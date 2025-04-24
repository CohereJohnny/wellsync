# Sprint 19 Tasks: Optional Backlog & Tech Debt

## Goals
Address selected high-priority items from `backlog.md` and `tech_debt.md`.

*   **Goal 1:** Implement "Reset Demo" functionality.
*   **Goal 2:** Improve Toolbar responsive layout.
*   **Goal 3:** Address Real-time Updates Enhancement (TD-001).
*   **Goal 4:** Add Fault Description Field (from Backlog).
*   **Goal 5:** Implement Well Display View Toggle (from Backlog).

## Tasks

### Goal 1: Reset Demo Functionality
*   [x] Define scope: What needs resetting? (e.g., faults, inventory changes, well statuses, chat history)
*   [x] Design mechanism: Supabase Function (`reset_demo_data`) invoked via RPC from frontend.
*   [x] Implement reset logic (Supabase Function - Applied via MCP migration).
*   [x] Implement frontend trigger (Button in Toolbar).
*   [x] Test reset functionality thoroughly (Verified working after SQL fixes).

### Goal 2: Improve Toolbar Responsive Layout
*   [x] Analyze current layout issues on smaller screens (`components/toolbar.tsx`).
*   [x] Identify components causing overflow or poor stacking. (Addressed via flex-wrap grouping)
*   [x] Implement TailwindCSS responsive variants (`sm:`, `md:`, etc.) or alternative layout strategies (e.g., mobile drawer/menu) to improve appearance on smaller viewports. (Current wrapping deemed sufficient)
*   [x] Test responsiveness across different screen sizes. (Verified wrapping behavior)

### Goal 3: Address Real-time Updates Enhancement (TD-001)
*   [x] Review TD-001 description in `sprints/tech_debt.md`.
*   [x] Analyze current Supabase Realtime setup and identify areas for improvement (e.g., subscription efficiency, data handling on frontend). (Identified missing subscriptions/disabled table replication)
*   [x] Implement necessary code changes (backend or frontend). (Added listeners to WellGrid, WellTableView, WellDetail; Enabled table replication in Supabase)
*   [x] Test real-time update behavior. (Verified working after enabling table replication)

### Goal 4: Add Fault Description Field (from Backlog)
*   [x] Add optional Textarea to `components/fault-simulation-form.tsx`.
*   [x] Update form submission to include description.
*   [x] Update `POST /api/faults` endpoint to accept and store description.
*   [x] Test fault simulation with and without description.

### Goal 5: Implement Well Display View Toggle (from Backlog)
*   [x] Add view toggle (Card/Table) buttons to `components/toolbar.tsx`.
*   [x] Implement URL search param update (`?view=card` / `?view=table`) in Toolbar.
*   [x] Create basic `components/well-table-view.tsx` using Shadcn Table.
*   [x] Define columns (Name, Camp, Formation, Status, Last Maintenance) in Table View.
*   [x] Implement conditional rendering in `app/page.tsx` based on `view` param.
*   [x] Refactor `WellTableView` to fetch its own data based on `searchParams`.
*   [x] Test switching views and ensure filters still apply.

## Sprint Review

*   **Demo Readiness:** 
    *   Reset Demo functionality is implemented and working via a Toolbar button.
    *   Fault Simulation now includes an optional description field.
    *   Well display toggle (Card/Table view) is functional using URL parameters.
    *   Toolbar layout handles wrapping acceptably on smaller screens.
    *   Real-time updates for well status changes are now functional across Table view, Card view, and Detail view after enabling table replication in Supabase.
*   **Gaps/Issues:**
    *   The real-time update handlers in `WellTableView` and `WellGrid` currently don't re-apply existing filters (status, camp, formation) when adding new wells or keeping updated wells. This could lead to wells appearing/staying in the view even if they no longer match the selected filters, until the next manual filter change or refresh. (Low priority for now).
*   **Next Steps:** 
    *   Proceed to the next planned sprint or feature development based on the overall project roadmap (referencing `sprints/v1.1.0-sprintplan.md`).
    *   Consider refining the real-time filter logic (from Gaps/Issues) if it becomes problematic. 