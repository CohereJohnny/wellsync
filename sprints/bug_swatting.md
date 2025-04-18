# Bug Swatting Log

## Bug Entry: [2024-03-21]
- **ID**: BUG-001
- **Description**: Shadcn/UI Select component error due to empty string values in SelectItem components
- **Discovered**: During Sprint 5 implementation of filtering toolbar
- **Context**: Sprint 5, Toolbar Component
- **Fix**: 
  - Changed empty string values to 'all' for "All" options in Select components
  - Updated filter handling logic to treat 'all' as no filter
  - Modified type definitions to handle null values
- **Status**: Resolved
- **Impact**: Fixed runtime error in filter dropdowns and improved filter UX

## Bug Entry: [2024-03-21]
- **ID**: BUG-002
- **Description**: Filter dropdown values did not match data model specification
- **Discovered**: During Sprint 5 testing
- **Context**: Sprint 5, Toolbar and WellGrid Components
- **Fix**: 
  - Updated Camp options to "Midland" and "Delaware"
  - Updated Formation options to "Spraberry", "Wolfcamp", and "Bone Spring"
  - Updated Status options to "Operational", "Fault", and "Pending Repair"
  - Added case handling in WellGrid for proper database queries
  - Added hyphenation handling for "Bone Spring" and "Pending Repair"
- **Status**: Resolved
- **Impact**: Aligned filter options with database schema and improved data consistency
