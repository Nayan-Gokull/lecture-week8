# Ship It — instructor notes

Not linked anywhere in the student-facing site. `_redirects` sends `/TEACHING.md` back to the hub so it can't be reached by guessing the URL.

## The one thing to get right

**Do not explain the stage 1 -> stage 2 -> stage 3 links before they happen.** The whole design depends on each stage being a genuine, unhinted commitment. If you preview "by the way, whatever you build in stage 2 becomes your rendering cost in stage 3," you have deleted the exercise — teams will hedge in stage 1 and 2 instead of actually deciding, and each reveal lands as a rule change instead of a consequence.

Say only, at the very start: "Three stages. Source an asset, build a scene, then ship it under a real frame budget. What you decide early carries forward — that's all I'm telling you." Let the two reveals (stage 2's "this is what your hero asset costs", stage 3's "this is what your scene costs to render") land as discoveries.

## Stage 1 — sourcing the asset is a real trade, not just a licence quiz

Three listings, always shippable in some form, so nobody hits a dead end:

- **Clean** (CC0, unoptimised) — always safe, but heavy: the "as-downloaded" file nobody at the marketplace bothered to optimise for real-time use.
- **Cheap** (CC BY-NC, pre-optimised) — the arguable case, same shape as the Model Lab's own NC/ND cases: coursework that is graded, public and stays in a portfolio sits close to, but not cleanly inside, "non-commercial". Defensible with attribution or a message to the creator; indefensible shipped with none.
- **Commission** (original work) — always safe, no licence question at all, moderate cost: the trade is time and skill, not legal risk.

The real strategic choice a sharp team notices is that **the cheapest, best-optimised asset is also the one with the most licence risk** — that is not a coincidence in the fiction, it mirrors why real marketplaces price optimised, well-supported assets under stricter terms. A team that picks cheap and does not write a real attribution (or does not flag the risk out loud) has skipped a licence condition, which the board treats the same as the standalone licence activity does: same as having no licence at all.

## Stage 2 — the hero asset is locked, the room still has real decisions

Whatever a team picked in stage 1 shows up already placed and non-removable. This is deliberate: it removes the "just don't use it" escape hatch and forces the team to build around the consequence of their own stage 1 choice. A team that picked the heavy clean asset has much less headroom for scene props than a team that took the cheap, risky, well-optimised one — **that headroom difference is stage 1's licence trade-off becoming visible as a real cost**, not a separate lesson.

The scene mechanic repeats the Model Lab Budget Table's own trap at a smaller scale on purpose — a team meets "draw calls and texture memory break a scene before triangle count does" twice across the two activities, which is what makes it stick:
- **Prop Cluster** (raw) is cheap in triangles but carries 14 materials — the potted-plant trap again.
- **Environment Backdrop Panel** is almost flat geometry holding an 18MB texture — the rug trap again.

## Stage 3 — rendering is no longer a free pick, it is what stage 2 cost

The old "Rendering & assets" picklist (LOD / atlas / hi-res / hero) is gone. In its place is a single locked line, sized to whatever stage 2's scene actually costs: `0.05 + draws*0.018 + textureMB*0.012` ms, calibrated so the same range (roughly 0.3–1.5ms) the old picklist covered still holds for a typically-built scene. This is the moment the whole pipeline's coupling becomes visible to the team — say nothing about it before they reach the stage 3 brief screen, and let the "locked in from stage 2" callout do the explaining.

### The frame-rate choice is still the first decision inside stage 3

Teams pick 30, 60 or 90fps, and the budget is computed live: roughly 23.3ms at 30fps, 6.7ms at 60fps, 1.1ms at 90fps.

- **60fps** is the tuned case. Every ground/light/audio/legibility option was calibrated against 6.7ms, so this is where the spending tension is real.
- **30fps** gives roughly 3x the budget — comfortably more than every remaining option maxed out. A team that picks 30fps will sail through both rounds with almost no spending decisions left among the four free categories (the derived rendering cost is fixed regardless of fps, so it eats a much smaller share of a bigger budget too). That is the point, not a bug: the real decision already happened, at the frame-rate screen. If a room picks 30fps for a motion-heavy brief (kids, wayfinding, fitness, warehouse, concert) without acknowledging the trade-off out loud, that is worth naming in the plenary — the board flags it.
- **90fps** is deliberately brutal and is there so a team can feel directly why headsets need a different pipeline, not because it is a realistic target for any of these nine briefs.

## Why nine different briefs

Every room getting the same scenario would make the plenary boring. Every room getting a genuinely different scenario means the plenary is a comparison, and the comparison is where the lesson lives: **the brief decides the spend, not the technology.** Nine briefs rather than five specifically so a cohort of up to nine breakout rooms can each land on a genuinely different one — with only five, a class that size guarantees repeats, which flattens the comparison the plenary depends on.

The throttle severity is also brief-dependent, on purpose — a fixed percentage of whatever Round 1 budget the team is working with, so the same relative severity holds however much budget a team started with. The four new briefs extend the same spread of continuity and environment that drove the original five:

- **Fitness coaching** (keeps ~60%) — continuous 30–45 minute use, indoors but no airflow across a propped-up phone.
- **Warehouse pick-assist** (keeps ~45%, the harshest brief) — continuous, shift-length use on a handheld scanner in a warmer-than-average industrial environment. Worse than direct outdoor sun, because duration beats intensity here.
- **Real estate walkthrough** (keeps ~81%, the mildest brief) — genuine breaks between ten-to-fifteen-minute showings let the phone actually recover, which is itself worth pointing out: not every "repeated use all afternoon" brief throttles the same amount.
- **Venue wayfinding** (keeps ~64%) — a short walk, but continuous GPS/beacon lookups in a signal-congested crowd and a maxed screen for glare.

## Running order (35–40 minutes)

| Time | What | Say / do |
|---|---|---|
| 0:00 | Open `source.html` | "Three stages: source, build, ship. What you decide early carries forward — that's all I'm telling you." Read the brief aloud. |
| 0:03 | Breakout, stage 1 | Named reporter per room. Locking in an asset carries it forward automatically — there is no going back. |
| 0:10 | Breakout, stage 2 | The hero asset is already placed when they open `scene.html`. Do not explain why the caps feel tighter or looser between rooms — that is stage 1 showing up. |
| 0:20 | Back in main room | Do **not** open the board yet. Just: "Everyone locked in stage 2? Good — open stage 3 together." |
| 0:22 | The reveal | Let the "locked in from stage 2" callout land in silence for a beat. This is the moment the coupling becomes visible. |
| 0:24 | Breakout, Round 1 | "Pick your target frame rate, then spend what's left across four categories. Rendering is already decided." |
| ~0:30 | Back in main room | "Everyone locked in? Advance to the next screen together." |
| 0:32 | The throttle reveal | Let it happen live, in silence, for a beat. |
| 0:33 | Breakout, Round 2 | "Keep, swap, or cut — your call." |
| 0:38 | Plenary | Open `admin.html`, hit Refresh. Read the board's callouts aloud in order. |

## Reading the board

The callouts are ordered stage 1 -> stage 2 -> stage 3, then the plenary payoff:

1. **Hero asset sourced** — distribution across clean / cheap / commission. If most rooms took the cheap, risky option, that is worth naming before anything else: most of the room accepted licence risk to buy scene headroom.
2. **Indefensible-cheap-asset flag** — named rooms who took the risky asset without a defensible attribution. Ask them to defend it live, same as the standalone licence activity's trap cases.
3. **Average rendering cost from Scene Build**, and the share of Round 1's own budget it ate before a single grounding/lighting/audio/legibility pick — this is the number that makes stage 1 and 2's consequences land in stage 3's numbers.
4. **"X of Y rooms already fit the throttled budget."** Ask a future-proofed room what they protected; ask a caught room what they'd change knowing the throttle was coming.
5. **"First to go under pressure: [category]."** Genuinely least important for most briefs, or simply the most expensive line on the sheet — different failures.
6. **Risky-pick flag** ("Nothing" shipped in a mandatory category in the final answer).
7. **Spatial-audio flag** (HRTF kept despite no brief guaranteeing headphones).
8. **Target frame rate chosen**, and the named "picked 30fps for a motion-heavy brief" flag.
9. **By-brief table** — ranked by the fixed throttle ratio; the actual ms cap varies within a brief by fps chosen, shown as a range.

## Answer key — is there a "right" spend?

No, deliberately — but there are defensible and indefensible ones per brief:

- **Museum piece** — static object, long dwell time: grounding and lighting are easiest to justify spending on here, because visitors get close and slow enough to notice bad grounding.
- **Retail try-on** — short bursts, close-up: light estimation plus a contact shadow is usually enough; paying for the expensive occlusion tier here is arguable overspend for a 30-second interaction.
- **Kids' game** — the brief that should scare a sharp team into protecting frame rate itself, because 20 minutes continuous play is exactly the thermal-cliff scenario.
- **Outdoor wayfinding** — legibility is not optional here (direct sun on a screen); cutting it to "Nothing" is hardest to defend, and also the one where it happens most.
- **Accessibility tour** — the brief most likely to be under-thought, because "accessibility" reads as a UI checkbox rather than a performance constraint. Legibility needs the *most* deliberate spend here, not the least.
- **Fitness coaching** — the phone does not move, but the person does: this is the brief where paying for the expensive ML depth/occlusion tier is hardest to justify, since the overlay only needs to track a body, not ground content convincingly among real objects. Spending there instead of protecting frame rate is the mistake worth pushing on.
- **Warehouse pick-assist** — a working tool, not a showpiece: legibility and grounding earn their keep here (a picker glancing at an overlay for a split second needs it to be instantly readable and unambiguous), but nobody needs a hero-tier lighting response in a warehouse under fixed fluorescent lighting. Spending on lighting realism here is the overspend to watch for.
- **Real estate walkthrough** — closest in shape to retail try-on: short bursts, indoors, real breaks. A room that treats this like the museum brief and pays for expensive occlusion is over-engineering for a ten-minute showing.
- **Venue wayfinding** — legibility against glare and crowd clutter is the genuinely hard problem here, not grounding — arrows floating slightly wrong on a phone someone is glancing at while walking is far less noticeable than text nobody can read in direct sun through a stadium concourse.

## If a room finishes early

Ask them to defend their Round 2 pick against a brief they didn't get, or ask what they'd have picked in stage 1 if they had known their stage 2 scene ambitions in advance.

## If a room gets stuck

The only hard block anywhere in the pipeline is a cap itself (millisecond, triangle, draw call, or texture). If a room is stuck arguing, tell them: "pick the cheapest legal option everywhere first, then spend what's left on the one thing your brief actually needs."
