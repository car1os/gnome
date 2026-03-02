# gnome

Next.js health dashboard showcasing the [whoopper](https://www.npmjs.com/package/whoopper) library. Displays WHOOP recovery, sleep, and strain trends with a dark theme.

## Quick Reference

```bash
npm run dev     # Next.js dev server on localhost:3000
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — dark theme, Inter font
│   ├── page.tsx                    # Dashboard (server component, auth check)
│   ├── globals.css                 # Tailwind + WHOOP theme CSS variables
│   ├── login/page.tsx              # Login page with "Connect with WHOOP" button
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      #   GET: generate state, redirect to WHOOP OAuth
│       │   ├── callback/route.ts   #   GET: exchange code, fetch profile, set session
│       │   └── logout/route.ts     #   POST: clear session
│       └── whoop/
│           └── trends/route.ts     #   GET ?range=7|30|90: aggregated chart data
├── components/
│   ├── DashboardShell.tsx          # Client component — state, data fetching, layout
│   ├── TimeRangeSelector.tsx       # 7d / 30d / 90d toggle
│   ├── StatCard.tsx                # Summary metric card
│   ├── RecoveryChart.tsx           # Recovery % line chart (0-100, zone lines at 33/67)
│   ├── SleepChart.tsx              # Sleep performance % line chart
│   └── StrainChart.tsx             # Strain line chart (0-21)
├── lib/
│   ├── session.ts                  # iron-session: get/set/clear encrypted cookie
│   ├── auth.ts                     # OAuth helpers: buildAuthUrl, exchangeCode, refreshTokens
│   └── whoop-client.ts            # Creates WhooopperClient.withTokens() with auto-refresh
└── middleware.ts                   # Protects / and /api/whoop/*; proactive token refresh
```

## Architecture

### Auth Flow

1. User clicks "Connect with WHOOP" → `/api/auth/login`
2. Login route generates state cookie, redirects to WHOOP OAuth (`api.prod.whoop.com/oauth/oauth2/auth`)
3. WHOOP redirects back to `/api/auth/callback` with code
4. Callback validates state, exchanges code for tokens, fetches profile via `client.user.getProfile()`
5. Tokens + firstName stored in encrypted iron-session cookie
6. User redirected to `/` (dashboard)

### Session

- **iron-session** with encrypted httpOnly cookie (`gnome-session`)
- Stores: `accessToken`, `refreshToken`, `expiresAt`, `firstName`
- No database needed

### Token Refresh

Tokens are proactively refreshed (5-minute buffer before expiry) in two places:
- **Middleware** — on every protected request
- **`getClient()`** — before API calls in route handlers

Both call WHOOP's `/oauth/oauth2/token` endpoint with `grant_type=refresh_token`.

### Data Flow

1. `page.tsx` (server) checks session → renders `<DashboardShell firstName={...} />`
2. `DashboardShell` (client) fetches `/api/whoop/trends?range=30`
3. Trends route creates whoopper client, fetches cycles + recovery + sleep in parallel
4. Data joined on cycle_id/sleep_id, transformed to chart-ready format with averages
5. Charts render via Recharts

### Server vs Client Components

- **Server**: `page.tsx`, `layout.tsx`, `login/page.tsx`, all API routes
- **Client**: all `components/*.tsx` (prefixed with `"use client"`)

## Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0a` | Page background |
| `--surface` | `#1a1a1a` | Cards, chart containers |
| `--border` | `#2a2a2a` | Card borders, grid lines |
| `--accent` | `#00d1b2` | Primary accent, recovery green |
| `--recovery-yellow` | `#ffcc00` | Recovery 34-66% |
| `--recovery-red` | `#ff4444` | Recovery 0-33% |

Use Tailwind classes: `bg-background`, `bg-surface`, `border-border`, `text-accent`, etc.

## Environment Variables

```bash
WHOOP_CLIENT_ID=           # From WHOOP Developer Portal
WHOOP_CLIENT_SECRET=       # From WHOOP Developer Portal
SESSION_SECRET=            # 32+ character random string for iron-session
NEXT_PUBLIC_BASE_URL=      # Default: http://localhost:3000
```

Copy `.env.local.example` → `.env.local` to get started.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **whoopper** — WHOOP API client
- **Recharts 3** — line charts
- **iron-session 8** — encrypted cookie sessions
- **Tailwind CSS 4**
- **TypeScript 5** (strict mode, `@/*` path alias)

## Key Conventions

- OAuth is handled via API routes (not whoopper's built-in `authenticate()` which opens a browser)
- `WhooopperClient.withTokens()` creates a per-request client from session tokens
- All chart components use Recharts `ResponsiveContainer` with consistent dark-themed Tooltip styling
- Charts use distinct colors: recovery `#00d1b2`, sleep `#6366f1`, strain `#f97316`
- The trends API filters out `PENDING_SCORE`/`UNSCORABLE` entries and naps from sleep data
