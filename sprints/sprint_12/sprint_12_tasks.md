# Sprint 12 Tasks

## Goals
Integrate semantic search functionality into the chat panel, using Cohere Rerank for relevance.

## Tasks

### 1. API Route (`/api/search_faults`)
- [x] Create the Next.js API route handler file (`app/api/search_faults/route.ts`).
  - *Progress*: Created file with POST handler structure.
- [x] Implement request body validation (e.g., expect `query: string`, `wellId: string`).
  - *Progress*: Added validation for `query` and `wellId` presence/type.
- [x] Add error handling middleware/try-catch blocks.
  - *Progress*: Added main `try...catch` block and JSON parsing check.
- [x] Set up Supabase client for calling RPC.
  - *Progress*: Initialized server client using `createClient()`.
- [x] Set up Cohere client for Embed and Rerank APIs.
  - *Progress*: Imported existing shared Cohere client from `@/lib/cohere`.

### 2. Embedding & Initial Search Logic
- [x] In the API route, call Cohere Embed API (`embed-english-v3.0`, `input_type: search_query`) with the user's query string.
  - *Progress*: Implemented `cohere.embed` call with type assertions.
- [x] Call the `search_faults` Supabase RPC function using the generated query embedding.
    - Pass appropriate `similarity_threshold` (e.g., 0.5) and `match_count` (e.g., 25-50 to give Rerank enough candidates).
  - *Progress*: Implemented `supabase.rpc` call with specified parameters.
- [x] Handle potential errors from Cohere Embed and RPC calls.
  - *Progress*: Added specific error handling within the `try...catch` block for embed/RPC failures.

### 3. Rerank Integration
- [x] Format the results from the `search_faults` RPC into the document format expected by Cohere Rerank (e.g., array of strings or objects with a `text` key representing the fault details).
  - *Progress*: Mapped RPC results to `{index, text, originalData}` and extracted `text` for API call.
- [x] Call the Cohere Rerank API (`rerank-english-v2.0` or newer) with the user's query and the formatted fault documents.
  - *Progress*: Implemented `cohere.rerank` call.
- [x] Specify a `top_n` parameter for the number of results to return after reranking (e.g., 3-5).
  - *Progress*: Set `RERANK_TOP_N = 5`.
- [x] Handle potential errors from the Rerank API call.
  - *Progress*: Added `try...catch` for rerank call, falling back to initial results on error.

### 4. API Response
- [x] Structure the API response to return the reranked list of fault details (e.g., `fault_id`, `timestamp`, `fault_type`, `similarity_score` from rerank).
  - *Progress*: Mapped rerank results back to original data and added `rerank_score`.
- [x] Ensure consistent JSON response format.
  - *Progress*: Using `NextResponse.json` for success and error responses.

### 5. Frontend Integration (`ChatPanel.tsx`)
- [x] Determine how semantic search is triggered (e.g., specific user phrasing like "find similar faults to X", a dedicated button, or automatically on certain queries).
  - *Progress*: Implemented keyword trigger (`/search`) and dedicated search button.
- [x] If triggered explicitly, add UI element (e.g., button, command suggestion).
  - *Progress*: Added Search icon button next to Send.
- [x] Implement client-side logic to call `POST /api/search_faults` with the query and `wellId`.
  - *Progress*: Created `handleSearch` function for API call.
- [x] Add loading state specifically for search results.
  - *Progress*: Added `isSearching` state and loading indicator.
- [x] Display the reranked fault results within the chat interface (e.g., as a special type of message or card).
  - *Progress*: Added results summary as an assistant message.
- [x] Format the displayed results clearly (show timestamp, type, and perhaps the similarity score).
  - *Progress*: Basic formatting included in the summary message.

### 6. Testing
- [ ] Test the `/api/search_faults` endpoint with various queries.
- [ ] Verify that embedding, RPC call, and rerank steps execute correctly.
- [ ] Test frontend triggering mechanism.
- [ ] Validate display of reranked results in the chat panel.
- [ ] Test error handling for API and frontend.

### 7. Documentation
- [x] Document the `/api/search_faults` endpoint (request body, response structure).
  - *Progress*: Created `docs/api_search_faults.md`.
- [x] Update `ChatPanel.tsx` documentation regarding search functionality.
  - *Progress*: Added inline comments explaining search states and handlers.
- [x] Add notes on the text formatting used for Rerank documents.
  - *Progress*: Formatting details included in `docs/api_search_faults.md` logic flow.

## Test Case 1.1: Valid Request

*   Purpose: Test the happy path with a relevant query.
*   **Command:**
    *   Make sure your Next.js development server (`pnpm run dev`) is running first.
    *   Open your terminal (it should be in the `/Users/jkb/Projects/wellsync` directory).
    *   You'll need a valid `wellId` from your `wells` table. Let's assume one is `550e8400-e29b-41d4-a716-446655440000` (replace if needed).
    *   Run the following command:
        ```bash
        curl -X POST http://localhost:3000/api/search_faults \
        -H "Content-Type: application/json" \
        -d '{
          "query": "electrical issue",
          "wellId": "550e8400-e29b-41d4-a716-446655440000"
        }' | cat
        ```
*   **Expected Result:**
    *   The command should output a JSON array.
    *   The array should contain objects representing faults, each having properties like `fault_id`, `fault_type`, `timestamp`, `similarity`, and crucially, `rerank_score`.
    *   The `rerank_score` values should indicate relevance (closer to 1 is more relevant).
    *   You should see log messages in the `pnpm run dev` terminal output indicating the request processing steps (embedding, RPC, rerank). 