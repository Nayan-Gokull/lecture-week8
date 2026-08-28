/* ============================================================
   Ship It — Stage 2 data: "Build the scene"
   window.SCENE_CAPS   = { tris, draws, textureMB }   — includes the hero
   window.SCENE_CATS   = [ ...requirements, excluding hero ]
   window.SCENE_ASSETS = [ ...generic scene props ]
   window.SCENE_LEVERS = [ ...same shape as the Model Lab's Budget Table ]

   The hero prop itself is not in this list — it was locked in on
   source.html and is placed automatically, non-removable, at whatever
   cost that licence choice carries. Everything here is the rest of the
   scene built around it.

   DRAW CALL RULE, same convention as the Model Lab's Budget Table: one
   draw call per material on a placed object.

   THE TRAP, same shape as the Budget Table on purpose — it is the same
   lesson, applied to a smaller room so a team meets it twice across
   the two activities rather than needing a new lesson invented here:
     - the PROP CLUSTER is cheap in triangles but carries 14 separate
       materials, quietly eating most of the draw call budget
     - the ENVIRONMENT BACKDROP is almost flat geometry holding an 18MB
       texture, the texture-memory sink
   Reaching for the optimised variant, not deleting the object, is the
   point.
   ============================================================ */
(function () {
  "use strict";

  window.SCENE_CAPS = {
    tris:      60000,
    draws:     35,
    textureMB: 45,
  };

  window.SCENE_CATS = [
    { id: "setting",   label: "Setting piece",     category: "setting",   min: 1, max: 1 },
    { id: "decor",     label: "Supporting decor",  category: "decor",     min: 2, max: 4 },
    { id: "interface", label: "Interface element", category: "interface", min: 1, max: 1 },
  ];

  window.SCENE_ASSETS = [
    /* ---------------- Setting piece ---------------- */
    { id: "set-plane", name: "Ground Anchor Plane", category: "setting",
      tris: 200, materials: 1, textureMB: 1,
      note: "A flat anchor surface. Cheap on every axis, invisible to the customer." },
    { id: "set-backdrop", name: "Environment Backdrop Panel", category: "setting",
      tris: 400, materials: 1, textureMB: 18,
      note: "Almost no geometry. The whole asset is one large, un-compressed backdrop texture." },
    { id: "set-backdrop-comp", name: "Environment Backdrop Panel (compressed)", category: "setting",
      variantOf: "set-backdrop", tris: 400, materials: 1, textureMB: 6,
      note: "Same backdrop, KTX2-compressed. Costs a few minutes of pipeline work, keeps most of the detail." },

    /* ---------------- Supporting decor ---------------- */
    { id: "dec-cluster", name: "Prop Cluster", category: "decor",
      tris: 6200, materials: 14, textureMB: 5,
      note: "A handful of small objects grouped for set dressing. Every one of them got its own material." },
    { id: "dec-cluster-atlas", name: "Prop Cluster (atlased)", category: "decor",
      variantOf: "dec-cluster", tris: 6200, materials: 1, textureMB: 6,
      note: "Same cluster, all fourteen maps baked into one atlas. Costs 1MB, saves thirteen draw calls." },
    { id: "dec-particles", name: "Particle FX Emitter", category: "decor",
      tris: 300, materials: 2, textureMB: 3,
      note: "Sparkle, dust or glow. Cheap geometry, a small sprite sheet." },
    { id: "dec-label3d", name: "3D Signage Piece", category: "decor",
      tris: 1400, materials: 3, textureMB: 2,
      note: "A modelled sign or plaque rather than a flat overlay." },
    { id: "dec-crate", name: "Simple Set Prop", category: "decor",
      tris: 800, materials: 1, textureMB: 1,
      note: "A crate, box or plinth. Cheap on every axis. Every scene needs one of these." },

    /* ---------------- Interface element ---------------- */
    { id: "ui-plain", name: "Flat UI Panel", category: "interface",
      tris: 100, materials: 1, textureMB: 1,
      note: "A simple flat overlay panel. Cheap, unremarkable, gets the job done." },
    { id: "ui-anim", name: "Animated UI Panel", category: "interface",
      tris: 100, materials: 2, textureMB: 3,
      note: "Same flat panel, with an animated texture sheet for feedback states." },
    { id: "ui-3d", name: "3D-Modelled UI Frame", category: "interface",
      tris: 2200, materials: 4, textureMB: 4,
      note: "A real modelled frame around the interface, not a flat overlay. Reads as more considered." },
  ];

  window.SCENE_LEVERS = [
    { id: "decimate", ttl: "Decimated the mesh",        sub: "Fewer triangles, softer silhouette" },
    { id: "atlas",    ttl: "Merged materials / atlas",  sub: "Fewer draw calls, one big texture sheet" },
    { id: "texture",  ttl: "Cut texture resolution",    sub: "Less memory, softer detail up close" },
    { id: "compress", ttl: "Compressed the textures",   sub: "Keeps detail, costs pipeline work" },
    { id: "cut",      ttl: "Removed an object",         sub: "Cheapest of all, and the customer notices" },
  ];
})();
