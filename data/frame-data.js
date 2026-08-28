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

window.FRAME_ROUND1_CAP = 6.7;

window.FRAME_CATEGORIES = [
  { id: "ground",     label: "Grounding & occlusion", min: 1, max: 2 },
  { id: "light",      label: "Lighting",               min: 1, max: 2 },
  { id: "audio",      label: "Audio",                  min: 0, max: 2 },
  { id: "legibility", label: "Legibility & UI",         min: 1, max: 1 },
  { id: "render",     label: "Rendering & assets",      min: 1, max: 2 },
];

/* flags: risky = a real design gap the admin board will call out
          deviceGate = ships on premium hardware only
          headsetOnly = only correct if the user is definitely wearing headphones */
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
    note: "Works on almost any phone, but edges are soft and depth lag makes it “chew” at boundaries.", ms: 2.0 },

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

  // ---- Rendering & assets ----
  { id: "r_lod",   category: "render", label: "Optimised / LOD model",
    note: "Cheap. Swaps in a lower-detail mesh at distance.", ms: 0.3 },
  { id: "r_atlas", category: "render", label: "Atlased textures",
    note: "Merges materials so the object costs one draw call instead of many.", ms: 0.2 },
  { id: "r_hires", category: "render", label: "High-res unique textures",
    note: "Sharper up close. Costs memory and load time.", ms: 0.9 },
  { id: "r_hero",  category: "render", label: "Hero unoptimised model",
    note: "Best fidelity available. The heaviest single line item on this list.", ms: 1.5 },
];

window.FRAME_BRIEFS = [
  {
    id: "museum",
    title: "Museum piece",
    scenario: "An artefact sits on a plinth. Visitors walk slowly around it for roughly ninety seconds each, all day, on a device the museum owns and hands between them.",
    throttleLine: "It is 3pm. The display has been running back-to-back ninety-second visits since the doors opened at nine.",
    round2Cap: 5.2,
  },
  {
    id: "retail",
    title: "Retail try-on",
    scenario: "A customer holds a phone up to their own wrist to see a watch. Sessions are short, thirty to sixty seconds, repeated across a busy afternoon in an air-conditioned shop.",
    throttleLine: "The till queue is long. The same phone has been handed between forty customers this afternoon — but the shop is air-conditioned.",
    round2Cap: 5.6,
  },
  {
    id: "kids",
    title: "Kids' game",
    scenario: "A creature runs across a child's living room floor. One continuous session, no breaks, played for around twenty minutes at a time.",
    throttleLine: "Twenty minutes in, same session, no break — and small warm hands have been wrapped around the phone the whole time.",
    round2Cap: 3.8,
  },
  {
    id: "wayfinding",
    title: "Outdoor wayfinding",
    scenario: "Arrows are overlaid on a real street to guide someone walking. Direct sunlight, GPS running continuously, fifteen minutes or more per journey.",
    throttleLine: "Fifteen minutes of direct sun, GPS on the whole time, screen brightness maxed out to fight the glare.",
    round2Cap: 3.5,
  },
  {
    id: "accessibility",
    title: "Low-vision accessibility tour",
    scenario: "The same kind of tour content as the museum brief, but the user is stationary for longer, reading text-heavy labels, and needs the screen genuinely bright to see them.",
    throttleLine: "Forty minutes in — screen brightness has been turned up for legibility the entire time, and nobody has put the phone down.",
    round2Cap: 4.5,
  },
];
