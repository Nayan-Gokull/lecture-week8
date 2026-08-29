# The Source-the-Asset model set

Three real, self-hosted `.glb` files, one per hero-asset "cost tier" (`clean` / `cheap` / `commission`), shared across all nine briefs — the same convention `data/source-data.js` already uses for the cost profiles themselves. `source.html` opens whichever one a team is inspecting in a live three.js viewer and reads its real stats straight out of the file, using the exact same binary-GLB parser the Model Lab's `autopsy.html` already uses (ported, not reinvented).

**None of these three files were used in Model Autopsy.** That is deliberate: reusing Dragon/Fox/Helmet/ToyCar/Chess here would mean wrapping an asset a student may already recognise in a *fictional* licence story for this exercise — CC BY-NC, "contact the creator," etc. — none of which is that file's real licence. A student who later looked up the real asset could reasonably conclude the exercise had lied to them. These three are different files with no such collision risk.

## The set

| Pick tier | File | Real licence | Real author | Triangles | Draws | Materials | Texture (measured) |
|---|---|---|---|---|---|---|---|
| `clean` (heavy, safe) | `sheenchair.glb` | CC0 1.0 | Eric Chadwick / Wayfair, LLC | 39,936 | 4 | 6 | 14.7 MB |
| `cheap` (light, fictionally risky) | `clearcoatwicker.glb` | CC0 1.0 | Eric Chadwick | 3,072 | 1 | 1 | 5.3 MB |
| `commission` (moderate, safe) | `glamvelvetsofa.glb` | CC BY 4.0 | Eric Chadwick / Wayfair, LLC | 4,196 | 3 | 7 | 10.7 MB |

All three figures are parsed straight from the real files with the same method `models/README.md` in the Model Lab documents — a GLB's 12-byte header is followed by a length-prefixed JSON manifest, read directly, no renderer required. They are **not** estimates and match exactly what `source.html`'s viewer reports live.

The `materials` column above is the file's real material count; the game mechanics in `data/source-data.js` and `functions/api/frame-results.js` use the file's real measured **draw count** instead (mirroring the "one draw call per material *placed*" convention used throughout this course's activities) — that is why `SOURCE_MODEL_PROFILES` records `materials: 4` for the chair rather than 6.

## Why these three, numerically

- **`sheenchair.glb` is the heaviest** on every axis at once — the largest triangle count, the most draw calls, the most texture memory of the three. That is exactly the "as-downloaded, nobody optimised it" story `clean` needs to tell.
- **`clearcoatwicker.glb` is the lightest** on every axis — a fifth of the chair's material count, over ten times fewer triangles. A team that picks it buys real headroom in stage 2, which is the whole point of the licence/cost trade-off in stage 1.
- **`glamvelvetsofa.glb` sits in between**, moderate on triangles and draws, with texture memory in between the other two. It reads as competent, unremarkable work — exactly what "your team modelled or commissioned this" should feel like.

These numbers were checked against `data/scene-data.js`'s caps before being committed: even the heaviest hero (`sheenchair.glb`, 66% of the triangle cap and a third of the texture cap on its own) still leaves a valid scene reachable, and no fps/brief combination in stage 3 becomes mathematically unwinnable for any reachable scene built on any of the three heroes — verified by brute-force enumeration of every valid stage-2 scene, the same audit method used for the rest of this pipeline.

## Licensing — real vs. the exercise's fiction

**The real licence in the table above is not what `source.html` tells the student.** Stage 1 is a licensing exercise: each listing is given a fictional marketplace story (fictional author name, fictional licence terms, fictional small print), same fabrication rule as the Model Lab's `licence-cases.js` ("every author name, model title and listing is fictional"). The file behind the listing is real and genuinely licensed as shown above — self-hosting it is legitimate regardless of which fictional story the exercise tells about it.

To make sure this is never actually misleading, `source.html` states plainly, on every listing card, that its licence text is written for the exercise and is not the demo file's real licence, with a pointer back to this file for the real one. If you ever export a screenshot of this activity for a slide or a report, treat the fictional listing text as fictional and cite the real credit above instead.

## Where they came from

```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/<Name>/glTF-Binary/<Name>.glb
```

```bash
cd models
B=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models
curl -L -o sheenchair.glb      $B/SheenChair/glTF-Binary/SheenChair.glb
curl -L -o clearcoatwicker.glb $B/ClearcoatWicker/glTF-Binary/ClearcoatWicker.glb
curl -L -o glamvelvetsofa.glb  $B/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb
```

Total is about 8.6 MB for all three, comfortably inside Cloudflare Pages' per-file and per-deploy limits, and small enough not to be a single point of failure on campus wifi — the same reasoning the Model Lab's own `models/README.md` gives for self-hosting.

## Retuning

`data/source-data.js`'s `SOURCE_MODEL_PROFILES` and `window.SOURCE_MODEL_FILES` are the two places that reference these three files. Swapping a file means: re-download, re-run the same GLB parser to get real numbers, update both `SOURCE_MODEL_PROFILES` (client) and the mirrored `SOURCE_PROFILES` in `functions/api/frame-results.js` (server), and re-run the scene-feasibility audit before shipping — do not hand-tune these numbers away from what the file actually measures.
