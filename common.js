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

  window.ML = {
    $, $$, esc, clamp,
    fmtInt, fmtBytes, fmtCompact, pct, stamp,
    getIdentity, setIdentity, clearIdentity,
    hasSubmitted, markSubmitted, clearSubmitted,
    toast, saveRun, fetchRuns, clearRuns,
    download, toCSV, bindPress, show, bindTabs,
  };
})();
