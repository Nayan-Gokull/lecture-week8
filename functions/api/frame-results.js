/* ============================================================
   Cloudflare Pages Function — /api/frame-results
   "Spend the Frame" team submissions.

   Bindings required:
     - RESULTS   (KV namespace)   : this activity's own namespace,
                                    or shared with others via prefix
     - ADMIN_KEY (env var/secret) : gates GET (read) and DELETE (clear)
   POST is open (teams submit); GET/DELETE require the admin key.

   Nothing from the client is trusted for scoring. Every total, every
   category-coverage flag and the cut/added lists are recomputed here
   from the raw pick id arrays, against the copy of the cost table
   below — kept in sync with data/frame-data.js by hand.
   ============================================================ */

const PREFIX = "frame:";

const ROUND1_CAP = 6.7;

const CATEGORIES = {
  ground:     { min: 1, max: 2 },
  light:      { min: 1, max: 2 },
  audio:      { min: 0, max: 2 },
  legibility: { min: 1, max: 1 },
  render:     { min: 1, max: 2 },
};

const OPTIONS = {
  g_none:     { ms: 0.0, category: "ground" },
  g_occluder: { ms: 0.2, category: "ground" },
  g_contact:  { ms: 0.3, category: "ground" },
  g_lidar:    { ms: 1.2, category: "ground" },
  g_mldepth:  { ms: 2.0, category: "ground" },

  l_none:     { ms: 0.0, category: "light" },
  l_estimate: { ms: 0.3, category: "light" },
  l_ibl:      { ms: 1.0, category: "light" },
  l_shadow:   { ms: 1.3, category: "light" },

  a_mono:        { ms: 0.1, category: "audio" },
  a_hrtf:        { ms: 0.6, category: "audio" },
  a_reverbshort: { ms: 0.4, category: "audio" },
  a_reverblong:  { ms: 1.8, category: "audio" },

  x_none:      { ms: 0.0, category: "legibility" },
  x_outline:   { ms: 0.1, category: "legibility" },
  x_scrim:     { ms: 0.2, category: "legibility" },
  x_backplate: { ms: 0.2, category: "legibility" },

  r_lod:   { ms: 0.3, category: "render" },
  r_atlas: { ms: 0.2, category: "render" },
  r_hires: { ms: 0.9, category: "render" },
  r_hero:  { ms: 1.5, category: "render" },
};

const BRIEF_CAPS = {
  museum:        5.2,
  retail:        5.6,
  kids:          3.8,
  wayfinding:    3.5,
  accessibility: 4.5,
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const str = (v, max) => String(v == null ? "" : v).slice(0, max);

function cleanPicks(arr){
  const out = [];
  if (!Array.isArray(arr)) return out;
  arr.slice(0, 20).forEach((p) => {
    const id = str(p, 40);
    if (OPTIONS[id] && out.indexOf(id) === -1) out.push(id);
  });
  return out;
}

function scoreRound(picks, cap){
  let ms = 0;
  const counts = {};
  picks.forEach((id) => {
    const o = OPTIONS[id];
    ms += o.ms;
    counts[o.category] = (counts[o.category] || 0) + 1;
  });
  ms = Math.round(ms * 10) / 10;

  const reqsMet = Object.keys(CATEGORIES).every((cat) => {
    const n = counts[cat] || 0;
    const c = CATEGORIES[cat];
    return n >= c.min && n <= c.max;
  });

  return { picks, ms, overBudget: ms > cap, reqsMet, valid: ms <= cap && reqsMet };
}

// ---- Team submits ----
export async function onRequestPost({ request, env }) {
  if (!env.RESULTS) return json({ error: "KV binding RESULTS not configured" }, 500);

  let data;
  try { data = await request.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  if (!data || typeof data.team !== "string" || !data.team.trim())
    return json({ error: "team required" }, 400);

  const briefId = str(data.brief, 40);
  const round2Cap = BRIEF_CAPS[briefId];
  if (!round2Cap) return json({ error: "unrecognised brief" }, 400);

  const r1picks = cleanPicks(data.round1 && data.round1.picks);
  const r2picks = cleanPicks(data.round2 && data.round2.picks);
  if (!r1picks.length || !r2picks.length)
    return json({ error: "picks required for both rounds" }, 400);

  const round1 = scoreRound(r1picks, ROUND1_CAP);
  const round2 = scoreRound(r2picks, round2Cap);

  const cutList   = r1picks.filter((id) => r2picks.indexOf(id) === -1);
  const addedList = r2picks.filter((id) => r1picks.indexOf(id) === -1);

  const futureProofed = round1.ms <= round2Cap;

  const plan = data.round2 && (data.round2.plannedAhead === "yes" || data.round2.plannedAhead === "no")
    ? data.round2.plannedAhead : "";

  const id = `${PREFIX}${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
  const record = {
    id,
    team: str(data.team, 60),
    members: str(data.members, 200),
    brief: briefId,
    round1: { ...round1, cap: ROUND1_CAP, justification: str(data.round1 && data.round1.justification, 240) },
    round2: { ...round2, cap: round2Cap, plannedAhead: plan, note: str(data.round2 && data.round2.note, 240) },
    cutList, addedList, futureProofed,
    ua: str(data.ua, 200),
    ts: Number(data.ts) || Date.now(),
  };

  await env.RESULTS.put(id, JSON.stringify(record));
  return json({ ok: true, id, round1, round2, futureProofed });
}

// ---- Instructor reads all ----
export async function onRequestGet({ request, env }) {
  const auth = checkAuth(request, env);
  if (auth) return auth;

  const runs = [];
  let cursor;
  do {
    const list = await env.RESULTS.list({ prefix: PREFIX, cursor });
    for (const k of list.keys) {
      const v = await env.RESULTS.get(k.name);
      if (v) { try { runs.push(JSON.parse(v)); } catch {} }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  runs.sort((a, b) => b.ts - a.ts);
  return json({ runs });
}

// ---- Instructor clears ----
export async function onRequestDelete({ request, env }) {
  const auth = checkAuth(request, env);
  if (auth) return auth;

  let cursor, deleted = 0;
  do {
    const list = await env.RESULTS.list({ prefix: PREFIX, cursor });
    for (const k of list.keys) { await env.RESULTS.delete(k.name); deleted++; }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, deleted });
}

function checkAuth(request, env) {
  if (!env.RESULTS) return json({ error: "KV binding RESULTS not configured" }, 500);
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || request.headers.get("x-admin-key");
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ error: "unauthorized" }, 401);
  return null; // ok
}
