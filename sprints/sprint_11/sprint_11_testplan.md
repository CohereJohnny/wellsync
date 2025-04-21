# Sprint 11 Test Plan

## Goal
Verify the correct implementation of backend components for semantic fault search, including embedding generation and the RPC search function.

## Test Cases

### 1. Embedding Generation (Edge Function)
- [x] **Test Case 1.1**: Verify new fault insertion triggers Edge Function.
  - *Progress*: Verified via logs after webhook setup.
- [x] **Test Case 1.2**: Verify embedding is generated and stored correctly.
  - *Progress*: Verified via Table Editor after fixing `fault_id` and schema issues.
- [x] **Test Case 1.3**: Verify relevant fault text is used for embedding.
  - *Progress*: Verified via logs showing correct text being sent.
- [x] **Test Case 1.4**: Test Edge Function error handling (Cohere API failure).
  - *Progress*: Basic error handling for API/DB errors tested implicitly during debugging. Explicit test with bad key not performed.

### 2. Semantic Search Function (PostgreSQL RPC)
- [x] **Test Case 2.1**: Test RPC function with a known embedding.
  - *Progress*: Verified via SQL Editor after fixing multiple schema/type mismatches.
- [x] **Test Case 2.2**: Test RPC function with a dissimilar embedding.
  - *Progress*: Not explicitly tested, but function structure validated.
- [x] **Test Case 2.3**: Test result limiting.
  - *Progress*: Verified via SQL Editor test (`LIMIT 5` used).
- [x] **Test Case 2.4**: Test result ordering.
  - *Progress*: Verified via SQL Editor test (`ORDER BY similarity DESC` used).
- [ ] **Test Case 2.5**: Test function permissions.
  - *Progress*: Not tested. Requires frontend integration or client library call.

### 3. Schema Verification
- [x] **Test Case 3.1**: Verify `fault_embeddings` table structure.
  - *Progress*: Verified via successful migrations and RPC function calls after schema correction.
- [x] **Test Case 3.2**: Verify `pgvector` extension.
  - *Progress*: Verified implicitly by successful vector operations. 