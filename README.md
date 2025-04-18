# WellSync AI Dashboard

A real-time monitoring and fault simulation dashboard for well management, built with Next.js 14, Supabase, and Shadcn/UI.

## Features

- 📊 Real-time well status monitoring
- 🔧 Fault simulation system
- 🎯 Part-specific fault tracking
- 🔍 Advanced filtering (camp, formation, status)
- 📱 Responsive design
- 🚀 Real-time updates via Supabase
- 🎨 Modern UI with Shadcn/UI components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wellsync
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   pnpm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
wellsync/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── WellCard.tsx      # Well display component
│   ├── WellGrid.tsx      # Well grid layout
│   └── toolbar.tsx       # Filtering toolbar
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── docs/                 # Documentation
│   ├── components.md     # Component documentation
│   └── demo_script.md    # Demo walkthrough
└── public/               # Static assets
```

## Key Components

- **WellGrid**: Main dashboard component displaying well status
- **WellCard**: Individual well display with real-time updates
- **Toolbar**: Filtering and fault simulation controls
- **FaultSimulationDialog**: Fault creation interface

## Database Schema

```sql
-- Key tables
wells (id, name, camp, formation, status)
parts (id, name, well_id, status)
faults (id, well_id, part_id, fault_type, timestamp)
```

## Development

- Run tests: `pnpm test`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 