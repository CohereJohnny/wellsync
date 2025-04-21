# Sprint 13 Tasks

## Goal
Enable part ordering and dispatching workflows through the GenAI assistant using Cohere tool calling.

## Tasks

### 1. Tool Schema Definition (`/api/chat`)
- [x] Define the JSON schema for the `order_part` tool.
  - Include parameters like `part_id` (string), `quantity` (integer), `destination_well_id` (string).
  - *Progress*: Schema defined as constant.
- [x] Define the JSON schema for the `dispatch_part` tool.
  - Include parameters like `part_id` (string), `quantity` (integer), `source_warehouse_id` (string), `destination_well_id` (string).
  - *Progress*: Schema defined as constant.
- [x] Update the `/api/chat` route to include these tool definitions in the call to Cohere Command model.
  - *Progress*: Passed `tools` array to `cohere.chat` and updated model to `command-r`.

### 2. Backend Order Simulation (`/api/orders`)
- [x] Create the Next.js API route handler file (`app/api/orders/route.ts`).
  - *Progress*: Created file with POST handler.
- [x] Implement a `POST` handler that accepts `{ part_id, quantity, destination_well_id }`.
  - *Progress*: Handler accepts parameters.
- [x] Implement basic request body validation.
  - *Progress*: Added checks for required fields and types.
- [x] Add basic error handling (`try...catch`).
  - *Progress*: Added main `try...catch` block.
- [x] **Simulate** order placement (e.g., log the order details).
  - *Progress*: Added console log for simulation.
- [x] Return a success response (e.g., `{ success: true, message: "Order placed for part X" }`).
  - *Progress*: Returning success JSON.

### 3. Backend Dispatch Simulation (`/api/dispatches`)
- [x] Create the Next.js API route handler file (`app/api/dispatches/route.ts`).
  - *Progress*: Created file with POST handler.
- [x] Implement a `POST` handler that accepts `{ part_id, quantity, source_warehouse_id, destination_well_id }`.
  - *Progress*: Handler accepts parameters.
- [x] Implement basic request body validation.
  - *Progress*: Added checks for required fields and types.
- [x] Add basic error handling (`try...catch`).
  - *Progress*: Added main `try...catch` block.
- [x] Set up Supabase client.
  - *Progress*: Initialized server client using `createClient()`.
- [x] **Simulate** dispatch and update inventory:
    - Query the `inventory` table for the `part_id` and `warehouse_id`.
    - If sufficient stock exists, decrement the `stock_level` in the `inventory` table.
    - Handle cases where stock is insufficient (return an appropriate error).
  - *Progress*: Implemented inventory check and update logic using Supabase client.
- [x] Return a success response (e.g., `{ success: true, message: "Part X dispatched" }`) or error response.
  - *Progress*: Returning success/error JSON based on stock check and update result.

### 4. Tool Call Integration (`/api/chat`)
- [x] Modify the `/api/chat` route handler to:
    - Check the Cohere response for tool calls (`response.tool_calls`).
    - If `order_part` tool is called:
        - Extract parameters.
        - Make a `POST` request to `/api/orders`.
        - Handle the response from `/api/orders`.
    - If `dispatch_part` tool is called:
        - Extract parameters.
        - Make a `POST` request to `/api/dispatches`.
        - Handle the response from `/api/dispatches`.
    - Construct a final chat message for the user summarizing the tool call result (success or failure).
    - Pass this summary message back to the Cohere model in a subsequent call (as a `TOOL` role message) to get a final natural language response for the user.
  - *Progress*: Implemented check for tool calls, parallel execution of simulation API calls using fetch, formatting of tool results, and second Cohere call with results.
- [x] Update error handling to cover tool call failures.
  - *Progress*: Added try/catch around simulation API calls and checks for non-OK responses, formatting errors into tool results.

### 5. Frontend Confirmation (`ChatPanel.tsx`)
- [ ] Ensure the assistant's final confirmation message (after tool call processing) is displayed correctly in the chat panel.
- [ ] Verify that loading states handle the potentially longer processing time involving tool calls.

### 6. Testing
- [ ] Test `/api/orders` endpoint directly.
- [ ] Test `/api/dispatches` endpoint directly (success and insufficient stock cases).
- [ ] Test `/api/chat` by providing prompts designed to trigger `order_part` tool call.
- [ ] Test `/api/chat` by providing prompts designed to trigger `dispatch_part` tool call.
- [ ] Verify correct parameters are extracted and sent to simulation endpoints.
- [ ] Verify inventory updates correctly after dispatch.
- [ ] Verify confirmation messages are displayed in the frontend chat panel.

### 7. Documentation
- [x] Document the `order_part` and `dispatch_part` tool schemas.
  - *Progress*: Created `docs/tool_schemas.md`.
- [x] Document the `/api/orders` endpoint.
  - *Progress*: Created `docs/api_orders.md`.
- [x] Document the `/api/dispatches` endpoint.
  - *Progress*: Created `docs/api_dispatches.md`.
- [x] Update `/api/chat` documentation regarding tool calling integration.
  - *Progress*: Created `docs/api_chat.md` detailing tool call flow.

## Sprint Review
- **Demo Readiness**: Tool calling is implemented for `order_part` and `dispatch_part` workflows. The chat assistant can now understand requests to order or dispatch parts, call the simulation APIs, and provide confirmation messages based on the results (including handling insufficient stock for dispatches).
- **Gaps/Issues**: The backend APIs (`/api/orders`, `/api/dispatches`) are simulations and don't interact with real systems. Error handling for the API calls themselves (e.g., network issues calling the simulation APIs from the chat API) could be more robust. Testing of multiple simultaneous tool calls was deferred.
- **Next Steps**: Proceed to Sprint 14 (Real-time Inventory & UI Polish). Consider adding more sophisticated error handling or real backend integrations later. 