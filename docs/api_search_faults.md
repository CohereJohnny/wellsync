# API Route: `/api/search_faults`

This API route provides an endpoint for performing semantic search on historical fault data using Cohere Embed and Rerank.

## Endpoint

`POST /api/search_faults`

## Request Body

The request body must be a JSON object with the following properties:

- **`query`** (string, required): The natural language search query provided by the user.
- **`wellId`** (string, required): The UUID of the well context. While not directly used in the semantic search filtering itself in the current implementation, it's required by the endpoint and could be used for future context enrichment or filtering.

**Example Request Body:**

```json
{
  "query": "recent electrical surges",
  "wellId": "550e8400-e29b-41d4-a716-446655440003"
}
```

## Success Response (200 OK)

Returns a JSON array of reranked fault objects. Each object represents a fault deemed relevant to the query by the Cohere Rerank model and includes the original fault data plus a relevance score.

- **`fault_id`**: UUID of the fault.
- **`well_id`**: UUID of the associated well.
- **`part_id`**: Identifier of the associated part (varchar(10)).
- **`timestamp`**: Timestamp of the fault (without time zone).
- **`fault_type`**: Type of the fault (varchar(50)).
- **`similarity`**: The initial cosine similarity score from the vector search (pgvector `<=>` operator).
- **`rerank_score`**: The relevance score (typically 0 to 1, higher is more relevant) assigned by the Cohere Rerank model.

**Example Success Response:**

```json
[
  {
    "fault_id": "d738a0c9-9e8f-496d-8978-863f8c3d437f",
    "well_id": "550e8400-e29b-41d4-a716-446655440003",
    "part_id": "P001",
    "timestamp": "2025-04-21T15:31:25.758",
    "fault_type": "Electrical",
    "similarity": 0.85321,
    "rerank_score": 0.987
  },
  {
    "fault_id": "45678155-fde6-49a6-bd61-5320abcd1234",
    "well_id": "550e8400-e29b-41d4-a716-446655440003",
    "part_id": "P003",
    "timestamp": "2025-04-21T10:31:08.000",
    "fault_type": "Vibration",
    "similarity": 0.78910,
    "rerank_score": 0.912
  }
]
```

## Error Responses

- **400 Bad Request**: Returned if the request body is invalid JSON or missing required fields (`query`, `wellId`).
  ```json
  { "error": "Invalid request body" }
  { "error": "Missing or invalid query parameter" }
  { "error": "Missing or invalid wellId parameter" }
  ```
- **500 Internal Server Error**: Returned if an error occurs during embedding generation, Supabase RPC call, Cohere Rerank API call, or other server-side processing.
  ```json
  { "error": "Failed to generate query embedding: [details]" }
  { "error": "Failed to search faults via RPC: [details]" }
  { "error": "Failed to rerank results: [details]" }
  { "error": "Internal server error" } 
  ```

## Logic Flow

1. Validate incoming POST request body.
2. Generate a query embedding for the user's `query` using Cohere Embed (`embed-english-v3.0`, `input_type: search_query`).
3. Call the `search_faults` PostgreSQL RPC function with the query embedding, a similarity threshold (e.g., 0.5), and a match count (e.g., 30) to get initial candidates based on vector similarity.
4. If initial results are found:
   a. Format the fault details (type, timestamp, part, well) into simple text strings.
   b. Call the Cohere Rerank API (`rerank-english-v2.0`) with the original `query` and the formatted text documents.
   c. Map the reranked results (ordered by `relevanceScore`) back to the original fault data.
   d. Return the top N (e.g., 5) reranked results, including the `rerank_score`.
5. If no initial results are found or the Rerank API fails (optional fallback), return an empty array or the initial results.
6. Handle errors at each step and return appropriate 4xx/5xx responses. 