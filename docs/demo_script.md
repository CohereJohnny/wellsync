# WellSync AI Demo Script

## Fault Simulation Demo

### Setup
1. Ensure the application is running (`pnpm run dev`)
2. Clear any existing filters in the toolbar
3. Verify there are operational wells visible in the grid

### Demo Flow

1. **Overview of the Dashboard**
   - Show the well grid layout
   - Point out the status indicators (green for operational, red for fault)
   - Demonstrate the filter functionality:
     - Filter by camp (Midland/Delaware)
     - Filter by formation (Spraberry/Wolfcamp/Bone Spring)
     - Filter by status (Operational/Fault/Pending Repair)
   - Reset filters to show all wells

2. **Fault Simulation Process**
   - Locate the "Trigger Fault" button in the toolbar
   - Click to open the fault simulation dialog
   - Walk through the form fields:
     1. Well selection (note that only operational wells are shown)
     2. Part selection (demonstrates dynamic filtering based on well)
     3. Fault type selection
     4. Optional description field

3. **Simulating a Fault**
   - Select an operational well (e.g., "Well-02")
   - Choose a part from the well's inventory
   - Select a fault type
   - Submit the form
   - Observe:
     - Success toast notification
     - Well status change in the grid (green to red)
     - Real-time update of the well card

4. **Filtering and Verification**
   - Filter by "Fault" status
   - Locate the well you just modified
   - Demonstrate that the well appears in the filtered view
   - Show that the status persists after clearing filters

### Key Features to Highlight

1. **Real-time Updates**
   - Status changes reflect immediately
   - No page refresh required
   - Toast notifications provide feedback

2. **User Experience**
   - Responsive design
   - Smooth animations
   - Clear visual feedback
   - Form validation
   - Error handling

3. **Data Consistency**
   - Well status updates persist
   - Filters work correctly with updated data
   - Part status is tracked accurately

### Troubleshooting Tips

If issues arise during the demo:
1. Check the browser console for errors
2. Verify Supabase connection status
3. Try refreshing the page if real-time updates aren't working
4. Ensure you're selecting an operational well for fault simulation

### Success Criteria

The demo is successful when:
- ✅ Fault can be triggered successfully
- ✅ Well status updates in real-time
- ✅ Toast notifications appear
- ✅ Filters work with updated data
- ✅ UI remains responsive and stable 