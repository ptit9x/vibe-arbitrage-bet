# ⚡ Arbitrage Bet

A sports arbitrage betting tool built with Next.js and Supabase.

**Live:** [vibe-arbitrage-bet.vercel.app](https://vibe-arbitrage-bet.vercel.app)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Auth & Database:** Supabase
- **UI:** shadcn/ui + Tailwind CSS + Lucide Icons
- **Language:** TypeScript

## Features

- Authentication (Login, Register, Forgot Password, Reset Password)
- Profile management (Display name, Change password)
- Protected routes with middleware

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home (protected)
│   ├── login/                # Sign in
│   ├── register/             # Sign up
│   ├── forgot-password/      # Request reset link
│   ├── reset-password/       # Set new password (via email link)
│   ├── change-password/      # Change password (logged in)
│   ├── profile/              # User profile
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── logout-button.tsx
├── lib/
│   ├── supabase/             # Client, Server, Middleware
│   └── utils.ts
└── middleware.ts              # Auth middleware
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `master` to auto-deploy.

GitHub: [ptit9x/vibe-arbitrage-bet](https://github.com/ptit9x/vibe-arbitrage-bet)
