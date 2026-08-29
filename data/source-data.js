/* ============================================================
   Ship It — Stage 1 data: "Source the asset"
   window.SOURCE_MODEL_PROFILES = { clean, cheap, commission }
   window.SOURCE_CASES = { <briefId>: [ 3 listings ] }

   This is the same "Can I Ship This?" mechanic as the Model Lab's
   licence.html — five listings, four verdict buttons, a reveal that
   explains the licence properly — narrowed to three listings for
   whichever hero prop a team's own brief actually needs, because here
   the choice has a consequence downstream: whichever listing a team
   locks in becomes the hero asset they build the rest of their scene
   around in scene.html, and its triangle/material/texture cost is
   real input to how much of stage 3's frame budget rendering eats.

   FABRICATION RULE, same as licence-cases.js: every author name and
   listing is fictional. Licence names (CC0, CC BY, CC BY-NC, CC BY-ND)
   are real and used correctly.

   THIS STAGE OPENS A REAL FILE IN A REAL VIEWER — source.html loads
   whichever listing a team selects into a live three.js viewer and
   reads its stats straight out of the .glb container, using the exact
   binary-GLB parser the Model Lab's autopsy.html already uses (ported,
   not reinvented). The three files are real, self-hosted, and
   documented in models/README.md — see that file for two important
   disclosures that also appear on-screen: (1) each listing's licence
   text below is fictional, written for this exercise, and is NOT the
   real file's real licence; (2) the file is a stand-in prop for
   reading real specs on, not literally the finished object your
   brief describes.

   Where the three cost profiles come from
   ----------------------------------------
   Real, measured numbers — not estimates — parsed directly from the
   three files in models/ with the same parser source.html itself
   uses. `materials` here is each file's real measured DRAW count, not
   its raw material count, to match this course's "one draw call per
   material placed" convention (see models/README.md for both figures
   per file). The three were chosen, out of several candidates
   downloaded and measured, specifically because their real weight
   classes reproduce the same shape the Model Lab's own Budget Table
   uses for its sofa-hero (58k/6/12) vs sofa-lod (22k/4/12) pattern,
   scaled down to a single hero prop:

     clean       — safe licence, unoptimised: heaviest on every axis.
     cheap       — licence-risky, pre-optimised: lightest on every axis —
                   whoever posted it did the optimisation work already,
                   which is also plausibly why the licence is stricter.
     commission  — always safe (original work, no licence question at
                   all), moderate cost: competent, unremarkable work,
                   in between the other two on every axis.
   ============================================================ */
(function () {
  "use strict";

  // Real measured stats — see models/README.md for the full table and
  // the exact method. Keep these in sync with functions/api/frame-
  // results.js's SOURCE_PROFILES by hand if the files ever change.
  window.SOURCE_MODEL_PROFILES = {
    clean:      { tris: 39936, materials: 4, textureMB: 14.7 },  // sheenchair.glb
    cheap:      { tris: 3072,  materials: 1, textureMB: 5.3  },  // clearcoatwicker.glb
    commission: { tris: 4196,  materials: 3, textureMB: 10.7 },  // glamvelvetsofa.glb
  };

  // Which real, self-hosted file source.html's viewer opens for each
  // pick tier — shared across all nine briefs, same convention as the
  // cost profiles above. See models/README.md for real licence/credit.
  window.SOURCE_MODEL_FILES = {
    clean:      "models/sheenchair.glb",
    cheap:      "models/clearcoatwicker.glb",
    commission: "models/glamvelvetsofa.glb",
  };

  // Same four verdict buttons as the Model Lab's licence.html.
  var OPTIONS = [
    { id: "asis",   label: "Ship as-is" },
    { id: "attr",   label: "Ship, with attribution" },
    { id: "change", label: "Ship only if you change something / get permission" },
    { id: "noship", label: "Do not ship" }
  ];

  // The scenario framing every "cheap" listing shares — same reasoning
  // as licence-cases.js case 3 (the CC BY-NC park bench): coursework
  // that is graded, published at a public URL and sits in a portfolio
  // afterwards sits close to, but not cleanly inside, most people's
  // idea of "non-commercial".
  var GRADED_SCENARIO = "This is the AR project you are graded on. It is published at a public URL, hosted on the university's servers, and it stays in your portfolio afterwards.";

  function cleanCase(brief, title, author, note) {
    return {
      pick: "clean",
      title: title,
      author: author,
      licence: "CC0",
      licenceName: "CC0 1.0 — Public Domain Dedication",
      sourceNote: "Downloaded from a large 3D model marketplace, listed as “as-scanned, unoptimised”.",
      smallPrint: "“The creator has waived all rights to this work worldwide under copyright law. You can use it for any purpose, without asking permission.”",
      needsAttribution: false,
      options: OPTIONS,
      kind: "fixed",
      correct: "asis",
      model: window.SOURCE_MODEL_PROFILES.clean,
      licenceRisk: false,
      verdict: {
        headline: "Shippable, no conditions attached.",
        body: ["CC0 is a full public-domain dedication — no attribution requirement, no NonCommercial clause, nothing to satisfy. The catch here is not the licence, it is the file itself: " + note]
      }
    };
  }

  function cheapCase(brief, title, author, note) {
    return {
      pick: "cheap",
      title: title,
      author: author,
      licence: "CC BY-NC 4.0",
      licenceName: "CC BY-NC 4.0 — Attribution-NonCommercial",
      sourceNote: "Downloaded from an indie asset marketplace, already optimised for real-time use.",
      smallPrint: "“Free for non-commercial use with attribution. For commercial licensing, contact the creator directly.”",
      scenario: GRADED_SCENARIO,
      needsAttribution: true,
      attributionHint: "Write the string you'd actually publish: title, creator, licence name, and a link to the licence text.",
      modelAttribution: "“" + title + "” by " + author + ", licensed under CC BY-NC 4.0 (https://creativecommons.org/licenses/by-nc/4.0/).",
      options: OPTIONS,
      kind: "arguable",
      accepted: ["attr", "change"],
      model: window.SOURCE_MODEL_PROFILES.cheap,
      licenceRisk: true,
      verdict: {
        headline: "Genuinely arguable, and it is the cheapest asset on offer for a reason.",
        body: [
          "<b>The case for shipping with attribution:</b> graded coursework you do not sell, on a non-monetised university page, is close to what most people mean by “non-commercial”.",
          "<b>The case for pausing and asking:</b> Creative Commons themselves admit NonCommercial has no agreed legal definition, and this sits in a portfolio indefinitely.",
          "Either way: shipping this with <b>no</b> attribution at all is not defensible. The whole reason this listing is the cheapest of the three is that whoever posted it already did the optimisation work — that is real value, and the licence is how they are trying to keep some control over it."
        ]
      },
      trap: "Picking this option for the low triangle count and then shipping with zero attribution — skipping a licence condition is the same as having no licence at all.",
      doInstead: "Write the full credit string, or message the creator and ask — most independent creators reply to a student fast."
    };
  }

  function commissionCase(brief, title, author, note) {
    return {
      pick: "commission",
      title: title,
      author: author,
      licence: "Original work",
      licenceName: "No third-party licence — modelled or commissioned by your own team",
      sourceNote: "Built from scratch for this brief, or commissioned from a course-mate / freelancer with a written work-for-hire agreement.",
      smallPrint: "“No licence question at all — you (or whoever you commissioned, with agreement in writing) own this outright.”",
      needsAttribution: false,
      options: OPTIONS,
      kind: "fixed",
      correct: "asis",
      model: window.SOURCE_MODEL_PROFILES.commission,
      licenceRisk: false,
      verdict: {
        headline: "Shippable, no conditions — and the only option with zero licence risk at any point.",
        body: ["The trade is time and skill, not legal risk: " + note + " A specialist would optimise this further than a team can in the time available, which is why it costs more than the cheap listing but far less than the raw scan."]
      }
    };
  }

  window.SOURCE_CASES = {
    museum: [
      cleanCase("museum", "Museum Artefact Scan — Raw Photogrammetry", "Tomasz Wren",
        "it is a real photogrammetry scan, and nobody who does photogrammetry for a museum archive optimises the export for a phone afterwards."),
      cheapCase("museum", "Plinth-Ready Artefact Replica — Optimised", "Priya Sattari"),
      commissionCase("museum", "Team-Modelled Artefact Replica", "your team",
        "your team modelled this from the museum's own reference photos.")
    ],
    retail: [
      cleanCase("retail", "Wristwatch Product Scan — Studio Raw", "Denholm Achterberg",
        "it is a studio product scan built for a print catalogue, at print resolution, never touched by anyone thinking about real-time rendering."),
      cheapCase("retail", "Wristwatch AR Try-On Model — Optimised", "Renata Bloch"),
      commissionCase("retail", "Team-Modelled Wristwatch", "your team",
        "your team modelled this against the manufacturer's spec sheet.")
    ],
    kids: [
      cleanCase("kids", "Creature Rig — Marketplace Raw Export", "Callum Ostrowski",
        "it ships as a raw export from the rigging marketplace, mesh untouched since the day it was sculpted."),
      cheapCase("kids", "Creature Rig — Mobile-Optimised", "Priya Sattari"),
      commissionCase("kids", "Team-Modelled Creature", "your team",
        "your team designed and modelled an original creature for this brief.")
    ],
    wayfinding: [
      cleanCase("wayfinding", "Directional Arrow Prop — Marketplace Raw", "Tomasz Wren",
        "it is bundled with a huge signage pack and nobody stripped the unused detail out of this one prop."),
      cheapCase("wayfinding", "Directional Arrow Prop — Optimised", "Denholm Achterberg"),
      commissionCase("wayfinding", "Team-Modelled Directional Arrow", "your team",
        "an arrow is simple enough that your team's own version holds up close to a specialist's.")
    ],
    accessibility: [
      cleanCase("accessibility", "Tour Label Fixture — Museum Scan Export", "Callum Ostrowski",
        "it is the same unoptimised export pipeline as the museum brief's raw scan, reused here because it happens to include a label mount."),
      cheapCase("accessibility", "Tour Label Fixture — Optimised", "Renata Bloch"),
      commissionCase("accessibility", "Team-Modelled Tour Label Fixture", "your team",
        "your team modelled a fixture specifically sized for large-print labels.")
    ],
    fitness: [
      cleanCase("fitness", "Posture Guide Rig — Motion-Capture Raw Export", "Tomasz Wren",
        "it is exported straight from a mocap studio's pipeline, built for offline film review rather than a phone running it live for forty-five minutes."),
      cheapCase("fitness", "Posture Guide Rig — Mobile-Optimised", "Priya Sattari"),
      commissionCase("fitness", "Team-Modelled Posture Guide", "your team",
        "your team built a simplified guide rig specifically for this workout's movements.")
    ],
    warehouse: [
      cleanCase("warehouse", "Shelf Marker Prop — Facilities Scan Export", "Denholm Achterberg",
        "it is a facilities-team scan meant for a warehouse floor plan viewer, not for running continuously on a handheld scanner all shift."),
      cheapCase("warehouse", "Shelf Marker Prop — Optimised", "Callum Ostrowski"),
      commissionCase("warehouse", "Team-Modelled Shelf Marker", "your team",
        "your team modelled a marker sized and shaped for this warehouse's actual shelving.")
    ],
    realestate: [
      cleanCase("realestate", "Staged Sofa Scan — Showroom Raw", "Renata Bloch",
        "it is a showroom product scan built for a furniture catalogue's zoom-in shots, not for a buyer walking around it in real time."),
      cheapCase("realestate", "Staged Sofa — AR-Optimised", "Denholm Achterberg"),
      commissionCase("realestate", "Team-Modelled Staged Sofa", "your team",
        "your team modelled a generic sofa sized to the room being staged.")
    ],
    concert: [
      cleanCase("concert", "Directional Beacon Marker — Venue Scan Export", "Priya Sattari",
        "it is bundled with a huge venue-signage pack and nobody stripped the unused detail out of this one marker."),
      cheapCase("concert", "Directional Beacon Marker — Optimised", "Tomasz Wren"),
      commissionCase("concert", "Team-Modelled Beacon Marker", "your team",
        "a beacon marker is simple enough that your team's own version holds up close to a specialist's.")
    ]
  };
})();
