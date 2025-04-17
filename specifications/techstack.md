# Tech Stack - Oil & Gas GenAI Demo

## 1. Introduction

This document outlines the technology stack for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The stack supports a NextJS frontend, Supabase backend, and Cohere’s Command A, Embed v4, and Rerank models for conversational queries, semantic fault search, and result reordering. The demo is built for simplicity and functionality, with no security or hardening, as specified, and uses a production key for Cohere APIs. Testing is handled manually via browser, and Supabase MCP tools are enabled in Cursor for vibe coding.

## 2. Technology Stack Overview

The tech stack is divided into four main areas: Frontend, Backend, GenAI Integration, and Deployment/DevOps. Each component is selected to meet the demo’s requirements for real-time updates, intuitive UI, and AI-driven interactions with 25-30 wells and 10-15 parts.

### 2.1 Frontend

- **Framework**: NextJS 14
  - Purpose: Server-side rendering, API routes, and App Router for efficient page navigation.
  - Version: 14.x (latest stable for 2025).
  - Rationale: Optimized for fast load times (&lt;2s for 30 well cards) and seamless integration with Supabase and Cohere.
- **UI Library**: Tailwind CSS
  - Purpose: Rapid styling for responsive well card grid and well detail view.
  - Version: 3.x.
  - Rationale: Simplifies responsive design for desktop/tablet with utility-first classes.
- **Component Library**: Shadcn/UI
  - Purpose: Pre-built, customizable components for toolbar, modals, and chat panel.
  - Version: Latest (2025).
  - Rationale: Accessible, lightweight components that integrate with Tailwind CSS.
- **State Management**: Zustand
  - Purpose: Manage well states, chat history, and fault search results.
  - Version: 4.x.
  - Rationale: Lightweight and performant for demo-scale state management.
- **Real-time Client**: Supabase JavaScript Client (@supabase/supabase-js)
  - Purpose: Handles WebSocket subscriptions for fault and inventory updates.
  - Version: 2.x.
  - Rationale: Native integration with Supabase Realtime for &lt;1s fault updates.
- **HTTP Client**: Axios
  - Purpose: Makes API calls to Supabase and NextJS API routes.
  - Version: 1.x.
  - Rationale: Simplifies HTTP requests with promise-based syntax.
- **Markdown Rendering**: React-Markdown
  - Purpose: Renders Cohere Command A’s markdown-formatted responses in the chat panel.
  - Version: 9.x.
  - Rationale: Lightweight and supports secure markdown rendering.

### 2.2 Backend

- **Platform**: Supabase
  - Purpose: Managed PostgreSQL database, REST APIs, Realtime subscriptions, and MCP tools.
  - Version: Latest (2025, hosted).
  - Rationale: Scalable backend with minimal setup, supports demo-scale data (30 wells, 15 parts, 200 faults), and integrates with MCP tools in Cursor.
- **Database**: PostgreSQL (via Supabase)
  - Purpose: Stores wells, parts, inventory, faults, fault embeddings, and chat history.
  - Version: 15.x (Supabase default).
  - Rationale: Robust relational database with JSONB and vector support for fault embeddings.
- **Vector Extension**: pgvector
  - Purpose: Stores and queries fault embeddings for semantic search.
  - Version: 0.5.x.
  - Rationale: Enables efficient cosine similarity search for Cohere Embed v4 embeddings.
- **Edge Functions**: Supabase Edge Functions (Deno)
  - Purpose: Generates fault embeddings on fault creation using Cohere TypeScript SDK.
  - Version: Latest (2025).
  - Rationale: Serverless functions for lightweight backend logic, integrated with Supabase.
- **API Framework**: Supabase REST API
  - Purpose: Exposes endpoints for wells, faults, parts, inventory, orders, dispatches, and fault search.
  - Version: Built-in with Supabase.
  - Rationale: Auto-generated APIs reduce development time.
- **Realtime**: Supabase Realtime
  - Purpose: Pushes fault and inventory updates to frontend via WebSocket.
  - Version: Built-in with Supabase.
  - Rationale: Ensures &lt;1s updates for fault notifications.
- **MCP Tools**: Supabase MCP Tools (via Cursor)
  - Purpose: Enables vibe coding with model context protocol for rapid development and data retrieval in Supabase.
  - Version: Latest (2025, integrated in Cursor).
  - Rationale: Streamlines development by leveraging your Cursor setup.

### 2.3 GenAI Integration

- **SDK**: Cohere V2 SDK for TypeScript (@cohere-ai/sdk)
  - Purpose: Accesses Cohere’s Command A, Embed v4, and Rerank models for conversational queries, semantic fault search, and result reordering.
  - Version: 2.x (latest for 2025).
  - Rationale: TypeScript-based SDK integrates natively with NextJS, enabling API calls within API routes and Edge Functions.
- **Conversational Model**: Cohere Command A (command-a-03-2025)
  - Purpose: Handles natural language queries and tool calling for well, part, and inventory data.
  - Version: command-a-03-2025 (released March 2025, 111B parameters, 256K context length).
  - Parameters: Temperature 0.3, max tokens 500.
  - Rationale: High-performance model for enterprise tasks like RAG and tool use, ideal for fault diagnosis and workflows.
- **Embedding Model**: Cohere Embed v4 (embed-v4-03-2025)
  - Purpose: Generates vector embeddings (1024 dimensions) for fault descriptions and queries, supporting Matryoshka embeddings for semantic search.
  - Version: embed-v4-03-2025 (released 2025).
  - Parameters: Input type `search_document` for faults, `search_query` for user input, truncate `END`, embedding dimension 1024.
  - Rationale: State-of-the-art embeddings for precise semantic similarity in fault history search.
- **Rerank Model**: Cohere Rerank (rerank-v3.5)
  - Purpose: Reorders semantic search results to improve relevance for fault history queries.
  - Version: rerank-v3.5 (released December 2024).
  - Parameters: Top_n 5, context length 500 tokens per document.
  - Rationale: Enhances fault search by prioritizing relevant results, improving demo user experience.
- **API Key**: Cohere Production Key
  - Purpose: Authenticates API calls to Cohere services.
  - Storage: Environment variable (`COHERE_API_KEY`).
  - Rationale: Production key ensures reliable access with high API limits (e.g., 10,000 calls/month).

### 2.4 Deployment and DevOps

- **Hosting (Frontend)**: Vercel
  - Purpose: Deploys NextJS application with automatic scaling and CI/CD.
  - Version: Latest (2025).
  - Rationale: Simplifies deployment and optimizes NextJS performance.
- **Hosting (Backend)**: Supabase
  - Purpose: Hosts PostgreSQL, APIs, Realtime, and Edge Functions.
  - Version: Latest (2025, hosted).
  - Rationale: Managed service with pre-configured tools for demo needs.
- **Version Control**: GitHub
  - Purpose: Stores source code and manages CI/CD pipelines.
  - Version: Latest (2025).
  - Rationale: Standard for collaboration and integration with Vercel/Supabase.
- **CI/CD**: Vercel GitHub Integration
  - Purpose: Automates frontend builds and deployments on code push.
  - Version: Built-in with Vercel.
  - Rationale: Streamlines development for rapid demo iterations.
- **Environment Variables**:
  - `COHERE_API_KEY`: Cohere production key.
  - `SUPABASE_URL`: Supabase project URL.
  - `SUPABASE_KEY`: Supabase anon key for public API access.
  - Purpose: Configures API access (no additional hardening).
  - Rationale: Simplifies demo setup.

### 2.5 Development Tools

- **IDE**: Cursor
  - Purpose: Code editing with Supabase MCP tools enabled for vibe coding.
  - Version: Latest (2025).
  - Rationale: Supports rapid development with AI-assisted coding and Supabase integration.
- **Package Manager**: pnpm
  - Purpose: Manages frontend dependencies (NextJS, Tailwind, etc.).
  - Version: 9.x (latest for 2025).
  - Rationale: Faster and disk-efficient package management for demo project setup.
- **Linter/Formatter**: ESLint + Prettier
  - Purpose: Enforces code style and quality for JavaScript/TypeScript.
  - Versions: ESLint 8.x, Prettier 3.x.
  - Rationale: Ensures consistent, readable code.
- **Type Checking**: TypeScript
  - Purpose: Adds type safety to frontend and API routes.
  - Version: 5.x.
  - Rationale: Reduces runtime errors in demo codebase.
- **Supabase CLI**: Supabase CLI
  - Purpose: Manages database schema, migrations, and Edge Functions.
  - Version: 1.x.
  - Rationale: Simplifies Supabase development and seeding.

## 3. Tech Stack Summary Table

| **Category** | **Technology** | **Purpose** |
| --- | --- | --- |
| **Frontend** | NextJS 14 | Framework for server-side rendering and API routes |
|  | Tailwind CSS | Styling for responsive UI |
|  | Shadcn/UI | Customizable UI components |
|  | Zustand | State management for wells and chat |
|  | Supabase JavaScript Client | Real-time subscriptions and API calls |
|  | Axios | HTTP requests to Supabase and API routes |
|  | React-Markdown | Renders assistant’s markdown responses |
| **Backend** | Supabase | Managed PostgreSQL, APIs, Realtime, and MCP tools |
|  | PostgreSQL | Relational database for wells, parts, faults |
|  | pgvector | Vector storage for fault embeddings |
|  | Supabase Edge Functions (Deno) | Serverless logic for embedding generation |
| **GenAI Integration** | Cohere V2 SDK for TypeScript | Access to Command A, Embed v4, and Rerank models |
|  | Cohere Command A (command-a-03-2025) | Conversational queries and tool calling |
|  | Cohere Embed v4 (embed-v4-03-2025) | Semantic search for fault history |
|  | Cohere Rerank (rerank-v3.5) | Reorders fault search results for relevance |
| **Deployment/DevOps** | Vercel | Frontend hosting and CI/CD |
|  | Supabase | Backend hosting |
|  | GitHub | Version control and CI/CD integration |
| **Development Tools** | Cursor | Code editing with Supabase MCP tools |
|  | pnpm | Package management |
|  | ESLint + Prettier | Code linting and formatting |
|  | TypeScript | Type safety |
|  | Supabase CLI | Database and Edge Function management |

## 4. Rationale for Key Choices

- **NextJS + Vercel**: Simplifies frontend development and deployment, ensuring fast load times for demo users.
- **Tailwind CSS + Shadcn/UI**: Enables rapid UI development with responsive, accessible components for well grid and chat panel.
- **Supabase + MCP Tools**: Combines database, APIs, Realtime, and MCP integration in Cursor, streamlining vibe coding for demo-scale data.
- **pgvector**: Supports efficient semantic search with Cohere Embed v4, enhancing fault history analysis.
- **Cohere V2 SDK for TypeScript**: Native TypeScript integration with NextJS, simplifying API calls for Command A, Embed v4, and Rerank models, backed by production key.
- **pnpm**: Faster and disk-efficient package management, improving development workflow.
- **Cursor with MCP Tools**: Aligns with your vibe coding approach, leveraging Supabase integration for rapid prototyping.
- **Browser Testing**: Eliminates need for testing frameworks, aligning with your manual testing preference.

## 5. Integration Notes

- **Command A**: Used via Cohere V2 SDK’s Chat API for conversational queries and tool calling, with 256K context length for complex fault diagnosis and workflows.

- **Embed v4**: Generates 1024-dimensional Matryoshka embeddings for fault descriptions, stored in pgvector for semantic search.

- **Rerank v3.5**: Reorders up to 100 fault records (500 tokens each) post-semantic search for relevance.

  - Example: Embed v4 retrieves top 10 similar faults; Rerank reorders based on query (e.g., “pump failure” prioritizes mechanical pump faults).
  - Implementation: NextJS API route (`/api/search_faults`) calls `cohere.rerank` with query and fault descriptions, returning top 5 results.

- **Cohere V2 SDK Usage**:

  - Installed via pnpm (`pnpm add @cohere-ai/sdk`).

  - Configured with production key for high API limits.

  - Example for fault search (TypeScript):

    ```typescript
    import Cohere from '@cohere-ai/sdk';
    
    const cohere = new Cohere({ token: process.env.COHERE_API_KEY });
    
    // Generate query embedding
    const query = "Pump failure on Well-12";
    const embedResponse = await cohere.embed({
      model: "embed-v4-03-2025",
      inputType: "search_query",
      texts: [query],
    });
    const queryEmbedding = embedResponse.embeddings[0];
    
    // Fetch similar faults from Supabase (pgvector)
    const faultDocs = [...]; // Fault descriptions from Supabase
    const rerankResponse = await cohere.rerank({
      model: "rerank-v3.5",
      query,
      documents: faultDocs,
      topN: 5,
    });
    
    // Return reordered results to frontend
    ```

- **Supabase MCP Tools**: Enabled in Cursor to facilitate vibe coding, allowing rapid iteration on Supabase schema, APIs, and data retrieval.

- **Edge Functions**: Use Deno with Cohere TypeScript SDK for embedding generation, ensuring compatibility with NextJS ecosystem.

## 6. Assumptions

- Supabase supports demo-scale data (30 wells, 15 parts, 200 faults, \~800KB embeddings).
- Cohere production key provides sufficient API quota (e.g., 10,000 calls/month) for Command A, Embed v4, and Rerank models.
- Modern browsers (Chrome, Firefox, Edge) are used for demo access and testing.
- No real-world integrations (e.g., manufacturer APIs) are required.

## 7. Future Considerations

- Explore NextJS experimental features (e.g., React Server Components) for better performance.
- Add Mapbox for geospatial well visualization.
- Use Cohere’s Classify model for fault severity categorization.
- Expand Rerank usage for inventory search (e.g., prioritizing nearby warehouses).

## 8. Relevant Memories

Your prior interest in vibe coding with Cursor for an insurance underwriting demo (April 6, 2025) and agent swarm monitoring (April 14, 2025) highlights your preference for rapid prototyping and AI-driven solutions. The inclusion of Supabase MCP tools in Cursor and the switch to pnpm align with this approach, streamlining development for the Oil & Gas demo. The use of Cohere’s TypeScript SDK reflects your focus on maintaining a cohesive JavaScript/TypeScript ecosystem, consistent with your NextJS-based development workflow.