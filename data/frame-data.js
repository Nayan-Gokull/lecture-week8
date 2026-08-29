/* ============================================================
   Spend the Frame — activity data
   INTE 42312 · Week 3 · Augmented Reality

   Plain data, no logic, so the activity can be retuned without
   touching any application code. The server (functions/api/
   frame-results.js) keeps its own copy of OPTIONS and recomputes
   every total from the raw picks — this file is what the browser
   renders from, never what is trusted for scoring.

   Round 1 cap (6.7 ms) is the same number the deck's own frame-
   budget slide uses: 16.7 ms per frame at 60fps, minus roughly
   10 ms already spent by camera capture, VIO and image tracking
   before a single line of the team's code runs.

   Round 2 cap varies by brief — it is what is left once the phone
   has been running long enough to hit the thermal cliff. A brief
   that runs continuously outdoors in the sun throttles harder than
   one that runs in short, air-conditioned bursts. The throttle
   amount is itself part of the lesson: the brief decided how bad
   the squeeze would be before anyone picked a single feature.
   ============================================================ */

/* Target frame rate is now a real first decision, not a fixed given.
   Round 1's cap is derived the same way regardless of which target a
   team picks: 1000/fps is the total frame time, minus the ~10ms that
   camera capture, VIO and image tracking already spend before a
   single line of the team's own code runs. That 10ms figure does not
   shrink just because you asked for fewer frames per second — the
   tracking pipeline runs at its own cadence — so a lower fps target
   genuinely does buy more discretionary budget, not a smaller total
   pie split the same way.

   30fps is a real, defensible handheld choice — the deck's own
   frame-rate slide teaches that a steady 30 beats a lurching 45-60,
   and this is exactly that trade-off made concrete: roughly 3x the
   discretionary budget, in exchange for a visibly less smooth result.
   60fps is the ARKit/ARCore ceiling for ordinary handheld AR, and the
   number every option on this sheet was actually tuned against. 90fps
   is a headset-style target (see the deck's passthrough-headset row)
   included so a team can try it against a handheld brief and feel
   directly why headsets need a completely different pipeline — it is
   not disabled, because the point lands harder if they choose it and
   watch the budget nearly vanish, rather than being told no. */
window.FRAME_FPS_OPTIONS = [
  { fps: 30, label: "30 fps", tag: "Steady and forgiving",
    note: "A stable 30 reads as intentional. Roughly 3x the discretionary budget of 60fps, at the cost of visible smoothness." },
  { fps: 60, label: "60 fps", tag: "The handheld standard",
    note: "The ceiling ARKit and ARCore actually run at. Every cost on this sheet was tuned against this budget." },
  { fps: 90, label: "90 fps", tag: "Headset-style target",
    note: "Not a realistic target for a handheld brief — pick it to see exactly why headsets need a different pipeline." },
];

function capForFps(fps){
  return Math.round(((1000 / fps) - 10) * 10) / 10;
}
window.FRAME_CAP_FOR_FPS = capForFps;

/* Stage: Select Platform (intro.html). AR only, on purpose — this
   activity closes out the AR unit, not the VR one, so the choice is
   the same handheld-vs-native ladder the deck's own Platform
   Selection slide teaches, not a third headset option. Recorded and
   carried into stage 3's Legal Notices step (a native app needs
   store-listing/app-permission disclosures a web link does not) — it
   deliberately does not change the frame-budget arithmetic, so the
   already-audited numeric balance of this activity stays untouched. */
window.AR_PLATFORMS = [
  { id: "webar", label: "Handheld WebAR", tag: "Ships as a link",
    note: "No install, no app store, works on any phone with a browser. The track this course actually built on." },
  { id: "native", label: "Native ARKit / ARCore", tag: "An installed app",
    note: "Access to more of the platform (real depth APIs, persistent anchors) in exchange for a Mac/Xcode or Android Studio toolchain and an app-store listing." },
];

window.FRAME_CATEGORIES = [
  { id: "ground",     label: "Grounding & occlusion", min: 1, max: 2 },
  { id: "light",      label: "Lighting",               min: 1, max: 2 },
  { id: "audio",      label: "Audio",                  min: 0, max: 2 },
  { id: "legibility", label: "Legibility & UI",         min: 1, max: 1 },
  { id: "render",     label: "Rendering & assets",      min: 1, max: 1, locked: true },
];

/* Rendering & assets is no longer a free pick here. This is now stage 3
   of a three-stage pipeline (source.html -> scene.html -> this page):
   whatever scene a team actually built in scene.html — its draw calls
   and texture footprint, including the hero asset they sourced under a
   real licence in source.html — determines what rendering that scene
   costs per frame. A team does not get to separately "buy" a cheap
   render tier here after building an expensive scene; the scene they
   built is the render cost.

   The formula mirrors the shape of the old picklist (r_lod .3 / r_atlas
   .2 up to r_hero 1.5): draw calls dominate CPU-side submission cost,
   texture memory dominates bandwidth/decode cost, matching the same
   "draw calls and texture memory break a scene before triangle count
   does" lesson the Model Lab's own Budget Table teaches. Triangle count
   is deliberately not a term in this formula, for the same reason. */
function renderMsFromScene(draws, textureMB) {
  return Math.round((0.05 + draws * 0.018 + textureMB * 0.012) * 10) / 10;
}
window.FRAME_RENDER_MS_FROM_SCENE = renderMsFromScene;

/* flags: risky = a real design gap the admin board will call out
          deviceGate = ships on premium hardware only
          headsetOnly = only correct if the user is definitely wearing headphones

   Where these ms figures come from
   ---------------------------------
   None of this is profiler output — the whole 6.7ms budget is itself a
   teaching simplification (see the comment above). What is NOT arbitrary
   is the relative ordering and rough proportion between options, each
   checked against a real basis rather than picked to make the activity
   feel balanced:

   - Grounding: LiDAR occlusion reads an existing hardware depth sensor
     (cheap); ML depth occlusion runs a monocular depth network every
     frame. Published mobile benchmarks put real monocular depth
     inference at roughly 6-50ms even on optimised models (e.g. LiteDepth,
     CVPR 2021W; Yucel et al., CVPR 2021W), which would blow the whole
     budget on its own. 3.5ms compresses that reality down to the
     activity's scale while keeping it unambiguously the single most
     expensive line on the sheet, exactly as it would be in practice.

   - Lighting: real-time shadow mapping costs more than image-based
     lighting on mobile GPUs is well documented (many mobile GPUs avoid
     traditional shadow mapping for exactly this reason), so the shadow
     option is priced above the IBL/probe option, which is itself priced
     above plain light estimation (a cheap value read, not a render pass).

   - Audio: HRTF binaural spatialisation is a per-source filter, costing
     more per source than a single shared algorithmic reverb bus — but
     nowhere near what a long convolution reverb costs, since a convolution
     impulse response for a real space can run for seconds while an HRTF
     impulse response runs for a few hundred samples. Long reverb is
     priced as the second most expensive item on the whole sheet for
     exactly that reason.

   - Rendering: no longer a picklist here at all — see the comment above
     window.FRAME_RENDER_MS_FROM_SCENE. It is derived from whatever scene
     a team actually assembled in scene.html.

   - Legibility: every option here is a flat UI overlay pass (an outline,
     a scrim, a backplate), which is why the whole category sits at the
     bottom of the sheet — that is the actual point of teaching it as the
     free win.
*/
window.FRAME_OPTIONS = [
  // ---- Grounding & occlusion ----
  { id: "g_none",     category: "ground", label: "Nothing",
    note: "Content floats on top of everything real, all the time.", ms: 0.0, risky: true },
  { id: "g_occluder", category: "ground", label: "Hand-placed occluder",
    note: "An invisible box positioned by hand. No sensor needed, nothing that moves is covered.", ms: 0.2 },
  { id: "g_contact",  category: "ground", label: "Contact shadow only",
    note: "Grounds the object without true occlusion behind real things.", ms: 0.3 },
  { id: "g_lidar",    category: "ground", label: "LiDAR occlusion",
    note: "Crisp and fast. Pro / Max hardware only.", ms: 1.2, deviceGate: true },
  { id: "g_mldepth",  category: "ground", label: "ML depth occlusion (RGB)",
    note: "Works on almost any phone, but running the network every frame is the single most expensive line on this whole sheet.", ms: 3.5 },

  // ---- Lighting ----
  { id: "l_none",     category: "light", label: "Nothing",
    note: "The object is lit by a flat default and ignores the room entirely.", ms: 0.0, risky: true },
  { id: "l_estimate", category: "light", label: "Light estimation only",
    note: "Intensity and colour temperature, matched live to the room.", ms: 0.3 },
  { id: "l_ibl",      category: "light", label: "Environment probe (IBL)",
    note: "Reflects the actual surroundings. The fix for metals and glass.", ms: 1.0 },
  { id: "l_shadow",   category: "light", label: "Real-time matched shadow",
    note: "Direction follows the estimated light instead of a fixed default.", ms: 1.3 },

  // ---- Audio ----
  { id: "a_mono",        category: "audio", label: "Mono positional",
    note: "The correct default on a handheld device. Distance only, no direction.", ms: 0.1 },
  { id: "a_hrtf",         category: "audio", label: "Spatial (binaural / HRTF)",
    note: "Genuinely different per ear. Only correct if the user is definitely wearing headphones.", ms: 0.6, headsetOnly: true },
  { id: "a_reverbshort", category: "audio", label: "Short algorithmic reverb",
    note: "Cheap, tunable room-matching. No recorded space needed.", ms: 0.4 },
  { id: "a_reverblong",  category: "audio", label: "Long convolution reverb",
    note: "Most realistic option. Cost scales with the length of the tail.", ms: 1.8 },

  // ---- Legibility & UI ----
  { id: "x_none",      category: "legibility", label: "No treatment",
    note: "Raw text sits straight on top of the live camera feed.", ms: 0.0, risky: true },
  { id: "x_outline",   category: "legibility", label: "Outline / halo",
    note: "Cheapest fix. Keeps the camera fully visible.", ms: 0.1 },
  { id: "x_scrim",     category: "legibility", label: "Scrim",
    note: "A semi-opaque wash behind the text.", ms: 0.2 },
  { id: "x_backplate", category: "legibility", label: "Opaque backplate",
    note: "Most robust option. Costs the most camera visibility.", ms: 0.2 },

  // Rendering & assets has no static options — see FRAME_RENDER_MS_FROM_SCENE.
];

/* throttleRatio replaces a fixed round2Cap so the same per-brief
   throttle severity generalises to whichever fps a team picked:
   round2Cap = round1Cap (from their chosen fps) * throttleRatio.
   The ratios below are exactly the original hand-tuned round2Cap
   values, expressed as a fraction of the 6.7ms baseline they were
   tuned against — so nothing about the calibration changed, it was
   only made to generalise. */
window.FRAME_BRIEFS = [
  {
    id: "museum",
    title: "Museum piece",
    scenario: "An artefact sits on a plinth. Visitors walk slowly around it for roughly ninety seconds each, all day, on a device the museum owns and hands between them.",
    throttleLine: "It is 3pm. The display has been running back-to-back ninety-second visits since the doors opened at nine.",
    throttleRatio: 0.776,  // was 5.2ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "retail",
    title: "Retail try-on",
    scenario: "A customer holds a phone up to their own wrist to see a watch. Sessions are short, thirty to sixty seconds, repeated across a busy afternoon in an air-conditioned shop.",
    throttleLine: "The till queue is long. The same phone has been handed between forty customers this afternoon — but the shop is air-conditioned.",
    throttleRatio: 0.836,  // was 5.6ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "kids",
    title: "Kids' game",
    scenario: "A creature runs across a child's living room floor. One continuous session, no breaks, played for around twenty minutes at a time.",
    throttleLine: "Twenty minutes in, same session, no break — and small warm hands have been wrapped around the phone the whole time.",
    throttleRatio: 0.567,  // was 3.8ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "wayfinding",
    title: "Outdoor wayfinding",
    scenario: "Arrows are overlaid on a real street to guide someone walking. Direct sunlight, GPS running continuously, fifteen minutes or more per journey.",
    throttleLine: "Fifteen minutes of direct sun, GPS on the whole time, screen brightness maxed out to fight the glare.",
    throttleRatio: 0.522,  // was 3.5ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "accessibility",
    title: "Low-vision accessibility tour",
    scenario: "The same kind of tour content as the museum brief, but the user is stationary for longer, reading text-heavy labels, and needs the screen genuinely bright to see them.",
    throttleLine: "Forty minutes in — screen brightness has been turned up for legibility the entire time, and nobody has put the phone down.",
    throttleRatio: 0.672,  // was 4.5ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "fitness",
    title: "Fitness coaching overlay",
    scenario: "A phone is propped on a stand facing someone doing a home workout. The overlay corrects their form in real time, continuously, for a thirty-to-forty-five-minute session.",
    throttleLine: "Thirty-five minutes into the session, propped upright with no airflow across the back of the case, and the room has warmed up along with the person in it.",
    throttleRatio: 0.597,  // was 4.0ms at the tuned 6.7ms/60fps baseline
  },
  {
    id: "warehouse",
    title: "Warehouse pick-assist",
    scenario: "A handheld scanner-style device overlays the next shelf location for a picker walking a warehouse floor, continuously, for a full shift.",
    throttleLine: "Four hours into the shift, same device, no charging break, and the warehouse floor runs warmer near the loading bay doors than anywhere else in the building.",
    throttleRatio: 0.448,  // was 3.0ms at the tuned 6.7ms/60fps baseline — the harshest brief, by design: shift-length continuous use beats even direct outdoor sun
  },
  {
    id: "realestate",
    title: "Real estate walkthrough",
    scenario: "A buyer holds an agent's phone up to see furniture staged in an empty room. Each showing is ten to fifteen minutes, indoors, well lit, with a break between viewings.",
    throttleLine: "Third showing of the afternoon back to back, but each one ends with the phone sitting untouched in the agent's bag for twenty minutes while they chat with the buyer outside.",
    throttleRatio: 0.806,  // was 5.4ms at the tuned 6.7ms/60fps baseline — the mildest brief, on purpose: real breaks between sessions actually let the phone recover
  },
  {
    id: "concert",
    title: "Venue wayfinding",
    scenario: "A phone overlay guides someone to their seat through a crowded stadium concourse. The walk itself is only five to ten minutes, but GPS and beacon lookups run continuously and the screen is maxed for glare.",
    throttleLine: "It is a sold-out show, the concourse is packed, and forty thousand other phones are fighting for the same signal while yours keeps its screen at full brightness.",
    throttleRatio: 0.642,  // was 4.3ms at the tuned 6.7ms/60fps baseline
  },
];
