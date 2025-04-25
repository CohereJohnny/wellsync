# Sprint 23 Tasks

## Goals
- Add a "Map View" toggle button to the Dashboard Toolbar.
- Implement a new Map View component for the Dashboard.
- Display all wells on a Mapbox map using their latitude/longitude.
- The Map View should include:
    - A main map area (width equivalent to ~5 well cards).
    - A scrollable sidebar list of wells (1 column, smaller cards).
- Update Dashboard logic to conditionally render Card, Table, or Map view based on the selected toggle.

## Tasks

### Setup
- [x] Create `sprint-23` branch.
- [x] Create `sprints/sprint_23` directory.
- [x] Initialize `sprint_23_tasks.md` and `sprint_23_testplan.md`.

### Toolbar Modification
- [x] Add a "Map View" button to the `Toolbar` component (`components/toolbar.tsx`).
- [x] Update the `updateView` function in `Toolbar` to handle the 'map' view type.
- [x] Ensure the view state (`card`, `table`, `map`) is correctly managed via URL search params.
- [ ] Add necessary translations for the "Map View" button. (Note: Done implicitly via existing pattern, but maybe needs specific review)

### Map View Component Implementation
- [ ] Check existing `map-view.tsx` for reusability/refactoring needs. (New component created instead)
- [x] Create a new component `components/dashboard/map-view-dashboard.tsx`.
- [x] Integrate Mapbox GL JS or a React wrapper.
- [x] Fetch all well data within the map view component (consider filtering).
- [x] Display markers on the map for each well using latitude and longitude.
- [x] Implement basic marker styling (consider color-coding by status).
- [x] Implement marker click interaction (e.g., show well name, navigate to detail page).

### Well List Sidebar (for Map View)
- [x] Create a new component `components/dashboard/map-well-list-item.tsx` for the smaller well cards in the sidebar.
- [x] Style the `map-well-list-item` to be compact.
- [x] Implement the scrollable sidebar within `map-view-dashboard.tsx`.
- [x] Implement interaction between list items and map markers. (Zoom implemented)

### Dashboard Integration
- [x] Update the main Dashboard page component (`app/[locale]/page.tsx`) to conditionally render `WellGrid`, `WellTable`, or `MapViewDashboard` based on the `view` search parameter.
- [x] Pass necessary props (like filters, openFaultDialog) to the `MapViewDashboard` component.

### Styling and Refinement
- [x] Style the `MapViewDashboard` layout (map area width, sidebar width). (Basic layout done)
- [x] Ensure responsiveness of the Map View layout. (Basic flex/grid responsiveness)
- [x] Add loading and error states to `MapViewDashboard`.

### Testing
- [x] Test toggling between Card, Table, and Map views.
- [x] Verify all wells are displayed correctly on the map.
- [x] Test marker interactions.
- [x] Test well list interactions.
- [ ] Test filtering (if applicable). (Filtering logic exists, but dedicated testing might be needed)
- [x] Test responsiveness.
- [ ] Test Map View in different languages. (Assumed working based on i18n setup, needs specific check)

## Sprint Review

- **Demo Readiness:** The core Map View functionality (displaying wells, sidebar list, basic map interactions) is implemented and working. The toolbar correctly toggles between Card, Table, and Map views. The centralized Fault Simulation dialog is functional from the Toolbar, Map View list, Table View, and Well Card context menus.
- **Gaps/Issues:** 
    - "Create Service Request" action remains unimplemented (shows placeholder toast).
    - Some minor styling refinements might be desired for the Map View sidebar/list items.
    - Persistent linter errors related to `geist/font` and `@/components/layout/site-footer` in `app/[locale]/layout.tsx` need further investigation outside this sprint.
- **Next Steps:** Address the unimplemented actions and styling refinements in a future sprint or backlog. Investigate the persistent linter errors. 