# Effervescence 2027 — landing page

**Live demo:** https://aarav471471.github.io/effervescence-2027/ (add `?motion=1` to force full motion)

Static site: no build step, no framework. Open with any static server:

```bash
python -m http.server 8766
```

Then visit http://localhost:8766. Add `?motion=1` to force full motion on machines whose OS asks for
reduced motion (Windows "Animation effects: off" does this).

## How the parallax works

The hero is a paper-cut diorama: every painted piece in `assets/` is its own plane in `index.html`,
tagged with `data-depth` (0 = far sky, 1 = foreground arch). `js/main.js` moves each plane by its depth on:

- **mouse move**: deeper planes shift more
- **scroll**: the hero is 240vh tall with a sticky stage; scrolling scales the near planes past the camera
  (the arch flies away, the palms part, the carpet swoops in)
- **load**: planes stand up one after another like a pop-up book, once the images have decoded

Any element with `data-speed="0.1"` gets vertical scroll parallax relative to its parent.
The schedule is a pinned horizontal scroll; the carpet follows `#flightPath`.

The **About** section is a second painted diorama (pillar arch, blossom branch, music pavilion, skyline, sitar,
table lantern). Each `.pc` piece has `data-from="x,y"` (offset in vw/vh it flies in from as the section arrives)
and `data-drift` (scroll + mouse parallax strength). Cream cloud banks swallow the bottom of the hero, and the
three pillars (Showcases / Competitions / Campus Life) sit between flowering bushes above a cloud strip.

## Editing content

| What | Where |
|---|---|
| Events, categories, colours | `EVENTS` / `CAT` at the top of `js/main.js` |
| Campus map places (48, with x/y and descriptions) | `PLACES` in `map/index.html` |
| "Jump to" chips on the landing page | `#jumps` buttons in `index.html` (`data-place` = a place id from `map/index.html`) |
| Seed wishes | `SEED_WISHES` in `js/main.js` |
| Schedule, copy, stats | `index.html` |
| Colours, fonts | `:root` in `css/style.css` |

Event names, schedule times and stats are **placeholders**. Gallery frames show "Photo coming soon":
put real photos in as `<img>` inside `.gframe__img`.

## Campus map

`map/` is the interactive atlas as its own page (full screen at `/map/`, deep links like `/map/#sac`).
The landing page embeds it in the unrolling scroll as `map/?embed=1`, loaded only as the section approaches.
A cover keeps page scrolling free until the visitor taps to explore; the chips send the carpet to a place
with `postMessage({ type: 'effe:place', id })`.

## Not wired up yet

- **Notify me** form only shows a message. Connect it to a mailing list or backend in `main.js`.
- **Wishes** are saved in the visitor's own browser (`localStorage`). For a shared wish wall, post them
  to a backend and load them instead of `SEED_WISHES`.

## Assets

`assets/*.webp` are the painted layers, cropped and compressed from the original PNGs (about 2.2 MB total).
`assets/icons/*.svg` and `assets/divider-*.svg` come from the components pack. `js/scene.js` still draws the campus map
and a few cloud dividers as SVG.

After changing CSS/JS, bump the `?v=` number on the links in `index.html` so browsers fetch the new files.
