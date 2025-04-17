# Product Requirements Document - WellSync AI

## 1. Introduction

### 1.1 Purpose

**WellSync AI** is a web-based demo application designed to showcase AI-driven fault management for oil wells in the Permian Basin, targeting Production Supervisors. The application demonstrates real-time well monitoring, semantic fault analysis, and streamlined workflows using Generative AI (Cohere’s Command A, Embed v4, Rerank v3.5). Built with NextJS, Supabase, Tailwind CSS, and Shadcn/UI, it supports 30 wells, 15 parts, and 3 warehouses in a demo environment with no security or hardening. This PRD establishes a clear vision for vibe coding in Cursor with Supabase MCP tools, ensuring a polished, impactful demo for stakeholders.

### 1.2 Scope

**WellSync AI** provides:

- A homescreen with a 5x6 grid of well cards (30 wells), filterable by camp, formation, or status.
- A well detail view with fault history and a GenAI chat panel for natural language queries and workflows.
- Real-time fault updates (&lt;1s) via Supabase Realtime.
- Semantic fault search using Cohere’s Embed v4 and Rerank v3.5.
- Workflows for ordering and dispatching parts from 3 warehouses.
- A clean, modern UI inspired by tailwindcss.com, optimized for desktop/tablet.

The demo excludes real-world integrations (e.g., manufacturer APIs), security, and mobile support, focusing on rapid prototyping for stakeholder presentations.

## 2. Vision and Goals

### 2.1 Vision

**WellSync AI** empowers Production Supervisors to monitor and resolve well faults efficiently with a clean, AI-driven interface. By syncing real-time well data, semantic fault insights, and intuitive workflows, it showcases the power of Generative AI in oilfield operations, delivering a compelling demo that feels fast, modern, and actionable.

### 2.2 Goals

- **Functional**: Display 30 wells with real-time status updates, support fault simulation, and enable semantic fault searches and part workflows.
- **Usable**: Provide a scannable, responsive UI (desktop/tablet) with clear well data and an intuitive GenAI chat experience.
- **Impactful**: Impress stakeholders with a polished, Tailwind-inspired design and seamless AI interactions (e.g., &lt;2s page loads, &lt;1s fault updates).
- **Developer-Friendly**: Enable rapid vibe coding in Cursor with Supabase MCP tools, using a structured sprint workflow for iterative development.

## 3. Stakeholders and Personas

### 3.1 Stakeholders

- **Demo Audience**: Oil & gas executives, engineers, and investors evaluating AI solutions.
- **Developers**: You, vibe coding in Cursor, switching roles (scrum master, product manager, developer, QA).
- **xAI Team**: Reviewing the demo for technical accuracy and market fit.

### 3.2 Primary Persona: Production Supervisor

- **Name**: Alex Carter
- **Role**: Oversees well operations in the Permian Basin.
- **Demographics**: 35-50 years old, technical background, works in field offices.
- **Needs**:
  - Monitor 30 wells at a glance with clear status indicators (Operational/Fault).
  - Filter wells by camp (Midland, Delaware), formation (Wolfcamp, Spraberry, Bone Spring), or status.
  - Access detailed fault history and similar faults via semantic search.
  - Query well, part, or inventory data naturally (e.g., “What’s wrong with Well-12?”).
  - Execute workflows (order/dispatch parts) quickly.
- **Pain Points**:
  - Scattered data across systems delays fault resolution.
  - Complex interfaces hinder quick decisions.
  - Manual processes for ordering parts slow repairs.
- **Goals**:
  - Reduce downtime by identifying and resolving faults faster.
  - Streamline inventory checks and part orders.
  - Leverage AI for actionable insights without steep learning curves.

## 4. Functional Requirements

### 4.1 Homescreen

- **Well Card Grid**:
  - Display 30 wells in a 5x6 grid, each card showing name, status (green/red badge), camp, and formation.
  - Support filtering by camp, formation, or status via dropdowns.
  - Enable fault simulation via a “Trigger Fault” button (updates well status and fault history).
  - Real-time updates (&lt;1s) for status changes via Supabase Realtime.
  - Load time: &lt;2s for 30 wells.
- **Toolbar**:
  - Sticky top bar with filter dropdowns and fault trigger button.
  - Responsive for desktop (1024px+) and tablet (768px+).

### 4.2 Well Detail View

- **Layout**: Split view (60% well info, 40% chat panel).
- **Well Info**:
  - Display well details: name, status, camp, formation, location (latitude/longitude), last maintenance, current fault (if any).
  - Fault history table: columns for fault ID, part, type, description, timestamp (sortable by timestamp).
- **GenAI Chat Panel**:
  - Support natural language queries (e.g., “What’s wrong with Well-12?”, “Find similar faults”).
  - Execute workflows: order parts (e.g., “Order pump for Well-12”) or dispatch parts (e.g., “Dispatch sensor from W01”).
  - Render assistant responses in markdown (via React-Markdown).
  - Maintain chat history per well, stored in Supabase.
- **Real-time**: Update fault details and inventory changes instantly (&lt;1s).

### 4.3 Semantic Fault Search

- Enable queries like “Pump failure on Well-12” to retrieve similar faults.
- Use Cohere Embed v4 for embeddings (1024 dimensions, stored in pgvector) and Rerank v3.5 for relevance (top 5 results).
- Display results in the chat panel or fault history table with relevance scores.

### 4.4 Workflows

- **Order Parts**: Simulate ordering a part from a manufacturer (e.g., “Order pump from Schlumberger”).
- **Dispatch Parts**: Simulate dispatching a part from a warehouse (e.g., “Dispatch pump from W01”), updating inventory stock levels.
- Confirm actions in the chat panel (e.g., “Pump dispatched from W01”).

### 4.5 Data Management

- **Wells**: 30 wells with name, camp, formation, location, status, and fault details (JSONB).
- **Parts**: 15 parts with ID, name, description, specifications (JSONB), and manufacturer.
- **Inventory**: Stock levels for 15 parts across 3 warehouses (W01, W02, W03).
- **Faults**: 150 faults with well ID, part ID, type, description, and timestamp.
- **Fault Embeddings**: 1024-dimensional vectors for fault descriptions (via Cohere Embed v4).
- **Chat History**: Per-well conversation logs (JSONB).

## 5. Non-Functional Requirements

- **Performance**:
  - Page load: &lt;2s for homescreen with 30 wells.
  - Fault updates: &lt;1s via Supabase Realtime.
  - Semantic search: &lt;1s for top 5 results.
- **Scalability**: Support 100 users, 10 requests/second (demo scale).
- **Usability**:
  - Clean, modern UI inspired by tailwindcss.com (Inter font, navy/teal palette).
  - High contrast, WCAG 2.1-compliant colors.
  - Keyboard navigation for filters and chat input.
- **Compatibility**: Desktop (Chrome, Firefox, Edge) and tablet; mobile unsupported.
- **Development**:
  - Vibe coding in Cursor with Supabase MCP tools.
  - pnpm for dependency management.
  - Structured sprint workflow (per `sprint_management_rule.mdc`).

## 6. Technical Stack

- **Frontend**: NextJS 14 (App Router), Tailwind CSS 3.x, Shadcn/UI, Zustand 4.x, Axios 1.x, React-Markdown 9.x.
- **Backend**: Supabase (PostgreSQL 15.x, pgvector 0.5.x, Realtime, Edge Functions with Deno).
- **GenAI**: Cohere V2 TypeScript SDK (@cohere-ai/sdk 2.x).
  - Command A (command-a-03-2025): Conversational queries, tool calling.
  - Embed v4 (embed-v4-03-2025): Semantic fault search (1024 dimensions).
  - Rerank v3.5: Result reordering (top 5).
- **Deployment**: Vercel (frontend), Supabase (backend), GitHub (version control).
- **Tools**: Cursor (with MCP tools), pnpm 9.x, ESLint 8.x, Prettier 3.x, TypeScript 5.x, Supabase CLI.

## 7. User Stories

### 7.1 As a Production Supervisor, I want to:

- View 30 wells in a grid with status indicators so I can monitor operations at a glance.
- Filter wells by camp, formation, or status to focus on specific issues.
- Simulate a fault to test the system’s response and update well status instantly.
- Access a well’s fault history to understand recurring issues.
- Query the GenAI assistant (e.g., “What’s wrong with Well-12?”) to get quick insights.
- Find similar faults (e.g., “Pump failures”) to diagnose patterns.
- Check part availability and dispatch parts from a warehouse to resolve faults.
- Order parts from a manufacturer to restock inventory.
- See real-time updates for faults and inventory changes to act promptly.

### 7.2 As a Developer, I want to:

- Code rapidly in Cursor with MCP tools to iterate on features.
- Follow a structured sprint workflow (per `sprint_management_rule.mdc`) to track tasks, bugs, and progress.
- Use mock data (30 wells, 15 parts, 150 faults) to test the demo.
- Deploy easily via Vercel and Supabase for stakeholder reviews.

## 8. Constraints and Assumptions

### 8.1 Constraints

- No security or authentication (public APIs, no RLS).
- Desktop/tablet only (no mobile support).
- Demo scale: 100 users, 10 requests/second.
- No real-world integrations (e.g., manufacturer APIs).

### 8.2 Assumptions

- Supabase free tier supports 30 wells, 15 parts, 150 faults, and \~800KB embeddings.
- Cohere production key provides sufficient API quota (e.g., 10,000 calls/month).
- Modern browsers (Chrome, Firefox, Edge) are used for testing.
- Mock data (`mock_data.sql`) provides realistic scenarios for demo.

## 9. Success Metrics

- **User Experience**:
  - 90% of demo users can navigate the well grid and chat panel without guidance.
  - Fault updates occur in &lt;1s, page loads in &lt;2s (measured in browser).
- **Functionality**:
  - All 30 wells display with accurate statuses and filters.
  - Semantic search returns relevant faults (top 5) in &lt;1s.
  - Workflows (order/dispatch) complete with confirmation in chat.
- **Development**:
  - Complete core features in 2-3 sprints (per `sprint_management_rule.mdc`).
  - No build errors (`pnpm run build`) at sprint end.
- **Stakeholder Feedback**:
  - Positive feedback on UI polish and AI capabilities (e.g., chat, search) in demo sessions.

## 10. Milestones and Sprint Plan

### 10.1 Milestones

- **Sprint 1**: Project setup, Supabase schema, mock data, homescreen grid with filters.
- **Sprint 2**: Well detail view, fault history table, GenAI chat panel with basic queries.
- **Sprint 3**: Semantic fault search, order/dispatch workflows, UI polish, and testing.

### 10.2 Sprint Workflow

Follow `sprint_management_rule.mdc`:

- Initialize sprints with templates (`sprints/templates/`).
- Plan tasks and test cases in `sprint_x_tasks.md` and `sprint_x_testplan.md`.
- Track progress in `sprint_x_tasks.md`, log sprint-wide notes in `sprint_x_updates.md`.
- Log bugs in `sprint_x_bug_swatting.md` with unique IDs.
- Conduct sprint reviews in `sprint_x_updates.md`.
- Generate reports with Cursor AI for `sprint_x_report.md`.
- Tag merged commits (`sprint-x`) and archive `sprints/sprint_x/` in `sprints/archive/`.

## 11. Risks and Mitigation

- **Risk**: Cohere API limits disrupt demo.
  - **Mitigation**: Use production key, monitor usage, cache embeddings offline if needed.
- **Risk**: UI performance lags with 30 wells.
  - **Mitigation**: Optimize with NextJS SSR, test load times in browser.
- **Risk**: Sprint delays due to complex AI integration.
  - **Mitigation**: Prioritize core features (grid, chat) in Sprint 1-2, defer advanced search to Sprint 3.
- **Risk**: Mock data lacks realism for demo.
  - **Mitigation**: Use `mock_data.sql` with industry-specific wells, parts, and faults.

## 12. Future Considerations

- Add Mapbox for geospatial well visualization.
- Implement Cohere Classify for fault severity categorization.
- Support dark mode for night-shift supervisors.
- Expand workflows to include repair scheduling or cost estimation.

## 13. Relevant Memories

Your experience vibe coding the insurance underwriting demo (April 6, 2025) emphasized realistic data and rapid prototyping, shaping **WellSync AI**’s focus on industry-specific mock data and Cursor-based development. Your agent swarm monitoring project (April 14, 2025) highlighted structured role-switching (scrum master, developer, QA), informing the sprint workflow and clear persona-driven requirements. The choice of **WellSync AI** (confirmed April 17, 2025) reflects your preference for impactful, modern demo names, ensuring the PRD sets a clear, stakeholder-friendly vision.