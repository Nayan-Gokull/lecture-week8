/* ============================================================
   Instructor board panel — "Spend the Frame"

   The plenary gold is usually one of three things:
   - how many rooms already fit the throttled budget without
     changing anything ("future-proofed")
   - which category gets cut first when squeezed
   - who paid for spatial audio or a risky "nothing" pick anyway

   Relies on window.FRAME_BRIEFS and window.FRAME_OPTIONS (loaded
   from data/frame-data.js) purely for display labels — every number
   here comes from the server-recomputed record, never from the
   client's own arithmetic.
   ============================================================ */
(function () {
  "use strict";

  function labelMaps(){
    const briefs = {}, options = {};
    (window.FRAME_BRIEFS || []).forEach((b) => { briefs[b.id] = b; });
    (window.FRAME_OPTIONS || []).forEach((o) => { options[o.id] = o; });
    return { briefs, options };
  }

  function render(runs, mount) {
    var esc = ML.esc, html = "";
    var maps = labelMaps(), BRIEFS = maps.briefs, OPTS = maps.options;
    var optLabel = function (id) { return (OPTS[id] && OPTS[id].label) || id; };
    var briefTitle = function (id) { return (BRIEFS[id] && BRIEFS[id].title) || id; };

    if (!runs.length) {
      mount.innerHTML = '<div class="card"><p class="muted">No submissions yet. Teams appear here as they finish Round 2.</p></div>';
      return;
    }

    var total = runs.length;

    /* ---- future-proofed ---- */
    var fp = runs.filter(function (r) { return r.futureProofed; }).length;
    html += '<div class="callout' + (fp >= total / 2 ? " green" : " gold") + '">' +
      '<b>' + fp + ' of ' + total + ' rooms already fit the throttled budget without changing anything.</b>' +
      '<p>Open the plenary by asking those rooms what they protected in Round 1 to get there, then ask a room that had to cut hard what they would do differently if they replayed Round 1 knowing the throttle was coming.</p></div>';

    /* ---- what gets cut first ---- */
    var cutByCat = {};
    runs.forEach(function (r) {
      (r.cutList || []).forEach(function (id) {
        var cat = (OPTS[id] && OPTS[id].category) || "?";
        cutByCat[cat] = (cutByCat[cat] || 0) + 1;
      });
    });
    var catOrder = Object.keys(cutByCat).sort(function (a, b) { return cutByCat[b] - cutByCat[a]; });
    if (catOrder.length) {
      var CATLABEL = { ground: "Grounding & occlusion", light: "Lighting", audio: "Audio",
                        legibility: "Legibility & UI", render: "Rendering & assets" };
      html += '<div class="callout"><b>First to go under pressure: ' + esc(CATLABEL[catOrder[0]] || catOrder[0]) +
        '.</b><p>Cut ' + cutByCat[catOrder[0]] + ' time' + (cutByCat[catOrder[0]] === 1 ? "" : "s") +
        ' across all rooms. Ask whether that is because it was genuinely least important for most briefs, or because it was simply the most expensive line on the sheet &mdash; those are different failures.</p></div>';
    }

    /* ---- risky picks still standing in the final answer ---- */
    var riskyFlags = [];
    runs.forEach(function (r) {
      var finalPicks = (r.round2 && r.round2.picks) || [];
      var risky = finalPicks.filter(function (id) { return OPTS[id] && OPTS[id].risky; });
      if (risky.length) riskyFlags.push(r.team + " kept " + risky.map(optLabel).join(", "));
    });
    if (riskyFlags.length) {
      html += '<div class="callout red"><b>' + riskyFlags.length + ' room' + (riskyFlags.length === 1 ? "" : "s") +
        ' shipped a &ldquo;nothing&rdquo; option in their final answer.</b>' +
        '<div style="margin-top:6px">' + riskyFlags.map(function (f) { return '<div class="flagrow">' + esc(f) + '</div>'; }).join("") +
        '</div></div>';
    }

    /* ---- headset-only audio picked anyway ---- */
    var hrtfTeams = runs.filter(function (r) {
      return ((r.round2 && r.round2.picks) || []).indexOf("a_hrtf") !== -1;
    }).map(function (r) { return r.team; });
    if (hrtfTeams.length) {
      html += '<div class="callout gold"><b>' + hrtfTeams.length + ' room' + (hrtfTeams.length === 1 ? "" : "s") +
        ' kept spatial (HRTF) audio despite no brief guaranteeing headphones.</b>' +
        '<p>' + esc(hrtfTeams.join(", ")) + '. Worth asking on the spot: what happens to your experience for the customer who has no headphones in?</p></div>';
    }

    /* ---- frame rate choice, and the specific case worth naming ----
       30fps genuinely removes almost all budget tension (even every
       option maxed out across every category totals well under a
       30fps budget), so the choice ITSELF is the thing worth probing,
       not the spend that follows it. Motion-heavy briefs (kids, way-
       finding) are the ones where 30fps has a real, visible cost. */
    var fpsCounts = {};
    runs.forEach(function (r) { fpsCounts[r.targetFps] = (fpsCounts[r.targetFps] || 0) + 1; });
    var fpsOrder = [30, 60, 90].filter(function (f) { return fpsCounts[f]; });
    if (fpsOrder.length) {
      html += '<div class="card"><div class="hd"><h2>Target frame rate chosen</h2></div><div class="casedist">';
      fpsOrder.forEach(function (f) {
        var n = fpsCounts[f], w = total ? (n / total) * 100 : 0;
        html += '<div class="distrow"><span class="dl">' + f + ' fps</span>' +
          '<span class="dbar"><i class="ok" style="width:' + w.toFixed(1) + '%"></i></span>' +
          '<span class="dn">' + n + '</span></div>';
      });
      html += '</div></div>';
    }

    var motionBriefs = { kids: 1, wayfinding: 1 };
    var coastedOn30 = runs.filter(function (r) {
      return r.targetFps === 30 && motionBriefs[r.brief];
    }).map(function (r) { return r.team + " (" + briefTitle(r.brief) + ")"; });
    if (coastedOn30.length) {
      html += '<div class="callout gold"><b>' + coastedOn30.length + ' room' + (coastedOn30.length === 1 ? "" : "s") +
        ' picked 30fps for a motion-heavy brief.</b>' +
        '<p>' + esc(coastedOn30.join(", ")) + '. That is a defensible choice, but ask them to justify it out loud: a kids game or a walking wayfinding overlay is exactly where a lurching frame rate is most noticeable. If they cannot defend it, that is the finding.</p></div>';
    }

    /* ---- per-brief breakdown ---- */
    var byBrief = {};
    runs.forEach(function (r) {
      (byBrief[r.brief] = byBrief[r.brief] || []).push(r);
    });
    html += '<div class="card"><div class="hd"><h2>By brief</h2><span class="side">harshest throttle RATIO on the left — actual cap depends on fps chosen</span></div>' +
      '<div class="tablewrap"><table class="dtl"><thead><tr><th>Brief</th><th class="num">Throttle keeps</th>' +
      '<th class="num">Rooms</th><th class="num">Future-proofed</th><th class="num">Avg Round 1</th><th class="num">Avg Round 2</th><th>Round 2 cap seen</th></tr></thead><tbody>';
    Object.keys(byBrief).sort(function (a, b) {
      return ((BRIEFS[a] && BRIEFS[a].throttleRatio) || 1) - ((BRIEFS[b] && BRIEFS[b].throttleRatio) || 1);
    }).forEach(function (bid) {
      var rs = byBrief[bid];
      var avgR1 = rs.reduce(function (s, r) { return s + r.round1.ms; }, 0) / rs.length;
      var avgR2 = rs.reduce(function (s, r) { return s + r.round2.ms; }, 0) / rs.length;
      var fpN = rs.filter(function (r) { return r.futureProofed; }).length;
      var caps = rs.map(function (r) { return r.round2.cap; });
      var capMin = Math.min.apply(null, caps), capMax = Math.max.apply(null, caps);
      var capTxt = capMin === capMax ? capMin.toFixed(1) + " ms" : capMin.toFixed(1) + "–" + capMax.toFixed(1) + " ms";
      var ratioPct = BRIEFS[bid] ? Math.round(BRIEFS[bid].throttleRatio * 100) : "?";
      html += '<tr><td class="team">' + esc(briefTitle(bid)) + '</td>' +
        '<td class="num">' + ratioPct + '%</td>' +
        '<td class="num">' + rs.length + '</td>' +
        '<td class="num">' + fpN + ' / ' + rs.length + '</td>' +
        '<td class="num">' + avgR1.toFixed(1) + ' ms</td>' +
        '<td class="num">' + avgR2.toFixed(1) + ' ms</td>' +
        '<td>' + capTxt + '</td></tr>';
    });
    html += '</tbody></table></div>' +
      '<p class="fine">Throttle keeps is the fixed per-brief ratio (this is what “harsher” actually ranks by). The Round 2 cap in ms depends on the fps each room chose, so it varies within a brief — shown as the range actually seen.</p></div>';

    /* ---- what got cut, frequency ---- */
    var cutFreq = {};
    runs.forEach(function (r) {
      (r.cutList || []).forEach(function (id) { cutFreq[id] = (cutFreq[id] || 0) + 1; });
    });
    var cutOrder = Object.keys(cutFreq).sort(function (a, b) { return cutFreq[b] - cutFreq[a]; });
    if (cutOrder.length) {
      html += '<div class="card"><div class="hd"><h2>What got cut, across all rooms</h2></div><div class="casedist">';
      cutOrder.forEach(function (id) {
        var n = cutFreq[id], w = total ? (n / total) * 100 : 0;
        html += '<div class="distrow"><span class="dl">' + esc(optLabel(id)) + '</span>' +
          '<span class="dbar"><i class="no" style="width:' + w.toFixed(1) + '%"></i></span>' +
          '<span class="dn">' + n + '</span></div>';
      });
      html += '</div></div>';
    }

    /* ---- per-team table ---- */
    html += '<div class="card"><div class="hd"><h2>Teams</h2></div><div class="tablewrap">' +
      '<table class="dtl"><thead><tr><th>Team</th><th>Brief</th><th class="num">fps</th><th class="num">R1</th><th class="num">R2 cap</th>' +
      '<th class="num">R2</th><th>Status</th><th>Cut</th><th>Planned ahead?</th><th>Note</th><th>When</th></tr></thead><tbody>';

    runs.forEach(function (r) {
      var cutTxt = (r.cutList || []).map(optLabel).join(", ") || "&mdash;";
      html += '<tr><td class="team">' + esc(r.team) + '</td>' +
        '<td>' + esc(briefTitle(r.brief)) + '</td>' +
        '<td class="num">' + (r.targetFps || "?") + '</td>' +
        '<td class="num' + (r.round1.overBudget ? " over" : "") + '">' + r.round1.ms.toFixed(1) + '</td>' +
        '<td class="num">' + r.round2.cap.toFixed(1) + '</td>' +
        '<td class="num' + (r.round2.overBudget ? " over" : "") + '">' + r.round2.ms.toFixed(1) + '</td>' +
        '<td>' + (r.futureProofed ? '<span class="badge ship">future-proofed</span>' : '<span class="badge fix">caught</span>') + '</td>' +
        '<td>' + cutTxt + '</td>' +
        '<td>' + esc(r.round2.plannedAhead || "&mdash;") + '</td>' +
        '<td>' + esc(r.round2.note || "") + '</td>' +
        '<td>' + esc(ML.stamp(r.ts)) + '</td></tr>';
    });
    html += '</tbody></table></div>' +
      '<p class="fine">Round 1 cap is fixed at 6.7 ms for every room. Round 2 cap varies by brief &mdash; see the table above.</p></div>';

    mount.innerHTML = html;
  }

  function csv(runs) {
    var maps = labelMaps();
    var rows = [["team", "members", "when", "brief", "target_fps", "round1_cap", "round1_ms", "round1_valid",
                 "round2_cap", "round2_ms", "round2_valid", "future_proofed",
                 "cut", "added", "planned_ahead", "note", "round1_justification"]];
    runs.forEach(function (r) {
      rows.push([
        r.team, r.members || "", ML.stamp(r.ts), (maps.briefs[r.brief] && maps.briefs[r.brief].title) || r.brief,
        r.targetFps || "", r.round1.cap, r.round1.ms, r.round1.valid ? "yes" : "no",
        r.round2.cap, r.round2.ms, r.round2.valid ? "yes" : "no",
        r.futureProofed ? "yes" : "no",
        (r.cutList || []).join(" | "), (r.addedList || []).join(" | "),
        r.round2.plannedAhead || "", r.round2.note || "", r.round1.justification || "",
      ]);
    });
    return rows;
  }

  window.PANEL_frame = { endpoint: "/api/frame-results", render: render, csv: csv };
})();
