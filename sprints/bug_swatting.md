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

## Bug Entry: [2024-03-21]
- **ID**: BUG-003
- **Description**: TypeError when accessing undefined property 'call' in webpack runtime
- **Discovered**: During application startup
- **Context**: Application root route ('/')
- **Fix**: 
  - Added Suspense boundaries around components using useSearchParams (Toolbar and WellGrid)
  - Created not-found.tsx page to handle 404 errors as required by Next.js 14
  - Cleaned build cache and reinstalled dependencies
- **Status**: Resolved
- **Impact**: Fixed application build and runtime errors, improved error handling with 404 page

## Bug Entry: [2024-03-21]
- **ID**: BUG-004
- **Description**: Module not found error for '@/components/ui/use-toast'
- **Discovered**: During build process after adding toast notifications
- **Context**: Sprint 6, Toolbar Component
- **Fix**: 
  - Verified correct implementation of toast components and hooks
  - Confirmed toast hook is correctly located at '@/hooks/use-toast'
  - Verified Toaster component is properly added to root layout
  - Fixed import path in toolbar component to use correct location
- **Status**: Resolved
- **Impact**: Application now builds successfully with working toast notifications

## Bug Entry: [2024-03-21]
- **ID**: BUG-005
- **Description**: Missing fault_types table preventing fault simulation
- **Discovered**: During fault simulation attempt
- **Context**: Fault Simulation Dialog
- **Fix**: 
  - Modified fault simulation form to use predefined fault types instead of database table
  - Added constant `FAULT_TYPES` array with 10 common fault types
  - Updated Part type definition to match data model
  - Removed unnecessary database queries for fault types
  - Fixed part selection to use correct part_id field
- **Status**: Resolved
- **Impact**: Users can now simulate faults by selecting wells, parts, and predefined fault types

## Bug Entry: [2024-03-21]
- **ID**: BUG-006
- **Description**: Error creating fault due to missing timestamp column
- **Discovered**: During fault simulation attempt
- **Context**: Fault Creation API
- **Fix**: 
  1. Update faults table schema to match data model:
  ```sql
  ALTER TABLE faults 
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  ```
  2. Update API route to use 'timestamp' instead of 'created_at'
  3. Update Fault type definition to match database schema
- **Status**: In Progress
- **Impact**: Users cannot create new faults due to schema mismatch

## Bug Entry: [2024-03-21]
- **ID**: BUG-007
- **Description**: Real-time updates not reflecting in UI despite successful fault simulation
- **Discovered**: During fault simulation testing
- **Context**: WellGrid and WellCard Components
- **Fix**: 
  1. Verified Supabase real-time subscription is working (logs show updates being received)
  2. Found issue in WellGrid's handleRealtimeUpdate:
     - Payload comparison was case-sensitive while database values use Title Case
     - State updates weren't triggering re-renders due to object reference issues
  3. Solutions implemented:
     - Added case-insensitive comparison for status updates
     - Ensured proper state immutability in setWells
     - Added key prop updates in WellCard to force re-render on status change
     - Added React.memo with proper comparison function to WellCard
  4. Added additional logging for debugging
- **Status**: Resolved
- **Impact**: Wells now update their status in real-time when faults are simulated

## Bug Entry: [2024-03-21]
- **ID**: BUG-008
- **Description**: Module not found error for '@supabase/ssr' in server-side Supabase client
- **Discovered**: During Sprint 7 implementation of well detail page
- **Context**: Sprint 7, Well Detail Component
- **Fix**: 
  1. Installed @supabase/ssr package using `pnpm add @supabase/ssr`
  2. Updated server-side Supabase client implementation in `lib/supabase/server.ts`:
     - Added proper cookie handling for SSR
     - Added set/remove cookie methods for complete cookie management
  3. Created `lib/supabase/database.types.ts` with complete type definitions for our schema
  4. Verified proper environment variables are set
- **Status**: Resolved
- **Impact**: Well detail page now loads correctly with proper server-side Supabase integration

## Bug Entry: [2024-03-21]
- **ID**: BUG-009
- **Description**: 404 error when accessing well detail page with UUID - type mismatch between URL parameter and database
- **Discovered**: During Sprint 7 testing of well detail page
- **Context**: Sprint 7, Well Detail Page
- **Fix**: 
  1. Updated Well type definition in `lib/types.ts` to include all fields and use string ID
  2. Removed parseInt from page component and added UUID validation
  3. Updated WellDetail component to accept string IDs
  4. Added proper type checking for UUIDs in the URL
- **Status**: Resolved
- **Impact**: Well detail pages now load correctly with UUID parameters

## Bug Entry: [2024-03-21]
- **ID**: BUG-010
- **Description**: Chat API using incorrect column name for fault timestamps
- **Discovered**: During chat system testing
- **Context**: Sprint 9, Chat Integration
- **Fix**: 
  - Updated fault query in chat API route to use 'timestamp' instead of 'created_at'
  - Modified fault display formatting to use 'timestamp' field
- **Status**: Resolved
- **Impact**: Chat system can now properly fetch and display recent faults as context

## Bug Entry: [2024-03-21]
- **ID**: BUG-011
- **Description**: Invalid role in chat history causing Cohere API errors
- **Discovered**: During chat conversation testing
- **Context**: Sprint 9, Chat Integration
- **Fix**: 
  - Identified that chat history roles must be one of: User, Chatbot, System, Tool
  - Updated chat history formatting in `/api/chat` route to map:
    - 'user' -> 'User'
    - 'assistant' -> 'Chatbot'
- **Status**: Resolved
- **Impact**: Chat system now correctly formats message roles for Cohere API, allowing conversations to continue beyond the first few messages

## Bug Entry: [2024-03-21]
- **ID**: BUG-012
- **Description**: Chat messages not displaying in UI despite successful API responses
- **Discovered**: During chat system testing
- **Context**: Sprint 9, Chat Integration
- **Fix**: 
  - Found issue in ChatPanel where API request was using a new message array instead of the stored messages
  - Updated handleSubmit to use wellMessages array from chat store
  - This ensures consistency between UI state and API requests
- **Status**: Resolved
- **Impact**: Chat messages now display correctly in the UI, maintaining conversation history

## Bug Entry: [2024-03-21]
- **ID**: BUG-013
- **Description**: Chat messages not wrapping properly and inconsistent bubble layout
- **Discovered**: During chat UI testing
- **Context**: Sprint 9, Chat Panel Component
- **Fix**: 
  - Added proper text wrapping with whitespace-pre-wrap and break-words
  - Improved chat bubble layout with better width control and alignment
  - Fixed message alignment for user and assistant messages
  - Updated loading indicator styling for consistency
- **Status**: Resolved
- **Impact**: Chat messages now display properly with correct wrapping and consistent layout

## Bug Entry: [2024-03-21]
- **ID**: BUG-014
- **Description**: ChunkLoadError when loading app/layout chunk
- **Discovered**: During application startup
- **Context**: Next.js App Router Layout
- **Fix**: 
  - Cleared Next.js build cache to resolve webpack caching issues
  - Updated layout.tsx with proper font configuration (display: swap, preload)
  - Added suppressHydrationWarning to html element
  - Added viewport metadata and proper layout structure
  - Improved font loading with consistent variable usage
- **Status**: Resolved
- **Impact**: Application now loads properly with optimized font loading and layout structure

## Bug Entry: [2024-03-21]
- **ID**: BUG-015
- **Description**: Chat module loading error and viewport metadata warnings
- **Discovered**: During chat interaction
- **Context**: Sprint 9, Chat Integration
- **Fix**: 
  - Moved viewport metadata to its own export using Next.js 14 viewport API
  - Cleaned up Next.js cache and node_modules
  - Reinstalled dependencies to resolve missing module issue
  - Fixed static chunk loading by proper cache cleanup
- **Status**: Resolved
- **Impact**: Chat system now loads and functions properly without module errors or metadata warnings

## Bug Entry: [2024-03-21]
- **ID**: BUG-016
- **Description**: TypeError in chat API route due to empty messages array
- **Discovered**: During first chat message attempt after previous fixes
- **Context**: Sprint 9, Chat API Route & Panel Interaction
- **Fix**: 
  - Identified that `handleSubmit` in `ChatPanel` was sending the message history *before* the new user message was included.
  - Modified `handleSubmit` to construct a `messagesToSend` array containing both the existing `wellMessages` and the `currentUserMessage`.
  - Passed `messagesToSend` to the API route, ensuring the latest message is always present.
- **Status**: Resolved
- **Impact**: Chat API route no longer errors on the first message, and conversation context is correctly maintained.
