# Data Model - Oil & Gas GenAI Demo

## 1. Introduction

This document defines the data model for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The schema is implemented in Supabase (PostgreSQL) and supports 25-30 wells, 10-15 parts, and 2-3 warehouses, as specified. It enables real-time updates, conversational queries via Cohere’s Command A model, semantic fault history search with Embed v4 and Rerank models, and workflows for ordering/dispatching parts. The model is designed for a demo environment with no security or hardening, and a separate `mock_data.sql` file will provide sample data.

## 2. Database Overview

The database uses PostgreSQL (version 15.x) via Supabase, leveraging JSONB for flexible fault details and pgvector for fault embeddings. The schema includes six tables to manage wells, parts, inventory, faults, fault embeddings, and chat history. All tables are public, with no Row-Level Security (RLS) or authentication, as specified for the demo.

### 2.1 Tables

1. **wells**: Stores information about oil wells.
2. **parts**: Stores details of equipment parts.
3. **inventory**: Tracks part stock across warehouses.
4. **faults**: Logs fault history for wells.
5. **fault_embeddings**: Stores vector embeddings for fault descriptions for semantic search.
6. **chat_history**: Stores conversation context for the GenAI assistant.

## 3. Table Definitions

### 3.1 wells

Stores data for 25-30 oil wells in the Permian Basin, including location, status, and fault details.

| Column            | Type          | Constraints           | Description                                      |
|-------------------|---------------|-----------------------|--------------------------------------------------|
| id                | UUID          | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the well.                  |
| name              | VARCHAR(50)   | NOT NULL              | Well name (e.g., "Well-01").                     |
| camp              | VARCHAR(50)   | NOT NULL              | Camp (e.g., "Midland", "Delaware").              |
| formation         | VARCHAR(50)   | NOT NULL              | Formation (e.g., "Spraberry", "Wolfcamp").       |
| latitude          | FLOAT         | NOT NULL              | Latitude coordinate (e.g., 31.8075).             |
| longitude         | FLOAT         | NOT NULL              | Longitude coordinate (e.g., -102.1123).          |
| status            | VARCHAR(20)   | NOT NULL, DEFAULT 'Operational' | Status ("Operational", "Fault", "Pending Repair"). |
| last_maintenance  | TIMESTAMP     |                       | Date of last maintenance (e.g., "2025-03-15").   |
| fault_details     | JSONB         |                       | Fault info (e.g., { "part_id": "P001", "fault_type": "Mechanical" }). |

- **Indexes**: Primary key index on `id`, index on `status` for filtering.
- **Notes**: `fault_details` uses JSONB for flexibility, storing the latest fault’s part and type.

### 3.2 parts

Stores data for 10-15 equipment parts used in wells.

| Column         | Type          | Constraints           | Description                                      |
|----------------|---------------|-----------------------|--------------------------------------------------|
| part_id        | VARCHAR(10)   | PRIMARY KEY           | Unique identifier (e.g., "P001").                |
| name           | VARCHAR(100)  | NOT NULL              | Part name (e.g., "Centrifugal Pump").            |
| description    | TEXT          |                       | Part description (e.g., "High-pressure pump").   |
| specifications | JSONB         |                       | Specs (e.g., { "pressure": "5000 psi" }).       |
| manufacturer   | VARCHAR(50)   |                       | Manufacturer (e.g., "Schlumberger").             |

- **Indexes**: Primary key index on `part_id`.
- **Notes**: `specifications` uses JSONB for flexible attribute storage.

### 3.3 inventory

Tracks part stock across 2-3 warehouses.

| Column         | Type          | Constraints           | Description                                      |
|----------------|---------------|-----------------------|--------------------------------------------------|
| id             | UUID          | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for inventory record.         |
| part_id        | VARCHAR(10)   | NOT NULL, FOREIGN KEY (parts.part_id) | References part.                                |
| warehouse_id   | VARCHAR(10)   | NOT NULL              | Warehouse identifier (e.g., "W01").              |
| stock_level    | INTEGER       | NOT NULL, CHECK (stock_level >= 0) | Number of parts in stock (e.g., 5).             |
| last_updated   | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Last update timestamp.                          |

- **Indexes**: Composite index on `part_id`, `warehouse_id` for fast lookups.
- **Notes**: Supports 2-3 warehouses (e.g., "W01", "W02", "W03").

### 3.4 faults

Logs fault history for wells, with 100-200 records for demo purposes.

| Column         | Type          | Constraints           | Description                                      |
|----------------|---------------|-----------------------|--------------------------------------------------|
| fault_id       | UUID          | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the fault.                |
| well_id        | UUID          | NOT NULL, FOREIGN KEY (wells.id) | References well.                                |
| part_id        | VARCHAR(10)   | NOT NULL, FOREIGN KEY (parts.part_id) | References part.                                |
| fault_type     | VARCHAR(50)   | NOT NULL              | Fault type (e.g., "Mechanical", "Electrical").   |
| description    | TEXT          | NOT NULL              | Detailed description (e.g., "Pump failed due to wear"). |
| timestamp      | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fault occurrence time.                          |

- **Indexes**: Index on `well_id` for fault history queries, index on `timestamp` for sorting.
- **Notes**: `description` is used for semantic search embeddings.

### 3.5 fault_embeddings

Stores vector embeddings for fault descriptions for semantic search.

| Column         | Type          | Constraints           | Description                                      |
|----------------|---------------|-----------------------|--------------------------------------------------|
| fault_id       | UUID          | PRIMARY KEY, FOREIGN KEY (faults.fault_id) | References fault.                               |
| embedding      | VECTOR(1024)  | NOT NULL              | 1024-dimensional embedding from Cohere Embed v4. |

- **Indexes**: HNSW index on `embedding` for fast cosine similarity search (pgvector).
- **Notes**: Stores ~800KB for 200 faults, generated on fault creation via Edge Function.

### 3.6 chat_history

Stores conversation context for the GenAI assistant per well.

| Column         | Type          | Constraints           | Description                                      |
|----------------|---------------|-----------------------|--------------------------------------------------|
| id             | UUID          | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for chat record.              |
| well_id        | UUID          | NOT NULL, FOREIGN KEY (wells.id) | References well.                                |
| messages       | JSONB         | NOT NULL              | Array of messages (e.g., [{ "role": "user", "content": "..." }]). |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp.                          |

- **Indexes**: Index on `well_id` for fast retrieval.
- **Notes**: `messages` stores chat history for context-aware assistant responses.

## 4. Schema Diagram (Text-Based)

```
wells
├── id (UUID, PK)
├── name (VARCHAR)
├── camp (VARCHAR)
├── formation (VARCHAR)
├── latitude (FLOAT)
├── longitude (FLOAT)
├── status (VARCHAR)
├── last_maintenance (TIMESTAMP)
└── fault_details (JSONB)
    |
    | (FK: well_id)
    |
faults
├── fault_id (UUID, PK)
├── well_id (UUID, FK)
├── part_id (VARCHAR, FK)
├── fault_type (VARCHAR)
├── description (TEXT)
└── timestamp (TIMESTAMP)
    |
    | (FK: fault_id)
    |
fault_embeddings
├── fault_id (UUID, PK, FK)
└── embedding (VECTOR(1024))

parts
├── part_id (VARCHAR, PK)
├── name (VARCHAR)
├── description (TEXT)
├── specifications (JSONB)
└── manufacturer (VARCHAR)
    |
    | (FK: part_id)
    |
inventory
├── id (UUID, PK)
├── part_id (VARCHAR, FK)
├── warehouse_id (VARCHAR)
├── stock_level (INTEGER)
└── last_updated (TIMESTAMP)

chat_history
├── id (UUID, PK)
├── well_id (UUID, FK)
├── messages (JSONB)
└── updated_at (TIMESTAMP)
```

## 5. Design Considerations

- **Scalability**: Supports 30 wells, 15 parts, 2-3 warehouses, and 200 faults, with ~800KB for embeddings, well within Supabase’s demo limits.
- **Real-time**: `wells` and `inventory` tables support Supabase Realtime subscriptions for <1s updates.
- **Semantic Search**: `fault_embeddings` uses pgvector with HNSW indexing for fast cosine similarity searches, paired with Rerank for relevance.
- **Flexibility**: JSONB in `wells.fault_details`, `parts.specifications`, and `chat_history.messages` allows dynamic attributes.
- **No Security**: Public tables with no RLS, as specified for demo.
- **Mock Data**: A separate `mock_data.sql` file will seed 25-30 wells, 10-15 parts, 2-3 warehouses, and 100-200 faults, ensuring realistic demo scenarios.

## 6. Assumptions

- Supabase PostgreSQL (15.x) and pgvector (0.5.x) are compatible with the schema.
- Cohere Embed v4 generates 1024-dimensional embeddings for fault descriptions.
- Demo-scale data (30 wells, 15 parts, 200 faults) fits within Supabase free tier limits.
- No real-world data integrations are required.

## 7. Future Considerations

- Add geospatial indexes on `wells.latitude` and `wells.longitude` for future Mapbox integration.
- Include a `warehouses` table for warehouse metadata (e.g., location, name).
- Expand `faults` with severity or resolution status for advanced analytics.
- Use Cohere’s Classify model to categorize fault severity.

## 8. Relevant Memories

Your preference for vibe coding with Cursor and Supabase MCP tools (seen in your insurance underwriting demo, April 6, 2025) informs the schema’s simplicity and compatibility with rapid prototyping. The requirement for a separate `mock_data.sql` file aligns with your focus on realistic demo data, similar to your approach in past projects where you emphasized practical, impactful datasets for AI-driven applications.