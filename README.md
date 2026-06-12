# Memoire

**Interactive Wedding Memory Wall** — a cinematic live photo wall for weddings, built with Next.js 15.

Guests scan a QR code, take a photo in the browser, and watch it appear on the live projection wall in real time — displayed inside animated film strips with an editorial dark aesthetic inspired by analog photography, Leica branding, and Apple keynote visual language.

---

## Features

- **Live Wall** (`/projection/[eventId]`) — full-screen cinematic display with 3 animated film strips, couple name typography, quote, event info, live memory counter, and a scannable QR card
- **Capture Page** (`/capture/[eventId]`) — mobile-first webcam photo booth with theme selection and instant upload
- **Highlight Overlay** — when a new photo is submitted, it's announced full-screen for 7 seconds before joining the wall
- **Film Frame Overlays** — 5 custom SVG frames (`/public/frame/`) that can be applied as overlays on captured photos
- **Persistent Photo Storage** — uploaded photos are written to `/public/upload/` as files and served via `/api/upload/[filename]` to avoid Next.js static cache issues
- **Download Page** (`/d/[photoId]`) — QR-linked page for guests to save their photo after submission
- **Dashboard** (`/dashboard`, `/dashboard/[eventId]`) — event management interface

---

## Project Structure

```
app/
  api/
    photos/          → GET (list) + POST (upload & save to disk)
    photos/[id]/     → GET single photo
    upload/[filename]/ → Serve uploaded files from public/upload/
  capture/[eventId]/ → Guest photo booth
  d/[photoId]/       → Guest photo download page
  dashboard/         → Event dashboard
  projection/[eventId]/ → Live wall display
lib/
  store.ts           → In-memory photo store (seeds from public/upload/ on startup)
  themes.ts          → 4 visual themes: minimal, polaroid, dark, rustic
public/
  frame/             → SVG frame overlays (minimal, polaroid, dark, rustic, floral)
  img/               → Couple photo (couple.jpeg)
  upload/            → Guest uploaded photos (written at runtime)
scripts/
  gen-frames.mjs     → Generator for dummy SVG frame files
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Fill in GEMINI_API_KEY if using AI features

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/projection/demo-wedding`.

---

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/projection/demo-wedding` |
| `/projection/[eventId]` | Live wall display (designed for projector/large screen) |
| `/capture/[eventId]` | Guest photo booth — linked from QR code on the wall |
| `/d/[photoId]` | Guest photo download page |
| `/dashboard` | Event list |
| `/dashboard/[eventId]` | Single event management |

---

## Photo Flow

1. Guest scans QR on the live wall → lands on `/capture/[eventId]`
2. Guest takes photo via webcam → selects theme → submits
3. `POST /api/photos` decodes base64 → writes `.jpg` to `public/upload/` → stores URL `/api/upload/filename.jpg` in memory
4. Live wall polls `GET /api/photos?eventId=...` every 2 seconds
5. New photo triggers highlight overlay for 7 seconds, then joins the film strips

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (for planned AI moderation & wishes features) |
| `APP_URL` | Deployment URL (used for self-referential links) |

---

## Themes

| ID | Name | Style |
|---|---|---|
| `minimal` | White Minimal | Clean white with corner accents |
| `polaroid` | Retro Polaroid | Cream background, caption area |
| `dark` | Dark Cinematic | Near-black with gold inner border |
| `rustic` | Rustic Botanical | Stone tones, leaf corner accents |

---

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS v4**
- **Motion** (Framer Motion v12) — film strip scroll, highlight overlay, entrance animations
- **qrcode.react** — live scannable QR on the projection wall
- **react-webcam** — in-browser camera capture
- **@google/genai** — Gemini API (planned: AI moderation, wishes enhancer)

---

## Roadmap

See [`PRD.md`](./PRD.md) for the full product vision including:

- Gemini Vision AI auto-moderation
- AI-powered wedding wishes enhancer
- Offline/low-bandwidth resilience with IndexedDB queue
- Guest digital guestbook PDF export
- SaaS multi-tenant dashboard for wedding organizers
