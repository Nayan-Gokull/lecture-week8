/* ============================================================
   Model Lab — shared client library  (window.ML)
   INTE 42312 · Week 3 · 3D model activities

   Loaded by every student page and by admin.html. Keep this file
   free of activity-specific logic: anything that only one activity
   needs belongs in that activity's own <script>.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny DOM helpers ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  /* ---------- number formatting ---------- */
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  // 184213 -> "184,213"
  const fmtInt = (n) => Math.round(Number(n) || 0).toLocaleString("en-GB");

  // 1836421 -> "1.8 MB"  ·  always 1 dp above 1 KB so budgets read consistently
  function fmtBytes(bytes) {
    const b = Number(bytes) || 0;
    if (b < 1024) return b + " B";
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
    return (b / (1024 * 1024)).toFixed(1) + " MB";
  }

  // 184213 -> "184k"  ·  compact form for budget bars where space is tight
  function fmtCompact(n) {
    const v = Number(n) || 0;
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1e3) return Math.round(v / 1e3) + "k";
    return String(Math.round(v));
  }

  const pct = (part, whole) => (whole > 0 ? clamp((part / whole) * 100, 0, 999) : 0);

  /* ---------- team identity ----------
     Every activity is played by a breakout-room team, not an individual.
     The identity is captured once and reused across all three activities
     in the same browser, so a team that does Autopsy then Budget only
     types their name once.                                              */
  const IDKEY = "modellab.identity.v1";

  function getIdentity() {
    try {
      const raw = localStorage.getItem(IDKEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || !o.team) return null;
      return { team: String(o.team), members: String(o.members || "") };
    } catch { return null; }
  }

  function setIdentity(team, members) {
    const o = { team: String(team || "").trim().slice(0, 60),
                members: String(members || "").trim().slice(0, 200) };
    if (!o.team) return null;
    try { localStorage.setItem(IDKEY, JSON.stringify(o)); } catch {}
    return o;
  }

  function clearIdentity() { try { localStorage.removeItem(IDKEY); } catch {} }

  /* ---------- deterministic brief assignment ----------
     Same hash-based technique used by every activity here: a team's
     name alone decides which scenario they get, so every stage of a
     multi-stage pipeline agrees on the same brief for the same team
     without a server round trip, and it cannot be gamed by retyping
     the name to fish for an easier one (the hash does not favour any
     input). Not security-relevant, so nothing here needs secrecy. */
  function pickBrief(team, list) {
    let h = 0;
    const s = String(team || "").toLowerCase();
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  }

  /* ---------- pipeline handoff storage ----------
     "Spend the Frame" is now the third stage of a three-stage pipeline
     (source.html -> scene.html -> index.html). Each stage writes what
     it decided into one object here, keyed by team name, so the next
     stage can read it without a server round trip — nothing here is
     scored until the final submission, which sends the whole thing to
     the server for authoritative recomputation. */
  const pipeKey = (team) => "framepipe.v1." + String(team || "").trim().toLowerCase();

  function getPipe(team) {
    try {
      const raw = localStorage.getItem(pipeKey(team));
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function setPipe(team, patch) {
    const cur = getPipe(team);
    const next = Object.assign({}, cur, patch);
    try { localStorage.setItem(pipeKey(team), JSON.stringify(next)); } catch {}
    return next;
  }

  function clearPipe(team) {
    try { localStorage.removeItem(pipeKey(team)); } catch {}
  }

  /* ---------- one-shot submission guard ----------
     Mirrors the Hick's Law lab: a team gets one submission per activity.
     Stops a room from quietly re-rolling until they like their answer.   */
  const doneKey = (activity) => "modellab.done." + activity;
  const hasSubmitted = (activity) => {
    try { return !!localStorage.getItem(doneKey(activity)); } catch { return false; }
  };
  const markSubmitted = (activity, id) => {
    try { localStorage.setItem(doneKey(activity), id || String(Date.now())); } catch {}
  };
  const clearSubmitted = (activity) => {
    try { localStorage.removeItem(doneKey(activity)); } catch {}
  };

  /* ---------- toast ---------- */
  let toastEl = null;
  function toast(msg, isErr) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.className = "toast" + (isErr ? " err" : "");
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------- API ----------
     Same contract as the Hick's Law lab: POST is open (students submit),
     GET/DELETE are gated on the admin key. Each activity has its own
     endpoint but they all share one KV namespace via key prefixes.       */
  async function saveRun(endpoint, payload) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json()).error || ""; } catch {}
      throw new Error("save failed: " + res.status + (detail ? " — " + detail : ""));
    }
    return res.json();
  }

  async function fetchRuns(endpoint, key) {
    const res = await fetch(endpoint + "?key=" + encodeURIComponent(key));
    if (res.status === 401) throw new Error("unauthorized");
    if (!res.ok) throw new Error("fetch failed: " + res.status);
    return res.json();
  }

  async function clearRuns(endpoint, key) {
    const res = await fetch(endpoint + "?key=" + encodeURIComponent(key), { method: "DELETE" });
    if (res.status === 401) throw new Error("unauthorized");
    if (!res.ok) throw new Error("clear failed: " + res.status);
    return res.json();
  }

  /* ---------- download / CSV ---------- */
  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // rows: array of arrays. Quotes every cell so commas in free text survive.
  function toCSV(rows) {
    return rows
      .map((r) => r.map((c) => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"').join(","))
      .join("\r\n");
  }

  /* ---------- time ---------- */
  const stamp = (ts) => {
    const d = new Date(Number(ts) || Date.now());
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  /* ---------- press-into-shadow feedback ----------
     The brand's tap affordance: elements translate into their own hard
     offset shadow instead of rippling. CSS does the work on :active;
     this only needs to exist for keyboard activation parity.            */
  function bindPress(root) {
    $$(".btn, .tile, .opt", root || document).forEach((el) => {
      if (el._pressBound) return;
      el._pressBound = true;
      el.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") el.classList.add("is-press");
      });
      el.addEventListener("keyup", () => el.classList.remove("is-press"));
      el.addEventListener("blur", () => el.classList.remove("is-press"));
    });
  }

  /* ---------- screen switching ----------
     Activities are a sequence of <section> screens inside .main-stage.
     show("done") reveals #done and hides its siblings.                  */
  function show(id, root) {
    const stage = root || $(".main-stage");
    if (!stage) return;
    $$(":scope > section", stage).forEach((s) => {
      s.hidden = s.id !== id;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- tabs (admin) ---------- */
  function bindTabs(tabSel, panelSel, onSwitch) {
    const tabs = $$(tabSel);
    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        tabs.forEach((x) => x.classList.toggle("sel", x === t));
        const target = t.dataset.tab;
        $$(panelSel).forEach((p) => { p.hidden = p.dataset.panel !== target; });
        if (typeof onSwitch === "function") onSwitch(target);
      });
    });
  }

  /* ---------- pipeline stage timeline ("Ship It" only) ----------
     A persistent stepper shown on every page of the four-page
     pipeline (intro/source/scene/index), so a team always knows
     where they are without ever seeing what's INSIDE a stage they
     haven't reached — labels are deliberately outcome-neutral (e.g.
     "Optimise", never "Throttle") so the timeline itself can never
     spoil a reveal. Same eleven stages, same order, on every page;
     each page passes which one is current. */
  const PIPELINE_STAGES = [
    { id: "brief",    label: "Brief" },
    { id: "discuss",  label: "Discuss" },
    { id: "platform", label: "Platform" },
    { id: "features", label: "Features" },
    { id: "source",   label: "Source" },
    { id: "build",    label: "Build" },
    { id: "audio",    label: "Audio" },
    { id: "spend",    label: "Spend" },
    { id: "optimise", label: "Optimise" },
    { id: "legal",    label: "Legal" },
    { id: "ship",     label: "Ship" },
  ];

  function renderTimeline(mount, currentId) {
    if (!mount) return;
    const curIdx = PIPELINE_STAGES.findIndex((s) => s.id === currentId);
    mount.innerHTML = PIPELINE_STAGES.map((s, i) => {
      const state = i < curIdx ? "done" : i === curIdx ? "now" : "next";
      return '<span class="tl-step tl-' + state + '"><span class="tl-dot"></span>' + esc(s.label) + "</span>";
    }).join('<span class="tl-line"></span>');
  }

  window.ML = {
    $, $$, esc, clamp,
    fmtInt, fmtBytes, fmtCompact, pct, stamp,
    getIdentity, setIdentity, clearIdentity, pickBrief,
    getPipe, setPipe, clearPipe,
    hasSubmitted, markSubmitted, clearSubmitted,
    toast, saveRun, fetchRuns, clearRuns,
    download, toCSV, bindPress, show, bindTabs,
    renderTimeline,
  };
})();
