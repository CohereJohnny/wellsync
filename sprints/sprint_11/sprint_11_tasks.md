# Sprint 11 Tasks

## Goals
Implement the backend components required for semantic fault search, including embedding generation.

## Tasks

### 1. Database & Schema
- [x] Define schema for `fault_embeddings` table (e.g., `id`, `fault_id` (FK to faults.id), `embedding` (vector), `created_at`).
  - *Progress*: Defined schema with `vector(1024)` and FK in migration script.
- [x] Create Supabase migration SQL for `fault_embeddings` table.
  - *Progress*: Created `003_create_fault_embeddings_table.sql` including an IVFFlat index.
- [x] Ensure `pgvector` extension is enabled (already done in Sprint 2, verify).
  - *Progress*: Verified during manual testing/previous sprints. Migration script includes commented check.

### 2. Embedding Generation (Edge Function)
- [x] Create a new Supabase Edge Function (e.g., `generate-fault-embedding`).
  - *Progress*: Created directory `supabase/functions/generate-fault-embedding` and `index.ts` file.
- [x] Implement Edge Function logic:
    - Triggered on new inserts into the `faults` table (via Database Webhooks or Triggers).
    - Extract relevant text content from the new fault record (e.g., `fault_type`, `description` if added later).
    - Call Cohere Embed v4 API with the fault text.
    - Handle API errors from Cohere.
    - Store the fault ID and the generated embedding vector in the `fault_embeddings` table.
  - *Progress*: Implemented core logic in `index.ts` to handle webhook payload, call Cohere Embed, and insert into `fault_embeddings`.
- [x] Configure the trigger (Database Webhook or Trigger) for the Edge Function.
  - *Progress*: Requires manual setup in Supabase Dashboard (Webhook on `faults` table INSERT event pointing to the deployed function). Instructions provided.
- [x] Add necessary environment variables for Cohere API Key to the Edge Function settings.
  - *Progress*: Requires manual setup in Supabase Dashboard Secrets (`COHERE_API_KEY`, `PROJECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Instructions provided.

### 3. Semantic Search Function (PostgreSQL RPC)
- [x] Create a new Supabase PostgreSQL RPC function named `search_faults`.
  - *Progress*: Created function via migration `004_create_search_faults_rpc.sql`.
- [x] Function should accept a query embedding (vector) and a match threshold/limit as parameters.
  - *Progress*: Parameters `query_embedding`, `similarity_threshold`, `match_count` defined.
- [x] Implement the function logic using `pgvector` operators (e.g., cosine distance `<=>`) to perform similarity search on the `fault_embeddings` table.
  - *Progress*: Implemented using `1 - (fe.embedding <=> query_embedding)` for cosine similarity.
- [x] Join with the `faults` table to return relevant fault details (id, timestamp, fault_type, etc.) for the matched embeddings.
  - *Progress*: Join implemented on `fault_id`.
- [x] Order results by similarity score.
  - *Progress*: Ordered by calculated similarity descending.
- [x] Grant necessary permissions for the function to be called by the API user.
  - *Progress*: Default permissions usually allow authenticated users; specific role grants might be needed depending on RLS policies (verify during testing).

### 4. Testing (Backend Focus)
- [x] Manually trigger fault insertion and verify embedding is generated in `fault_embeddings` table.
  - *Progress*: Verified via Table Editor after fixing `fault_id` issue in Edge Function.
- [x] Test the `search_faults` RPC function directly using Supabase SQL editor with sample embeddings.
  - *Progress*: Verified via SQL Editor after multiple fixes to function signature types (`fault_id`, `well_id`, `part_id`, `timestamp`, `fault_type`).
- [x] Verify Edge Function logs for successful execution and error handling.
  - *Progress*: Logs reviewed during debugging process.

### 5. Documentation
- [x] Document the `fault_embeddings` schema.
  - *Progress*: Added to `docs/semantic_search_backend.md` and `README.md`.
- [x] Document the `generate-fault-embedding` Edge Function (trigger, logic, env vars).
  - *Progress*: Detailed in `docs/semantic_search_backend.md`, manual steps noted in task list.
- [x] Document the `search_faults` RPC function (parameters, return value, usage).
  - *Progress*: Detailed in `docs/semantic_search_backend.md`.

## Sprint Review
- **Demo Readiness**: The backend infrastructure for semantic fault search is complete. New faults automatically trigger embedding generation via an Edge Function, and an RPC function is available for performing similarity searches using pgvector.
- **Gaps/Issues**: No frontend integration exists yet (Sprint 12). Manual testing was performed, but no automated tests exist. Documentation is basic.
- **Next Steps**: Implement frontend integration for semantic search (Sprint 12). 