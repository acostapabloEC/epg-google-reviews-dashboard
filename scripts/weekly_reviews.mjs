/**
 * weekly_reviews.mjs — laptop-free replacement for the Claude task `google-reviews-weekly-update`.
 * Pull newest reviews via the Apify HTTP API -> compare with src/App.jsx -> edit only if changed ->
 * build -> commit -> push (Vercel is git-linked and auto-deploys) -> verify live.
 *
 * Env: APIFY_TOKEN (required unless REPORT_FIXTURE), DRY_RUN=true, SKIP_BUILD=1, RESULT_DIR,
 *      REPORT_FIXTURE=<json file of Apify items> (local testing only).
 * Always exits 0; writes result.json {status, step, message, summary, notes[]}.
 * NEVER touches q3Goal, the Q3 card, "Customer Interactions", or anything outside the data arrays.
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src', 'App.jsx');
const SITE = 'https://epg-google-reviews-dashboard.vercel.app';
const PLACE_ID = 'ChIJC5RZzTL7b0ARSBaXcWo_E38';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DRY = ['true', '1'].includes(process.env.DRY_RUN);
const result = { status: 'failed', step: '', message: '', summary: '', notes: [] };

function done() {
  writeFileSync(path.join(process.env.RESULT_DIR || '.', 'result.json'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result));
  process.exit(0);
}
const fail = (step, message) => { result.step = step; result.message = String(message).slice(-1500); result.status = 'failed'; done(); };
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024, cwd: ROOT, ...opts });

// 1. pull
let items;
try {
  if (process.env.REPORT_FIXTURE) items = JSON.parse(readFileSync(process.env.REPORT_FIXTURE, 'utf8'));
  else {
    if (!process.env.APIFY_TOKEN) throw new Error('APIFY_TOKEN secret is not set.');
    const url = 'https://api.apify.com/v2/acts/compass~Google-Maps-Reviews-Scraper/run-sync-get-dataset-items'
      + '?timeout=240&fields=stars,text,publishedAtDate,name,totalScore,reviewsCount';
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.APIFY_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeIds: [PLACE_ID], maxReviews: 30, reviewsSort: 'newest', language: 'en' }),
      signal: AbortSignal.timeout(280000),
    });
    if (!res.ok) throw new Error(`Apify HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    items = await res.json();
  }
  if (!Array.isArray(items) || items.length === 0) throw new Error('Apify returned no reviews.');
  if (typeof items[0].totalScore !== 'number' || typeof items[0].reviewsCount !== 'number') throw new Error('Apify items lack totalScore/reviewsCount.');
} catch (e) { fail('pull', e.message); }

const rating = Math.round(items[0].totalScore * 10) / 10;
const total = items[0].reviewsCount;
const dated = items.filter(i => i.publishedAtDate).map(i => ({ ...i, d: new Date(i.publishedAtDate) })).sort((a, b) => b.d - a.d);
const fmtDay = d => `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
const monthLabel = d => `${MON[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const buenosAiresNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));

// 2. edit data arrays
const raw = readFileSync(FILE, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const before = t;
const block = name => {
  const m = t.match(new RegExp(`const ${name} = \\[\\n([\\s\\S]*?)\\n\\];`));
  if (!m) throw new Error(`${name} block not found in App.jsx`);
  return m;
};

try {
  // Early exit: nothing new if rating, total and the 5 newest (stars + date) are all unchanged.
  const curRating = Number(t.match(/const currentRating\s*=\s*([\d.]+);/)?.[1]);
  const curTotal = Number(t.match(/const totalReviews\s*=\s*([\d.]+);/)?.[1]);
  var existingRecent = [...block('recentReviews')[1].matchAll(/\{ rating: (\d),\s+date: "([^"]+)",\s+snippet: ".*" \},?/g)];
  const oldKeys = existingRecent.map(m => `${m[1]}|${m[2]}`).join(';');
  const newKeys = dated.slice(0, 5).map(i => `${i.stars}|${fmtDay(i.d)}`).join(';');
  if (rating === curRating && total === curTotal && oldKeys === newKeys) {
    result.status = 'no_change';
    result.summary = `No new reviews — dashboard unchanged (rating ${rating}, ${total} reviews).`;
    done();
  }
  const setScalar = (name, val) => {
    const re = new RegExp(`(const ${name}\\s*=\\s*)[\\d.]+;`);
    if (!re.test(t)) throw new Error(`${name} not found`);
    t = t.replace(re, `$1${val};`);
  };
  setScalar('currentRating', rating);
  setScalar('totalReviews', total);

  // recentReviews: 5 newest
  const rr = block('recentReviews');
  // Keep the existing (hand-trimmed) line for any review already shown; only new reviews get a
  // generated snippet (first ~240 characters, cut at a word boundary).
  const recent = dated.slice(0, 5).map(i => {
    const kept = existingRecent.find(m => Number(m[1]) === i.stars && m[2] === fmtDay(i.d));
    if (kept) return `  ${kept[0].trim().replace(/,?$/, ',')}`;
    let text = String(i.text || '').replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 240) text = text.slice(0, 240).replace(/\s+\S*$/, '') + '…';
    const snippet = text ? esc(text) : `${i.stars}-star rating. No written review.`;
    return `  { rating: ${i.stars}, date: "${fmtDay(i.d)}", snippet: "${snippet}" },`;
  });
  t = t.replace(rr[0], `const recentReviews = [\n${recent.join('\n')}\n];`);

  // monthlyReviews: refresh only from the last existing bucket onward (older buckets untouched)
  const mr = block('monthlyReviews');
  const lines = mr[1].split('\n');
  const lastM = lines[lines.length - 1].match(/month: "(\w{3}) (\d{2})"/);
  if (!lastM) throw new Error('Could not parse last monthlyReviews bucket');
  const now = buenosAiresNow();
  const cur = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  let m = new Date(Date.UTC(2000 + Number(lastM[2]), MON.indexOf(lastM[1]), 1));
  const oldest = dated[dated.length - 1]?.d;
  const truncated = items.length >= 30 && total > items.length;
  const out = lines.slice(0, -1);
  while (m <= cur) {
    const lab = monthLabel(m);
    const covered = !truncated || (oldest && oldest <= m);
    const existing = lines.find(l => l.includes(`"${lab}"`)) || '';
    const count = covered ? dated.filter(i => monthLabel(i.d) === lab).length : Number(existing.match(/reviews:\s*(\d+)/)?.[1] ?? 0);
    if (!covered) result.notes.push(`Month ${lab} not fully covered by the 30 newest reviews; left as is.`);
    out.push(`  { month: "${lab}", reviews: ${count} },`);
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
  }
  t = t.replace(mr[0], `const monthlyReviews = [\n${out.join('\n')}\n];`);

  // ratingDist: only when the full review set was pulled
  if (items.length >= total) {
    const dist = [5, 4, 3, 2, 1].map(s => `  { stars: "${s}★", count: ${items.filter(i => i.stars === s).length} },`);
    const rd = block('ratingDist');
    t = t.replace(rd[0], `const ratingDist = [\n${dist.join('\n')}\n];`);
  } else result.notes.push(`Only ${items.length} of ${total} reviews pulled; ratingDist left unchanged.`);
} catch (e) { fail('edit', e.message); }

// Compare data only (padding differences in the arrays are not "new reviews")
const norm = s => s.replace(/[ \t]+/g, ' ');
if (norm(t) === norm(before)) {
  result.status = 'no_change';
  result.summary = `No new reviews — dashboard unchanged (rating ${rating}, ${total} reviews).`;
  done();
}

// date stamps (only when data actually changed)
const today = fmtDay(new Date(buenosAiresNow().toDateString() + ' UTC'));
t = t.replace(/verified current as of [A-Z][a-z]{2} \d{1,2}, \d{4}[^\n]*/, `verified current as of ${today} (automated weekly update)`)
  .replace(/As of [A-Z][a-z]{2} \d{1,2}, \d{4}/g, `As of ${today}`)
  .replace(/(Source: Apify Google Maps Reviews Scraper · )[A-Z][a-z]{2} \d{1,2}, \d{4}/, `$1${today}`);
writeFileSync(FILE, t.replace(/\n/g, eol), 'utf8');
result.summary = `Updated: rating ${rating}, ${total} reviews; newest review ${fmtDay(dated[0].d)}.`;

// 3. build
if (process.env.SKIP_BUILD !== '1') {
  const ci = run('npm', ['ci', '--no-audit', '--no-fund']);
  if (ci.status !== 0) fail('build', `npm ci failed:\n${ci.stderr || ci.stdout}`);
  const b = run('npm', ['run', 'build']);
  if (b.status !== 0) fail('build', b.stderr || b.stdout);
}
if (DRY) { result.status = 'dry_run_ok'; done(); }

// 4. commit + push (only App.jsx); Vercel auto-deploys from master
for (const args of [['add', 'src/App.jsx'], ['commit', '-m', `Weekly update: Google Reviews via Apify (rating ${rating}, ${total} reviews)`], ['push']]) {
  const g = run('git', args);
  if (g.status !== 0) fail('push', `git ${args[0]} failed:\n${g.stderr || g.stdout}`);
}

// 5. verify the newest review date is in the served bundle
const marker = fmtDay(dated[0].d);
async function live() {
  const html = await (await fetch(`${SITE}/?t=${Date.now()}`)).text();
  for (const m2 of html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)) {
    if ((await (await fetch(SITE + m2[1])).text()).includes(marker)) return true;
  }
  return false;
}
let ok = false;
for (let i = 0; i < 15 && !ok; i++) {
  await new Promise(r => setTimeout(r, 20000));
  try { ok = await live(); } catch { /* retry */ }
}
result.status = ok ? 'updated' : 'pushed_unverified';
if (!ok) { result.step = 'verify'; result.message = `Pushed, but ${SITE} did not show "${marker}" within 5 minutes.`; }
done();
