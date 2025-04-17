# Architecture - Oil & Gas GenAI Demo

## 1. Introduction

This document outlines the system architecture for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The architecture supports a NextJS frontend, a Supabase backend, and a GenAI assistant powered by Cohere’s SDK, using the Command model for conversational queries and tool calling. Additionally, it explores the use of Cohere’s Embed model for semantic search of fault history to enhance fault analysis. The system is designed for demo purposes, prioritizing simplicity and functionality with no security or hardening, as specified, and no authentication. A production key for Cohere APIs ensures reliable access to Cohere’s services.

## 2. System Overview

The application comprises three primary layers:

- **Frontend**: A NextJS application rendering the well card grid, well detail view, and GenAI assistant chat interface.
- **Backend**: A Supabase instance providing a PostgreSQL database, REST APIs, and real-time subscriptions for well and inventory data.
- **GenAI Assistant**: Cohere’s Command model, accessed via the Cohere Python SDK, handling conversational queries and tool calling. Cohere’s Embed model is used for semantic search of fault history.

### 2.1 Key Components

- **Frontend (NextJS)**:
  - Displays 25-30 well cards, fault simulation controls, and well details.
  - Hosts the GenAI chat panel for user-assistant interactions, including fault history queries.
  - Subscribes to real-time updates for fault and inventory changes.
- **Backend (Supabase)**:
  - Stores data for wells, parts, inventory, faults, and fault embeddings.
  - Exposes APIs for data retrieval, fault triggers, workflow actions, and semantic search.
  - Provides real-time subscriptions for live updates.
- **GenAI Assistant (Cohere)**:
  - Uses Command model for natural language queries about wells, parts, and inventory.
  - Uses Embed model for semantic search of fault history, enabling similarity-based fault analysis.
  - Initiates workflows (e.g., order/dispatch parts) via API calls.
- **External Integration**:
  - Cohere API via Python SDK for Command and Embed models (https://docs.cohere.com).

## 3. Architecture Diagram (Text-Based)

```
[User]
   |
   | (HTTPS)
   v
[Frontend: NextJS]
   ├── Well Card Grid
   ├── Toolbar (Fault Trigger)
   ├── Well Detail View
   └── GenAI Chat Panel
   |   ├── Conversational Queries
   |   └── Semantic Fault Search
   |   |
   |   | (WebSocket/HTTPS)
   |   v
   | [Backend: Supabase]
   |   ├── PostgreSQL Database
   |   │   ├── Wells
   |   │   ├── Parts
   |   │   ├── Inventory
   |   │   ├── Faults
   |   │   └── Fault Embeddings
   |   ├── REST APIs
   |   │   ├── GET /wells
   |   │   ├── POST /faults
   |   │   ├── GET /parts
   |   │   ├── GET /inventory
   |   │   ├── POST /orders
   |   │   ├── POST /dispatches
   |   │   └── POST /search_faults
   |   └── Realtime Subscriptions
   |        ├── Fault Updates
   |        └── Inventory Updates
   |
   | (HTTPS)
   v
[GenAI: Cohere via SDK]
   ├── Command Model
   |   ├── Conversational Interface
   |   └── Tool Calling
   |        ├── Query Well/Fault Data
   |        ├── Query Parts/Inventory
   |        ├── Order Part
   |        └── Dispatch Part
   └── Embed Model
        └── Semantic Fault Search
```

## 4. Component Details

### 4.1 Frontend (NextJS)

- **Framework**: NextJS 14 with App Router, hosted on Vercel.
- **Responsibilities**:
  - Renders responsive grid of 25-30 well cards with status indicators (green/red).
  - Provides toolbar for fault simulation and filtering by camp, formation, or status.
  - Displays well detail view with split layout: well info (left), Cohere-powered chat panel (right).
  - Supports fault history queries via semantic search in the chat panel.
  - Manages real-time updates via Supabase Realtime client.
- **Data Flow**:
  - Fetches initial well data via Supabase REST API (`GET /wells`).
  - Subscribes to fault and inventory updates via Supabase Realtime.
  - Sends fault trigger requests (`POST /faults`).
  - Relays chat queries (conversational and fault search) to Cohere SDK via NextJS API routes.
  - Displays fault search results (e.g., similar faults) in the chat panel.
- **State Management**: Zustand for managing well states, chat history, and fault search results.
- **Real-time**: Uses Supabase Realtime (WebSocket) for fault notifications and inventory changes.
- **Cohere Integration**: Queries sent to NextJS API routes (`/api/chat`, `/api/search_faults`) that invoke the Cohere SDK.

### 4.2 Backend (Supabase)

- **Platform**: Supabase (PostgreSQL, REST APIs, Realtime).
- **Database**:
  - **Wells Table**: Stores 25-30 wells with columns: `id`, `name`, `camp`, `formation`, `latitude`, `longitude`, `status`, `last_maintenance`, `fault_details` (JSONB).
  - **Parts Table**: Stores 10-15 parts with columns: `part_id`, `name`, `description`, `specifications`, `manufacturer`.
  - **Inventory Table**: Tracks part stock across 3-5 warehouses with columns: `part_id`, `warehouse_id`, `stock_level`, `last_updated`.
  - **Faults Table**: Logs fault history with columns: `fault_id`, `well_id`, `part_id`, `fault_type`, `description`, `timestamp`.
  - **Fault Embeddings Table**: Stores embeddings for fault descriptions with columns: `fault_id`, `embedding` (vector).
  - **Chat History Table**: Stores conversation context with columns: `well_id`, `messages` (JSONB).
- **APIs**:
  - `GET /wells`: Retrieves all wells or a specific well by ID.
  - `GET /faults/:well_id`: Fetches fault history for a well.
  - `POST /faults`: Triggers a fault (specifies well, part, fault type, description).
  - `GET /parts`: Retrieves part details by ID or all parts.
  - `GET /inventory/:part_id`: Checks stock levels across warehouses.
  - `POST /orders`: Simulates ordering a part from the manufacturer.
  - `POST /dispatches`: Simulates dispatching a part from a warehouse.
  - `POST /search_faults`: Performs semantic search using fault embeddings (accepts query embedding, returns similar faults).
- **Realtime**:
  - Subscriptions for `wells` and `inventory` tables to push updates (e.g., status changes, stock levels).
  - Broadcasts fault triggers to update frontend in &lt;1 second.
- **Security**:
  - No authentication or Row-Level Security (RLS), as specified for demo.
  - APIs publicly accessible for simplicity.

### 4.3 GenAI Assistant (Cohere via SDK)

- **Integration**: Cohere Python SDK (cohere-python) for accessing Command and Embed models, using production API key.

- **Responsibilities**:

  - **Command Model**: Processes natural language queries (e.g., “What’s wrong with Well-12?”) and executes tool calls for:
    - Well data (`GET /wells/:id`, `GET /faults/:well_id`).
    - Part details (`GET /parts/:part_id`).
    - Inventory status (`GET /inventory/:part_id`).
    - Workflow actions (`POST /orders`, `POST /dispatches`).
  - **Embed Model**: Generates embeddings for fault descriptions and user queries to enable semantic search of fault history.
  - Maintains conversation context using chat history stored in Supabase.

- **Tool Calling (Command Model)**:

  - Implemented using Cohere’s Chat API with tool definitions in JSON schema.

  - Example tool schema:

    ```json
    {
      "name": "get_well",
      "description": "Fetch well details",
      "parameters": {
        "well_id": {"type": "string"}
      }
    }
    ```

  - Tools defined for wells, faults, parts, inventory, orders, and dispatches.

- **Semantic Search (Embed Model)**:

  - See Section 5 for detailed implementation.

- **Data Flow**:

  - **Conversational Queries**:
    - Frontend sends query to NextJS API route (`/api/chat`).
    - API route initializes Cohere client (`cohere.ClientV2`) and sends query to Chat API with Command model.
    - Command model processes query, executes tool calls to Supabase, and generates response.
    - Response formatted in markdown and returned to frontend.
  - **Workflows**:
    - Command model sends `POST /orders` or `POST /dispatches` for workflows.
    - Confirmation returned to frontend (e.g., “Pump ordered”).
  - **Fault Search**:
    - Frontend sends fault-related query to `/api/search_faults`.
    - API route uses Embed model to generate query embedding, calls `POST /search_faults`, and returns similar faults.

- **SDK Usage**:

  - Example for chat (simplified):

    ```python
    import cohere
    co = cohere.ClientV2(api_key=process.env.COHERE_API_KEY)
    response = co.chat_stream(
      model="command-r-plus-08-2024",
      messages=[{"role": "user", "content": "What’s wrong with Well-12?"}],
      tools=[get_well_tool, get_faults_tool]
    )
    for event in response:
      if event.type == "content-delta":
        # Stream response to frontend
    ```

  - Example for embeddings (see Section 5).

- **Parameters**:

  - Command Model: Temperature 0.3 for accurate responses, max tokens 500 for concise replies.
  - Embed Model: Configured for text embeddings (see Section 5).
  - Chat History: Passed from Supabase `chat_history` table for context.

## 5. Leveraging Cohere’s Embed Model for Semantic Search of Fault History

Cohere’s Embed model (e.g., `embed-english-v3.0`) generates high-dimensional vector embeddings for text, enabling semantic search by comparing the similarity of fault descriptions. This enhances the demo by allowing the Production Supervisor to find similar faults across wells, identifying patterns or recurring issues (e.g., “Find faults similar to Well-12’s pump failure”). Below is an expanded explanation of the implementation, benefits, and integration.

### 5.1 Concept

- **Purpose**: Enable the assistant to search fault history semantically, retrieving faults with similar characteristics (e.g., part, fault type, or description) rather than exact keyword matches.
- **Use Case**: The Production Supervisor asks, “Have we seen faults like the one on Well-12 before?” The assistant returns a list of similar faults (e.g., other pump failures or mechanical issues) across wells.
- **Benefit**:
  - Identifies recurring issues for proactive maintenance.
  - Provides context for fault resolution (e.g., “Similar faults were resolved by replacing the pump”).
  - Enhances demo appeal by showcasing advanced AI capabilities.

### 5.2 Implementation

- **Embedding Generation**:

  - When a fault is created (`POST /faults`), the fault description (e.g., “Centrifugal pump failed due to mechanical wear”) is sent to the Embed model.

  - Cohere generates a vector embedding (e.g., 1024 dimensions for `embed-english-v3.0`).

  - Embedding stored in `fault_embeddings` table with `fault_id` and `embedding` (vector).

  - Example:

    ```python
    import cohere
    co = cohere.ClientV2(api_key=process.env.COHERE_API_KEY)
    description = "Centrifugal pump failed due to mechanical wear"
    response = co.embed(
      model="embed-english-v3.0",
      input_type="search_document",
      texts=[description]
    )
    embedding = response.embeddings[0]
    # Store in Supabase: INSERT INTO fault_embeddings (fault_id, embedding)
    ```

- **Search Process**:

  - User queries assistant (e.g., “Find similar faults to Well-12”).

  - Frontend sends query to `/api/search_faults`, which extracts the fault description or user input.

  - API route generates an embedding for the query using Embed model:

    ```python
    query = "Pump failure on Well-12"
    response = co.embed(
      model="embed-english-v3.0",
      input_type="search_query",
      texts=[query]
    )
    query_embedding = response.embeddings[0]
    ```

  - Supabase API (`POST /search_faults`) computes cosine similarity between query embedding and stored fault embeddings using PostgreSQL’s vector extension (pgvector).

  - Query example:

    ```sql
    SELECT fault_id, description
    FROM faults f
    JOIN fault_embeddings fe ON f.fault_id = fe.fault_id
    ORDER BY fe.embedding <=> :query_embedding
    LIMIT 5;
    ```

  - Returns top 5 similar faults with their descriptions.

- **Integration**:

  - Fault embeddings generated on fault creation via a Supabase Edge Function invoking Cohere SDK.
  - Semantic search triggered via assistant query, handled by NextJS API route.
  - Results displayed in chat panel (e.g., “Found 3 similar faults: Well-05 pump failure, Well-18 valve issue…”).

- **Parameters**:

  - Model: `embed-english-v3.0` for high-quality embeddings.
  - Input Type: `search_document` for fault descriptions, `search_query` for user queries.
  - Truncate: `END` to handle long descriptions.
  - Top-K: 5 results for relevance and demo simplicity.

### 5.3 Benefits for Demo

- **Enhanced Insights**: Identifies patterns (e.g., frequent pump failures in Wolfcamp formation), impressing stakeholders.
- **Natural Interaction**: Users query in natural language (e.g., “Similar issues to this?”), showcasing Cohere’s capabilities.
- **Scalability**: Handles 100-200 fault records efficiently with pgvector indexing.
- **Reusability**: Embeddings can support future features (e.g., clustering faults by similarity).

### 5.4 Challenges and Mitigations

- **Embedding Storage**: Fault embeddings (1024 floats) require \~4KB per fault. For 200 faults, \~800KB total, manageable in Supabase.
  - Mitigation: Use pgvector’s HNSW index for fast similarity search.
- **API Costs**: Embedding generation and queries consume API calls.
  - Mitigation: Pre-compute embeddings on fault creation; cache frequent query results in Supabase.
- **Relevance**: Semantic search may return less relevant matches for vague queries.
  - Mitigation: Fine-tune prompts (e.g., “Describe the fault in detail”) and display top 5 results only.

### 5.5 Demo Integration

- **Trigger**: Assistant recognizes fault history queries (e.g., “Similar faults to Well-12”) using Command model’s intent detection.
- **Display**: Results shown in chat panel with fault ID, well, and description (e.g., “Well-05: Pump failure, 2025-04-10”).
- **Workflow**: Users can ask follow-ups (e.g., “How was Well-05 fixed?”), linking to existing tools (e.g., `GET /faults`).
- **Data Prep**: Seed Supabase with 100-200 fault records across 25-30 wells, with varied descriptions for meaningful search results.

### 5.6 Future Enhancements

- Cluster faults by embedding similarity to identify common failure modes.
- Combine semantic search with structured filters (e.g., “Similar pump faults in Midland”).
- Use embeddings for predictive maintenance (e.g., flag wells at risk based on fault patterns).

## 6. Data Flow

1. **Initial Load**:
   - Frontend fetches well data (`GET /wells`) and renders grid.
   - Subscribes to Supabase Realtime for fault and inventory updates.
2. **Fault Simulation**:
   - User triggers fault (`POST /faults`).
   - Supabase updates `wells` and `faults` tables, generates embedding for fault description, stores in `fault_embeddings`.
   - Broadcasts change via Realtime; frontend updates well status to red.
3. **Well Details**:
   - User clicks well card; frontend fetches details (`GET /wells/:id`, `GET /faults/:id`).
   - Data displayed in well detail view.
4. **Assistant Interaction**:
   - **Conversational Query**: Frontend sends query to `/api/chat`; Cohere Command model calls Supabase APIs and responds.
   - **Fault Search**: Frontend sends query to `/api/search_faults`; Embed model generates query embedding, Supabase returns similar faults.
   - Workflows: Command model sends `POST /orders` or `POST /dispatches`; frontend displays confirmation.
5. **Real-time Updates**:
   - Supabase pushes fault or inventory changes to frontend via Realtime.
   - Frontend updates well cards or chat panel dynamically.

## 7. Scalability and Performance

- **Frontend**:
  - Optimized for &lt;2s load time for 30 well cards using NextJS server-side rendering.
  - Caches well data in-memory (Zustand) to reduce API calls.
- **Backend**:
  - Supabase handles 100 concurrent users and 10 requests/second for demo.
  - Indexes on `wells.id`, `parts.part_id`, `inventory.part_id`, `fault_embeddings.embedding` (HNSW).
- **GenAI**:
  - Cohere production key ensures reliable API access (e.g., 10,000 calls/month for paid tier).
  - Command model responses in &lt;3s; Embed model queries in &lt;1s.
  - Fault search scales to 200 fault records with pgvector indexing.
- **Real-time**:
  - Supabase Realtime supports 100 concurrent WebSocket connections.
  - Fault updates delivered in &lt;1s via WebSocket.

## 8. Security Considerations

- **No Security**: No authentication, RLS, or hardening, as specified.
- **API Access**: Supabase APIs publicly accessible; Cohere production key stored in environment variables.
- **Risks**: Data exposed to anyone with demo URL; acceptable for demo.
- **HTTPS**: Used for all communication for basic encryption.

## 9. Deployment

- **Frontend**: Deployed on Vercel for NextJS, with CI/CD via GitHub.
- **Backend**: Hosted on Supabase (managed PostgreSQL, APIs, Realtime).
- **GenAI**: Accessed via Cohere API with production key.
- **Environment**:
  - Vercel: Configured for production with domain setup.
  - Supabase: Pre-seeded with 25-30 wells, 10-15 parts, 3-5 warehouses, 100-200 fault records.
  - Environment variables: `COHERE_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`.
- **Cohere Setup**:
  - Production API key configured in `.env` for Command and Embed models.
  - SDK installed (`npm install cohere-ai` or `pip install cohere` for Edge Functions).

## 10. Assumptions

- Supabase supports demo-scale data (30 wells, 15 parts, 200 faults).
- Cohere production key provides sufficient API quota (e.g., 10,000 calls/month).
- Command and Embed models deliver reliable responses with low latency.
- Users access demo on modern browsers (Chrome, Firefox, Edge).
- No real-world integrations required.

## 11. Future Considerations

- Cluster fault embeddings to detect failure patterns.
- Integrate Embed model for semantic search of part descriptions or well notes.
- Support secondary personas (e.g., Field Technician) with tailored views.
- Add predictive analytics using fault history embeddings (out of scope for demo).