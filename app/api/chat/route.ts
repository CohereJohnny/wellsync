import { NextResponse } from 'next/server'
import { cohere } from '@/lib/cohere'
import { supabaseAdmin } from '@/lib/supabase/server'
import { type Message, Tool, ToolCall, ToolResult, type NonStreamedChatResponse } from 'cohere-ai/api'

// --- Tool Definitions ---
const orderPartTool: Tool = {
  name: 'order_part',
  description: 'Orders a specific quantity of a part for a designated well or transformer.',
  parameterDefinitions: {
    part_id: {
      description: 'The unique identifier of the part to order (e.g., P001, XFMR-001).',
      type: 'str',
      required: true,
    },
    quantity: {
      description: 'The number of units of the part to order.',
      type: 'int',
      required: true,
    },
    destination_id: {
      description: 'The unique ID (UUID) of the well or transformer the part should be sent to.',
      type: 'str',
      required: true,
    },
    resource_type: {
      description: 'Type of resource receiving the part: "transformer" or "well".',
      type: 'str',
      required: true,
    },
  },
};

const triggerTransformerFaultTool: Tool = {
  name: 'trigger_transformer_fault',
  description: 'Simulates a fault on a specific transformer for testing purposes.',
  parameterDefinitions: {
    transformer_id: {
      description: 'The unique ID (UUID) of the transformer to create a fault for.',
      type: 'str',
      required: true,
    },
    part_id: {
      description: 'The unique identifier of the part that has the fault (e.g., XFMR-001, XFMR-003).',
      type: 'str',
      required: true,
    },
    fault_type: {
      description: 'The type of fault to simulate (e.g., "Electrical Failure", "Oil Leakage").',
      type: 'str',
      required: true,
    },
    description: {
      description: 'Optional detailed description of the fault.',
      type: 'str',
      required: false,
    }
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
    const { messages, resourceId, resourceType } = await request.json()
    console.log('Chat API: Parsed request data', { resourceId, resourceType, messageCount: messages?.length })

    if (!messages || !resourceId || !resourceType) {
      console.log('Chat API: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: messages, resourceId, and resourceType are required' },
        { status: 400 }
      )
    }

    if (!['transformer', 'well'].includes(resourceType)) {
      console.log('Chat API: Invalid resourceType', resourceType)
      return NextResponse.json(
        { error: 'Invalid resourceType. Must be "transformer" or "well"' },
        { status: 400 }
      )
    }

    // Get resource context from Supabase
    let resourceInfo: any = null;
    let recentFaults: any[] = [];

    if (resourceType === 'transformer') {
      console.log('Chat API: Fetching transformer data')
      const { data: transformer, error: transformerError } = await supabaseAdmin
        .from('transformers')
        .select('*')
        .eq('id', resourceId)
        .single()

      if (transformerError) {
        console.error('Chat API: Error fetching transformer:', transformerError)
        return NextResponse.json(
          { error: 'Failed to fetch transformer data' },
          { status: 500 }
        )
      }

      resourceInfo = transformer;

      // Get recent faults for context
      console.log('Chat API: Fetching recent transformer faults')
      const { data: faults, error: faultsError } = await supabaseAdmin
        .from('faults')
        .select('*')
        .eq('transformer_id', resourceId)
        .order('timestamp', { ascending: false })
        .limit(5)

      if (faultsError) {
        console.error('Chat API: Error fetching transformer faults:', faultsError)
        return NextResponse.json(
          { error: 'Failed to fetch fault data' },
          { status: 500 }
        )
      }

      recentFaults = faults || [];
    } else {
      // Well handling (existing code)
      console.log('Chat API: Fetching well data')
      const { data: well, error: wellError } = await supabaseAdmin
        .from('wells')
        .select('*')
        .eq('id', resourceId)
        .single()

      if (wellError) {
        console.error('Chat API: Error fetching well:', wellError)
        return NextResponse.json(
          { error: 'Failed to fetch well data' },
          { status: 500 }
        )
      }

      resourceInfo = well;

      // Get recent faults for context
      console.log('Chat API: Fetching recent well faults')
      const { data: faults, error: faultsError } = await supabaseAdmin
        .from('faults')
        .select('*')
        .eq('well_id', resourceId)
        .order('timestamp', { ascending: false })
        .limit(5)

      if (faultsError) {
        console.error('Chat API: Error fetching well faults:', faultsError)
        return NextResponse.json(
          { error: 'Failed to fetch fault data' },
          { status: 500 }
        )
      }

      recentFaults = faults || [];
    }

    // Format context for the AI based on resource type
    console.log('Chat API: Preparing context for', resourceType)
    let context = '';

    if (resourceType === 'transformer') {
      context = `
        You are an AI assistant helping with transformer "${resourceInfo.name}" (ID: ${resourceInfo.id}).
        Transformer Details:
        - Substation: ${resourceInfo.substation}
        - Status: ${resourceInfo.status}
        - Type: ${resourceInfo.type}
        - Location: Lat: ${resourceInfo.latitude}, Long: ${resourceInfo.longitude}
        - Last Maintenance: ${resourceInfo.last_maintenance || 'No data'}
        
        Recent Faults:
        ${recentFaults
          .map(
            (fault) =>
              `- ${new Date(fault.timestamp).toLocaleString()}: ${
                fault.fault_type
              } (${fault.status})`
          )
          .join('\n')}
      `.trim();
    } else {
      // Well context (existing)
      context = `
        You are an AI assistant helping with well "${resourceInfo.name}" (ID: ${resourceInfo.id}).
        Well Details:
        - Location: ${resourceInfo.location}
        - Status: ${resourceInfo.status}
        - Camp: ${resourceInfo.camp}
        - Formation: ${resourceInfo.formation}
        - Depth: ${resourceInfo.depth} ft
        - Pressure: ${resourceInfo.pressure} psi
        - Temperature: ${resourceInfo.temperature}°F
        - Flow Rate: ${resourceInfo.flow_rate} bbl/d
        
        Recent Faults:
        ${recentFaults
          .map(
            (fault) =>
              `- ${new Date(fault.timestamp).toLocaleString()}: ${
                fault.fault_type
              } (${fault.status})`
          )
          .join('\n')}
      `.trim();
    }

    // Fetch existing chat history from chat_history table
    let historicalMessages = [];
    const resourceIdField = resourceType === 'transformer' ? 'transformer_id' : 'well_id';
    const { data: historyData, error: historyError } = await supabaseAdmin
      .from('chat_history')
      .select('messages')
      .eq(resourceIdField, resourceId)
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

    // Select appropriate tools based on resource type
    const tools = resourceType === 'transformer' 
      ? [orderPartTool, triggerTransformerFaultTool]
      : [orderPartTool];

    // --- First Cohere API Call ---
    console.log('Chat API: Calling Cohere with tools for', resourceType);
    const firstCohereResponse = await cohere.chat({
      message: combinedMessages[combinedMessages.length - 1].content,
      chatHistory,
      preamble: context,
      model: 'command-a-03-2025',
      temperature: 0.3,
      tools: tools,
    }) as NonStreamedChatResponse;
    console.log('Chat API: Received first Cohere response');

    // --- Tool Call Handling --- 
    if (firstCohereResponse.toolCalls && firstCohereResponse.toolCalls.length > 0) {
      console.log(`Chat API: Detected ${firstCohereResponse.toolCalls.length} tool call(s).`);
      const toolResults: ToolResult[] = [];

      // Execute tools in parallel
      await Promise.all(firstCohereResponse.toolCalls.map(async (toolCall: ToolCall) => {
        console.log(`Chat API: Processing tool call: ${toolCall.name}`);
        let outputs: Array<Record<string, any>> = [];
        
        try {
          let simulationApiResponse: Response;
          let simulationResult: any;

          if (toolCall.name === 'order_part') {
            console.log(`Chat API: Calling /api/orders with params:`, toolCall.parameters);
            console.log('Stringified order_part parameters:', JSON.stringify(toolCall.parameters, null, 2)); 
            simulationApiResponse = await fetch(`${baseUrl}/api/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolCall.parameters),
            });
          } else if (toolCall.name === 'trigger_transformer_fault') {
            console.log(`Chat API: Calling /api/faults with params:`, toolCall.parameters);
            console.log('Stringified trigger_transformer_fault parameters:', JSON.stringify(toolCall.parameters, null, 2)); 
            simulationApiResponse = await fetch(`${baseUrl}/api/faults`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolCall.parameters),
            });
          } else {
            console.warn(`Chat API: Received unsupported tool call: ${toolCall.name}`);
            outputs = [{ error: `Unsupported tool: ${toolCall.name}` }];
            return;
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
            {
                role: 'CHATBOT', 
                message: '', 
                toolCalls: firstCohereResponse.toolCalls,
            } as Message
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
        finalAssistantMessageContent = secondCohereResponse.text;
      } else {
         console.warn('Chat API: Tool calls were present but no results were generated.');
         finalAssistantMessageContent = firstCohereResponse.text;
      }
    } else {
        finalAssistantMessageContent = firstCohereResponse.text;
    }

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
    
    // Prepare data for upsert based on resource type
    const upsertData = resourceType === 'transformer' 
      ? { transformer_id: resourceId, messages: finalUpdatedMessages, updated_at: new Date() }
      : { well_id: resourceId, messages: finalUpdatedMessages, updated_at: new Date() };
    
    const { error: upsertError } = await supabaseAdmin
      .from('chat_history')
      .upsert(upsertData, { onConflict: resourceIdField });
      
    if (upsertError) {
        console.error('POST /api/chat: Supabase history upsert error:', upsertError);
    }
    
    console.log('Chat API: Sending final response to client.');
    return NextResponse.json({ content: finalAssistantMessageContent });

  } catch (error) {
    console.error('Chat API error:', error)
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