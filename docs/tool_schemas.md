# Cohere Tool Schemas

This document describes the schemas for the tools provided to the Cohere Command model in the `/api/chat` route to enable specific workflows.

## Tool: `order_part`

- **Description**: Orders a specific quantity of a part for a designated well.
- **Purpose**: Used when the user asks the assistant to order a part.
- **Endpoint Called**: `POST /api/orders`

### Parameters

- **`part_id`**
  - **Type**: `string`
  - **Required**: Yes
  - **Description**: The unique identifier of the part to order (e.g., P001, P005).
- **`quantity`**
  - **Type**: `integer`
  - **Required**: Yes
  - **Description**: The number of units of the part to order.
- **`destination_well_id`**
  - **Type**: `string`
  - **Required**: Yes
  - **Description**: The unique ID (UUID) of the well the part should be sent to.

### Result Format (Sent back to Cohere as `TOOL` message output)

A JSON object indicating success or failure:

```json
// Success
{ "success": true, "message": "Order successfully simulated for 5 unit(s) of part P001..." }

// Failure (Example)
{ "success": false, "error": "Internal server error during order simulation" }
```

---

## Tool: `dispatch_part`

- **Description**: Dispatches a specific quantity of a part from a warehouse to a well, checking inventory first.
- **Purpose**: Used when the user asks the assistant to dispatch a part from a specific warehouse.
- **Endpoint Called**: `POST /api/dispatches`

### Parameters

- **`part_id`**
  - **Type**: `string`
  - **Required**: Yes
  - **Description**: The unique identifier of the part to dispatch (e.g., P002, P003).
- **`quantity`**
  - **Type**: `integer`
  - **Required**: Yes
  - **Description**: The number of units of the part to dispatch.
- **`source_warehouse_id`**
  - **Type**: `string`
  - **Required**: Yes
  - **Description**: The identifier of the warehouse where the part is stored (e.g., WH-A, WH-B).
- **`destination_well_id`**
  - **Type**: `string`
  - **Required**: Yes
  - **Description**: The unique ID (UUID) of the well the part should be dispatched to.

### Result Format (Sent back to Cohere as `TOOL` message output)

A JSON object indicating success or failure:

```json
// Success
{ "success": true, "message": "Successfully dispatched 2 unit(s) of part P002... New stock: 5." }

// Failure (Insufficient Stock Example)
{ "success": false, "error": "Insufficient stock for part P004... Required: 1, Available: 0." }

// Failure (Not Found Example)
{ "success": false, "error": "Part P999 not found in warehouse W01." }
``` 