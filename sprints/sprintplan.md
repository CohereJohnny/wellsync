# WellSync AI - Master Sprint Plan

This document outlines the planned sprints for the WellSync AI demo project, based on the specifications provided. Each sprint aims to deliver a functional increment towards the final demo application, following the workflow defined in `sprintmanagement.mdc`.

## Sprint 1: Project Setup & Core Foundation
- **Goal**: Initialize the project environment, configure core development tools, and set up version control.
- **Key Tasks**:
  - Initialize NextJS project using `pnpm`.
  - Set up Git repository and create `sprint-1` branch.
  - Configure TypeScript, ESLint, and Prettier.
  - Install essential dependencies (`react`, `next`, `tailwindcss`).
  - Basic `.env.local` setup.

## Sprint 2: Supabase & Database Schema Definition
- **Goal**: Establish the Supabase backend project and define the initial database schema.
- **Key Tasks**:
  - Create Supabase project.
  - Initialize Supabase CLI locally.
  - Define and migrate schema for `wells`, `parts`, `inventory`, `faults` tables using `supabase/migrations/`.
  - Enable `pgvector` extension in Supabase.

## Sprint 3: Basic Layout & UI Primitives
- **Goal**: Implement the main application layout, global styles, and core reusable UI components using Shadcn/UI.
- **Key Tasks**:
  - Create root layout (`app/layout.tsx`) with basic structure.
  - Implement global styles (`app/globals.css`) including the Inter font.
  - Set up Shadcn/UI.
  - Create/Customize basic components: `Button`, `Card`, `Badge`.

## Sprint 4: Homescreen Grid & Data Fetching
- **Goal**: Display the 5x6 grid of well cards on the homescreen, fetching data from Supabase.
- **Key Tasks**:
  - Create `WellCard.tsx` component to display individual well data.
  - Create `WellGrid.tsx` component to arrange cards.
  - Implement API call to fetch data using `GET /wells`.
  - Display 30 well cards with basic info (name, status, camp, formation).

## Sprint 5: Homescreen Filtering & Toolbar
- **Goal**: Add the capability to filter wells on the homescreen via a toolbar.
- **Key Tasks**:
  - Implement the homescreen Toolbar component UI.
  - Add filter dropdowns (Shadcn/UI) for Camp, Formation, and Status.
  - Implement frontend filtering logic.
  - Update `GET /wells` API call to use filter parameters.

## Sprint 6: Fault Simulation & Real-time Status
- **Goal**: Implement the ability to trigger faults and reflect status changes in real-time on the homescreen.
- **Key Tasks**:
  - Add "Trigger Fault" button to the Toolbar.
  - Implement basic `POST /faults` endpoint logic (logs fault, updates well status).
  - Set up Supabase Realtime subscription on the `wells` table.
  - Update `WellCard` status indicator dynamically based on Realtime events.

## Sprint 7: Well Detail View - Layout & Basic Data
- **Goal**: Create the well detail page structure and display fundamental well information.
- **Key Tasks**:
  - Set up dynamic routing for `/well/[id]`.
  - Create `WellDetail.tsx` component with a split-screen layout.
  - Implement API call using `GET /wells/:id` to fetch specific well data.
  - Display key well details (name, camp, formation, status, location, etc.).

## Sprint 8: Well Detail View - Fault History
- **Goal**: Display the historical fault data for a specific well on the detail page.
- **Key Tasks**:
  - Implement API call using `GET /faults?well_id=...` to fetch fault history.
  - Create `FaultHistoryTable.tsx` component.
  - Display fault history in a sortable table (by timestamp).

## Sprint 9: Chat Panel - UI & Basic Cohere Integration
- **Goal**: Implement the GenAI chat panel UI and connect it to Cohere Command A for basic conversational responses.
- **Key Tasks**:
  - Create `ChatPanel.tsx` UI (message list, input field, send button).
  - Set up the NextJS API route `/api/chat`.
  - Integrate Cohere V2 SDK (TypeScript) to call Command A model.
  - Implement basic state management for chat messages using Zustand.
  - Render assistant responses (initially plain text).

## Sprint 10: Chat History & Context
- **Goal**: Enable context awareness in the chat by storing and retrieving conversation history.
- **Key Tasks**:
  - Define and migrate `chat_history` table schema.
  - Implement API calls for `GET /chat_history` and `POST /chat_history`.
  - Pass message history to Cohere Command A in `/api/chat` requests.
  - Store updated message history after each interaction.
  - Implement markdown rendering for assistant responses using `react-markdown`.

## Sprint 11: Semantic Search - Embedding & Backend
- **Goal**: Implement the backend components required for semantic fault search, including embedding generation.
- **Key Tasks**:
  - Define and migrate `fault_embeddings` table schema.
  - Create Supabase Edge Function triggered by `POST /faults` to:
    - Call Cohere Embed v4 API.
    - Store the resulting embedding in `fault_embeddings`.
  - Create a Supabase PostgreSQL RPC function (`search_faults`) using `pgvector` operators for similarity search.

## Sprint 12: Semantic Search - Frontend & Rerank
- **Goal**: Integrate semantic search functionality into the chat panel, using Cohere Rerank for relevance.
- **Key Tasks**:
  - Create the NextJS API route `/api/search_faults`.
  - Implement logic in `/api/search_faults` to:
    - Call Cohere Embed v4 for the user's query.
    - Call the `search_faults` RPC function in Supabase.
    - Call Cohere Rerank v3.5 with the results.
  - Trigger this API route from the `ChatPanel.tsx` based on user queries (e.g., "find similar faults").
  - Display reranked fault results in the chat panel.

## Sprint 13: Workflows - Order & Dispatch Parts
- **Goal**: Enable part ordering and dispatching workflows through the GenAI assistant using tool calling.
- **Key Tasks**:
  - Define Cohere tools schemas for "order\_part" and "dispatch\_part".
  - Implement backend logic for `POST /orders` (simulation).
  - Implement backend logic for `POST /dispatches` (simulation + inventory update).
  - Integrate tool calling into the `/api/chat` route.
  - Provide clear confirmation messages in the chat upon workflow completion.

## Sprint 14: Real-time Inventory & UI Polish
- **Goal**: Implement real-time updates for inventory changes and apply final UI polish based on the design spec.
- **Key Tasks**:
  - Set up Supabase Realtime subscription on the `inventory` table.
  - Ensure relevant UI components update based on inventory changes (if applicable in chat context).
  - Review and refine UI styles across the application according to `design_spec.md`.
  - Add hover states, transitions, and minor animations.
  - Ensure consistency in component usage and appearance.

## Sprint 15: Testing & Final Review
- **Goal**: Conduct thorough end-to-end testing, cross-browser checks, performance validation, and finalize documentation.
- **Key Tasks**:
  - Perform manual end-to-end testing of all user stories and UX flows.
  - Test on target browsers (Chrome, Firefox, Edge) and screen sizes (Desktop/Tablet).
  - Validate performance metrics (load times, real-time latency).
  - Review and update `README.md` with setup and usage instructions.
  - Final code cleanup and review.
  - Prepare for potential demo deployment merge.

# Cohere API Key (Replace with your production key)
COHERE_API_KEY=

# Supabase Project URL (Replace with your project URL)
SUPABASE_URL=https://<your-project-id>.supabase.co

# Supabase Anon Key (Replace with your anon key)
SUPABASE_KEY=<your-anon-key>
