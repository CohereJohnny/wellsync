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
- 💬 AI Chat Assistant with history (Cohere)
- 🔎 Semantic Fault Search Backend (Cohere Embed + pgvector)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Real-time**: Supabase Realtime
- **AI**: Cohere (Command A, Embed v3)
- **Edge Functions**: Supabase Edge Functions (Deno)
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
   Fill in your Supabase and Cohere credentials:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   # Cohere
   COHERE_API_KEY=your-cohere-api-key
   ```

4. **Set up Supabase Database**
   - Ensure you have the Supabase CLI installed and logged in.
   - Link your local project: `supabase link --project-ref <your-project-ref>`
   - Push database migrations: `supabase db push`

5. **Set up Supabase Edge Function Secrets**
   - Go to your Supabase Project Dashboard -> Edge Functions -> generate-fault-embedding -> Secrets.
   - Add the following secrets:
     - `COHERE_API_KEY`: Your Cohere API key.
     - `PROJECT_URL`: Your Supabase Project URL (from Project Settings -> API).
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (from Project Settings -> API -> Project API keys).

6. **Set up Supabase Database Webhook**
   - Go to your Supabase Project Dashboard -> Database -> Webhooks.
   - Create a new webhook:
     - Name: `Trigger Fault Embedding`
     - Table: `faults`
     - Events: `INSERT`
     - Type: `Supabase Edge Functions`
     - Edge Function: `generate-fault-embedding`

7. **Run the development server**
   ```bash
   pnpm run dev
   ```

8. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
wellsync/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── (main)/            # Main application routes
│       ├── layout.tsx
│       ├── page.tsx       # Home page
│       └── well/[id]/     # Well detail page
│           └── page.tsx
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── chat/             # Chat related components
│   └── ...               # Other shared components
├── lib/                   # Utility functions & libs
│   ├── cohere.ts         # Cohere client setup
│   ├── stores/           # Zustand stores
│   ├── supabase/         # Supabase client/server setup
│   └── utils.ts          # General utilities
├── supabase/              # Supabase specific files
│   ├── functions/        # Edge Functions
│   │   ├── _shared/
│   │   └── generate-fault-embedding/
│   ├── migrations/       # Database migration SQL files
│   └── config.toml       # Supabase CLI config
├── public/                # Static assets
├── sprints/               # Sprint planning/tracking docs
│   ├── archive/
│   └── ...
├── .env.local             # Local environment variables
├── next.config.mjs        # Next.js config
├── package.json
├── pnpm-lock.yaml
├── README.md
└── tsconfig.json
```

## Database Schema

```sql
-- Key tables (simplified)
wells (id, name, camp, formation, status, depth, pressure, temperature, flow_rate, ...)
parts (id, name, well_id, status, ...)
faults (id, well_id, part_id, fault_type, timestamp, status, ...)
fault_embeddings (id, fault_id FK, embedding vector(1024), created_at) -- Stores embeddings for semantic search
chat_history (id, well_id UNIQUE, messages jsonb, updated_at) -- Stores conversation history per well
```

## Semantic Search Backend (Sprint 11)

- An Edge Function (`generate-fault-embedding`) automatically creates vector embeddings (using Cohere Embed v3) for new faults via a Database Webhook on the `faults` table.
- A PostgreSQL RPC function (`search_faults`) enables efficient vector similarity searches on these embeddings using pgvector's `<=>` operator (cosine distance).

## Development Commands

- Run dev server: `pnpm run dev`
- Run tests: `pnpm test` (Note: Testing deferred, see `sprints/tech_debt.md`)
- Build: `pnpm run build`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Supabase DB Push: `supabase db push`
- Supabase Function Deploy: `supabase functions deploy <function_name>`

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
- [Cohere](https://cohere.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)