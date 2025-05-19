# GridSync AI Dashboard

A real-time monitoring and fault simulation dashboard for electrical transformer management, built with Next.js 14, Supabase, and Shadcn/UI.

## Features

- 📊 Real-time transformer status monitoring
- 🔧 Fault simulation system
- 🎯 Component-specific fault tracking
- 🔍 Advanced filtering (substation, type, status)
- 📱 Responsive design
- 🚀 Real-time updates via Supabase
- 🎨 Modern UI with Shadcn/UI components
- 💬 AI Chat Assistant with history
- 🔎 Semantic Fault Search Backend (Supabase pgvector)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Real-time**: Supabase Realtime
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gridsync
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
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase Database**
   - Ensure you have the Supabase CLI installed and logged in.
   - Link your local project: `supabase link --project-ref <your-project-ref>`
   - Push database migrations: `supabase db push`

5. **Run the development server**
   ```bash
   pnpm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
gridsync/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── [locale]/          # Localized application routes
│       ├── layout.tsx
│       ├── page.tsx       # Home page
│       └── transformer/[id]/  # Transformer detail page
│           └── page.tsx
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── chat/             # Chat related components
│   └── ...               # Other shared components
├── lib/                   # Utility functions & libs
│   ├── stores/           # State management
│   ├── supabase/         # Supabase client/server setup
│   └── utils.ts          # General utilities
├── supabase/              # Supabase specific files
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migration SQL files
├── public/                # Static assets
├── locales/               # i18n translation files
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
transformers (id, name, substation, type, status, latitude, longitude, last_maintenance, fault_details, ...)
parts (part_id, name, description, specifications, manufacturer, ...)
faults (fault_id, transformer_id, part_id, fault_type, timestamp, status, severity, ...)
chat_history (id, transformer_id, messages jsonb, updated_at) -- Stores conversation history per transformer
```

## Development Commands

- Run dev server: `pnpm run dev`
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
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)