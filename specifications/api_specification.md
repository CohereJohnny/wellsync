# API Specification - Oil & Gas GenAI Demo

## 1. Introduction

This document defines the REST API for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The API is implemented in Supabase (PostgreSQL) and supports 25-30 wells, 10-15 parts, and 2-3 warehouses. It enables the NextJS frontend to display well data, simulate faults, query parts and inventory, perform semantic fault searches, and execute workflows (ordering/dispatching parts) via the Cohere GenAI assistant (Command A, Embed v4, Rerank v3.5). The API is designed for simplicity, with no security or authentication, as specified for the demo, and leverages Supabase’s auto-generated REST endpoints where possible.

## 2. API Overview

- **Base URL**: `https://<supabase-project-id>.supabase.co/rest/v1/`
- **Authentication**: None (public APIs, no Row-Level Security).
- **Content Type**: `application/json` for requests and responses.
- **Error Handling**:
  - Success: `200 OK` or `201 Created`.
  - Client Error: `400 Bad Request` (invalid input), `404 Not Found` (resource missing).
  - Server Error: `500 Internal Server Error` (rare, demo-focused).
- **Real-time**: Supabase Realtime subscriptions on `wells` and `inventory` tables for fault and stock updates (<1s).
- **Rate Limits**: None enforced, sufficient for demo-scale (100 users, 10 requests/second).

## 3. Endpoints

The API includes endpoints for managing wells, faults, parts, inventory, and workflows, plus a custom endpoint for semantic fault search. All endpoints are public and map to the data model defined in `datamodel.md`.

### 3.1 Wells

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

### 3.2 Faults

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

#### POST /faults

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

### 3.3 Parts

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

### 3.4 Inventory

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

### 3.5 Workflows

#### POST /orders

Simulate ordering a part from the manufacturer.

- **Purpose**: Initiate a part order via the GenAI assistant.
- **Request Body**:
  ```json
  {
    "part_id": "P001",
    "well_id": "uuid",
    "quantity": 1,
    "manufacturer": "Schlumberger"
  }
  ```
- **Response**:
  - Status: `201 Created`
  - Body:
    ```json
    {
      "order_id": "uuid",
      "part_id": "P001",
      "well_id": "uuid",
      "quantity": 1,
      "manufacturer": "Schlumberger",
      "timestamp": "2025-04-17T10:00:00Z"
    }
    ```
- **Example**: `POST /orders`

#### POST /dispatches

Simulate dispatching a part from a warehouse.

- **Purpose**: Initiate a part dispatch via the GenAI assistant.
- **Request Body**:
  ```json
  {
    "part_id": "P001",
    "well_id": "uuid",
    "warehouse_id": "W01",
    "quantity": 1
  }
  ```
- **Response**:
  - Status: `201 Created`
  - Body:
    ```json
    {
      "dispatch_id": "uuid",
      "part_id": "P001",
      "well_id": "uuid",
      "warehouse_id": "W01",
      "quantity": 1,
      "timestamp": "2025-04-17T10:00:00Z"
    }
    ```
- **Side Effects**:
  - Updates `inventory.stock_level` (decrements by quantity).
  - Broadcasts update via Realtime on `inventory` table.
- **Example**: `POST /dispatches`

### 3.6 Semantic Fault Search

#### POST /search_faults

Perform a semantic search on fault history using Cohere Embed v4 and Rerank.

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
  - NextJS API route (`/api/search_faults`) generates query embedding using Cohere Embed v4.
  - Supabase queries `fault_embeddings` with pgvector for top 10 similar faults (cosine similarity).
  - Cohere Rerank reorders results, returning top 5.
- **Example**: `POST /search_faults`

### 3.7 Chat History

#### GET /chat_history

Retrieve conversation history for a well.

- **Purpose**: Fetch chat context for the GenAI assistant.
- **Query Parameters**:
  - `well_id` (required, UUID): Filter by well ID.
  - `select` (optional): Columns to return (e.g., `messages,updated_at`).
- **Response**:
  - Status: `200 OK`
  - Body: Array of chat history objects.
    ```json
    [
      {
        "id": "uuid",
        "well_id": "uuid",
        "messages": [
          { "role": "user", "content": "What’s wrong with Well-12?" },
          { "role": "assistant", "content": "Mechanical fault in pump." }
        ],
        "updated_at": "2025-04-17T10:00:00Z"
      }
    ]
    ```
- **Example**: `GET /chat_history?well_id=eq.uuid`

#### POST /chat_history

Store or update conversation history for a well.

- **Purpose**: Save assistant interactions for context-aware responses.
- **Request Body**:
  ```json
  {
    "well_id": "uuid",
    "messages": [
      { "role": "user", "content": "What’s wrong with Well-12?" },
      { "role": "assistant", "content": "Mechanical fault in pump." }
    ]
  }
  ```
- **Response**:
  - Status: `201 Created`
  - Body: Created or updated chat history object (same as GET /chat_history).
- **Example**: `POST /chat_history`

## 4. Design Considerations

- **Simplicity**: Endpoints are minimal, leveraging Supabase’s auto-generated REST API for CRUD operations on tables.
- **Real-time**: Subscriptions on `wells` and `inventory` ensure <1s updates for fault triggers and dispatches.
- **Demo Scope**: Supports 100 users, 10 requests/second, with no rate limits or authentication.
- **Semantic Search**: `POST /search_faults` integrates Cohere Embed v4 and Rerank for relevant fault history results, enhancing assistant capabilities.
- **Mock Data**: Endpoints work with `mock_data.sql` (to be created) for 25-30 wells, 10-15 parts, 2-3 warehouses, and 100-200 faults.
- **Error Handling**: Basic validation (e.g., valid UUIDs, positive quantities) to prevent demo crashes.

## 5. Assumptions

- Supabase REST API and Realtime support demo-scale traffic.
- Cohere V2 TypeScript SDK handles API calls for Embed v4 and Rerank in `/search_faults`.
- Mock data will provide realistic values for wells, parts, and faults.
- No real-world integrations (e.g., manufacturer APIs) are required.

## 6. Future Considerations

- Add pagination for `GET /faults` if fault history grows beyond 200 records.
- Implement geospatial queries for well locations (e.g., nearest wells to a fault).
- Expand `/search_faults` to include filters (e.g., by part or fault type).
- Add endpoints for warehouse metadata if needed.

## 7. Relevant Memories

Your emphasis on simplicity for the demo, as seen in your vibe coding approach with Cursor and Supabase MCP tools (e.g., insurance underwriting demo, April 6, 2025), informs the API’s minimal design. The requirement for a separate `mock_data.sql` file to seed 25-30 wells, 10-15 parts, and 2-3 warehouses aligns with your focus on realistic demo data, ensuring the API supports practical, impactful interactions.