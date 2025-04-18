# Feature Backlog

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
