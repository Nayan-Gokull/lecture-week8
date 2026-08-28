/* ============================================================
   Cloudflare Pages Function — /api/frame-results
   "Ship It" — one team's complete run through all three stages
   (source.html -> scene.html -> index.html "Spend the Frame"),
   submitted here as a single record at the very end of stage 3.

   Bindings required:
     - RESULTS   (KV namespace)   : this activity's own namespace,
                                    or shared with others via prefix
     - ADMIN_KEY (env var/secret) : gates GET (read) and DELETE (clear)
   POST is open (teams submit); GET/DELETE require the admin key.

   Nothing from the client is trusted for scoring. Every total, every
   category-coverage flag and the cut/added lists are recomputed here
   from the raw pick id arrays, against the copy of the cost tables
   below — kept in sync with data/frame-data.js, data/source-data.js
   and data/scene-data.js by hand. That now includes stage 1 (which
   hero asset, and whether the licence verdict on it holds up) and
   stage 2 (which scene props, whether they fit the caps) — Round 1's
   rendering cost is derived from stage 2's totals, not picked freely,
   so it has to be recomputed from the same raw inputs as everything
   else, not trusted as a number the client already worked out.

   See data/frame-data.js for the reasoning behind each ms value — in
   short, the 6.7ms budget itself is a teaching simplification, but the
   relative ordering and proportion between options is checked against
   a real basis (published mobile depth-inference benchmarks, known
   mobile shadow-mapping cost, HRTF vs convolution reverb DSP cost,
   and the Model Lab budget table's own asset numbers), not guessed.
   ============================================================ */

const PREFIX = "frame:";

const ALLOWED_FPS = [30, 60, 90];
function capForFps(fps){
  return Math.round(((1000 / fps) - 10) * 10) / 10;
}

function renderMsFromScene(draws, textureMB){
  return Math.round((0.05 + draws * 0.018 + textureMB * 0.012) * 10) / 10;
}

const CATEGORIES = {
  ground:     { min: 1, max: 2 },
  light:      { min: 1, max: 2 },
  audio:      { min: 0, max: 2 },
  legibility: { min: 1, max: 1 },
  render:     { min: 1, max: 1 },
};

const BASE_OPTIONS = {
  g_none:     { ms: 0.0, category: "ground" },
  g_occluder: { ms: 0.2, category: "ground" },
  g_contact:  { ms: 0.3, category: "ground" },
  g_lidar:    { ms: 1.2, category: "ground" },
  g_mldepth:  { ms: 3.5, category: "ground" },

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
};

const BRIEF_THROTTLE_RATIO = {
  museum:        0.776,
  retail:        0.836,
  kids:          0.567,
  wayfinding:    0.522,
  accessibility: 0.672,
  fitness:       0.597,
  warehouse:     0.448,
  realestate:    0.806,
  concert:       0.642,
};

/* ---------------- Stage 1: source the asset ----------------
   Mirrors data/source-data.js's three profiles. clean and commission
   are always shippable as-is; cheap is the arguable NC/ND case, and
   only "attr" or "change" count as a defensible verdict on it. */
const SOURCE_PROFILES = {
  clean:      { model: { tris: 22000, materials: 5, textureMB: 13 }, licenceRisk: false, kind: "fixed",    accepted: ["asis"] },
  cheap:      { model: { tris: 5200,  materials: 2, textureMB: 4  }, licenceRisk: true,  kind: "arguable", accepted: ["attr", "change"], needsAttribution: true },
  commission: { model: { tris: 10500, materials: 3, textureMB: 7  }, licenceRisk: false, kind: "fixed",    accepted: ["asis"] },
};

/* ---------------- Stage 2: build the scene ----------------
   Mirrors data/scene-data.js. groupOf mirrors the client's variant
   rule: only one version of any given object may be placed. */
const SCENE_CAPS = { tris: 60000, draws: 35, textureMB: 45 };
const SCENE_CATS = {
  setting:   { min: 1, max: 1 },
  decor:     { min: 2, max: 4 },
  interface: { min: 1, max: 1 },
};
const SCENE_ASSETS = {
  "set-plane":          { category: "setting",   tris: 200,  materials: 1, textureMB: 1  },
  "set-backdrop":       { category: "setting",   tris: 400,  materials: 1, textureMB: 18, group: "set-backdrop" },
  "set-backdrop-comp":  { category: "setting",   tris: 400,  materials: 1, textureMB: 6,  group: "set-backdrop" },

  "dec-cluster":        { category: "decor",     tris: 6200, materials: 14, textureMB: 5, group: "dec-cluster" },
  "dec-cluster-atlas":  { category: "decor",     tris: 6200, materials: 1,  textureMB: 6, group: "dec-cluster" },
  "dec-particles":      { category: "decor",     tris: 300,  materials: 2, textureMB: 3  },
  "dec-label3d":        { category: "decor",     tris: 1400, materials: 3, textureMB: 2  },
  "dec-crate":          { category: "decor",     tris: 800,  materials: 1, textureMB: 1  },

  "ui-plain":           { category: "interface", tris: 100,  materials: 1, textureMB: 1  },
  "ui-anim":            { category: "interface", tris: 100,  materials: 2, textureMB: 3  },
  "ui-3d":              { category: "interface", tris: 2200, materials: 4, textureMB: 4  },
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const str = (v, max) => String(v == null ? "" : v).slice(0, max);

function cleanPicks(arr, options){
  const out = [];
  if (!Array.isArray(arr)) return out;
  arr.slice(0, 20).forEach((p) => {
    const id = str(p, 40);
    if (options[id] && out.indexOf(id) === -1) out.push(id);
  });
  return out;
}

function scoreRound(picks, cap, options){
  let ms = 0;
  const counts = {};
  picks.forEach((id) => {
    const o = options[id];
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

/* ---------------- Stage 1 recomputation ----------------
   The client's own model spec / licenceRisk / outcome are never
   trusted — only `pick` and `verdict` (and `attribution`, for the
   record) come from the client; everything else is looked up here. */
function scoreSource(data){
  if (!data) return null;
  const pick = str(data.pick, 20);
  const profile = SOURCE_PROFILES[pick];
  if (!profile) return null;

  const verdict = str(data.verdict, 20);
  const accepted = profile.accepted;
  const ok = accepted.indexOf(verdict) !== -1;
  const attribution = str(data.attribution, 400);
  const attributionOk = !profile.needsAttribution || !!attribution;

  const outcome = !attributionOk
    ? (profile.kind === "arguable" ? "hard-to-defend" : "incorrect")
    : (profile.kind === "arguable" ? (ok ? "defensible" : "hard-to-defend") : (ok ? "correct" : "incorrect"));

  return {
    pick, verdict, attribution,
    licenceRisk: profile.licenceRisk,
    model: profile.model,
    outcome,
  };
}

/* ---------------- Stage 2 recomputation ----------------
   groupOf mirrors the client's "one version of any object" rule. */
function scoreScene(data, heroModel){
  if (!data || !heroModel) return null;
  const picks = [];
  const seenGroups = new Set();
  (Array.isArray(data.picks) ? data.picks.slice(0, 20) : []).forEach((p) => {
    const id = str(p, 40);
    const a = SCENE_ASSETS[id];
    if (!a || picks.indexOf(id) !== -1) return;
    const group = a.group || id;
    if (seenGroups.has(group)) return; // only one version of any object
    seenGroups.add(group);
    picks.push(id);
  });

  let tris = heroModel.tris, draws = heroModel.materials, textureMB = heroModel.textureMB;
  const counts = {};
  picks.forEach((id) => {
    const a = SCENE_ASSETS[id];
    tris += a.tris; draws += a.materials; textureMB += a.textureMB;
    counts[a.category] = (counts[a.category] || 0) + 1;
  });

  const reqsMet = Object.keys(SCENE_CATS).every((cat) => {
    const n = counts[cat] || 0;
    const c = SCENE_CATS[cat];
    return n >= c.min && n <= c.max;
  });
  const withinCaps = tris <= SCENE_CAPS.tris && draws <= SCENE_CAPS.draws && textureMB <= SCENE_CAPS.textureMB;

  return {
    picks,
    totals: { tris, draws, textureMB },
    valid: reqsMet && withinCaps,
    renderMs: renderMsFromScene(draws, textureMB),
    lever: str(data.lever, 20),
    justification: str(data.justification, 240),
  };
}

// ---- Team submits ----
export async function onRequestPost({ request, env }) {
  if (!env.RESULTS) return json({ error: "KV binding RESULTS not configured" }, 500);

  let data;
  try { data = await request.json(); } catch { return json({ error: "invalid JSON" }, 400); }

  if (!data || typeof data.team !== "string" || !data.team.trim())
    return json({ error: "team required" }, 400);

  const briefId = str(data.brief, 40);
  const ratio = BRIEF_THROTTLE_RATIO[briefId];
  if (!ratio) return json({ error: "unrecognised brief" }, 400);

  const targetFps = Number(data.targetFps);
  if (ALLOWED_FPS.indexOf(targetFps) === -1)
    return json({ error: "unrecognised target frame rate" }, 400);

  const source = scoreSource(data.source);
  if (!source) return json({ error: "invalid or missing stage 1 (source) data" }, 400);

  const scene = scoreScene(data.scene, source.model);
  if (!scene || !scene.valid) return json({ error: "invalid or missing stage 2 (scene) data" }, 400);

  const OPTIONS = Object.assign({}, BASE_OPTIONS, {
    r_derived: { ms: scene.renderMs, category: "render" },
  });

  const round1Cap = capForFps(targetFps);
  const round2Cap = Math.round(round1Cap * ratio * 10) / 10;

  const r1picks = cleanPicks(data.round1 && data.round1.picks, OPTIONS);
  const r2picks = cleanPicks(data.round2 && data.round2.picks, OPTIONS);
  if (r1picks.indexOf("r_derived") === -1 || r2picks.indexOf("r_derived") === -1)
    return json({ error: "rendering pick must be the derived scene cost" }, 400);
  if (!r1picks.length || !r2picks.length)
    return json({ error: "picks required for both rounds" }, 400);

  const round1 = scoreRound(r1picks, round1Cap, OPTIONS);
  const round2 = scoreRound(r2picks, round2Cap, OPTIONS);

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
    targetFps,
    source, scene,
    round1: { ...round1, cap: round1Cap, justification: str(data.round1 && data.round1.justification, 240) },
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
