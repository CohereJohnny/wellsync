# WellSync AI Components Documentation

## Fault Simulation Components

### TriggerFaultButton
A button component that opens the fault simulation dialog.

```tsx
import { TriggerFaultButton } from '@/components/TriggerFaultButton';

<TriggerFaultButton />
```

**Features:**
- Positioned in the toolbar
- Visual feedback on hover/click
- Accessible with keyboard navigation
- Integrated with toast notifications

### FaultSimulationDialog
A modal dialog for simulating faults on wells.

```tsx
import { FaultSimulationDialog } from '@/components/FaultSimulationDialog';

<FaultSimulationDialog 
  open={open} 
  onOpenChange={setOpen} 
/>
```

**Props:**
- `open`: boolean - Controls dialog visibility
- `onOpenChange`: (open: boolean) => void - Handles dialog state changes

**Features:**
- Well selection (filtered to show only operational wells)
- Part selection (dynamically filtered based on selected well)
- Fault type selection
- Form validation
- Loading states
- Error handling
- Success/error notifications via toast

## Real-time Components

### WellGrid
A responsive grid component that displays well cards with real-time status updates.

```tsx
import { WellGrid } from '@/components/WellGrid';

<WellGrid />
```

**Features:**
- Responsive grid layout
- Real-time status updates via Supabase subscriptions
- Loading states
- Error handling
- Empty state handling
- Filter support (camp, formation, status)

### WellCard
A card component that displays well information with real-time status updates.

```tsx
import { WellCard } from '@/components/WellCard';

<WellCard well={well} />
```

**Props:**
- `well`: Well - Well data object

**Features:**
- Visual status indicators
- Hover animations
- Responsive layout
- Accessibility support
- Real-time status updates

## API Documentation

### POST /api/faults
Creates a new fault and updates well status.

**Request Body:**
```typescript
{
  wellId: string;
  partId: string;
  faultType: string;
  description?: string;
}
```

**Response:**
```typescript
{
  id: string;
  wellId: string;
  partId: string;
  faultType: string;
  description?: string;
  timestamp: string;
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 500: Server error

## Type Definitions

```typescript
interface Well {
  id: string;
  name: string;
  camp: string;
  formation: string;
  status: 'Operational' | 'Fault' | 'Pending Repair';
}

interface Part {
  id: string;
  name: string;
  wellId: string;
  status: 'Operational' | 'Fault';
}

interface Fault {
  id: string;
  wellId: string;
  partId: string;
  faultType: string;
  description?: string;
  timestamp: string;
}
``` 