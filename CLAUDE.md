# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InfantPedia (인펀트피디아) — a mobile-first web encyclopedia providing age-specific infant care data (0–12 months). Korean-language UI targeting parents of newborns.

## Tech Stack

- **Framework:** Next.js 14+ with App Router, TypeScript, React
- **Styling:** Tailwind CSS (mobile-first) + shadcn/ui components
- **Database:** Supabase (PostgreSQL), using Supabase client SDK
- **State:** Zustand or React Context API
- **Deployment:** Vercel (frontend), Supabase Cloud (database)

## Build & Dev Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run lint         # run ESLint
```

## Architecture

### Data Flow
- Baby profile (name, birthdate) is stored in browser `localStorage` — no auth required
- Age calculations (days since birth, months) are computed client-side from stored birthdate
- Encyclopedia and dashboard data is fetched from Supabase tables based on computed age

### Database Tables (Supabase)
- `months_info` — per-month metadata: wake windows, feeding amounts, nap counts, summary (keyed by `month` 0–12)
- `wonder_weeks` — Wonder Weeks periods defined by `start_day`/`end_day` ranges (days since birth)
- `activities` — detailed content (development, play, sleep, food) linked to `months_info.month`

### Key UI Structure
- **Bottom Tab Bar:** Home / Encyclopedia / Settings (fixed on mobile)
- **Home Tab:** Daily dashboard with age-matched data cards (wake window, feeding, Wonder Weeks alert)
- **Encyclopedia Tab:** Month selector (swiper 0m–12m) → accordion/tab content by category
- **Mobile-first:** optimized for 360–430px viewport, min touch target 48px

## Language & Locale

All user-facing text is in Korean (한국어). Code, comments, and variable names should be in English.
