# Sprint 4 Tasks

## Goals
- Display the 5x6 grid of well cards on the homescreen.
- Fetch well data from Supabase.

## Tasks
- [x] Create `lib/supabase.ts` for Supabase client initialization.
  - Progress: File created, @supabase/supabase-js installed, .env.local updated and server restart needed (2024-05-16).
- [x] Define `Well` type/interface in `lib/types.ts`.
  - Progress: Well interface defined in lib/types.ts on 2024-05-16.
- [x] Create `components/WellCard.tsx` component.
  - Progress: WellCard.tsx component created on 2024-05-16.
- [x] Create `components/WellGrid.tsx` component.
  - Progress: WellGrid.tsx component created on 2024-05-16.
- [x] Implement data fetching logic in `WellGrid.tsx` using Supabase client (`GET /wells`).
  - Progress: Data fetching implemented within WellGrid.tsx via useEffect on 2024-05-16.
- [x] Integrate `WellGrid.tsx` into `app/page.tsx`.
  - Progress: Integrated WellGrid into app/page.tsx on 2024-05-16.

## Notes
- This sprint focuses on displaying the core data on the homescreen.
- Mock data is not yet loaded; fetching will initially return an empty list.