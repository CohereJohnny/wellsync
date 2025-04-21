import { NextResponse } from 'next/server'
import { cohere } from '@/lib/cohere'
import { createClient } from '@/lib/supabase/server'
import { type Message } from 'cohere-ai/api'

// Explicitly define allowed methods
export const runtime = 'edge' // Optional: Use Edge Runtime
export const dynamic = 'force-dynamic' // Optional: Disable static optimization

export async function POST(request: Request) {
  try {
    console.log('Chat API: Received request')
    const { messages, wellId } = await request.json()
    console.log('Chat API: Parsed request data', { wellId, messageCount: messages?.length })

    if (!messages || !wellId) {
      console.log('Chat API: Missing required fields', { messages: !!messages, wellId: !!wellId })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get well context from Supabase
    console.log('Chat API: Fetching well data')
    const supabase = createClient()
    const { data: well, error: wellError } = await supabase
      .from('wells')
      .select('*')
      .eq('id', wellId)
      .single()

    if (wellError) {
      console.error('Chat API: Error fetching well:', wellError)
      return NextResponse.json(
        { error: 'Failed to fetch well data' },
        { status: 500 }
      )
    }

    // Get recent faults for context
    console.log('Chat API: Fetching recent faults')
    const { data: recentFaults, error: faultsError } = await supabase
      .from('faults')
      .select('*')
      .eq('well_id', wellId)
      .order('timestamp', { ascending: false })
      .limit(5)

    if (faultsError) {
      console.error('Chat API: Error fetching faults:', faultsError)
      return NextResponse.json(
        { error: 'Failed to fetch fault data' },
        { status: 500 }
      )
    }

    // Format context for the AI
    console.log('Chat API: Preparing context')
    const context = `
      You are an AI assistant helping with well "${well.name}" (ID: ${well.id}).
      Well Details:
      - Location: ${well.location}
      - Status: ${well.status}
      - Camp: ${well.camp}
      - Formation: ${well.formation}
      - Depth: ${well.depth} ft
      - Pressure: ${well.pressure} psi
      - Temperature: ${well.temperature}°F
      - Flow Rate: ${well.flow_rate} bbl/d
      
      Recent Faults:
      ${recentFaults
        .map(
          (fault) =>
            `- ${new Date(fault.timestamp).toLocaleString()}: ${
              fault.fault_type
            } (${fault.status})`
        )
        .join('\n')}
    `.trim()

    // Fetch existing chat history from chat_history table
    let historicalMessages = [];
    const { data: historyData, error: historyError } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('well_id', wellId)
      .single();
    if (historyData && historyData.messages) {
      historicalMessages = historyData.messages;
    }

    // Combine historical messages with new messages from the request body
    const combinedMessages = [...historicalMessages, ...messages];

    // Format conversation history for Cohere
    console.log('Chat API: Formatting chat history')
    const chatHistory: Message[] = combinedMessages
      .filter((msg: any): msg is { role: string; content: string } => msg.content)
      .map((msg: { role: string; content: string }): Message => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.content,
      }));

    // Get response from Cohere
    console.log('Chat API: Calling Cohere')
    const cohereResponse = await cohere.chat({
      message: combinedMessages[combinedMessages.length - 1].content,
      chatHistory,
      preamble: context,
      model: 'command-a-03-2025',
      temperature: 0.3,
      connectors: [], // No connectors needed yet
    })

    console.log('Chat API: Received Cohere response')

    // Use cohereResponse.text instead of .content
    const assistantMessage = {
      role: 'assistant',
      content: cohereResponse.text, // Use .text
      timestamp: new Date().toISOString(),
    };

    // Create the updated conversation history
    const updatedMessages = [...combinedMessages, assistantMessage];

    // Upsert the updated chat history into supabase
    const { error: upsertError } = await supabase
      .from('chat_history')
      // Specify well_id as the conflict target for upsert
      .upsert({ well_id: wellId, messages: updatedMessages, updated_at: new Date() }, { onConflict: 'well_id' });
    if (upsertError) {
      console.error('POST /api/chat: Supabase upsert error:', upsertError); // Add logging
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ content: cohereResponse.text }); // Use .text
  } catch (error) {
    console.error('Chat API error:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 