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
