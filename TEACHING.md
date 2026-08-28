# Spend the Frame — instructor notes

Not linked anywhere in the student-facing site. `_redirects` sends `/TEACHING.md` back to the hub so it can't be reached by guessing the URL.

## The one thing to get right

**Do not explain anything before the throttle reveal.** The whole design depends on Round 1 being a genuine, unhinted commitment. If you preview "by the way, your budget will shrink later," you have deleted the exercise — teams will hedge in Round 1 instead of actually deciding, and the reveal lands as a rule change instead of a shock.

Say only: "You have 6.7 milliseconds. Spend it." Let them ask why 16.7 minus 10 — if nobody asks, don't volunteer it; the brief card and the callout already state it.

## Why five different briefs

Every room getting the *same* scenario would make the plenary boring — five identical answers is not a discussion. Every room getting a genuinely *different* scenario, with a genuinely different throttle severity, means the plenary is a comparison, and the comparison is where the real lesson lives: **the brief decides the spend, not the technology.** A feature that is obviously correct for the museum piece is obviously wrong for the kids' game, and no slide can deliver that as convincingly as five contradictory answers on the board at once.

The throttle severity is *also* brief-dependent, on purpose (3.5ms outdoor vs 5.6ms retail) — that is a second, quieter lesson: some rooms had an easier time structurally, before they made a single choice, because of what their brief demanded. Worth pointing out explicitly if nobody notices on their own.

## Running order

| Time | What | Say / do |
|---|---|---|
| 0:00 | Open | "You have 6.7ms. Spend it. Five categories, pick within each one's limits. Justify it in one sentence." Do not explain the categories in depth — the tags and notes on each option are the only guidance they get. |
| 0:02 | Breakout, Round 1 | Named reporter per room. Do not answer "which is the right pick" questions — say "that's the exercise." |
| ~0:12 | Back in main room | Do **not** open the board yet. Just: "Everyone locked in? Good — advance to the next screen together." |
| 0:14 | The reveal | Let it happen live, in silence, for a beat. This is the moment. |
| 0:15 | Breakout, Round 2 | "Keep, swap, or cut — your call. Answer whether you could have seen this coming." |
| 0:22 | Plenary | Open `admin.html`, hit Refresh. Read the board's own callouts aloud in order — they are written to be the opening lines, not just data. |

## Reading the board

The callouts are ordered to build to the point, not just report numbers:

1. **"X of Y rooms already fit the throttled budget."** Ask a future-proofed room what they protected and why — usually they under-spent on one flashy category rather than maxing all five. Ask a room that got caught what they'd change if they replayed Round 1 knowing what's coming.
2. **"First to go under pressure: [category]."** Push on whether that's because the category was genuinely least important for most rooms' briefs, or simply the most expensive line item on the sheet — those are different failures, and only one of them is a design decision.
3. **Risky-pick flag** (a room shipped "Nothing" in a mandatory category in their *final* answer) — read the team names. This is usually legibility or grounding, and it's the trap: cheap enough to skip, expensive enough in the real world that skipping it is never actually free.
4. **Spatial-audio flag** (HRTF kept despite no brief guaranteeing headphones) — ask on the spot what happens to the experience for the customer with no headphones in. This is a direct callback to the deck's own handheld-audio slide.
5. **By-brief table** — this is where the "harshest throttle was baked in before anyone picked a feature" point lives. Point at the wayfinding and kids' rows next to the retail row.

## Answer key — is there a "right" spend?

No, deliberately — but there are defensible and indefensible ones per brief, and it's worth having a private view on each so you can push back convincingly:

- **Museum piece** — static object, long dwell time, phone owned by the venue: this is the brief where **ML depth occlusion + IBL** are easiest to justify, because visitors get close and slow enough to notice bad grounding. A room that skimps on grounding here should be pushed on it.
- **Retail try-on** — short bursts, close-up, customer scrutiny is high but sessions are brief: **light estimation + a contact shadow** is usually enough; paying for the expensive occlusion tier here is arguable overspend for a 30-second interaction.
- **Kids' game** — the brief that should scare a sharp team into protecting frame rate itself rather than buying features, because 20 minutes continuous play is exactly the thermal-cliff scenario. A room that spent right up to 6.7ms here walked into the throttle with eyes open.
- **Outdoor wayfinding** — legibility is not optional here (direct sun on a screen) and neither is a real answer for grounding/lighting given it's outdoors, moving, GPS-dependent. This is the brief where cutting legibility to "Nothing" is hardest to defend, and also the one where it happens most.
- **Accessibility tour** — the brief most likely to be under-thought, because "accessibility" reads as a UI checkbox rather than a performance constraint. The real story is that legibility needs the *most* deliberate spend here, not the least, precisely because the brief said "low-vision."

## If a room finishes early

Ask them to defend their Round 2 pick against a brief they *didn't* get — "would this survive the kids' game brief instead?" Almost always it wouldn't, which is a fast, free reinforcement of the core lesson without needing new content.

## If a room gets stuck

Category minimums are enforced as guidance, not a hard block — the only hard block is the millisecond cap itself. If a room is stuck arguing rather than deciding, tell them: "pick the cheapest legal option in every category first, then spend what's left on the one thing your brief actually needs." That is the fallback strategy, and it's a fine thing for a stuck room to fall back on.
