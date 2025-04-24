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
- [ ] Add a "Map View" button to the `Toolbar` component (`components/toolbar.tsx`).
- [ ] Update the `updateView` function in `Toolbar` to handle the 'map' view type.
- [ ] Ensure the view state (`card`, `table`, `map`) is correctly managed via URL search params.
- [ ] Add necessary translations for the "Map View" button.

### Map View Component Implementation
- [ ] Check existing `map-view.tsx` for reusability/refactoring needs.
- [ ] Create a new component `components/dashboard/map-view-dashboard.tsx`.
- [ ] Integrate Mapbox GL JS or a React wrapper.
- [ ] Fetch all well data within the map view component (consider filtering).
- [ ] Display markers on the map for each well using latitude and longitude.
- [ ] Implement basic marker styling (consider color-coding by status).
- [ ] Implement marker click interaction (e.g., show well name, navigate to detail page).

### Well List Sidebar (for Map View)
- [ ] Create a new component `components/dashboard/map-well-list-item.tsx` for the smaller well cards in the sidebar.
- [ ] Style the `map-well-list-item` to be compact.
- [ ] Implement the scrollable sidebar within `map-view-dashboard.tsx`.
- [ ] Implement interaction between list items and map markers.

### Dashboard Integration
- [ ] Update the main Dashboard page component (`app/[locale]/page.tsx`) to conditionally render `WellGrid`, `WellTable`, or `MapViewDashboard` based on the `view` search parameter.
- [ ] Pass necessary props (like filters) to the `MapViewDashboard` component.

### Styling and Refinement
- [ ] Style the `MapViewDashboard` layout (map area width, sidebar width).
- [ ] Ensure responsiveness of the Map View layout.
- [ ] Add loading and error states to `MapViewDashboard`.

### Testing
- [ ] Test toggling between Card, Table, and Map views.
- [ ] Verify all wells are displayed correctly on the map.
- [ ] Test marker interactions.
- [ ] Test well list interactions.
- [ ] Test filtering (if applicable).
- [ ] Test responsiveness.
- [ ] Test Map View in different languages. 