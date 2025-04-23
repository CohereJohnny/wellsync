# Completed Backlog Items

## Advanced Fault Filtering
- **Priority**: Medium
- **Description**: Implement advanced filtering options for fault history
- **Requirements**:
  - Add multi-select filters for fault types
  - Implement date range filtering
  - Add part-based filtering
  - Support status-based filtering
  - Allow saving filter presets
  - Add text search for descriptions
  - Implement filter combinations
- **Technical Considerations**:
  - Update query structure for complex filters
  - Optimize filter performance
  - Consider URL parameter mapping
  - Maintain real-time updates with filters
  - Add filter state management
- **Benefits**:
  - More precise data analysis
  - Better troubleshooting capabilities
  - Improved user productivity
  - Customizable views per user
  - Enhanced data exploration
- **Dependencies**:
  - Existing fault history table
  - Current filtering system
  - State management system

## Toolbar Responsive Layout
- **Priority**: Medium
- **Description**: The toolbar elements (filters and trigger button) overflow the screen width on narrow mobile viewports.
- **Requirements**:
  - Adjust the toolbar layout to be responsive.
  - Consider a two-row layout on smaller screens: top row for filters, bottom row for action buttons (Trigger Fault, Reset Demo).
  - Alternatively, collapse filters into a single dropdown or use smaller button variants on mobile.
  - Ensure usability and aesthetics on various screen sizes (mobile, tablet, desktop).
- **Technical Considerations**:
  - Use Tailwind CSS responsive prefixes (sm:, md:, lg:).
  - May require restructuring the Toolbar component's JSX.
- **Benefits**:
  - Improves usability on mobile devices.
  - Ensures all controls are accessible without horizontal scrolling.
- **Dependencies**:
  - Existing Toolbar component.

## Reset Demo Functionality
- **Priority**: Medium
- **Description**: Add a "Reset Demo" button to the toolbar that resets the status of all wells to "Operational".
- **Requirements**:
  - Add a new button (e.g., "Reset Demo") to the toolbar, likely next to "Trigger Fault".
  - Implement backend logic (e.g., a new API endpoint `/api/reset_demo` or a Supabase Edge Function) that updates the `status` column to 'Operational' for all rows in the `wells` table.
  - Ensure the button calls this backend logic.
  - Provide visual feedback to the user upon successful reset (e.g., toast notification).
  - Update the frontend (homescreen grid) to reflect the reset statuses (potentially via `router.refresh()` or relying on existing Realtime updates).
- **Technical Considerations**:
  - Creating the new API endpoint/function requires backend work.
  - Need efficient SQL `UPDATE` query in the backend.
  - Consider potential race conditions if faults are triggered concurrently.
- **Benefits**:
  - Allows easy resetting of the demo state for presentations or testing.
  - Improves demo usability.
- **Dependencies**:
  - Existing Toolbar component.
  - `wells` table schema.

## Well Display View Toggle
- **Priority**: Medium
- **Description**: Add ability to switch between card view and table view on the homepage for wells
- **Requirements**:
  - Add a toggle button in the toolbar next to filters
  - Implement a table view component that shows wells in a sortable table format
  - Table columns should include:
    - Well Name
    - Camp
    - Formation
    - Status (with appropriate status indicators)
    - Last Maintenance Date
  - Persist view preference in URL parameters (e.g., `?view=table` or `?view=card`)
  - Maintain filter functionality in both views
  - Ensure responsive design for both views
  - Add appropriate loading and empty states for table view

- **Technical Considerations**:
  - Use Shadcn/UI Table component for consistency
  - Implement column sorting functionality
  - Consider pagination for table view
  - Ensure filter state works seamlessly between views
  - Add smooth transition animation between views

- **Benefits**:
  - Improved data scanning and comparison in table format
  - Better accessibility for users who prefer tabular data
  - Enhanced sorting capabilities in table view
  - Flexibility for different user preferences

- **Dependencies**:
  - Existing filter functionality
  - Shadcn/UI components
  - Current well data structure

## Fault Description Field
- **Priority**: Medium
- **Description**: Add a free-form text description field to the Trigger Fault dialog
- **Requirements**:
  - Add a text area field to the fault simulation form
  - Allow users to provide context about the fault
  - Make the field optional
  - Store descriptions in the faults table
  - Display descriptions in fault history (future feature)
  - Add character limit with visual counter
  - Add placeholder text suggesting what to include

- **Technical Considerations**:
  - Update fault creation API to handle descriptions
  - Add validation for maximum length
  - Consider markdown support for formatting
  - Add proper sanitization for user input
  - Update TypeScript types to include description

- **Benefits**:
  - Better fault documentation
  - Improved troubleshooting context
  - Enhanced maintenance history
  - Better communication between shifts

- **Dependencies**:
  - Existing fault simulation dialog
  - Fault creation API endpoint
  - Database schema update required
