# Sprint 12 Test Plan

## Goal
Verify the correct implementation and integration of semantic fault search with reranking in the chat interface.

## Test Cases

### 1. API Route (`/api/search_faults`)
- [x] **Test Case 1.1**: Test valid request with a relevant query.
  - **Steps**: Send POST request with `{ query: "power failure detected", wellId: "..." }`.
  - **Expected Result**: Status 200 OK. Response body contains an array of reranked fault objects with `fault_id`, `timestamp`, `fault_type`, `similarity`, `rerank_score`. Verified via curl.
- [x] **Test Case 1.2**: Test with irrelevant query.
  - **Steps**: Send POST request with `{ query: "lunch menu", wellId: "..." }`.
  - **Expected Result**: Status 200 OK. Response body contains an empty array. Verified via curl.
- [x] **Test Case 1.3**: Test missing `query` parameter.
  - **Steps**: Send POST request with `{ wellId: "..." }`.
  - **Expected Result**: Status 400 Bad Request with `{"error":"Missing or invalid query parameter"}`. Verified via curl.
- [x] **Test Case 1.4**: Test missing `wellId` parameter.
  - **Steps**: Send POST request with `{ query: "pump failure" }`.
  - **Expected Result**: Status 400 Bad Request with `{"error":"Missing or invalid wellId parameter"}`. Verified via curl.
- [ ] **Test Case 1.5**: Test Cohere API error handling (e.g., invalid API key temporarily).
  - **Steps**: Temporarily invalidate Cohere key, send valid request.
  - **Expected Result**: Status 500 Internal Server Error with appropriate error message.
  - *Progress*: Deferred to Tech Debt (TD-003).
- [ ] **Test Case 1.6**: Test Supabase RPC error handling (e.g., function unavailable temporarily).
  - **Steps**: Temporarily rename or drop RPC function, send valid request.
  - **Expected Result**: Status 500 Internal Server Error with appropriate error message.
  - *Progress*: Deferred to Tech Debt (TD-003).

### 2. Embedding & Search Logic
- **Test Case 2.1**: Verify query embedding generation.
  - **Steps**: Send valid request. Check server logs.
  - **Expected Result**: Logs show Cohere Embed API call with correct query and `input_type: search_query`.
- **Test Case 2.2**: Verify RPC function call.
  - **Steps**: Send valid request. Check server logs.
  - **Expected Result**: Logs show Supabase RPC call to `search_faults` with generated embedding, threshold, and limit.
- **Test Case 2.3**: Verify initial search results (before rerank).
  - **Steps**: (Requires temporary modification of API to return pre-rerank results) Send valid request.
  - **Expected Result**: Results match direct RPC call results for the same query embedding.

### 3. Rerank Integration
- **Test Case 3.1**: Verify document formatting for Rerank.
  - **Steps**: Send valid request. Check server logs.
  - **Expected Result**: Logs show the array of documents (formatted fault strings/objects) being sent to Cohere Rerank.
- **Test Case 3.2**: Verify Rerank API call.
  - **Steps**: Send valid request. Check server logs.
  - **Expected Result**: Logs show Cohere Rerank API call with query and documents.
- **Test Case 3.3**: Verify reranked results order.
  - **Steps**: Send valid request. Compare response order to pre-rerank results.
  - **Expected Result**: Response order reflects relevance scores from Rerank, potentially different from initial similarity order.
- **Test Case 3.4**: Verify `top_n` parameter.
  - **Steps**: Send valid request. Check number of results returned.
  - **Expected Result**: Number of results matches the `top_n` value specified in the API logic (e.g., 3-5).

### 4. Frontend Integration (`ChatPanel.tsx`)
- [x] **Test Case 4.1**: Test search trigger mechanism (e.g., button click, specific phrase).
  - *Progress*: Verified via UI interaction (keyword and button).
- [x] **Test Case 4.2**: Test loading state display.
  - *Progress*: Verified visually during search.
- [x] **Test Case 4.3**: Test successful result display.
  - *Progress*: Verified via assistant message summary in chat.
- [x] **Test Case 4.4**: Test empty result display.
  - *Progress*: Verified via assistant message ("No relevant faults found.").
- [x] **Test Case 4.5**: Test API error display.
  - *Progress*: Verified via toast notification after simulating 404 error. 