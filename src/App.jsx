import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GOOGLE_BLUE  = "#4285f4";
const GOOGLE_DIM   = "rgba(66,133,244,0.12)";
const GOOGLE_RED   = "#ea4335";
const GOOGLE_GREEN = "#34a853";
const GOOGLE_GREEN_DIM = "rgba(52,168,83,0.12)";
const GOOGLE_YELLOW = "#fbbc04";
const GREEN    = "#3fb950";
const GREEN_DIM= "rgba(63,185,80,0.12)";
const RED      = "#f85149";
const RED_DIM  = "rgba(248,81,73,0.12)";
const MUTED    = "#8892a4";
const BORDER   = "rgba(255,255,255,0.07)";
const SURFACE  = "#111827";

// Current baseline from Google Business screenshot
const currentRating = 4.8;
const totalReviews  = 21;
const q2Goal        = 10; // new reviews goal per Brian

// Placeholder monthly data — will be replaced with live API data
const monthlyReviews = [
  { month: "Jan 26", reviews: 0 },
  { month: "Feb 26", reviews: 1 },
  { month: "Mar 26", reviews: 2 },
  { month: "Apr 26", reviews: 0 },
];

// Placeholder recent reviews — will be replaced with live API data
const recentReviews = [
  { rating: 5, date: "Mar 2026", snippet: "Frank and his team were incredibly helpful navigating our transition. Highly recommend." },
  { rating: 5, date: "Feb 2026", snippet: "Elite Consulting Partners provided outstanding guidance. Professional, knowledgeable, and responsive." },
  { rating: 5, date: "Jan 2026", snippet: "Exceptional service. Frank's expertise in advisor transitions is unmatched in the industry." },
];

const ratingDist = [
  { stars: "5★", count: 18 },
  { stars: "4★", count: 2  },
  { stars: "3★", count: 1  },
  { stars: "2★", count: 0  },
  { stars: "1★", count: 0  },
];

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= rating ? GOOGLE_YELLOW : "rgba(255,255,255,0.15)" }}>★</span>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a2235", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = time.getHours() % 12 || 12;
  const m = String(time.getMinutes()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  return <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#f0f6fc", letterSpacing: 1 }}>{h}:{m} {ampm}</span>;
}

export default function App() {
  const newReviewsQ2 = monthlyReviews.slice(1).reduce((a,b) => a + b.reviews, 0);
  const pct = Math.round((newReviewsQ2 / q2Goal) * 100);

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f0f6fc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #2a3445; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
      `}</style>

      {/* HEADER */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, background: GOOGLE_BLUE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 700 }}>G</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Elite Partners Group — Google Business Reviews</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Elite Consulting Partners · Moorestown, NJ</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", background: GOOGLE_DIM, color: GOOGLE_BLUE, padding: "5px 12px", borderRadius: 6, border: `1px solid rgba(66,133,244,0.2)` }}>As of Apr 23, 2026</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbc04", animation: "pulse 2s infinite" }} />
            API Pending Approval
          </div>
          <Clock />
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto" }}>

        {/* API PENDING BANNER */}
        <div style={{ background: "rgba(251,188,4,0.08)", border: `1px solid rgba(251,188,4,0.25)`, borderRadius: 12, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#fbbc04" }}>
          <span>⏳</span>
          <span>Google Business API quota request pending (1–3 business days). Dashboard will auto-populate with live review data once approved. Current data sourced manually.</span>
        </div>

        {/* ROW 1: KPI CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>

          {/* Star Rating */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: GOOGLE_YELLOW, borderRadius: "12px 12px 0 0" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>Google Business</div>
            <div style={{ fontSize: 13, color: "#a0aab4", marginBottom: 6 }}>Average Star Rating</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: "#f0f6fc", lineHeight: 1, marginBottom: 10 }}>{currentRating}</div>
            <StarRating rating={5} size={20} />
          </div>

          {/* Total Reviews */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: GOOGLE_BLUE, borderRadius: "12px 12px 0 0" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>Google Business</div>
            <div style={{ fontSize: 13, color: "#a0aab4", marginBottom: 6 }}>Total Reviews</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: "#f0f6fc", lineHeight: 1, marginBottom: 10 }}>{totalReviews}</div>
            <div style={{ fontSize: 11, color: MUTED }}>As of Apr 23, 2026</div>
          </div>

          {/* Q2 New Reviews */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: GOOGLE_GREEN, borderRadius: "12px 12px 0 0" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>Q2 Goal Progress</div>
            <div style={{ fontSize: 13, color: "#a0aab4", marginBottom: 6 }}>New Reviews Q2</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#f0f6fc", lineHeight: 1, marginBottom: 10 }}>{newReviewsQ2} / {q2Goal}</div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: GOOGLE_GREEN, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 10, color: MUTED }}>{pct}% of Q2 goal</div>
          </div>

          {/* 609 Interactions */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: GOOGLE_RED, borderRadius: "12px 12px 0 0" }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>Google Business</div>
            <div style={{ fontSize: 13, color: "#a0aab4", marginBottom: 6 }}>Customer Interactions</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#f0f6fc", lineHeight: 1, marginBottom: 10 }}>609</div>
            <div style={{ fontSize: 11, color: MUTED }}>Profile views + actions</div>
          </div>

        </div>

        {/* ROW 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>

          {/* Monthly new reviews chart */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>New Reviews Per Month</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>2026 YTD · Live data pending API approval</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyReviews} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reviews" name="New Reviews" fill={GOOGLE_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rating distribution */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Rating Distribution</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 20 }}>21 total reviews · Google Business</div>
            {ratingDist.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: GOOGLE_YELLOW, width: 24 }}>{r.stars}</span>
                <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.count / totalReviews) * 100}%`, background: i === 0 ? GOOGLE_GREEN : i === 1 ? GOOGLE_BLUE : GOOGLE_RED, borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, width: 20, textAlign: "right" }}>{r.count}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: "10px 14px", background: GOOGLE_GREEN_DIM, border: `1px solid rgba(52,168,83,0.2)`, borderRadius: 8, fontSize: 11, color: GOOGLE_GREEN }}>
              ✓ 85% of reviews are 5-star
            </div>
          </div>

          {/* Recent reviews */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Recent Reviews</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Sample data · Live reviews pending API approval</div>
            {recentReviews.map((r, i) => (
              <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <StarRating rating={r.rating} size={13} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: MUTED }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 12, color: "#a0aab4", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.snippet}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "10px 14px", background: GOOGLE_DIM, border: `1px solid rgba(66,133,244,0.15)`, borderRadius: 8, fontSize: 11, color: GOOGLE_BLUE, lineHeight: 1.5 }}>
              💡 Review text will auto-populate once Google API quota is approved
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 32px", display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: 10, color: MUTED, marginTop: 24 }}>
        <span>Elite Partners Group · Google Reviews Dashboard · Elite Consulting Partners</span>
        <span>Source: Google Business Profile · Manual + API (pending) · Apr 23, 2026</span>
        <span>4.8 ★ · 21 reviews · 609 interactions</span>
      </div>
    </div>
  );
}
