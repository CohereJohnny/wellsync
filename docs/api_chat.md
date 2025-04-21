# API Route: `/api/chat`

This API route handles chat interactions, providing context-aware responses and enabling tool use for specific workflows.

## Endpoint

`POST /api/chat`

## Request Body

- **`messages`** (array, required): An array containing the *new* user message object. The backend retrieves and manages the full history.
  - Each message object should have `role` ('user') and `content` (string).
- **`wellId`** (string, required): The UUID of the well the chat session pertains to.

**Example Request Body:**

```json
{
  "messages": [
    { "role": "user", "content": "Please order 5 units of part P001 for this well." }
  ],
  "wellId": "550e8400-e29b-41d4-a716-446655440013"
}
```

## Success Response (200 OK)

Returns a JSON object containing the assistant's final text response.

- **`content`** (string): The natural language response from the assistant, generated after potentially processing tool calls.

**Example Success Response:**

```json
{
  "content": "Okay, I have simulated placing an order for 5 units of part P001 for well Well-13 (ID: 550e8400-e29b-41d4-a716-446655440013)."
}
```

## Error Responses

- **400 Bad Request**: Missing `messages` or `wellId`.
- **500 Internal Server Error**: Failure fetching well/fault data, calling Cohere API, calling tool simulation APIs, or saving history.

## Logic Flow

1. Validates request body.
2. Fetches well details and recent fault history from Supabase based on `wellId`.
3. Fetches existing chat history for the `wellId` from the `chat_history` table.
4. Constructs the preamble (system message) including well and fault context.
5. Formats the combined chat history (historical + new user message) for the Cohere API.
6. **First Cohere Call**: Calls `cohere.chat` with the message, history, preamble, and defined tool schemas (`order_part`, `dispatch_part`). Uses the `command-a-03-2025` model.
7. **Tool Call Handling**:
   - Checks if the response contains `toolCalls`.
   - If yes:
     - Iterates through each `toolCall`.
     - Calls the corresponding simulation API (`/api/orders` or `/api/dispatches`) via `fetch` with the parameters from the tool call.
     - Collects the success/failure results from the simulation APIs.
     - Formats these results into a `toolResults` array.
     - **Second Cohere Call**: Calls `cohere.chat` *again*, providing the original history (up to the first assistant response with tool calls) and the `toolResults`.
     - The final assistant text response is taken from this second call.
   - If no:
     - The final assistant text response is taken from the first call.
8. **History Update**: Upserts the full conversation history (including the final assistant response) back into the `chat_history` table.
9. **Response**: Returns the final assistant text response (`content`) to the client.

## Tool Schemas Used

Refer to `docs/tool_schemas.md` for details on the `order_part` and `dispatch_part` tools passed to the Cohere model. 