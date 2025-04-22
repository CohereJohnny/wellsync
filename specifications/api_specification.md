# API Specification - Oil & Gas GenAI Demo

## 1. Introduction

This document defines the REST API for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The API is implemented using Next.js API Routes and Supabase (PostgreSQL) and supports 25-30 wells, 10-15 parts, and 2-3 warehouses. It enables the NextJS frontend to display well data, simulate faults, query parts and inventory, perform semantic fault searches, and execute simulated workflows (ordering/dispatching parts) via the Cohere GenAI assistant (powered by the Command R+ model with tool calling, Embed v3 for embeddings, and Rerank v3 for search). The API is designed for simplicity, with no security or authentication, as specified for the demo. It leverages Supabase's auto-generated REST endpoints for direct data access where possible and custom Next.js API routes for complex logic like chat, search, and workflow simulations.

## 2. API Overview

- **Base URL**:
  - Supabase Direct: `https://<supabase-project-id>.supabase.co/rest/v1/`
  - Next.js Custom: `/api/` (relative to the application URL)
- **Authentication**: None (public APIs, no Row-Level Security).
- **Content Type**: `application/json` for requests and responses.
- **Error Handling**:
  - Success: `200 OK` or `201 Created`.
  - Client Error: `400 Bad Request` (invalid input), `404 Not Found` (resource missing), `409 Conflict` (e.g., insufficient stock).
  - Server Error: `500 Internal Server Error` (rare, demo-focused).
- **Real-time**: Supabase Realtime subscriptions on `wells` and `inventory` tables for fault and stock updates (<1s).
- **Rate Limits**: None enforced, sufficient for demo-scale (100 users, 10 requests/second).

## 3. Endpoints

The API includes Supabase direct endpoints for basic CRUD and custom Next.js API routes for chat, fault search, and workflow simulations. All endpoints are public and map to the data model defined in `datamodel.md`.

### 3.1 Wells (via Supabase REST)

#### GET /wells

Retrieve all wells or a specific well by ID.

- **Purpose**: Fetch well data for the homescreen grid or well detail view.
- **Query Parameters**:
  - `id` (optional, UUID): Filter by well ID.
  - `select` (optional): Columns to return (e.g., `id,name,camp,formation,status`).
  - `camp.eq` (optional): Filter by camp (e.g., `Midland`).
  - `formation.eq` (optional): Filter by formation (e.g., `Wolfcamp`).
  - `status.eq` (optional): Filter by status (e.g., `Fault`).
- **Response**:
  - Status: `200 OK`
  - Body: Array of well objects or single object if `id` specified.
    ```json
    [
      {
        "id": "uuid",
        "name": "Well-01",
        "camp": "Midland",
        "formation": "Wolfcamp",
        "latitude": 31.8075,
        "longitude": -102.1123,
        "status": "Operational",
        "last_maintenance": "2025-03-15T00:00:00Z",
        "fault_details": { "part_id": "P001", "fault_type": "Mechanical" }
      }
    ]
    ```
- **Example**: `GET /wells?select=id,name,status&camp.eq=Midland`

#### Realtime Subscription: wells

Subscribe to updates on the `wells` table for status or fault changes.

- **Purpose**: Update well cards in real-time when faults are triggered.
- **Channel**: `public:wells`
- **Events**: `UPDATE` (e.g., status changes to `Fault`).
- **Payload**: Updated well object (same as GET /wells).
- **Client**: Supabase JavaScript Client (`@supabase/supabase-js`).

### 3.2 Faults (via Supabase REST & Edge Function)

#### GET /faults

Retrieve fault history for a well.

- **Purpose**: Fetch fault details for the well detail view or assistant queries.
- **Query Parameters**:
  - `well_id` (required, UUID): Filter by well ID.
  - `select` (optional): Columns to return (e.g., `fault_id,part_id,fault_type,timestamp`).
  - `order` (optional): Sort by `timestamp.desc`.
- **Response**:
  - Status: `200 OK`
  - Body: Array of fault objects.
    ```json
    [
      {
        "fault_id": "uuid",
        "well_id": "uuid",
        "part_id": "P001",
        "fault_type": "Mechanical",
        "description": "Centrifugal pump failed due to wear",
        "timestamp": "2025-04-17T10:00:00Z"
      }
    ]
    ```
- **Example**: `GET /faults?well_id=eq.uuid&order=timestamp.desc`

#### POST /faults (via Supabase REST)

Trigger a new fault for a well.

- **Purpose**: Simulate a fault, updating well status and logging fault history.
- **Request Body**:
  ```json
  {
    "well_id": "uuid",
    "part_id": "P001",
    "fault_type": "Mechanical",
    "description": "Centrifugal pump failed due to wear"
  }
  ```
- **Response**:
  - Status: `201 Created`
  - Body: Created fault object (same as GET /faults).
- **Side Effects**:
  - Updates `wells.status` to `Fault` and `wells.fault_details` with `{ part_id, fault_type }`.
  - Triggers embedding generation (via Edge Function) for `fault_embeddings`.
  - Broadcasts update via Realtime on `wells` table.
- **Example**: `POST /faults`

### 3.3 Parts (via Supabase REST)

#### GET /parts

Retrieve all parts or a specific part by ID.

- **Purpose**: Fetch part details for assistant queries or well detail view.
- **Query Parameters**:
  - `part_id` (optional, VARCHAR): Filter by part ID.
  - `select` (optional): Columns to return (e.g., `part_id,name,description`).
- **Response**:
  - Status: `200 OK`
  - Body: Array of part objects or single object if `part_id` specified.
    ```json
    [
      {
        "part_id": "P001",
        "name": "Centrifugal Pump",
        "description": "High-pressure pump",
        "specifications": { "pressure": "5000 psi" },
        "manufacturer": "Schlumberger"
      }
    ]
    ```
- **Example**: `GET /parts?part_id=eq.P001`

### 3.4 Inventory (via Supabase REST)

#### GET /inventory

Retrieve inventory levels for a part across warehouses.

- **Purpose**: Check part availability for assistant queries or workflows.
- **Query Parameters**:
  - `part_id` (required, VARCHAR): Filter by part ID.
  - `select` (optional): Columns to return (e.g., `warehouse_id,stock_level`).
- **Response**:
  - Status: `200 OK`
  - Body: Array of inventory objects.
    ```json
    [
      {
        "id": "uuid",
        "part_id": "P001",
        "warehouse_id": "W01",
        "stock_level": 5,
        "last_updated": "2025-04-17T10:00:00Z"
      }
    ]
    ```
- **Example**: `GET /inventory?part_id=eq.P001`

#### Realtime Subscription: inventory

Subscribe to updates on the `inventory` table for stock changes.

- **Purpose**: Update inventory data in real-time after dispatch workflows.
- **Channel**: `public:inventory`
- **Events**: `UPDATE` (e.g., stock_level changes).
- **Payload**: Updated inventory object (same as GET /inventory).
- **Client**: Supabase JavaScript Client.

### 3.5 Workflows (Simulations via Next.js API Routes)

These endpoints are called internally by the `/api/chat` route when triggered by a Cohere tool call. They simulate the respective actions.

#### POST /api/orders

Simulate ordering a part from the manufacturer.

- **Purpose**: Simulate a part order action triggered by the GenAI assistant tool call.
- **Request Body**: Matches `order_part` tool parameters.
  ```json
  {
    "part_id": "P001", // string, required
    "quantity": 1, // integer, required
    "destination_well_id": "uuid" // string, required
  }
  ```
- **Response**:
  - Status: `200 OK` (on successful simulation) or `400 Bad Request` (invalid input).
  - Body:
    ```json
    {
      "success": true,
      "message": "Order placed for 1 unit(s) of part P001 for well uuid."
      // Or error message on failure
    }
    ```
- **Side Effects**: Logs the simulated order details to the console.
- **Example**: `POST /api/orders` (Internal call from `/api/chat`)

#### POST /api/dispatches

Simulate dispatching a part from a warehouse, checking inventory.

- **Purpose**: Simulate a part dispatch action triggered by the GenAI assistant tool call, including inventory check and update.
- **Request Body**: Matches `dispatch_part` tool parameters.
  ```json
  {
    "part_id": "P001", // string, required
    "quantity": 1, // integer, required
    "source_warehouse_id": "W01", // string, required
    "destination_well_id": "uuid" // string, required
  }
  ```
- **Response**:
  - Status: `200 OK` (on successful dispatch), `400 Bad Request` (invalid input), `404 Not Found` (part/warehouse combo not found), `409 Conflict` (insufficient stock).
  - Body (Success):
    ```json
    {
      "success": true,
      "message": "Successfully dispatched 1 unit(s) of part P001 from warehouse W01. New stock level: 4."
    }
    ```
  - Body (Failure):
    ```json
    {
      "success": false,
      "message": "Insufficient stock for part P001 in warehouse W01. Available: 3, Requested: 5."
      // Or other error messages
    }
    ```
- **Side Effects**:
  - On success: Updates `inventory.stock_level` (decrements by quantity) for the specified `part_id` and `warehouse_id`.
  - Broadcasts update via Realtime on `inventory` table if stock level changes.
- **Example**: `POST /api/dispatches` (Internal call from `/api/chat`)

### 3.6 Semantic Fault Search (via Next.js API Route)

#### POST /api/search_faults

Perform a semantic search on fault history using Cohere Embed v3 and Rerank v3.

- **Purpose**: Retrieve faults similar to a user query for assistant responses.
- **Request Body**:
  ```json
  {
    "query": "Pump failure on Well-12",
    "top_n": 5
  }
  ```
- **Response**:
  - Status: `200 OK`
  - Body: Array of fault objects with relevance scores.
    ```json
    [
      {
        "fault_id": "uuid",
        "well_id": "uuid",
        "part_id": "P001",
        "fault_type": "Mechanical",
        "description": "Centrifugal pump failed due to wear",
        "timestamp": "2025-04-17T10:00:00Z",
        "relevance_score": 0.95
      }
    ]
    ```
- **Implementation**:
  - NextJS API route (`/api/search_faults`) generates query embedding using Cohere Embed v3.
  - Supabase function `match_faults` queries `fault_embeddings` with pgvector for top N similar faults (cosine similarity).
  - Cohere Rerank v3 reorders results, returning top K.
- **Example**: `POST /api/search_faults`

### 3.7 Chat (via Next.js API Route)

#### POST /api/chat

Handle user chat messages, interact with Cohere Command R+ model, manage context, and execute tool calls.

- **Purpose**: Central endpoint for all GenAI assistant interactions.
- **Request Body**:
  ```json
  {
    "message": "User's message",
    "wellId": "uuid", // Context for the conversation
    "chat_history": [ // Optional: Full history if needed, otherwise retrieved server-side
      { "role": "USER", "message": "Previous message" },
      { "role": "CHATBOT", "message": "Previous response" }
      // ... includes tool calls and results if any
    ]
  }
  ```
- **Response**: Streamed response containing assistant's message chunks (including markdown formatting) and potentially tool call requests or results.
- **Implementation**:
  - Retrieves chat history for `wellId` from Supabase `chat_history` table if not provided.
  - Calls Cohere Chat API (`command-a-03-2025` model) with message, history, and tool definitions (`order_part`, `dispatch_part`, etc.).
  - If Cohere requests tool calls:
    - Executes necessary actions (e.g., query Supabase directly, call `/api/orders`, `/api/dispatches`).
    - Formats results and sends back to Cohere in a subsequent call.
  - Streams final natural language response back to the client.
  - Saves updated conversation (including tool interactions) to `chat_history` table.
- **Example**: `POST /api/chat`

## 4. Design Considerations

- **Simplicity**: Endpoints are minimal, leveraging Supabase's auto-generated REST API for direct CRUD and custom Next.js routes for complex logic (chat, search, simulations).
- **Real-time**: Subscriptions on `wells` and `inventory` ensure <1s updates for fault triggers and dispatches.
- **Demo Scope**: Supports 100 users, 10 requests/second, with no rate limits or authentication.
- **Semantic Search**: `POST /api/search_faults` integrates Cohere Embed v3 and Rerank v3 for relevant fault history results, enhancing assistant capabilities.
- **Tool Calling**: `/api/chat` integrates Cohere `command-a-03-2025` tool calling to trigger simulated workflows via `/api/orders` and `/api/dispatches`.
- **Mock Data**: Endpoints work with `mock_data.sql` (to be created) for 25-30 wells, 10-15 parts, 2-3 warehouses, and 100-200 faults.
- **Error Handling**: Basic validation (e.g., valid UUIDs, positive quantities) to prevent demo crashes.

## 5. Assumptions

- Supabase REST API and Realtime support demo-scale traffic.
- Cohere SDK handles API calls for `command-a-03-2025`, Embed v3, and Rerank v3 in Next.js API routes.
- Mock data will provide realistic values for wells, parts, and faults.
- No real-world integrations (e.g., manufacturer APIs) are required.

## 6. Future Considerations

- Add pagination for `GET /faults` if fault history grows significantly.
- Implement geospatial queries for well locations (e.g., nearest wells to a fault).
- Expand `/api/search_faults` to include filters (e.g., by part or fault type).
- Add endpoints for warehouse metadata if needed.
- Implement real backend integrations instead of simulation endpoints (`/api/orders`, `/api/dispatches`).

## 7. Relevant Memories

Your emphasis on simplicity for the demo, as seen in your vibe coding approach with Cursor and Supabase MCP tools (e.g., insurance underwriting demo, April 6, 2025), informs the API's minimal design. The requirement for a separate `mock_data.sql` file to seed 25-30 wells, 10-15 parts, and 2-3 warehouses aligns with your focus on realistic demo data, ensuring the API supports practical, impactful interactions. The implementation of tool calling in Sprint 13 adds workflow capabilities directly initiated by the AI assistant.