# Sprint 19 Test Plan (Draft)

This plan outlines testing for the optional backlog and tech debt items addressed in Sprint 19.

## Goal 1: Reset Demo Functionality

*   **Test Case 1.1: Trigger Reset**
    *   **Action:** Activate the reset mechanism (e.g., click reset button).
    *   **Expected Result:** Confirmation message indicating reset process started/completed. Relevant database tables (e.g., `faults`, `inventory`, `wells` status) are reset to their initial state (verify by checking data before and after). UI reflects the reset state (e.g., fault history cleared, inventory levels default, well statuses default).
*   **Test Case 1.2: Reset Scope Verification**
    *   **Action:** Perform various actions (simulate faults, order/dispatch parts) to change data from the initial state. Trigger the reset.
    *   **Expected Result:** Only the data defined within the reset scope should revert. Data outside the scope (if any) should remain unchanged.

## Goal 2: Improve Toolbar Responsive Layout

*   **Test Case 2.1: Small Viewport (< 640px)**
    *   **Action:** Resize browser window or use browser dev tools to simulate a small mobile viewport.
    *   **Expected Result:** Toolbar elements (`components/toolbar.tsx`) stack cleanly, do not overflow horizontally, remain accessible (e.g., within a drawer/menu if implemented), and maintain readability.
*   **Test Case 2.2: Medium Viewport (640px - 768px)**
    *   **Action:** Resize browser window or use browser dev tools to simulate a tablet viewport.
    *   **Expected Result:** Toolbar layout adapts appropriately, ensuring usability and preventing layout issues.
*   **Test Case 2.3: Large Viewport (> 768px)**
    *   **Action:** View the application on a standard desktop viewport.
    *   **Expected Result:** Toolbar displays its standard desktop layout correctly.

## Goal 3: Address Real-time Updates Enhancement (TD-001)

*   **Test Case 3.1: Verify Real-time Update (Targeted Area)**
    *   **Action:** Identify the specific area targeted by TD-001 (e.g., fault list, well status). Manually change the corresponding data in the Supabase database.
    *   **Expected Result:** The frontend UI updates automatically and efficiently (without full page reload) to reflect the database change within a reasonable time (< 2-3 seconds).
*   **Test Case 3.2: Performance/Efficiency (If Applicable)**
    *   **Action:** Monitor network traffic (browser dev tools) or application performance while triggering real-time updates.
    *   **Expected Result:** Verify that the implemented changes improve efficiency (e.g., reduced subscription load, faster updates) compared to the previous state, as per TD-001's goal. 