# Ship It — INTE 42312

One team activity, three stages, one continuous pipeline: licence a hero asset, budget the scene you build it into, then survive a real per-frame budget with it — including whatever that scene costs to render. Built for Zoom breakout rooms, about 35–40 minutes total, produces something the lecturer can put on screen for the plenary.

| Page | What it is |
|---|---|
| `source.html` | **Stage 1 — Source the asset.** Team sign-in, brief, three licensed listings for the same hero prop, a real licence verdict |
| `scene.html` | **Stage 2 — Build the scene.** The hero asset is locked in from stage 1; the team assembles the rest of the scene under triangle / draw call / texture caps |
| `index.html` | **Stage 3 — Spend the frame.** Target frame rate, Round 1, the throttle, Round 2, done. Rendering cost is no longer picked freely — it is whatever stage 2 built |
| `admin.html` | Instructor board — one row per team covering all three stages, CSV export |

Students never see `admin.html` linked from anywhere. Go to `/admin.html` directly and bookmark it.

## Why three stages, mechanically coupled

This closes out the AR unit as an end-to-end simulation rather than three separate exercises bolted together. What a team decides in stage 1 is not just a licence verdict — the actual triangle/material/texture cost of the listing they pick becomes their hero asset's real cost in stage 2. What they build in stage 2 is not just a scene — its draw calls and texture footprint becomes the real rendering cost stage 3 has to absorb, alongside grounding, lighting, audio and legibility. Nothing is picked twice, and nothing downstream is free to ignore what happened upstream.

## What the activity actually does

1. **Sign in** (on `source.html`). Team name (or room number) + optional member names, stored in `localStorage`. The team name deterministically picks one of five briefs (museum piece, retail try-on, kids' game, outdoor wayfinding, low-vision accessibility tour) — same hash-based assignment used throughout this course's activities, so every room gets a different scenario without a lookup table, and every stage agrees on the same brief for the same team without a server round trip.

2. **Stage 1 — Source the asset.** Three listings for the same hero prop: a **clean, safe, unoptimised** stock scan; a **cheap, pre-optimised, licence-risky** listing (CC BY-NC — the same "graded, public, portfolio" pressure as the Model Lab's own arguable licence cases); and a **commissioned/original** asset with no licence question at all but a mid-range cost. The team picks one, gives it a real verdict (ship as-is / with attribution / only with a change or permission / do not ship), and locks it in. That listing's triangle/material/texture cost is now their hero asset for stage 2 — there is no going back to pick a different one.

3. **Stage 2 — Build the scene.** The hero asset is placed automatically, non-removable. The team adds a setting piece, 2–4 supporting decor items and one interface element from a small generic prop catalogue, under a shared cap (triangles / draw calls / texture memory) that includes the hero. Same "draw calls and texture memory break a scene before triangle count does" lesson as the Model Lab's Budget Table, met a second time at a smaller scale. Locking in computes the scene's total rendering cost in milliseconds and carries it forward.

4. **Stage 3 — Spend the frame.** The team picks a target frame rate (30 / 60 / 90fps); Round 1's budget is `1000/fps` minus the fixed ~10ms camera/VIO/tracking overhead. Four categories — grounding, lighting, audio, legibility — are picked freely, each with a `min`/`max` requirement. **Rendering & assets is not a fifth free pick any more** — it is locked to whatever stage 2's scene costs, shown as a fixed line item the team cannot toggle. The team justifies its spend, locks in, gets throttled (a brief-specific ratio of their own Round 1 budget), renegotiates in Round 2, and gets a one-sentence auto-generated summary to read out.

Nothing is client-trusted for scoring, at any stage. The licence verdict, the scene totals and category coverage, the derived rendering cost, and every Round 1/Round 2 millisecond total and cut/added diff are all recomputed server-side in one Function, from the raw pick ids — against hand-synced copies of the cost tables in `data/source-data.js`, `data/scene-data.js` and `data/frame-data.js`. One team submission at the very end of stage 3 covers the whole pipeline; stages 1 and 2 only write to `localStorage` until then.

## Structure

```
source.html             stage 1 — sign-in, brief, licence the hero asset
scene.html              stage 2 — build the scene around the locked hero asset
index.html              stage 3 — the frame budget (rendering cost now derived, not picked)
admin.html              instructor board (key-gated)
styles.css              brand design system, identical copy from the Model Lab / Hick's Law lab
lab.css                 activity component layer — the frame-budget visualizer, plus the Model
                        Lab's listing/reveal/requirements-checklist components, ported verbatim
common.js               window.ML — shared helpers: identity, the source->scene->frame pipeline
                        handoff (getPipe/setPipe), the brief hash, API, CSV
data/frame-data.js      stage 3: fps tiers, categories, ground/light/audio/legibility options,
                        the five briefs, and the render-cost-from-scene formula — retune here
data/source-data.js     stage 1: the three hero-asset cost profiles + five briefs' worth of listings
data/scene-data.js      stage 2: the generic scene prop catalogue, categories, caps
panels/frame-panel.js   admin board renderer + CSV export — covers all three stages
functions/api/          the one Pages Function, server-side scoring for the whole pipeline
```

Design system is the same one used across the other course activities: cream and forest, Plus Jakarta Sans, 2px ink borders, flat hard-offset shadows with no blur, squared corners, press-into-shadow tap feedback. `styles.css` is a direct copy so every activity site stays visually identical.

## Deploy (Cloudflare Pages, free tier)

Static site plus one Pages Function. The free plan covers it easily: unlimited bandwidth for static assets, 100k Function requests/day, and a KV free tier of 100k reads / 1,000 writes per day. One team's final submission (covering all three stages) is one write.

**There is deliberately no `wrangler.toml`.** When a Pages project has one, Cloudflare treats it as the single source of truth and **ignores every binding set in the dashboard**, including encrypted secrets — that would force the admin key into plaintext in this repo. Configuring in the dashboard keeps the key secret and the KV id out of git.

The `functions/` directory is auto-detected. No build step, no config file.

1. **Create the KV namespace** — dashboard → *Workers & Pages* → *KV* → **Create a namespace**. Call it anything, e.g. `frame-budget-results`.

2. **Create the Pages project** — *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → this repo.
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`

3. **Bind KV and set the admin key** — project → *Settings* → *Bindings*:
   - KV namespace binding: variable name **`RESULTS`** → the namespace from step 1
   - Environment variable **`ADMIN_KEY`** → **click Encrypt** → the key you will type into `admin.html`

4. **Redeploy.** Bindings only attach at build time — the deployment that ran before you added them will keep returning 500 on every save. *Deployments* → *Retry deployment*, or push any commit.

Pushing to `main` redeploys automatically from then on.

### If the deploy fails

| Error | Cause |
|---|---|
| `Invalid KV namespace ID` | A `wrangler.toml` with a placeholder id is present. Delete it. |
| Saves return **500**, `KV binding RESULTS not configured` | Bindings added but not redeployed since, or the variable is not named exactly `RESULTS` |
| Board returns **401** | `ADMIN_KEY` unset, or you are typing a different key |

## Running it as an online / Zoom session

Rough shape of a 35–40 minute slot — see `TEACHING.md` for the full run-of-show and what each stage's board callouts mean:

| Time | What |
|---|---|
| 0:00–0:03 | Share `source.html` in chat. Read the scenario aloud, and the "commit before you look" rule |
| 0:03–0:10 | Breakout rooms, stage 1. Named reporter per room. Locking in carries the hero asset forward automatically |
| 0:10–0:20 | Breakout rooms, stage 2. Building the rest of the scene around the locked hero asset |
| 0:20–0:22 | Back in the main room. Do **not** explain the rendering-cost link yet — just say "lock in, then wait" |
| 0:22–0:24 | Everyone opens stage 3 together and reads the "locked in from stage 2" callout — this is the reveal that the scene they just built is the rendering cost, not a fresh pick |
| 0:24–0:34 | Breakout rooms, Round 1 then the throttle then Round 2, same shape as before |
| 0:34–0:38 | Main room. Open `admin.html`, hit Refresh, and run the plenary off the board's callouts across all three stages |

Add `?demo=1` to `source.html` to seed a fake team identity for rehearsing on the projector — carry the same query string through to `scene.html` and `index.html` if you want the whole rehearsal run to skip a real submission (a `?demo=1` run on stage 3 never calls the server).

One submission per team, enforced in `localStorage`, written once at the end of stage 3. A team that genuinely needs to redo the whole pipeline can clear site data.

## Retuning the content

Three data files, each plain data with no logic:

- `data/source-data.js` — the three hero-asset cost profiles (`clean` / `cheap` / `commission`) and the five briefs' worth of listings built from them
- `data/scene-data.js` — the generic scene prop catalogue, category requirements, and the scene-wide caps
- `data/frame-data.js` — the fps tiers, the four freely-picked categories, the five briefs' throttle ratios, and the formula that turns a scene's draw calls + texture memory into a rendering-ms cost

**If you change any cost number, cap, or requirement in any of these three files, update the matching copy in `functions/api/frame-results.js` too** — the server never reads the client data files, by design, so they have to be kept in sync by hand (same convention as the Model Lab's own budget activity).

## Privacy

Teams enter a team name and optionally first names. Nothing else is collected beyond a truncated user-agent string. No third-party analytics, no cookies, no login. Results live in one KV namespace the lecturer controls and can wipe from the board.
