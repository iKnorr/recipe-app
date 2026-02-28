# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Monsieur Cookie Dough** - Personal recipe management web app. Deployed at `cuisine.iknorr.com`.

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

**Data layer:** Supabase (PostgreSQL) via `@supabase/ssr`. No ORM — direct Supabase client queries. Two client variants:
- `src/lib/supabase/server.ts` — server-side with cookie handling (used in server actions)
- `src/lib/supabase/client.ts` — browser-side

**Mutations:** All writes go through server actions in `src/actions/`. Pattern: validate → Supabase query → `revalidatePath()` → `redirect()`.

**Auth:** Simple password-based. Middleware (`src/middleware.ts`) checks a `recipe-auth` cookie against `AUTH_SECRET` env var. No Supabase Auth — just a login form that sets an httpOnly cookie for 30 days.

**Recipe import — two methods:**
- **URL parsing** (`src/lib/recipe-parser.ts`): Fetches URL, extracts schema.org/Recipe JSON-LD with cheerio, falls back to Open Graph meta tags
- **Screenshot AI** (`src/lib/ai-extractor.ts`): Sends one or more images to Claude Haiku, extracts structured recipe JSON. Supports multi-image (e.g. ingredients on one page, steps on another)

**Styling:** Tailwind CSS v4 + shadcn/ui (new-york style). Theme color is orange (#F97316). shadcn components live in `src/components/ui/`.

**Image storage:** Supabase Storage bucket `recipe-images`. Upload via server action, public URL stored in recipe record.

## Key Types

`src/lib/types.ts` defines: `Recipe`, `RecipeInsert`, `RecipeUpdate`, `Ingredient` ({amount, unit, name}), `Step` ({order, instruction}).

Database stores `ingredients` and `steps` as JSONB arrays. Tags are `text[]`.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `ANTHROPIC_API_KEY` — Claude API for screenshot import
- `SITE_PASSWORD` / `AUTH_SECRET` — password auth

## Database

Schema in `supabase/migrations/001_create_recipes.sql`. Single `recipes` table with auto-updating `updated_at` trigger and GIN indexes on title (text search) and tags.
