# Monsieur Cookie Dough

Personal recipe management and cooking tips web app. Deployed at [cuisine.iknorr.com](https://cuisine.iknorr.com).

## Features

- **Recipe management** — Create, edit, delete, and favorite recipes with ingredients, steps, tags, and photos
- **Recipe import** — Import recipes from a URL (schema.org JSON-LD extraction) or from screenshots using Claude AI
- **Cooking tips** — Organize cooking tips by category (vegetables, meat, fish, sauces, etc.)
- **Image upload** — Upload recipe photos to Supabase Storage
- **PWA** — Installable as a standalone app on mobile devices
- **Password auth** — Simple cookie-based authentication protecting all routes

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, React Server Components)
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com) (PostgreSQL)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **AI:** [Claude API](https://docs.anthropic.com) (recipe extraction from screenshots)
- **Deployment:** [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Anthropic API key (for screenshot import)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/iKnorr/recipe-app.git
   cd recipe-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` from the example:

   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in the environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ANTHROPIC_API_KEY=<your-anthropic-api-key>
   SITE_PASSWORD=<login-password>
   AUTH_SECRET=<random-secret-for-cookie>
   ```

5. Run the database migrations against your Supabase project:

   - `supabase/migrations/001_create_recipes.sql`
   - `supabase/migrations/002_create_cooking_tips.sql`

6. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
  actions/         # Server actions (recipes, cooking tips, imports)
  app/
    (app)/         # Authenticated routes (recipes, tips)
    api/           # API routes (login, logout)
    login/         # Login page
  components/      # React components
    ui/            # shadcn/ui primitives
  lib/
    supabase/      # Supabase client (server + browser)
    types.ts       # TypeScript types
    recipe-parser.ts   # URL-based recipe import
    ai-extractor.ts    # Screenshot-based recipe import
supabase/
  migrations/      # SQL migrations
```
