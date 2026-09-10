# Flashcard Quiz Tool

A study tool for memorizing exact term definitions. You're shown either a term or
its definition and pick the correct match from multiple-choice options.

## Phase 1

Built with Vite + React + TypeScript (chosen so Phase 2 could add Supabase +
Vercel cleanly). Cards are saved to your browser's localStorage, with JSON
export/import for backup.

## Phase 2 (current)

Accounts + cross-device sync, via Supabase (auth + Postgres) and Vercel
(hosting). Quizzes created before signing up can be imported into your
account on first sign-in.

### Getting started

1. Create a Supabase project at https://supabase.com, then in **Project
   Settings → API** copy the **Project URL** and **anon public** key.
2. In the Supabase **SQL Editor**, run the schema from the project's setup
   notes to create the `decks` table with row-level security.
3. Copy `.env.example` to `.env.local` and fill in the two values from step 1.
4. Install and run:

```
npm install
npm run dev
```

Deploying: import this repo into Vercel (framework auto-detected, no config
needed) and add the same two env vars in the Vercel project's Environment
Variables settings before (or with a redeploy after) the first build.

## Status

Building in layered steps — see the project plan for the full roadmap.
