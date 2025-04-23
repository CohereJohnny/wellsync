# Sprint 20 Tasks

## Goals

- Refactor `well-table-view.tsx` to use TanStack Table (React Table v8).
- Refactor `fault-history-table.tsx` to use TanStack Table (React Table v8).
- Implement site-wide navigation toolbar.
- Address UI/UX bugs and improvements.
- Target release: v1.1.2

## Tasks

- [x] **Setup:** Install TanStack Table dependencies (`@tanstack/react-table`).
- [x] **Refactor `well-table-view.tsx`:**
  - [x] Define columns using `createColumnHelper`.
  - [x] Integrate data fetching (Kept existing `useEffect` for now).
  - [x] Implement table instance using `useReactTable`.
  - [x] Render table using TanStack Table's headless UI pattern mapped to Shadcn UI components (`<Table>`, `<TableRow>`, etc.).
  - [x] Ensure filtering logic (from URL params) updates table data/state.
  - [x] Re-implement link rendering for well name column.
  - [x] Re-implement status badge rendering within the column definition.
  - [x] Handle loading and error states appropriately.
  - [x] Adapt real-time update logic (`handleRealtimeUpdate`) to work with TanStack Table's data state.
- [x] **Refactor `fault-history-table.tsx`:**
  - [x] Define columns using `createColumnHelper`.
  - [x] Pass `faults` data prop to `useReactTable`.
  - [x] Implement sorting state and handlers using TanStack Table's features.
  - [x] Implement row expansion state and rendering logic using TanStack Table's features.
  - [x] Render table structure using TanStack Table headless UI pattern mapped to Shadcn UI components.
  - [x] Re-implement status badge rendering within the column definition.
  - [x] Handle `isLoading` prop appropriately.
- [x] **Navigation & Layout:**
  - [x] Define Main Navigation Toolbar component in `design_spec.md`.
  - [x] Create `components/layout/main-toolbar.tsx` component.
    - Progress: Added links, title, icon, styling.
  - [x] Integrate `MainToolbar` into `app/layout.tsx`.
  - [x] Remove redundant `<h1>` title from `app/page.tsx`.
- [x] **Bug Fixes & Improvements:**
  - [x] Fix real-time fault update on `well/[id]` page navigation (add `revalidate = 0`).
  - [x] Adjust chat panel padding in `components/chat/chat-panel.tsx` (`p-1`).
  - [x] Investigate `order_part`/`dispatch_part` API error (`Unexpected end of JSON input`).
    - Progress: Added logging in `app/api/chat/route.ts` to inspect `toolCall.parameters`. Root cause likely empty parameters from Cohere despite `required: true`.
- [x] **Testing:** Perform basic functional testing.
  - [x] Verify data display in `WellTableView`.
  - [x] Verify filtering works in `WellTableView`.
  - [x] Verify real-time updates work in `WellTableView`.
  - [x] Verify sorting works in `FaultHistoryTable`.
  - [x] Verify row expansion works in `FaultHistoryTable`.
  - [x] Verify Main Toolbar displays correctly and links work (to non-existent pages for now).
  - [x] Verify chat padding looks correct.
  - [x] Verify fault update works after navigation.

## Sprint Review

- **Demo Readiness**: The TanStack table refactors are complete. The main navigation toolbar is implemented. Key bugs related to real-time updates and chat UI have been addressed. The core dashboard and well detail views are functional.
- **Gaps/Issues**: The API error for tool calls (`order_part`, `dispatch_part`) still needs resolution (likely requires handling potentially empty parameters from Cohere or adjusting tool prompts). Placeholder pages for Inventory, Settings, Documentation are needed.
- **Next Steps**: Focus on resolving the tool call API error in the next sprint. Create placeholder pages for the new navigation links. 