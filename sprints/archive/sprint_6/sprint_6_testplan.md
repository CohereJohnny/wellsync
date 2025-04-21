# Sprint 6 Test Plan

## Component Tests

### Fault Trigger UI
1. Verify "Trigger Fault" button renders correctly in toolbar
2. Test fault simulation modal/dialog:
   - Opens correctly
   - Shows correct well information
   - Lists available fault types
   - Shows relevant parts for selection
   - Validates form inputs
   - Handles submission
   - Closes properly
3. Test responsive design on different screen sizes
4. Verify keyboard navigation and accessibility

### Fault Creation
1. Test `POST /faults` endpoint:
   - Valid fault creation
   - Invalid requests (missing fields)
   - Error responses
   - Rate limiting
2. Verify well status updates:
   - Status changes to "Fault"
   - Fault details are recorded
   - Timestamps are correct
3. Test concurrent fault creation

### Real-time Updates
1. Test Supabase Realtime subscription:
   - Initial connection
   - Reconnection after disconnect
   - Error handling
2. Verify UI updates:
   - Status indicator changes
   - Animations play correctly
   - Toast notifications appear
3. Test multiple clients:
   - Changes reflect across all connected clients
   - No race conditions
4. Test offline behavior

### Performance Tests
1. Measure latency:
   - Fault creation time
   - Real-time update propagation
   - UI response time
2. Test under load:
   - Multiple simultaneous faults
   - Many connected clients
   - Rapid status changes

## Test Data Requirements
- Multiple test wells in different states
- Various fault types
- Different part configurations
- Test accounts with different permissions

## Success Criteria
1. Fault simulation works reliably
2. Real-time updates propagate within 1 second
3. UI remains responsive during operations
4. Error states handled gracefully
5. All accessibility requirements met

## Test Scenarios

### Basic Flow
1. Click "Trigger Fault" button
2. Select fault type and part
3. Submit fault
4. Verify status change
5. Check toast notification
6. Confirm real-time update

### Error Cases
1. Network disconnection during fault creation
2. Invalid fault type selection
3. Missing required fields
4. Server errors
5. Realtime subscription failures

### Edge Cases
1. Multiple faults on same well
2. Rapid fault triggering
3. Browser refresh during operation
4. Mobile network transitions
5. Concurrent users triggering faults 