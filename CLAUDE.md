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

As of **Jun 30, 2026**:
- `currentRating`: 4.8
- `totalReviews`: 22

---

## The one file to edit

**`src/App.jsx`** — all review data is hardcoded directly.

When new reviews come in:
1. Run the Apify actor with the place ID above to get the latest reviews
2. Update `currentRating` and `totalReviews`
3. Add new reviews to the reviews array (with reviewer name, rating, text, date)
4. Run `npm run build`
5. `npx vercel@latest deploy --prod --yes`

---

## Gotchas

- This dashboard changes infrequently (only when someone leaves a new review) — don't check it weekly
- Apify is the data source; you need an active Apify account to run the scraper
- Manual deploy required — git push alone won't update the live site
- After deploying, visit the live URL to confirm the new review appears
