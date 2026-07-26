# Apex Racing Simulator — website & booking system

Live site for Apex Racing Simulator (New Cairo). Built with Next.js + Tailwind v4, deployed on Vercel. Bookings are stored in Vercel Blob so availability is real and shared across every visitor.

## Managing the site day-to-day (no coding needed)

### Adding photos
Drop image files into `public/gallery/` — see [public/gallery/README.md](public/gallery/README.md) for the upload-on-github.com walkthrough. The gallery section is hidden entirely until at least one photo exists.

### Viewing / cancelling bookings
Go to `/admin` on the live site (e.g. `https://apex-racing-simulator.vercel.app/admin`) and enter the staff passcode to see every upcoming booking and cancel one if needed. The passcode is stored as the `ADMIN_PASSCODE` environment variable in the Vercel project settings — change it any time from there.

### Correcting business info
Opening hours, phone number, WhatsApp number, and other facts live in one place: [lib/constants.ts](lib/constants.ts). Opening hours in particular were **assumed** (10:00–00:00) since they weren't confirmed — check and correct there if wrong.

## How the booking system works

- 4 rigs total; bays 03 & 04 are drift-capable, all 4 run F1/Highway/Race.
- Customers pick a date, mode, and 30-min or 1-hour duration; the time grid shows real availability computed from existing bookings.
- On confirm, a rig is assigned automatically (non-drift bookings prefer non-drift bays, saving the 2 drift bays for drift requests) and the booking is written to the shared store with optimistic-concurrency (ETag) writes, so two customers can never win the same rig for an overlapping time.
- Booking is instant — there's no manual approval step. A WhatsApp message auto-opens for the customer to notify the shop too.

**Known limitation:** the shared store is a single JSON blob with retry-based conflict resolution, not a transactional database. This is safe for a single venue's realistic booking volume, but if traffic grows heavily, consider migrating to a real database (Postgres/Neon, or Upstash Redis) — the API surface in `lib/store.ts` is the only file that would need to change.

## Local development

```bash
npm run dev
```

Requires `.env.local` with `BLOB_READ_WRITE_TOKEN` (from the linked Vercel Blob store) and `ADMIN_PASSCODE`. Run `vercel env pull` if you're on a fresh checkout with the project already linked.

## Deploying

Push to the connected GitHub repo, or run:

```bash
vercel --prod
```
