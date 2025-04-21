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

## Fault History Pagination
- **Priority**: Medium
- **Description**: Add pagination to the fault history table for better performance and usability
- **Requirements**:
  - Implement server-side pagination for fault history
  - Add page size selector (e.g., 10, 25, 50 faults per page)
  - Show current page and total pages
  - Add navigation controls (previous/next, first/last page)
  - Maintain sorting state across page changes
  - Update real-time subscription to work with pagination
  - Show loading state during page transitions

- **Technical Considerations**:
  - Update Supabase queries to handle pagination
  - Maintain real-time updates with paginated data
  - Consider implementing infinite scroll as alternative
  - Ensure proper cache management
  - Update TypeScript types to include pagination metadata

- **Benefits**:
  - Improved performance for wells with many faults
  - Better user experience for data exploration
  - Reduced memory usage on client side
  - Faster initial page load

- **Dependencies**:
  - Existing FaultHistoryTable component
  - Supabase real-time subscription system
  - Current fault data structure

## Enhanced Part Information Display
- **Priority**: Low
- **Description**: Expand the fault history table's expandable rows with more detailed part information
- **Requirements**:
  - Add part specifications section
  - Include part maintenance history
  - Show related parts and dependencies
  - Add part images or diagrams if available
  - Include manufacturer documentation links
  - Show part replacement history
  - Add quick actions for part management

- **Technical Considerations**:
  - Update database schema for additional part details
  - Implement lazy loading for part images
  - Consider caching strategy for part documentation
  - Add new API endpoints for part history
  - Update TypeScript interfaces for expanded part data

- **Benefits**:
  - Better troubleshooting context
  - Improved maintenance planning
  - Enhanced part lifecycle tracking
  - Better integration with inventory system

- **Dependencies**:
  - Existing part management system
  - Current fault history implementation
  - Asset management system integration

## Fault Analytics and Trends
- **Priority**: High
- **Description**: Add analytics and trend visualization for fault history
- **Requirements**:
  - Create fault frequency charts
  - Show fault duration statistics
  - Implement trend analysis for recurring faults
  - Add fault type distribution visualization
  - Create part reliability metrics
  - Show mean time between failures (MTBF)
  - Generate preventive maintenance recommendations

- **Technical Considerations**:
  - Choose appropriate charting library
  - Implement data aggregation logic
  - Consider real-time updates for analytics
  - Optimize query performance for analytics
  - Add export functionality for reports

- **Benefits**:
  - Proactive maintenance planning
  - Better resource allocation
  - Improved fault prediction
  - Data-driven decision making
  - Cost reduction through prevention

- **Dependencies**:
  - Existing fault history data
  - Analytics library integration
  - Historical data availability

## Fault History Export
- **Priority**: Low
- **Description**: Add functionality to export fault history data in various formats
- **Requirements**:
  - Support multiple export formats (CSV, Excel, PDF)
  - Allow custom date range selection
  - Include all relevant fault details
  - Add export progress indicator
  - Support batch exports for multiple wells
  - Include summary statistics in exports
  - Add custom field selection for exports

- **Technical Considerations**:
  - Choose appropriate export libraries
  - Handle large data sets efficiently
  - Implement proper error handling
  - Consider rate limiting for exports
  - Add proper file naming conventions

- **Benefits**:
  - Better reporting capabilities
  - Integration with external systems
  - Improved audit compliance
  - Offline data access
  - Custom report generation

- **Dependencies**:
  - Existing fault history system
  - Export library integration
  - File generation system

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

## Populate Missing Well Data
- **Priority**: Medium
- **Description**: Populate missing numerical data (Depth, Temperature, Pressure, Flow Rate) for existing wells.
- **Requirements**:
  - Create a SQL script to update the `wells` table.
  - Use realistic, varied data ranges for each field based on typical oil/gas well parameters.
  - Ensure the script updates existing rows without affecting other data.
  - Script should be idempotent if possible (e.g., only update if values are NULL or zero).
- **Technical Considerations**:
  - Determine appropriate ranges for each field (e.g., Depth 5000-15000 ft, Pressure 1000-5000 psi, Temp 150-300 F, Flow Rate 50-500 bbl/d).
  - Use SQL functions like `RANDOM()` or similar to generate varied data within ranges.
  - Test script carefully on a development database first.
- **Benefits**:
  - Provides more complete and realistic data for the Well Detail view.
  - Enhances the realism of the demo application.
  - Supports potential future features that might use this data.
- **Dependencies**:
  - Existing `wells` table schema.

## Enhance Fault Data Realism
- **Priority**: Medium
- **Description**: Improve the realism of mock fault data by adding more descriptive fields and context, addressing the issue where fault details are sometimes reported as "undefined".
- **Requirements**:
  - Review the `faults` table schema.
  - Add new columns if necessary (e.g., `severity` ENUM/TEXT, `description` TEXT, `affected_component` TEXT).
  - Update the fault simulation logic (`POST /api/faults`) to populate these new fields with varied, realistic data (e.g., different severity levels, plausible descriptions based on fault type).
  - Modify the context generation in `/api/chat` to include these richer fault details.
  - Ensure the `FaultHistoryTable` can display (or potentially display in the future) this additional information.
- **Technical Considerations**:
  - Define appropriate ENUM values or text patterns for severity/description.
  - Consider how fault type relates to affected components or descriptions.
  - Update database migrations and potentially seed data scripts.
  - Ensure backward compatibility if changing existing fault data structures.
- **Benefits**:
  - Provides more meaningful context to the GenAI chat assistant.
  - Creates a more realistic and informative user experience in the Fault History table.
  - Improves the believability and usefulness of the demo application.
- **Dependencies**:
  - Existing `faults` table schema.
  - Fault simulation logic (`POST /api/faults`).
  - Chat context generation (`/api/chat`).
