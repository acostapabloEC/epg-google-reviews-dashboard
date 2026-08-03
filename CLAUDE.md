# EPG Google Reviews Dashboard

React/Vite app displaying Frank LaRosa / Elite Consulting Partners Google Reviews.

- **Local:** `C:\Users\ECP\epg-google-reviews-dashboard\`
- **GitHub:** acostapabloEC/epg-google-reviews-dashboard
- **Vercel:** epg-google-reviews-dashboard.vercel.app ✓ auto-deploy on push (branch: master)
- **Password:** Elite2026

---

## Data source

Review data comes from the **Apify Google Maps Reviews Scraper**.

- **Place ID:** `ChIJC5RZzTL7b0ARSBaXcWo_E38` (Elite Consulting Partners)
- Run the Apify actor to pull fresh reviews, then update `App.jsx`

As of **Aug 3, 2026**:
- `currentRating`: 4.8
- `totalReviews`: 20

---

## Automation

**Fully automated** — scheduled task `google-reviews-weekly-update` runs every Monday at 9am (see `C:\Users\ECP\.claude\scheduled-tasks\google-reviews-weekly-update\SKILL.md`). It pulls fresh data from Apify, diffs against `App.jsx`, and only rebuilds/redeploys if the rating, review count, or most recent review actually changed. No manual check needed.

---

## The one file to edit

**`src/App.jsx`** — all review data is hardcoded directly.

Manual update process (only needed if the scheduled task is off or you want to force a check):
1. Run the Apify actor with the place ID above to get the latest reviews
2. Update `currentRating` and `totalReviews`
3. Add new reviews to the reviews array (with reviewer name, rating, text, date)
4. Run `npm run build`
5. `npx vercel@latest deploy --prod --yes`

---

## Gotchas

- Apify is the data source; you need an active Apify account to run the scraper
- Manual deploy required — git push alone won't update the live site
- After deploying, visit the live URL to confirm the new review appears
- The "Q3 Goal Progress" card tracks a rep-facing goal (10 new reviews/quarter, per Brian) — don't change the goal number without being asked, only the progress value moves
- "Customer Interactions" (609) is a separate, manually-sourced Google Business Profile metric — unrelated to the Apify review pull, not part of the daily automation
