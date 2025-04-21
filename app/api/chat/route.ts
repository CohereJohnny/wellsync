import { NextResponse } from 'next/server'
import { cohere } from '@/lib/cohere'
import { createClient } from '@/lib/supabase/server'
import { type Message, Tool, ToolCall, ToolResult, type NonStreamedChatResponse } from 'cohere-ai/api'

// --- Tool Definitions ---
const orderPartTool: Tool = {
  name: 'order_part',
  description: 'Orders a specific quantity of a part for a designated well.',
  parameterDefinitions: {
    part_id: {
      description: 'The unique identifier of the part to order (e.g., P001, P005).',
      type: 'str',
      required: true,
    },
    quantity: {
      description: 'The number of units of the part to order.',
      type: 'int',
      required: true,
    },
    destination_well_id: {
      description: 'The unique ID (UUID) of the well the part should be sent to.',
      type: 'str',
      required: true,
    },
  },
};

const dispatchPartTool: Tool = {
  name: 'dispatch_part',
  description: 'Dispatches a specific quantity of a part from a warehouse to a well, checking inventory first.',
  parameterDefinitions: {
    part_id: {
      description: 'The unique identifier of the part to dispatch (e.g., P002, P003).',
      type: 'str',
      required: true,
    },
    quantity: {
      description: 'The number of units of the part to dispatch.',
      type: 'int',
      required: true,
    },
    source_warehouse_id: {
      description: 'The identifier of the warehouse where the part is stored (e.g., WH-A, WH-B).',
      type: 'str',
      required: true,
    },
    destination_well_id: {
      description: 'The unique ID (UUID) of the well the part should be dispatched to.',
      type: 'str',
      required: true,
    },
  },
};

// Helper function to get base URL
function getBaseUrl(request: Request): string {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const host = request.headers.get('host');
  if (host) return `${host.includes('localhost') ? 'http' : 'https'}://${host}`;
  return 'http://localhost:3000'; // Default for local development
}

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

    const baseUrl = getBaseUrl(request);
    let finalCohereText: string | undefined = undefined;
    let finalAssistantMessageContent: string | undefined = undefined;

    // --- First Cohere API Call ---
    console.log('Chat API: Calling Cohere (potentially with tools)');
    const firstCohereResponse = await cohere.chat({
      message: combinedMessages[combinedMessages.length - 1].content,
      chatHistory,
      preamble: context,
      model: 'command-a-03-2025', // Using user-requested model
      temperature: 0.3,
      tools: [orderPartTool, dispatchPartTool],
    }) as NonStreamedChatResponse;
    console.log('Chat API: Received first Cohere response');

    // --- Tool Call Handling --- 
    if (firstCohereResponse.toolCalls && firstCohereResponse.toolCalls.length > 0) {
      console.log(`Chat API: Detected ${firstCohereResponse.toolCalls.length} tool call(s).`);
      const toolResults: ToolResult[] = [];

      // Execute tools in parallel
      await Promise.all(firstCohereResponse.toolCalls.map(async (toolCall: ToolCall) => {
        console.log(`Chat API: Processing tool call: ${toolCall.name}`);
        let outputs: Array<Record<string, any>> = []; // Define outputs for the result
        
        try {
          let simulationApiResponse: Response;
          let simulationResult: any;

          if (toolCall.name === 'order_part') {
            console.log(`Chat API: Calling /api/orders with params:`, toolCall.parameters);
            simulationApiResponse = await fetch(`${baseUrl}/api/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolCall.parameters),
            });
          } else if (toolCall.name === 'dispatch_part') {
            console.log(`Chat API: Calling /api/dispatches with params:`, toolCall.parameters);
            simulationApiResponse = await fetch(`${baseUrl}/api/dispatches`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolCall.parameters),
            });
          } else {
            console.warn(`Chat API: Received unsupported tool call: ${toolCall.name}`);
            outputs = [{ error: `Unsupported tool: ${toolCall.name}` }];
            // Continue to next tool call if any
            return; // Exit map function for this tool call
          }

          // Process response from simulation API
          if (!simulationApiResponse.ok) {
             const errorBody = await simulationApiResponse.json().catch(() => ({ error: `Tool simulation API failed with status ${simulationApiResponse.status}` }));
             console.error(`Chat API: Tool call simulation failed (${toolCall.name}):`, errorBody);
             outputs = [{ success: false, error: errorBody.error || `Tool execution failed.` }];
          } else {
            simulationResult = await simulationApiResponse.json();
            console.log(`Chat API: Tool call simulation successful (${toolCall.name}):`, simulationResult);
            outputs = [{ success: true, message: simulationResult.message }];
          }

        } catch (toolError) {
            console.error(`Chat API: Error executing tool call (${toolCall.name}):`, toolError);
            outputs = [{ success: false, error: toolError instanceof Error ? toolError.message : 'Unknown error during tool execution' }];
        }
        
        // Add the result for this tool call
        toolResults.push({ call: toolCall, outputs });
      })); // End of Promise.all map

      // --- Second Cohere API Call with Tool Results ---
      if (toolResults.length > 0) {
        console.log('Chat API: Calling Cohere again with tool results...');

        // Construct history for the second call
        const historyForSecondCall = [
            ...chatHistory, 
            // Add the first assistant response containing the tool calls
            // Use type assertion to allow toolCalls property
            {
                role: 'CHATBOT', 
                message: '', 
                toolCalls: firstCohereResponse.toolCalls,
            } as Message // Assert as base Message type, API handles structure
        ];

        const secondCohereResponse = await cohere.chat({
           message: '', 
           chatHistory: historyForSecondCall, 
           preamble: context,
           model: 'command-a-03-2025',
           temperature: 0.3,
           toolResults: toolResults, 
        }) as NonStreamedChatResponse;
        console.log('Chat API: Received second Cohere response after tool execution.');
        finalAssistantMessageContent = secondCohereResponse.text; // Use text from second response
      } else {
         console.warn('Chat API: Tool calls were present but no results were generated.');
         finalAssistantMessageContent = firstCohereResponse.text;
      }
    } else {
        finalAssistantMessageContent = firstCohereResponse.text;
    } // End of tool call handling block

    // --- Final Response Processing --- 
    if (!finalAssistantMessageContent) {
        console.error('Chat API: Final Cohere response text is empty.');
        finalAssistantMessageContent = "I encountered an issue processing that request.";
    }

    console.log('Chat API: Final assistant message content determined.');

    // Create the assistant message for history
    const assistantMessage = {
      role: 'assistant',
      content: finalAssistantMessageContent,
      timestamp: new Date().toISOString(),
    };

    // Update and upsert history (including the final assistant message)
    const finalUpdatedMessages = [...combinedMessages, assistantMessage];
    const { error: upsertError } = await supabase
      .from('chat_history')
      .upsert({ well_id: wellId, messages: finalUpdatedMessages, updated_at: new Date() }, { onConflict: 'well_id' });
      
    if (upsertError) {
        console.error('POST /api/chat: Supabase history upsert error:', upsertError);
        // Don't block response to user for history failure, but log it
        // Consider alternative error handling if history saving is critical
    }
    
    console.log('Chat API: Sending final response to client.');
    return NextResponse.json({ content: finalAssistantMessageContent });

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