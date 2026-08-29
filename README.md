# Ship It — INTE 42312

One team activity, one continuous pipeline, eleven stages across four pages: read the brief, discuss it, pick a platform and predict your features, licence a hero asset, budget the scene you build it into, add audio, spend a real per-frame budget with it, optimise under a throttle, clear legal notices, then ship. Built for Zoom breakout rooms, about 35–40 minutes total, produces something the lecturer can put on screen for the plenary.

| Page | Stages inside it |
|---|---|
| `intro.html` | **Brief → Discuss → Platform → Features.** Team sign-in, the brief, a no-mechanics "first thoughts" write-in, an AR platform choice, and a features prediction — before any numbers exist |
| `source.html` | **Source.** Three licensed listings for the same hero prop, each one a real self-hosted `.glb` opened in a real 3D viewer with real measured stats, not a text description |
| `scene.html` | **Build.** The hero asset is locked in from Source; the team assembles the rest of the scene under triangle / draw call / texture caps |
| `index.html` | **Audio → Spend → Optimise → Legal → Ship.** Audio gets its own screen ahead of the numeric spend; target frame rate, Round 1, the throttle, Round 2 (with a callback to Discuss/Features), a Legal Notices check, then the final submit |
| `admin.html` | Instructor board — one row per team covering every stage, CSV export |

Students never see `admin.html` linked from anywhere. Go to `/admin.html` directly and bookmark it.

## Why eleven stages, mechanically coupled

This closes out the AR unit as an end-to-end simulation rather than a set of exercises bolted together. What a team decides in Source is not just a licence verdict — the real triangle/draw-call/texture cost of the listing they pick becomes their hero asset's real cost in Build. What they build in Build is not just a scene — its draw calls and texture footprint becomes the real rendering cost Spend has to absorb, alongside audio, grounding, lighting and legibility. Optimise calls back to what the room predicted in Discuss and Features, before it had seen a single number. Legal closes the loop Source opened. Nothing is picked twice, and nothing downstream is free to ignore what happened upstream.

A persistent stage timeline (`ML.renderTimeline`, in `common.js`) runs across all four pages so a team always knows where they are in the eleven stages — but every label is deliberately outcome-neutral (`Optimise`, never `Throttle`) so the timeline itself can never spoil a reveal still to come.

## What the activity actually does

1. **Sign in** (on `intro.html`). Team name (or room number) + optional member names, stored in `localStorage`. The team name deterministically picks one of nine briefs — same hash-based assignment used throughout this course's activities, so every room gets a different scenario without a lookup table, and every stage agrees on the same brief for the same team without a server round trip.

2. **Discuss.** Before any mechanics exist, the room writes one or two sentences on the riskiest or most demanding part of the brief. No scoring — it comes back as a callback in Optimise.

3. **Platform.** AR only: handheld WebAR, or a native ARKit/ARCore app. Recorded, not scored against the frame-budget arithmetic (deliberately — it feeds Legal's platform-specific notice instead, so the numeric balance already audited for this activity stays untouched).

4. **Features.** A yes/no prediction across the same four categories Spend will use — grounding, lighting, audio, legibility — before the room has seen a single cost number. Compared against what Round 1 actually spent real budget on, in Optimise.

5. **Source.** Three listings for the same hero prop: a **clean, safe, unoptimised** stock file; a **cheap, pre-optimised, licence-risky** listing; and a **commissioned/original** asset with no licence question but a mid-range cost. Each one opens its real, self-hosted `.glb` in a live three.js viewer and reads real triangle/draw-call/texture stats straight out of the file — the same binary-GLB parser the Model Lab's `autopsy.html` uses. The team picks one, gives it a real licence verdict, and locks it in — no going back.

6. **Build.** The hero asset is placed automatically, non-removable. The team adds a setting piece, 2–4 decor items and one interface element from a small generic prop catalogue, under a shared cap that includes the hero. Locking in computes the scene's rendering cost and carries it forward.

7. **Audio.** Its own screen, ahead of the rest of the spend — pick from the same audio options Spend used to bury inside one long category list, with a running total against the shared Round 1 budget before grounding, lighting or legibility exist yet.

8. **Spend (Round 1).** Target frame rate, then grounding / lighting / legibility, each with a `min`/`max` requirement. Rendering is not a free pick — it is locked to whatever Build's scene costs.

9. **Optimise (the throttle + Round 2).** The budget shrinks by a brief-specific ratio. The room renegotiates, and sees a callback to what it said in Discuss and predicted in Features, next to what it actually spent.

10. **Legal.** The credit from Source, a platform-specific notice (a native app needs an app-store disclosure a web link does not), and a confirmation that the credit lives somewhere a viewer could actually find it.

11. **Ship.** The one and only point where anything is sent to the server — a single submission covering all eleven stages — followed by a one-sentence auto-generated summary to read out.

Nothing is client-trusted for scoring. The licence verdict, the scene totals and category coverage, the derived rendering cost, and every Round 1/Round 2 millisecond total and cut/added diff are all recomputed server-side in one Function, from the raw pick ids — against hand-synced copies of the cost tables in `data/source-data.js`, `data/scene-data.js` and `data/frame-data.js`. Discuss/Platform/Features/Legal are recorded, not scored — there is no "correct" platform or feature prediction, only the real comparison Optimise already shows the team live.

## Structure

```
intro.html              Brief, Discuss, Platform, Features + sign-in
source.html             Source — licence a hero asset via a real 3D viewer
scene.html              Build — the scene around the locked hero asset
index.html              Audio, Spend, Optimise, Legal, Ship
admin.html              instructor board (key-gated)
styles.css              brand design system, identical copy from the Model Lab / Hick's Law lab
lab.css                 activity component layer — the frame-budget visualizer, the stage
                        timeline, the Model Lab's viewer/listing/reveal components, ported
common.js               window.ML — shared helpers: identity, the pipeline handoff
                        (getPipe/setPipe), the brief hash, the stage timeline, API, CSV
data/frame-data.js      fps tiers, categories, AR platforms, the nine briefs, and the
                        render-cost-from-scene formula — retune here
data/source-data.js     the three hero-asset cost profiles (real, measured) + the file each
                        one opens, and the nine briefs' worth of listings built from them
data/scene-data.js      the generic scene prop catalogue, categories, caps
models/                 the three real, self-hosted .glb files Source's viewer opens —
                        see models/README.md for real licences and why these three
panels/frame-panel.js   admin board renderer + CSV export — covers every stage
functions/api/          the one Pages Function, server-side scoring for the whole pipeline
```

Design system is the same one used across the other course activities: cream and forest, Plus Jakarta Sans, 2px ink borders, flat hard-offset shadows with no blur, squared corners, press-into-shadow tap feedback. `styles.css` is a direct copy so every activity site stays visually identical.

## Deploy (Cloudflare Pages, free tier)

Static site plus one Pages Function. The free plan covers it easily: unlimited bandwidth for static assets, 100k Function requests/day, and a KV free tier of 100k reads / 1,000 writes per day. One team's final submission (covering every stage) is one write.

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
   - Check the binding is set on the **Production** environment specifically, not just Preview — the live `.pages.dev` URL serves Production.

4. **Redeploy.** Bindings only attach at build time — the deployment that ran before you added them will keep returning 500 on every save (`KV binding RESULTS not configured`). *Deployments* → *Retry deployment*, or push any commit.

Pushing to `main` redeploys automatically from then on.

### If the deploy fails

| Error | Cause |
|---|---|
| `Invalid KV namespace ID` | A `wrangler.toml` with a placeholder id is present. Delete it. |
| Saves (or the board) return **500**, `KV binding RESULTS not configured` | Bindings added but not redeployed since, the binding is on Preview instead of Production, or the variable is not named exactly `RESULTS` |
| Board returns **401** | `ADMIN_KEY` unset, or you are typing a different key |

## Running it as an online / Zoom session

Rough shape of a 35–40 minute slot — see `TEACHING.md` for the full run-of-show and what each stage's board callouts mean:

| Time | What |
|---|---|
| 0:00–0:05 | Share `intro.html` in chat. Read the brief aloud, then Discuss / Platform / Features — quick, no mechanics yet |
| 0:05–0:12 | Breakout rooms, Source. Named reporter per room. Locking in carries the hero asset forward automatically |
| 0:12–0:20 | Breakout rooms, Build |
| 0:20–0:22 | Back in the main room. Do **not** explain the rendering-cost link yet — just say "lock in, then wait" |
| 0:22–0:24 | Everyone opens Audio together and reads the "locked in from Build" callout — the first moment the pipeline's coupling becomes visible |
| 0:24–0:34 | Breakout rooms: Audio, then Spend (Round 1), the throttle, Optimise (Round 2) |
| 0:34–0:36 | Legal Notices, then Ship |
| 0:36–0:40 | Main room. Open `admin.html`, hit Refresh, and run the plenary off the board's callouts across every stage |

Add `?demo=1` to `intro.html` to seed a fake team identity for rehearsing on the projector — a `?demo=1` run never calls the server on Ship, so it cannot pollute the results.

One submission per team, enforced in `localStorage`, written once at Ship. A team that genuinely needs to redo the whole pipeline can clear site data.

## Retuning the content

Three data files, each plain data with no logic:

- `data/source-data.js` — the three hero-asset cost profiles (`clean` / `cheap` / `commission`, real measured numbers — see `models/README.md`) and the nine briefs' worth of listings built from them
- `data/scene-data.js` — the generic scene prop catalogue, category requirements, and the scene-wide caps
- `data/frame-data.js` — the fps tiers, the AR platform options, the four freely-picked categories, the nine briefs' throttle ratios, and the formula that turns a scene's draw calls + texture memory into a rendering-ms cost

**If you change any cost number, cap, or requirement in any of these three files, update the matching copy in `functions/api/frame-results.js` too** — the server never reads the client data files, by design, so they have to be kept in sync by hand (same convention as the Model Lab's own budget activity). If you ever swap one of the three `.glb` files in `models/`, re-measure it with the same parser (see `models/README.md`) rather than hand-tuning a number, and re-run the scene-feasibility audit before shipping.

## Privacy

Teams enter a team name and optionally first names. Nothing else is collected beyond a truncated user-agent string. No third-party analytics, no cookies, no login. Results live in one KV namespace the lecturer controls and can wipe from the board.
