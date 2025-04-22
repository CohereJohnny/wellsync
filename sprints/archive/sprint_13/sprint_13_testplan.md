# Sprint 13 Test Plan

## Goal
Verify the correct implementation of part ordering and dispatching workflows via Cohere tool calling integrated into the chat assistant.

## Test Cases

### 1. Tool Schema Definition
- **Test Case 1.1**: Verify `order_part` schema is correctly defined in `/api/chat`.
  - **Steps**: Review code in `/api/chat/route.ts`.
  - **Expected Result**: Schema includes `part_id`, `quantity`, `destination_well_id` with correct types and descriptions.
- **Test Case 1.2**: Verify `dispatch_part` schema is correctly defined in `/api/chat`.
  - **Steps**: Review code in `/api/chat/route.ts`.
  - **Expected Result**: Schema includes `part_id`, `quantity`, `source_warehouse_id`, `destination_well_id` with correct types and descriptions.

### 2. Backend Order Simulation (`/api/orders`)
- [x] **Test Case 2.1**: Test valid order request.
  - **Steps**: Send `POST` request with valid `{ part_id, quantity, destination_well_id }`.
  - **Expected Result**: Status 200 OK. Response `{ success: true, message: "..." }`. Server logs show order details. Verified via curl.
- [x] **Test Case 2.2**: Test invalid request (e.g., missing `part_id`).
  - **Steps**: Send `POST` request missing `part_id`.
  - **Expected Result**: Status 400 Bad Request with `{"error":"Missing or invalid part_id"}`. Verified via curl.

### 3. Backend Dispatch Simulation (`/api/dispatches`)
- [x] **Test Case 3.1**: Test valid dispatch request (sufficient stock).
  - **Steps**: Send `POST` request with valid `{ part_id: "P002", quantity: 3, source_warehouse_id: "W01", destination_well_id: "..." }`.
  - **Expected Result**: Status 200 OK. Response `{ success: true, message: "... New stock: 7." }`. Inventory table updated. Verified via curl & DB check.
- [x] **Test Case 3.2**: Test dispatch request (insufficient stock).
  - **Steps**: Send `POST` request for part with 0 stock (e.g., `part_id: "P004", quantity: 1, source_warehouse_id: "W03"`).
  - **Expected Result**: Status 409 Conflict with `{"success":false,"error":"Insufficient stock..."}`. Verified via curl.
- [x] **Test Case 3.3**: Test invalid request (e.g., missing `quantity`).
  - **Steps**: Send `POST` request missing `quantity`.
  - **Expected Result**: Status 400 Bad Request with `{"error":"Missing, invalid, or non-positive integer quantity"}`. Verified via curl.

### 4. Tool Call Integration (`/api/chat`)
- [x] **Test Case 4.1**: Test `order_part` tool trigger.
  - **Steps**: Send chat message like "Order 5 units of P001 for well X".
  - **Expected Result**: Tool called, `/api/orders` called, success message displayed. Verified via UI.
- [x] **Test Case 4.2**: Test `dispatch_part` tool trigger (success).
  - **Steps**: Send chat message like "Dispatch 2 units of P002 from warehouse W01 to well Y". Ensure sufficient stock.
  - **Expected Result**: Tool called, `/api/dispatches` called, success message displayed, inventory updated. Verified via UI & DB check.
- [x] **Test Case 4.3**: Test `dispatch_part` tool trigger (failure - insufficient stock).
  - **Steps**: Send chat message for part with 0 stock.
  - **Expected Result**: Tool called, `/api/dispatches` called, failure message (insufficient stock) displayed. Verified via UI.
- [ ] **Test Case 4.4**: Test handling of multiple tool calls (if supported by Cohere model/setup).
  - **Steps**: Send chat message potentially triggering multiple actions.
  - **Expected Result**: Verify if both tool calls are received and processed sequentially or in parallel as expected. Verify final confirmation covers both actions.
  - *Progress*: Deferred/Skipped for this sprint.
- [ ] **Test Case 4.5**: Test error handling if `/api/orders` or `/api/dispatches` fails.
  - **Steps**: Temporarily make `/api/orders` return 500 error. Trigger `order_part` via chat.
  - **Expected Result**: `/api/chat` handles the error gracefully. Final assistant message indicates the order failed.
  - *Progress*: Deferred to Tech Debt (TD-003).

### 5. Frontend Confirmation (`ChatPanel.tsx`)
- [x] **Test Case 5.1**: Verify order confirmation message display.
  - **Steps**: Trigger successful `order_part` tool call via chat.
  - **Expected Result**: Clear confirmation message displayed. Verified via UI.
- [x] **Test Case 5.2**: Verify successful dispatch confirmation message display.
  - **Steps**: Trigger successful `dispatch_part` tool call via chat.
  - **Expected Result**: Clear confirmation message displayed. Verified via UI.
- [x] **Test Case 5.3**: Verify failed dispatch (stock) message display.
  - **Steps**: Trigger failed `dispatch_part` tool call (insufficient stock) via chat.
  - **Expected Result**: Clear message indicating failure due to stock is displayed. Verified via UI.
- [x] **Test Case 5.4**: Verify loading state during tool call processing.
  - **Steps**: Trigger any tool call.
  - **Expected Result**: Standard chat loading indicator is displayed. Verified visually during tests. 