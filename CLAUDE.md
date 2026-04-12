# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Monsieur Cookie Dough** - Personal recipe management and cooking tips web app. Deployed at `cuisine.iknorr.com`.

## Commands

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

## Commits

Do not add `Co-Authored-By` lines to commit messages.

## Architecture

Next.js 16 App Router with TypeScript. Uses React Server Components by default; client components are explicitly marked with `"use client"`.

**Route groups:** Authenticated pages live in `src/app/(app)/` (recipes, tips). The login page lives at `src/app/login/` outside the group, so it renders without the header/nav.

**Data layer:** Neon PostgreSQL via `@neondatabase/serverless`. No ORM — direct SQL queries using Neon's tagged template literals. Database client in `src/lib/db.ts`.

**Image storage:** Supabase Storage bucket `recipe-images` (kept separately from the database). Supabase client wrappers in `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` are used only for storage operations.

**Mutations:** All writes go through server actions in `src/actions/`. Pattern: validate → SQL query → `revalidatePath()` → `redirect()`. Note: `redirect()` throws internally — client-side catch blocks must rethrow errors with a `digest` property to avoid false error toasts.

**Auth:** Simple password-based. Middleware (`src/middleware.ts`) checks a `recipe-auth` cookie against `AUTH_SECRET` env var. No Supabase Auth — just a login form that sets an httpOnly cookie for 30 days. Logout via `POST /api/logout` clears the cookie.

**Recipe import — two methods:**
- **URL parsing** (`src/lib/recipe-parser.ts`): Fetches URL, extracts schema.org/Recipe JSON-LD with cheerio, falls back to Open Graph meta tags
- **Screenshot AI** (`src/lib/ai-extractor.ts`): Sends one or more images to Claude Haiku, extracts structured recipe JSON. Supports multi-image (e.g. ingredients on one page, steps on another)

**Cooking tips:** Simple CRUD for text-based tips organized by category. Server actions in `src/actions/cooking-tips.ts`. Categories defined as a const array `COOKING_TIP_CATEGORIES` in types.

**Styling:** Tailwind CSS v4 + shadcn/ui (new-york style). Theme color is orange (#F97316). shadcn components live in `src/components/ui/`.

**PWA:** Manifest at `public/manifest.json`, standalone display mode. Installable on mobile via "Add to Home Screen".

## Key Types

`src/lib/types.ts` defines:
- `Recipe`, `RecipeInsert`, `RecipeUpdate`, `Ingredient` ({amount, unit, name}), `Step` ({order, instruction})
- `CookingTip`, `CookingTipInsert`, `COOKING_TIP_CATEGORIES`

Database stores `ingredients` and `steps` as JSONB arrays. Tags are `text[]`.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Recipe grid (home) |
| `/recipes/new` | Add recipe |
| `/recipes/[id]` | View recipe |
| `/recipes/[id]/edit` | Edit recipe |
| `/tips` | Tips overview grouped by category |
| `/tips/new` | Add tip |
| `/tips/[id]` | View tip |
| `/tips/[id]/edit` | Edit tip |
| `/login` | Password login |

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (storage only)
- `ANTHROPIC_API_KEY` — Claude API for screenshot import
- `SITE_PASSWORD` / `AUTH_SECRET` — password auth

## Database

Migrations in `supabase/migrations/`:
- `001_create_recipes.sql` — `recipes` table with `updated_at` trigger, GIN indexes on title and tags
- `002_create_cooking_tips.sql` — `cooking_tips` table with `updated_at` trigger (reuses function from 001)
