# API Route: `/api/dispatches`

This API route simulates dispatching a part from inventory.

## Endpoint

`POST /api/dispatches`

## Purpose

This endpoint is called by the `/api/chat` route when the Cohere model triggers the `dispatch_part` tool. It simulates dispatching a part by checking and updating the `inventory` table in the Supabase database.

## Request Body

The request body must be a JSON object matching the parameters defined in the `dispatch_part` tool schema:

- **`part_id`** (string, required): The unique identifier of the part to dispatch.
- **`quantity`** (integer, required): The number of units to dispatch. Must be a positive integer.
- **`source_warehouse_id`** (string, required): The identifier of the warehouse to dispatch from.
- **`destination_well_id`** (string, required): The UUID of the well the part is being dispatched to.

**Example Request Body:**

```json
{
  "part_id": "P002",
  "quantity": 2,
  "source_warehouse_id": "W01",
  "destination_well_id": "550e8400-e29b-41d4-a716-446655440013"
}
```

## Success Response (200 OK)

Indicates that the dispatch was successful and the inventory was updated.

- **`success`** (boolean): `true`.
- **`message`** (string): A confirmation message including the new stock level.

**Example Success Response:**

```json
{
  "success": true,
  "message": "Successfully dispatched 2 unit(s) of part P002 from warehouse W01 to well 550e8400-e29b-41d4-a716-446655440013. New stock: 5."
}
```

## Error Responses

- **400 Bad Request**: Returned if the request body is invalid JSON or missing/invalid required fields.
  ```json
  { "error": "Invalid request body" }
  { "error": "Missing or invalid part_id" }
  { "error": "Missing, invalid, or non-positive integer quantity" }
  { "error": "Missing or invalid source_warehouse_id" }
  { "error": "Missing or invalid destination_well_id" }
  ```
- **404 Not Found**: Returned if the specified `part_id` / `source_warehouse_id` combination does not exist in the `inventory` table.
  ```json
  { "success": false, "error": "Part PXXX not found in warehouse WXX." }
  ```
- **409 Conflict**: Returned if there is insufficient stock for the requested `part_id` and `quantity` in the specified `source_warehouse_id`.
  ```json
  { "success": false, "error": "Insufficient stock for part PXXX... Required: X, Available: Y." }
  ```
- **500 Internal Server Error**: Returned for unexpected errors during database operations (fetching or updating inventory).
  ```json
  { "success": false, "error": "Failed to fetch inventory: [details]" }
  { "success": false, "error": "Failed to update inventory: [details]" }
  { "success": false, "error": "Internal server error during dispatch simulation" }
  ```

## Simulation Logic

1. Validates the request body.
2. Connects to Supabase.
3. Queries the `inventory` table to find the row matching `part_id` and `source_warehouse_id`.
4. Checks if the `stock_level` is greater than or equal to the requested `quantity`.
5. If sufficient, updates the `stock_level` (decrements by `quantity`) and `last_updated` timestamp for that specific inventory row.
6. Returns success or failure based on the outcome. 