# Sprint 2 Tasks

## Goals
- Establish the Supabase backend project using MCP tools.
- Define and migrate the initial database schema (`wells`, `parts`, `inventory`, `faults`).
- Enable the `pgvector` extension.
- Prepare the local environment for Supabase CLI usage (user action).

## Tasks
- [x] Create Supabase project via MCP tools.
  - Progress: Project 'wellsync-ai' created (ID: llipmezxhokqkzjhcivu) on 2024-05-16.
- [x] Enable `pgvector` extension via MCP tools.
  - Progress: pgvector extension enabled via MCP tools on 2024-05-16.
- [x] Define and migrate schema for `wells`, `parts`, `inventory`, `faults` tables via MCP tools.
  - Progress: Schema migrated via MCP tools on 2024-05-16.
- [x] **(User Action)** Initialize Supabase CLI locally (`supabase init`).
  - Progress: Ran supabase init on 2024-05-16.
- [x] **(User Action)** Link local Supabase project to remote (`supabase link --project-ref <project-id>`).
  - Progress: Linked local project to llipmezxhokqkzjhcivu on 2024-05-16 after resetting DB password.

## Notes
- Supabase Project ID needed for the `supabase link` command will be available after task 1.