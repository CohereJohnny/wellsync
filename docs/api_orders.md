# API Route: `/api/orders`

This API route simulates the placement of a part order.

## Endpoint

`POST /api/orders`

## Purpose

This endpoint is called by the `/api/chat` route when the Cohere model triggers the `order_part` tool. It simulates placing an order in an external system (like an ERP).

## Request Body

The request body must be a JSON object matching the parameters defined in the `order_part` tool schema:

- **`part_id`** (string, required): The unique identifier of the part to order.
- **`quantity`** (integer, required): The number of units to order. Must be a positive integer.
- **`destination_well_id`** (string, required): The UUID of the well the part is being ordered for.

**Example Request Body:**

```json
{
  "part_id": "P001",
  "quantity": 10,
  "destination_well_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Success Response (200 OK)

Indicates that the order simulation was successful.

- **`success`** (boolean): Always `true` for a successful simulation.
- **`message`** (string): A confirmation message.

**Example Success Response:**

```json
{
  "success": true,
  "message": "Order successfully simulated for 10 unit(s) of part P001 for well 550e8400-e29b-41d4-a716-446655440000."
}
```

## Error Responses

- **400 Bad Request**: Returned if the request body is invalid JSON or missing/invalid required fields.
  ```json
  { "error": "Invalid request body" }
  { "error": "Missing or invalid part_id" }
  { "error": "Missing, invalid, or non-positive integer quantity" }
  { "error": "Missing or invalid destination_well_id" }
  ```
- **500 Internal Server Error**: Returned for unexpected server-side errors during simulation.
  ```json
  { "success": false, "error": "Internal server error during order simulation" }
  ```

## Simulation Logic

Currently, this endpoint only logs the received order details to the server console. It does **not** interact with a real ordering system or modify any database state. 