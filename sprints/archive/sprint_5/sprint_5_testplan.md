# Sprint 5 Test Plan

## Component Tests

### Toolbar Component
1. Verify toolbar renders correctly on homescreen
2. Confirm all dropdowns (Camp, Formation, Status) are present
3. Check dropdown styling matches design spec
4. Verify dropdowns show correct options from database
5. Test keyboard navigation in dropdowns
6. Verify mobile responsiveness of toolbar

### Filter Functionality
1. Test individual filter selection:
   - Select Camp filter only
   - Select Formation filter only
   - Select Status filter only
2. Test multiple filter combinations:
   - Camp + Formation
   - Camp + Status
   - Formation + Status
   - All three filters
3. Verify filter reset functionality
4. Check URL parameter updates with filter changes
5. Test browser back/forward navigation with filters

### API Integration
1. Verify correct API calls with:
   - No filters
   - Single filter
   - Multiple filters
2. Check error handling for:
   - Invalid filter values
   - Missing parameters
   - Network errors
3. Verify response format matches expected schema

### UI/UX Tests
1. Check loading states during filter operations
2. Verify empty state UI when no results match filters
3. Test filter persistence across page reloads
4. Verify accessibility of all filter controls
5. Test keyboard navigation through entire interface

## Test Data Requirements
- Minimum 3 different Camps
- Minimum 3 different Formations
- All possible Status values
- At least one well for each filter combination

## Success Criteria
1. All filter combinations return correct results
2. URL parameters correctly sync with filter state
3. UI remains responsive during filter operations
4. Empty states handle gracefully
5. All accessibility requirements met 