# Ship It — instructor notes

Not linked anywhere in the student-facing site. `_redirects` sends `/TEACHING.md` back to the hub so it can't be reached by guessing the URL.

## The one thing to get right

**Do not explain the Source -> Build -> Audio/Spend links before they happen.** The whole design depends on each stage being a genuine, unhinted commitment. If you preview "by the way, whatever you build in Build becomes your rendering cost in Spend," you have deleted the exercise — teams will hedge instead of actually deciding, and each reveal lands as a rule change instead of a consequence.

Say only, at the very start: "Eleven stages, one build, one team. What you decide early carries forward — that's all I'm telling you." Let the two reveals (Build's "this is what your hero asset costs", Audio's "this is what your scene costs to render") land as discoveries. The stage timeline at the top of every page is deliberately safe to look at — the labels never say what happens inside a stage, only its name — so pointing at it and saying "here's the shape of the whole thing" does not spoil anything.

## Pre-production — Discuss, Platform, Features (on intro.html)

Three quick stages before any mechanics exist, on the same page as sign-in:

- **Discuss** is one or two sentences, no scoring: "what's the riskiest or most demanding part of this brief?" Its only job is to exist so Optimise can quote it back later. Do not let a room skip it with a one-word answer if you can help it — the callback lands better with something real to compare against.
- **Platform** is AR only, on purpose (handheld WebAR vs native ARKit/ARCore) — the same ladder as the deck's own Platform Selection slide, not a new track decision. It is recorded and resurfaces in Legal Notices (a native app needs an app-store disclosure a web link does not); it deliberately does not touch the frame-budget arithmetic, so the already-audited numeric balance of this activity stays untouched.
- **Features** is a yes/no prediction across the same four categories Spend uses (grounding, lighting, audio, legibility) — before the room has seen a single millisecond number. This is the one most rooms will treat as a formality; tell them it comes back in Optimise, but not how.

## Stage: sourcing the asset is a real trade, not just a licence quiz — and now a real file, not a description

Three listings, always shippable in some form, so nobody hits a dead end:

- **Clean** (CC0, unoptimised) — always safe, but heavy: the "as-downloaded" file nobody at the marketplace bothered to optimise for real-time use.
- **Cheap** (CC BY-NC, pre-optimised) — the arguable case, same shape as the Model Lab's own NC/ND cases: coursework that is graded, public and stays in a portfolio sits close to, but not cleanly inside, "non-commercial". Defensible with attribution or a message to the creator; indefensible shipped with none.
- **Commission** (original work) — always safe, no licence question at all, moderate cost: the trade is time and skill, not legal risk.

The real strategic choice a sharp team notices is that **the cheapest, best-optimised asset is also the one with the most licence risk** — that is not a coincidence in the fiction, it mirrors why real marketplaces price optimised, well-supported assets under stricter terms. A team that picks cheap and does not write a real attribution (or does not flag the risk out loud) has skipped a licence condition, which the board treats the same as the standalone licence activity does: same as having no licence at all.

Each listing opens a real, self-hosted `.glb` in a live viewer and reads real triangle/draw-call/texture stats straight out of the file — the team is deciding by checking, not by reading a description. Two disclosures are on-screen at all times, so nobody walks away with a false belief: the licence text is fictional, written for this exercise, and is not the file's real licence (real credit is in `models/README.md`); the file itself is a stand-in prop for reading real specs on, not literally the finished object the brief describes.

## Build — the hero asset is locked, the room still has real decisions

Whatever a team picked in Source shows up already placed and non-removable. This is deliberate: it removes the "just don't use it" escape hatch and forces the team to build around the consequence of their own Source choice. A team that picked the heavy clean asset has much less headroom for scene props than a team that took the cheap, risky, well-optimised one — **that headroom difference is Source's licence trade-off becoming visible as a real cost**, not a separate lesson.

The scene mechanic repeats the Model Lab Budget Table's own trap at a smaller scale on purpose — a team meets "draw calls and texture memory break a scene before triangle count does" twice across the two activities, which is what makes it stick:
- **Prop Cluster** (raw) is cheap in triangles but carries 14 materials — the potted-plant trap again.
- **Environment Backdrop Panel** is almost flat geometry holding an 18MB texture — the rug trap again.

## Audio gets its own screen now

Audio used to be buried inside the same long category list as grounding, lighting and legibility. It is now its own screen, ahead of the rest of the spend, with a running total against the shared budget before the other three categories exist on screen at all — the point is to stop audio quietly losing out to whichever category happens to render first in a long list. It still spends from the exact same pool; only when it is decided changed, not how it is scored. A room cannot go back to this screen once past it, but the audio category's own minimum is zero, so "deselect everything" is always a valid escape if a pick turns out to overspend.

## Rendering is no longer a free pick, it is what Build cost

The old "Rendering & assets" picklist (LOD / atlas / hi-res / hero) is gone. In its place is a single locked line, sized to whatever Build's scene actually costs: `0.05 + draws*0.018 + textureMB*0.012` ms, calibrated so the same range (roughly 0.3–1.5ms) the old picklist covered still holds for a typically-built scene. This is the moment the whole pipeline's coupling becomes visible to the team — say nothing about it before they reach Audio's brief recap, and let the "locked in from Build" callout do the explaining.

### The frame-rate choice is still the first decision inside Spend

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
| 0:00 | Open `intro.html` | "Eleven stages, one build, one team. What you decide early carries forward — that's all I'm telling you." Read the brief aloud. |
| 0:02 | Discuss, Platform, Features | Quick, no mechanics. Push for a real sentence in Discuss — it comes back later. Do not hint at what Platform or Features actually change. |
| 0:05 | Breakout, Source | Named reporter per room. Locking in an asset carries it forward automatically — there is no going back. |
| 0:12 | Breakout, Build | The hero asset is already placed when they open `scene.html`. Do not explain why the caps feel tighter or looser between rooms — that is Source showing up. |
| 0:20 | Back in main room | Do **not** open the board yet. Just: "Everyone locked in Build? Good — open the next stage together." |
| 0:22 | The reveal | Let the "locked in from Build" callout land in silence for a beat. This is the moment the coupling becomes visible. |
| 0:24 | Breakout, Audio then Spend | Audio first, its own screen, then grounding/lighting/legibility. "Pick your target frame rate, then spend what's left. Rendering is already decided." |
| ~0:32 | Back in main room | "Everyone locked in? Advance to the next screen together." |
| 0:33 | The throttle reveal | Let it happen live, in silence, for a beat. |
| 0:34 | Breakout, Optimise | "Keep, swap, or cut — your call." Point out the callback card quoting their own Discuss answer back at them. |
| 0:37 | Legal Notices, then Ship | Quick — this is a check, not new work. |
| 0:38 | Plenary | Open `admin.html`, hit Refresh. Read the board's callouts aloud in order. |

## Reading the board

The callouts are ordered pre-production -> Source -> Build -> Spend, then the plenary payoff:

1. **Platform selected** — a straight distribution. Worth a line if the room split evenly or went almost entirely one way.
2. **Hero asset sourced** — distribution across clean / cheap / commission. If most rooms took the cheap, risky option, that is worth naming before anything else: most of the room accepted licence risk to buy scene headroom.
3. **Indefensible-cheap-asset flag** — named rooms who took the risky asset without a defensible attribution. Ask them to defend it live, same as the standalone licence activity's trap cases.
4. **Average rendering cost from Scene Build**, and the share of Round 1's own budget it ate before a single grounding/lighting/audio/legibility pick — this is the number that makes Source and Build's consequences land in Spend's numbers.
5. **"X of Y rooms already fit the throttled budget."** Ask a future-proofed room what they protected; ask a caught room what they'd change knowing the throttle was coming.
6. **"First to go under pressure: [category]."** Genuinely least important for most briefs, or simply the most expensive line on the sheet — different failures.
7. **Risky-pick flag** ("Nothing" shipped in a mandatory category in the final answer).
8. **Spatial-audio flag** (HRTF kept despite no brief guaranteeing headphones).
9. **Target frame rate chosen**, and the named "picked 30fps for a motion-heavy brief" flag.
10. **By-brief table** — ranked by the fixed throttle ratio; the actual ms cap varies within a brief by fps chosen, shown as a range.

The board does not currently print the Features-prediction-vs-actual comparison or the Discuss quotes — those live in each team's own Optimise screen, read live in the room, not pulled onto the shared board.

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

Ask them to defend their Round 2 pick against a brief they didn't get, or ask what they'd have picked in Source if they had known their Build scene ambitions in advance.

## If a room gets stuck

The only hard block anywhere in the pipeline is a cap itself (millisecond, triangle, draw call, or texture). If a room is stuck arguing, tell them: "pick the cheapest legal option everywhere first, then spend what's left on the one thing your brief actually needs."

## Closing the activity — the debrief speech

This is the last thing you say before the module moves on, and it is doing real work: it is the moment eleven separate decisions become one story, and it is the closing statement for the whole AR unit, not just for this one exercise. Give it room — three to four minutes, after the board callouts, once every team has been named at least once. Read it close to verbatim the first time you run this; you will find your own shorthand for it after that.

<p><b class="sd">[open — name what just happened, don't undersell it]</b> Right. Before you go — what you just did was not five unrelated puzzles back to back. It was one build. A licence choice you made in the first ten minutes was still costing you frame time in the last ten. That is not a coincidence I built in for fun. That is what a real project actually feels like, compressed into thirty-five minutes.</p>

<p><b class="sd">[thread 1 — licensing has a price tag, not just a legal status]</b> Start with Source. Every room had the same three-way choice: safe and heavy, cheap and risky, or safe and middling. <b class="sd">[ask]</b> Who took the cheap one? — <b class="sd">[whatever the answer]</b> Here is the thing I want you to actually remember, past this module, past this degree: <b>the cheapest, best-optimised asset on a marketplace is very often the one with the strictest licence.</b> That is not this exercise being artificial. That is why the good stuff costs more or comes with more conditions — someone already did the work you didn't have to. You inspected a real file to make that call, not a paragraph describing one. That is the habit. Read the file. Not the listing.</p>

<p><b class="sd">[thread 2 — the trap you were shown twice, on purpose]</b> Then Build. And here is a pattern some of you have now met three separate times this course, in three separate activities, on purpose: <b>draw calls and texture memory break a scene long before triangle count does.</b> The Model Autopsy taught it to you as a diagnosis. The Budget Table taught it to you as a scene. Just now, it taught it to you as a consequence — because the hero asset you licensed in Source was either handing you headroom or eating it, before you placed a single prop. If a lesson costs you something real three times, it is because it is the lesson that actually matters, not because I ran out of new ones to teach.</p>

<p><b class="sd">[thread 3 — the reveal, named out loud now that it's safe to]</b> <b class="sd">[ask]</b> When did you realise your scene build was also your rendering budget? — Some of you will say "the moment I opened the frame screen." Good. That was deliberate, and now I can tell you why: if I had told you up front, you would have built defensively instead of honestly, and the exercise would have taught you nothing except how to game a rubric. <b>In a real studio nobody warns you either.</b> The scene you shipped is the scene you have to render. There is no separate rendering budget you get to negotiate afterwards.</p>

<p><b class="sd">[thread 4 — frame rate as a decision, not a setting]</b> Then the frame budget itself. <b>Sixty frames a second is not a score, it is a deadline</b> — you have heard me say that already this module, and today you felt what happens when you miss it. Some rooms picked thirty and found the whole exercise went quiet: almost nothing to spend, almost no tension. That is not a room that broke the activity. That is a room that made the single decision that mattered most, right at the start, and then correctly discovered that everything after it was easier because of it. <b class="sd">[ask]</b> Did any room regret their frame-rate choice by the end? — Whatever comes back, the point is the same: the frame rate is the first architectural decision on a real project, not a graphics setting you tune at the end.</p>

<p><b class="sd">[thread 5 — the throttle, and what it actually tested]</b> The throttle was not a trick question. It was the thermal cliff from three weeks ago, made personal. <b>The rooms that were "future-proofed" did not get lucky — they spent like the phone was already hot,</b> from the first pick. That is the entire difference between a demo and a shippable product: a demo is tuned for the first ninety seconds. A product is tuned for minute five.</p>

<p><b class="sd">[thread 6 — the prediction check, use their own words if you have them]</b> <b class="sd">[if you can see the Discuss / Features answers, quote one or two rooms directly here — it lands far better than a generalisation]</b> Before any of you had touched a single number, you wrote down what you thought would be the hard part, and you predicted which categories you'd end up needing. Some of you were right. Some of you were confidently wrong. Both are useful — a team that guesses right by instinct still has to prove it with numbers, and a team that guesses wrong just found out, cheaply, in a thirty-five minute exercise, that their gut read on a brief is not automatically correct. That is worth knowing before it costs you a client's money.</p>

<p><b class="sd">[thread 7 — legal notices, land this one plainly]</b> And last: the Legal Notices screen. I put that at the very end, after all the interesting technical work was already done, on purpose — because that is exactly where it sits in a real project too. It is the boring screen nobody wants to do last, right before shipping, when everyone just wants to be finished. <b>Everyone in this room, on every project from now on, is going to be tempted to skip that screen.</b> Don't. It is the same one sentence from the licensing block, weeks ago: the credits file is where you write down that you did this properly, and it is also where it gets checked.</p>

<p><b class="sd">[the close — tie it to the whole AR unit, not just today]</b> So here is the one sentence I actually want you to leave with, and it is the same sentence that has been true since the very first slide of this whole AR block: <b>a beautiful experience that does not run, is not licensed to ship, or does not credit what it is built from, is not a finished experience. It is an unfinished one that happens to look done.</b> Performance, rights and honesty about your sources are not three separate checklists at the end of a project. They are three constraints on your very first decision, same as frame rate is. You just spent thirty-five minutes proving that to yourselves, one build at a time.</p>

<p class="crib"><b>If you go off-book, hit at minimum:</b></p>
<ul>
<li>Cheapest/best-optimised asset = usually the most licence-restricted one — a real market pattern, not this exercise being artificial</li>
<li>Draw calls / texture memory beating triangle count is the lesson repeated three times this course on purpose — name that repetition explicitly, it is what makes it stick</li>
<li>The scene-build-becomes-rendering-cost reveal was deliberately unhinted — say why (defensive building teaches nothing) now that it is safe to</li>
<li>Frame rate is an architectural decision made once, at the start, not a setting tuned at the end — some rooms proved this by picking 30fps and finding the rest of the exercise went quiet</li>
<li>The throttle rewarded rooms that built as if the phone was already hot from pick one — that is the entire difference between a demo and a shippable product</li>
<li>Quote a real Discuss/Features answer if you can see the board — it lands far better than a generic "some of you predicted wrong"</li>
<li>Legal Notices sits last on purpose, exactly where it sits in real work, exactly where everyone is tempted to skip it</li>
<li>Close on: performance + rights + honest credit are constraints on decision one, not a checklist at the end — same as frame rate</li>
</ul>
