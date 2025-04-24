# Sprint 20 Test Plan

## Goals

- Verify the functionality and correctness of `WellTableView` after refactoring to TanStack Table.
- Verify the functionality and correctness of `FaultHistoryTable` after refactoring to TanStack Table.

## Test Cases

### Component: `WellTableView`

**Test Case WTV-01: Data Display**
- **Steps:** 
    1. Navigate to the page displaying the `WellTableView`.
    2. Ensure multiple wells are available in the database.
- **Expected Result:** The table renders, showing columns for Well Name, Camp, Formation, Status, and Last Maintenance. Data accurately reflects the wells in the database.

**Test Case WTV-02: Loading State**
- **Steps:**
    1. Clear browser cache or simulate slow network conditions.
    2. Navigate to the page displaying the `WellTableView`.
- **Expected Result:** A loading indicator (e.g., spinner or skeleton) is displayed while the initial data fetch is in progress.

**Test Case WTV-03: Error State**
- **Steps:**
    1. Simulate a network error during the data fetch (e.g., use browser dev tools to block requests to the Supabase API).
    2. Navigate to the page displaying the `WellTableView`.
- **Expected Result:** An appropriate error message is displayed instead of the table.

**Test Case WTV-04: Filtering**
- **Steps:**
    1. Navigate to the page displaying the `WellTableView`.
    2. Select a specific Camp from the filter dropdown (ensure wells exist for this Camp).
    3. Select a specific Formation from the filter dropdown (ensure wells exist for this Formation).
    4. Select a specific Status from the filter dropdown (ensure wells exist for this Status).
    5. Select "All" for each filter.
    6. Test a combination of filters (e.g., Camp='Midland', Status='Operational').
- **Expected Result:** The table updates dynamically to show only wells matching the selected filter criteria. Selecting "All" restores the full (or previously filtered) list. Combinations work correctly.

**Test Case WTV-05: Real-time Updates**
- **Steps:**
    1. Open the database interface or another mechanism to modify well data.
    2. Update the status of a currently displayed well.
    3. Insert a new well that matches the current filter criteria.
    4. Delete a well that is currently displayed.
- **Expected Result:** 
    1. The status badge for the updated well changes in the table without a page refresh.
    2. The new well appears in the table, maintaining the default sort order (by name).
    3. The deleted well disappears from the table.

**Test Case WTV-06: Links**
- **Steps:**
    1. In the `WellTableView`, click on the name of any well.
- **Expected Result:** The browser navigates to the correct detail page for that specific well (`/well/[id]`).

**Test Case WTV-07: Responsiveness**
- **Steps:**
    1. View the `WellTableView`.
    2. Resize the browser window to various widths (desktop, tablet, mobile).
- **Expected Result:** The table remains usable and readable. Columns may wrap or adjust, but content should not be excessively clipped or overflow horizontally.

### Component: `FaultHistoryTable`

**Test Case FHT-01: Data Display**
- **Steps:**
    1. Navigate to a well detail page with known fault history.
- **Expected Result:** The table renders, showing columns for Timestamp, Fault Type, Part ID, and Status. Data accurately reflects the faults for that well.

**Test Case FHT-02: Loading State**
- **Steps:**
    1. Navigate to a well detail page.
    2. Ensure the parent component passes `isLoading=true` initially.
- **Expected Result:** A loading state (e.g., skeletons) is displayed within the table area.

**Test Case FHT-03: Empty State**
- **Steps:**
    1. Navigate to a well detail page that has no fault history.
- **Expected Result:** A message indicating "No fault history available" is displayed instead of the table header/body.

**Test Case FHT-04: Sorting**
- **Steps:**
    1. Navigate to a well detail page with multiple faults.
    2. Click the "Timestamp" header.
    3. Click the "Timestamp" header again.
    4. Click the "Fault Type" header.
    5. Click the "Fault Type" header again.
    6. Click the "Status" header.
    7. Click the "Status" header again.
- **Expected Result:** The table rows re-sort according to the clicked column. The first click applies ascending sort (or the default descending for timestamp), the second click toggles the direction. A sort indicator appears next to the active column header.

**Test Case FHT-05: Row Expansion**
- **Steps:**
    1. Navigate to a well detail page with multiple faults.
    2. Click on a fault row.
    3. Click the same row again.
    4. Click on a different fault row.
- **Expected Result:** 
    1. Clicking a row expands it, showing additional details (Description, Resolved At, Part Details). The chevron icon points down.
    2. Clicking the expanded row collapses it. The chevron icon points right.
    3. Clicking a different row collapses any previously expanded row and expands the newly clicked one.

**Test Case FHT-06: Status Badges**
- **Steps:**
    1. Navigate to a well detail page with both 'active' and 'resolved' faults.
- **Expected Result:** Active faults have a red status badge. Resolved faults have a green status badge. 