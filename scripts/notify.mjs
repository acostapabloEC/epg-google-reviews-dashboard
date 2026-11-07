/**
 * notify.mjs — emails Pablo the Google Reviews run result (reads RESULT_DIR/result.json).
 * Env: RESULT_DIR, SMTP_*, EMAIL_FROM, RUN_URL; DRY_PRINT=1 prints instead of sending.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const f = path.join(process.env.RESULT_DIR || '.', 'result.json');
const r = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
const OK = new Set(['updated', 'no_change', 'dry_run_ok']);
const bad = !r || !OK.has(r.status);
const lines = [];
if (!r) lines.push('The run ended before producing a result. Check the run log.');
else if (r.status === 'updated') lines.push(`Updated and verified live. ${r.summary}`);
else if (r.status === 'no_change') lines.push(r.summary);
else if (r.status === 'dry_run_ok') lines.push(`DRY RUN ok (built, not pushed). ${r.summary}`);
else if (r.status === 'pushed_unverified') lines.push(`PUSHED but not confirmed live — check the Vercel deploy. ${r.summary}`);
else lines.push(`FAILED at "${r.step}": ${r.message}`);
for (const n of r?.notes || []) lines.push(`  - ${n}`);
lines.push('', 'Reminder: the "Q3 Goal Progress" card still counts Jul-Sep; it was not changed.', '', `Run: ${process.env.RUN_URL || '(local)'}`);
const subject = bad ? 'Google Reviews weekly update FAILED' : `Google Reviews weekly update${r.status === 'no_change' ? ' — nothing new' : ''}`;
const body = lines.join('\n');
if (process.env.DRY_PRINT === '1') { console.log(subject + '\n\n' + body); process.exit(0); }

const { default: nodemailer } = await import('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
const t = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: false, auth: { user: SMTP_USER, pass: SMTP_PASS } });
await t.sendMail({ from: EMAIL_FROM || SMTP_USER, to: 'pabloacosta@eliteconsultingpartners.com', subject, text: body });
console.log('Notification sent.');
if (bad) process.exit(1);
