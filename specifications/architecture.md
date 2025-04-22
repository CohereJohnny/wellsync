# Architecture - Oil & Gas GenAI Demo

## 1. Introduction

This document outlines the system architecture for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The architecture supports a NextJS frontend, a Supabase backend, and a GenAI assistant powered by Cohere's SDK, using the `command-a-03-2025` model for conversational queries and tool calling. Additionally, it leverages Cohere's Embed v3 model for semantic search of fault history to enhance fault analysis. The system is designed for demo purposes, prioritizing simplicity and functionality with no security or hardening, as specified, and no authentication. A production key for Cohere APIs ensures reliable access to Cohere's services.

## 2. System Overview

The application comprises three primary layers:

- **Frontend**: A NextJS application rendering the well card grid, well detail view, and GenAI assistant chat interface.
- **Backend**: A Supabase instance providing a PostgreSQL database, direct REST APIs for basic CRUD, real-time subscriptions, and custom Next.js API routes (`/api/*`) for chat, search, and workflow simulations.
- **GenAI Assistant**: Cohere's `command-a-03-2025` model, accessed via the Cohere SDK within Next.js API routes, handling conversational queries and tool calling. Cohere's Embed v3 model is used for semantic search of fault history.

### 2.1 Key Components

- **Frontend (NextJS)**:
  - Displays 25-30 well cards, fault simulation controls, and well details.
  - Hosts the GenAI chat panel for user-assistant interactions, including conversational queries, semantic fault history search, and initiating workflows via tool calls.
  - Subscribes to real-time updates for fault and inventory changes.
- **Backend (Supabase & Next.js API Routes)**:
  - Supabase stores data for wells, parts, inventory, faults, fault embeddings, and chat history.
  - Supabase exposes direct REST APIs for simple data retrieval (e.g., `GET /wells`).
  - Next.js API Routes (`/api/*`) handle complex logic:
    - `/api/chat`: Orchestrates Cohere interactions, context management, tool calls.
    - `/api/search_faults`: Performs semantic search using Cohere Embed/Rerank.
    - `/api/orders`, `/api/dispatches`: Simulate workflow actions (called by `/api/chat`).
    - `/api/faults`: (If needed for complex fault simulation logic beyond direct Supabase POST).
  - Supabase provides real-time subscriptions for live updates.
- **GenAI Assistant (Cohere)**:
  - Uses `command-a-03-2025` model (via `/api/chat`) for natural language queries and tool execution.
  - Uses Embed v3 model (via `/api/search_faults` and potentially Edge Functions) for semantic search.
  - Initiates simulated workflows (order/dispatch parts) via tool calls routed through `/api/chat` to `/api/orders` or `/api/dispatches`.
- **External Integration**:
  - Cohere API via SDK (Node.js/Python) for `command-a-03-2025`, Embed v3, and Rerank v3 models (https://docs.cohere.com).

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
   |   ├── Semantic Fault Search
   |   └── Tool Call Initiation (Order/Dispatch)
   |   |
   |   | (WebSocket/HTTPS)
   |   v
   | [Backend: Supabase & Next.js API Routes]
   |   ├── PostgreSQL Database (Supabase)
   |   │   ├── Wells
   |   │   ├── Parts
   |   │   ├── Inventory
   |   │   ├── Faults
   |   │   ├── Fault Embeddings
   |   │   └── Chat History
   |   ├── Supabase REST APIs (Direct CRUD)
   |   │   ├── GET /wells
   |   │   ├── POST /faults (Direct)
   |   │   ├── GET /parts
   |   │   └── GET /inventory
   |   ├── Next.js API Routes
   |   │   ├── POST /api/chat (Handles Cohere Calls)
   |   │   ├── POST /api/search_faults
   |   │   ├── POST /api/orders (Simulation)
   |   │   └── POST /api/dispatches (Simulation)
   |   └── Realtime Subscriptions (Supabase)
   |        ├── Fault Updates
   |        └── Inventory Updates
   |
   | (HTTPS)
   v
[GenAI: Cohere via SDK]
   ├── `command-a-03-2025` Model
   |   ├── Conversational Interface
   |   └── Tool Calling
   |        ├── Query Well/Fault Data (via Supabase Direct/API)
   |        ├── Query Parts/Inventory (via Supabase Direct/API)
   |        ├── Order Part (Triggers POST /api/orders)
   |        └── Dispatch Part (Triggers POST /api/dispatches)
   └── Embed v3 Model
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
  - Sends fault trigger requests (`POST /faults` directly to Supabase).
  - Relays chat messages (conversational queries, fault search prompts, workflow requests) to the `/api/chat` Next.js API route.
  - `/api/chat` interacts with Cohere `command-a-03-2025` and may trigger tool calls to `/api/orders` or `/api/dispatches` or query Supabase directly.
  - For semantic search, `/api/chat` might call `/api/search_faults` or handle it directly.
  - Displays fault search results (e.g., similar faults) in the chat panel.
- **State Management**: Zustand for managing well states, chat history (persistence via Supabase client), and fault search results.
- **Real-time**: Uses Supabase Realtime (WebSocket) for fault notifications and inventory changes.
- **Cohere Integration**: All assistant interactions funnel through `/api/chat`, which uses the Cohere SDK (Node.js). `/api/search_faults` also uses the SDK.

### 4.2 Backend (Supabase)

- **Platform**: Supabase (PostgreSQL, Direct REST APIs, Realtime) augmented by Next.js API Routes for custom logic.
- **Database**:
  - **Wells Table**: Stores 25-30 wells with columns: `id`, `name`, `camp`, `formation`, `latitude`, `longitude`, `status`, `last_maintenance`, `fault_details` (JSONB).
  - **Parts Table**: Stores 10-15 parts with columns: `part_id`, `name`, `description`, `specifications`, `manufacturer`.
  - **Inventory Table**: Tracks part stock across 3-5 warehouses with columns: `part_id`, `warehouse_id`, `stock_level`, `last_updated`.
  - **Faults Table**: Logs fault history with columns: `fault_id`, `well_id`, `part_id`, `fault_type`, `description`, `timestamp`.
  - **Fault Embeddings Table**: Stores embeddings for fault descriptions with columns: `fault_id`, `embedding` (vector).
  - **Chat History Table**: Stores conversation context with columns: `well_id`, `messages` (JSONB).
- **APIs**:
  - **Supabase Direct REST APIs**: Used for basic CRUD (e.g., `GET /wells`, `GET /parts`, `GET /inventory`, `POST /faults`). Primarily called by frontend components or `/api/chat`.
  - **Next.js API Routes**:
    - `POST /api/chat`: Central handler for Cohere interactions, context management, tool calls.
    - `POST /api/orders`: Simulation endpoint for ordering parts (called by `/api/chat`).
    - `POST /api/dispatches`: Simulation endpoint for dispatching parts, including inventory check/update (called by `/api/chat`).
    - `POST /api/search_faults`: Handles semantic fault search using Cohere Embed/Rerank and Supabase vector search.
- **Realtime**:
  - Subscriptions for `wells` and `inventory` tables to push updates (e.g., status changes, stock levels).
  - Broadcasts fault triggers to update frontend in <1 second.
- **Security**:
  - No authentication or Row-Level Security (RLS), as specified for demo.
  - APIs publicly accessible for simplicity.

### 4.3 GenAI Assistant (Cohere via SDK)

- **Integration**: Cohere Node.js SDK (`cohere-ai`) used within Next.js API routes (`/api/chat`, `/api/search_faults`) for accessing `command-a-03-2025`, Embed v3, and Rerank v3 models, using production API key.

- **Responsibilities**:

  - **`command-a-03-2025` Model**: Processes natural language queries (e.g., "What's wrong with Well-12?") via `/api/chat` and executes tool calls for:
    - Well data (Querying Supabase directly or via dedicated API if needed).
    - Part details (Querying Supabase directly).
    - Inventory status (Querying Supabase directly).
    - Workflow actions (Triggering `/api/orders`, `/api/dispatches` simulations).
  - **Embed v3 Model**: Generates embeddings for fault descriptions (potentially via Edge Function on insert) and user queries (via `/api/search_faults`) to enable semantic search.
  - **Rerank v3 Model**: Refines semantic search results within `/api/search_faults`.
  - Maintains conversation context using chat history retrieved from and saved to Supabase `chat_history` table via `/api/chat`.

- **Tool Calling (`command-a-03-2025` Model)**:

  - Implemented within `/api/chat` using Cohere's Chat API (`command-a-03-2025`) with tool definitions (`order_part`, `dispatch_part`) in JSON schema.
  - `/api/chat` receives tool call requests from Cohere.
  - `/api/chat` makes `fetch` calls to the simulation endpoints (`/api/orders`, `/api/dispatches`).
  - `/api/chat` formats simulation results and sends them back to Cohere for the final response generation.

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

- **Semantic Search (Embed v3 Model)**:

  - See Section 5 for detailed implementation.

- **Data Flow**:

  - **Conversational Queries**:
    - Frontend sends query to NextJS API route (`/api/chat`).
    - `/api/chat` retrieves history, calls Cohere (`command-a-03-2025`), potentially executes tool calls (querying Supabase or calling simulation APIs), saves updated history, and streams the final response back to the frontend.
  - **Workflows**:
    - User request triggers `order_part` or `dispatch_part` tool call via Cohere in `/api/chat`.
    - `/api/chat` calls `POST /api/orders` or `POST /api/dispatches`.
    - Simulation result is processed by `/api/chat` and Cohere generates a confirmation message.
  - **Fault Search**:
    - Frontend sends fault-related query to `/api/search_faults`.
    - API route uses Embed v3 model to generate query embedding, calls Supabase vector search function, uses Rerank v3, and returns similar faults.

- **SDK Usage**:

  - Example for chat (simplified):

    ```python
    import { CohereClient } from "cohere-ai";
    const co = new CohereClient({ token: process.env.COHERE_API_KEY });
    response = co.chat_stream(
      model="command-a-03-2025",
      messages=[{"role": "user", "content": "What's wrong with Well-12?"}],
      tools=[order_part_tool, dispatch_part_tool]
    )
    for event in response:
      if event.type == "content-delta":
        # Stream response to frontend
    ```

  - Example for embeddings (see Section 5).

- **Parameters**:

  - `command-a-03-2025` Model: Temperature ~0.3 for factual responses, appropriate max tokens.
  - Embed v3 Model: Configured for text embeddings (see Section 5).
  - Chat History: Passed from Supabase `chat_history` table for context within `/api/chat`.

## 5. Leveraging Cohere's Embed Model for Semantic Search of Fault History

Cohere's Embed v3 model (e.g., `embed-english-v3.0`) generates high-dimensional vector embeddings for text, enabling semantic search by comparing the similarity of fault descriptions. This enhances the demo by allowing the Production Supervisor to find similar faults across wells, identifying patterns or recurring issues (e.g., "Find faults similar to Well-12's pump failure"). Below is an expanded explanation of the implementation, benefits, and integration.

### 5.1 Concept

- **Purpose**: Enable the assistant to search fault history semantically, retrieving faults with similar characteristics (e.g., part, fault type, or description) rather than exact keyword matches.
- **Use Case**: The Production Supervisor asks, "Have we seen faults like the one on Well-12 before?" The assistant returns a list of similar faults (e.g., other pump failures or mechanical issues) across wells.
- **Benefit**:
  - Identifies recurring issues for proactive maintenance.
  - Provides context for fault resolution (e.g., "Similar faults were resolved by replacing the pump").
  - Enhances demo appeal by showcasing advanced AI capabilities.

### 5.2 Implementation

- **Embedding Generation**:

  - When a fault is created (`POST /faults`), the fault description (e.g., "Centrifugal pump failed due to mechanical wear") is sent to the Embed v3 model.

  - Cohere generates a vector embedding (e.g., 1024 dimensions for `embed-english-v3.0`).

  - Embedding stored in `fault_embeddings` table with `fault_id` and `embedding` (vector).

  - Example:

    ```python
    import { CohereClient } from "cohere-ai";
    const co = new CohereClient({ token: process.env.COHERE_API_KEY });
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

  - User queries assistant (e.g., "Find similar faults to Well-12").

  - Frontend sends query to `/api/search_faults`, which extracts the fault description or user input.

  - API route generates an embedding for the query using Embed v3 model:

    ```python
    query = "Pump failure on Well-12"
    response = co.embed(
      model="embed-english-v3.0",
      input_type="search_query",
      texts=[query]
    )
    query_embedding = response.embeddings[0]
    ```

  - Supabase API (`POST /search_faults`) computes cosine similarity between query embedding and stored fault embeddings using PostgreSQL's vector extension (pgvector).

  - Query example:

    ```sql
    SELECT fault_id, description, similarity_score
    FROM faults f
    JOIN fault_embeddings fe ON f.fault_id = fe.fault_id
    ORDER BY fe.embedding <=> :query_embedding
    LIMIT 5;
    ```

  - Returns top 5 similar faults with their descriptions.

- **Integration**:

  - Fault embeddings generated on fault creation via a Supabase Edge Function invoking Cohere SDK.
  - Semantic search triggered via assistant query, handled by `/api/chat` potentially calling `/api/search_faults`.
  - Results displayed in chat panel (e.g., "Found 3 similar faults: Well-05 pump failure, Well-18 valve issue...").

- **Parameters**:

  - Embed Model: `embed-english-v3.0` (or other v3 variant) for high-quality embeddings.
  - Rerank Model: `rerank-english-v3.0` (or multilingual).
  - Input Type: `search_document` for fault descriptions, `search_query` for user queries.
  - Truncate: `END` to handle long descriptions.
  - Top-K: 5 final results after reranking for relevance and demo simplicity.

### 5.3 Benefits for Demo

- **Enhanced Insights**: Identifies patterns (e.g., frequent pump failures in Wolfcamp formation), impressing stakeholders.
- **Natural Interaction**: Users query in natural language (e.g., "Similar issues to this?"), showcasing Cohere's capabilities.
- **Scalability**: Handles 100-200 fault records efficiently with pgvector indexing.
- **Reusability**: Embeddings can support future features (e.g., clustering faults by similarity).

### 5.4 Challenges and Mitigations

- **Embedding Storage**: Fault embeddings (1024 floats) require ~4KB per fault. For 200 faults, ~800KB total, manageable in Supabase.
  - Mitigation: Use pgvector's HNSW index for fast similarity search.
- **API Costs**: Embedding generation and queries consume API calls.
  - Mitigation: Pre-compute embeddings on fault creation; cache frequent query results in Supabase.
- **Relevance**: Semantic search may return less relevant matches for vague queries.
  - Mitigation: Fine-tune prompts (e.g., "Describe the fault in detail") and display top 5 results only.

### 5.5 Demo Integration

- **Trigger**: Assistant recognizes fault history queries (e.g., "Similar faults to Well-12") using `command-a-03-2025` model's intent detection.
- **Display**: Results shown in chat panel with fault ID, well, and description (e.g., "Well-05: Pump failure, 2025-04-10").
- **Workflow**: Users can ask follow-ups (e.g., "How was Well-05 fixed?"), linking to existing tools (e.g., `GET /faults`).
- **Data Prep**: Seed Supabase with 100-200 fault records across 25-30 wells, with varied descriptions for meaningful search results.

### 5.6 Future Enhancements (Semantic Search)

- Cluster faults by embedding similarity to identify common failure modes.
- Combine semantic search with structured filters (e.g., "Similar pump faults in Midland").
- Use embeddings for predictive maintenance (e.g., flag wells at risk based on fault patterns).

## 6. Data Flow

1. **Initial Load**:
   - Frontend fetches well data (`GET /wells`) and renders grid.
   - Subscribes to Supabase Realtime for fault and inventory updates.
2. **Fault Simulation**:
   - User triggers fault (`POST /faults`).
   - Supabase updates `wells` and `faults` tables.
   - A Supabase Edge Function triggers on `faults` insert, calls Cohere Embed v3, and saves the embedding to `fault_embeddings`.
   - Broadcasts change via Realtime; frontend updates well status to red.
3. **Well Details**:
   - User clicks well card; frontend fetches details (`GET /wells/:id`, `GET /faults/:id` via Supabase client).
   - Data displayed in well detail view.
4. **Assistant Interaction**:
   - User types message in chat panel.
   - Frontend sends message and `wellId` to `/api/chat`.
   - `/api/chat` handles conversation:
     - Retrieves/updates chat history from Supabase `chat_history` table.
     - Calls Cohere `command-a-03-2025`.
     - **If Tool Call requested (e.g., `order_part`)**: `/api/chat` calls simulation endpoint (`POST /api/orders`), gets result, sends result back to Cohere.
     - **If Semantic Search needed**: `/api/chat` calls `/api/search_faults` (which uses Cohere Embed/Rerank + Supabase vector search) or handles directly.
     - **Otherwise**: Streams natural language response.
   - Final response/confirmation streamed to frontend.
5. **Real-time Updates**:
   - E.g., If `/api/dispatches` updates inventory, Supabase pushes change to frontend via Realtime.
   - Frontend updates relevant UI elements dynamically.

## 7. Scalability and Performance

- **Frontend**:
  - Optimized for <2s load time for 30 well cards using NextJS server-side rendering.
  - Caches well data in-memory (Zustand) to reduce API calls.
- **Backend**:
  - Supabase handles 100 concurrent users and 10 requests/second for demo.
  - Indexes on `wells.id`, `parts.part_id`, `inventory.part_id`, `chat_history.well_id`, `fault_embeddings.embedding` (HNSW).
- **GenAI**:
  - Cohere production key ensures reliable API access (e.g., 10,000 calls/month for paid tier).
  - `command-a-03-2025` model responses in <3s; Embed v3 model queries in <1s.
  - Fault search scales to 200 fault records with pgvector indexing.
- **Real-time**:
  - Supabase Realtime supports 100 concurrent WebSocket connections.
  - Fault updates delivered in <1s via WebSocket.

## 8. Security Considerations

- **No Security**: No authentication, RLS, or hardening, as specified.
- **API Access**: Supabase APIs publicly accessible; Cohere production key stored in environment variables (`.env.local` for Next.js).
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
  - Production API key configured in `.env.local` for `command-a-03-2025`, Embed v3, Rerank v3 models.
  - SDK installed (`npm install cohere-ai`).

## 10. Assumptions

- Supabase supports demo-scale data (30 wells, 15 parts, 200 faults).
- Cohere production key provides sufficient API quota (e.g., 10,000 calls/month).
- `command-a-03-2025` and Embed v3 models deliver reliable responses with low latency.
- Users access demo on modern browsers (Chrome, Firefox, Edge).
- No real-world integrations required.

## 11. Future Considerations

- Cluster fault embeddings to detect failure patterns.
- Integrate Embed v3 model for semantic search of part descriptions or well notes.
- Support secondary personas (e.g., Field Technician) with tailored views.
- Add predictive analytics using fault history embeddings (out of scope for demo).