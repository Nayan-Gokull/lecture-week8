# Spend the Frame — INTE 42312

One team activity: budget a realistic AR experience under a hard frame-time cap, then survive the phone throttling mid-session. Built for Zoom breakout rooms, 20–25 minutes, produces something the lecturer can put on screen for the plenary.

| Page | What it is |
|---|---|
| `index.html` | The activity — team sign-in, brief, Round 1, the throttle, Round 2, done |
| `admin.html` | Instructor board — submissions, diagnostics, CSV export |

Students never see `admin.html` linked from anywhere. Go to `/admin.html` directly and bookmark it.

## What the activity actually does

1. **Sign in.** Team name (or room number) + optional member names, stored in `localStorage`.
2. **Brief.** The team name deterministically picks one of five briefs (museum piece, retail try-on, kids' game, outdoor wayfinding, low-vision accessibility tour) — same hash-based assignment as the Model Lab activities, so every room gets a different scenario without needing a lookup table.
3. **Target frame rate, then Round 1.** The team first picks a target — 30fps, 60fps, or a 90fps headset-style comparison — and their Round 1 budget is computed live: 1000/fps, minus the ~10ms already spent by camera capture, VIO and tracking before the team's own code runs. 60fps gives the tuned 6.7ms every option on the sheet was calibrated against; 30fps gives roughly 3x that (23.3ms), which removes most of the spending tension — that trade-off, steadiness versus headroom, is itself the point, not a shortcut around the exercise. Five categories — grounding, lighting, audio, legibility, rendering — each with a `min`/`max` pick requirement. The team must justify its spend in one sentence.
4. **The throttle.** On locking Round 1, the team is told the phone has been running long enough to hit the thermal cliff. The new budget is **smaller and brief-specific**, computed as their own Round 1 budget times a fixed per-brief ratio (an outdoor, continuous-use brief keeps only ~52% of whatever budget they had; an indoor, short-burst one keeps ~84%). This is itself part of the lesson: the brief decided how bad the squeeze would be before anyone picked a single feature, or a frame rate.
5. **Round 2.** The team renegotiates under the new cap — keep, swap or cut anything from Round 1 — and answers whether the cut was predictable from the brief.
6. **Done.** A one-sentence, auto-generated summary ("Brief: X. Round 1 spent Yms... after the throttle we cut Z...") with a copy-to-clipboard button for pasting into chat.

Nothing is client-trusted for scoring: every millisecond total, category-coverage check and the cut/added diff between rounds is recomputed server-side from the raw pick ids, against a hand-synced copy of the cost table in the Function. This mirrors the Model Lab's `budget-results.js` exactly.

## Structure

```
index.html            the activity (sign-in through done, one state machine)
admin.html             instructor board (key-gated)
styles.css              brand design system, identical copy from the Model Lab / Hick's Law lab
lab.css                 activity component layer (trimmed copy + a few new classes)
common.js               window.ML — shared helpers, team identity, API, CSV (identical copy)
data/frame-data.js      categories, options + ms costs, the five briefs — retune here
panels/frame-panel.js   admin board renderer + CSV export
functions/api/          the one Pages Function, server-side scoring
```

Design system is the same one used across the other course activities: cream and forest, Plus Jakarta Sans, 2px ink borders, flat hard-offset shadows with no blur, squared corners, press-into-shadow tap feedback. `styles.css` is a direct copy so every activity site stays visually identical.

## Deploy (Cloudflare Pages, free tier)

Static site plus one Pages Function. The free plan covers it easily: unlimited bandwidth for static assets, 100k Function requests/day, and a KV free tier of 100k reads / 1,000 writes per day. One team's final submission is one write.

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

Rough shape of a 20–25 minute slot:

| Time | What |
|---|---|
| 0:00–0:02 | Share the link in chat. Read the rule aloud: pick a frame rate, the budget is computed from it, five categories |
| 0:02–0:12 | Breakout rooms, Round 1. Assign a **named reporter** per room before you open them |
| 0:12–0:14 | Back in the main room. Do **not** explain anything yet — just say "lock in, then wait" |
| 0:14–0:15 | Everyone reads the throttle reveal together — this moment is the whole point, don't let a fast room skip ahead of it alone if you want it to land as a shared beat |
| 0:15–0:22 | Breakout rooms, Round 2 renegotiation |
| 0:22–0:25 | Main room. Open `admin.html`, hit Refresh, and run the plenary off the board's callouts |

The board's own callouts are written to hand you the opening line: it will tell you how many rooms were "future-proofed" without changing anything, which category got cut first across the whole cohort, and name any room that kept a "nothing" pick or spatial audio into the final answer. Open with whichever of those has the most rooms in it.

Add `?demo=1` to the activity URL to seed a fake team identity for rehearsing on the projector — a `?demo=1` run never calls the server, so it cannot pollute the results.

One submission per team, enforced in `localStorage`. A team that genuinely needs to redo it can clear site data.

## Retuning the content

`data/frame-data.js` is plain data — no logic — so the activity can be rebalanced without touching application code: the fps tiers, the five briefs' throttle ratios, and the cost/category table for all 20 options. **If you change any `ms` value, a throttle ratio, or add/remove an option, update the matching copy in `functions/api/frame-results.js` too** — the server never reads the client data file, by design, so the two must be kept in sync by hand (same convention as the Model Lab's budget activity).

## Privacy

Teams enter a team name and optionally first names. Nothing else is collected beyond a truncated user-agent string. No third-party analytics, no cookies, no login. Results live in one KV namespace the lecturer controls and can wipe from the board.
