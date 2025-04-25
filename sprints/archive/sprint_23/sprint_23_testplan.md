# Sprint 23 Test Plan

## Goal: Implement Dashboard Map View

### Test Cases

**1. View Toggling:**
    - [ ] **TC1.1:** Click "Map View" button in the toolbar.
        - **Expected:** Dashboard switches to Map View, URL updates with `?view=map`.
    - [ ] **TC1.2:** From Map View, click "Card View" button.
        - **Expected:** Dashboard switches to Card View, URL updates with `?view=card`.
    - [ ] **TC1.3:** From Map View, click "Table View" button.
        - **Expected:** Dashboard switches to Table View, URL updates with `?view=table`.
    - [ ] **TC1.4:** Navigate directly to `/` (or `/en/`) with `?view=map` in the URL.
        - **Expected:** Dashboard loads directly in Map View.

**2. Map Display:**
    - [ ] **TC2.1:** Verify Mapbox map container renders correctly.
    - [ ] **TC2.2:** Verify markers are displayed for all wells currently fetched (consider filters).
    - [ ] **TC2.3:** Verify markers are positioned accurately based on well latitude/longitude.
    - [ ] **TC2.4:** Verify markers have basic styling (e.g., default color, potentially different color for 'Fault' status).

**3. Marker Interaction:**
    - [ ] **TC3.1:** Click on a well marker.
        - **Expected:** A tooltip/popup appears showing the well name and status OR navigates directly to the well detail page `/well/[id]`.
    - [ ] **TC3.2 (If Tooltip):** Click the link/button within the tooltip (if applicable).
        - **Expected:** Navigates to the correct well detail page.

**4. Well List Sidebar:**
    - [ ] **TC4.1:** Verify the scrollable well list sidebar renders next to the map.
    - [ ] **TC4.2:** Verify each item in the list displays at least the well name and status compactly.
    - [ ] **TC4.3:** Verify the list is scrollable if the number of wells exceeds the sidebar height.

**5. List/Map Interaction:**
    - [ ] **TC5.1:** Click a well item in the sidebar list.
        - **Expected:** The corresponding marker on the map is highlighted or the map pans/zooms to the marker.
    - [ ] **TC5.2 (Optional):** Click a marker on the map.
        - **Expected:** The corresponding item in the list is highlighted and scrolled into view.

**6. Responsiveness:**
    - [ ] **TC6.1:** View the Map View on different screen sizes (desktop, tablet, mobile).
        - **Expected:** The layout adjusts gracefully (e.g., sidebar might stack below map or become narrower).

**7. Data Handling:**
    - [ ] **TC7.1:** Observe the Map View during initial load.
        - **Expected:** A loading indicator is displayed while map/data loads.
    - [ ] **TC7.2:** Simulate a network error during well data fetching for the map.
        - **Expected:** An appropriate error message is displayed.

**8. Localization:**
    - [ ] **TC8.1:** Switch language using the language switcher.
        - **Expected:** The "Map View" button text in the toolbar is translated correctly.

**9. Filtering (If Implemented):**
    - [ ] **TC9.1:** Apply filters (Camp, Formation, Status) while in Map View.
        - **Expected:** Only markers and list items matching the filters are displayed. Map might re-center/zoom based on filtered results.
    - [ ] **TC9.2:** Switch to Map View with filters already applied.
        - **Expected:** Map View displays only the filtered wells. 