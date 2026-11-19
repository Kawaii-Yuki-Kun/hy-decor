# HyDecor website — local redesign

**Last updated:** 2026-11-19
**Repo:** none (local folder, not under git). Source: a `wget --mirror` of the live site `https://hy-decor.com/` (Vercel, static) taken 2026-11-19, then redesigned locally.
**Stack:** one static HTML page (`index.html`, inline CSS + JS) plus per-area CSS/JS files and video assets. No build step, no framework, no backend.
**Environments:** local only — `python3 -m http.server 8790 --bind 127.0.0.1` from this folder → http://127.0.0.1:8790/. Nothing here is deployed; the live site is unchanged.

## Table of Contents
1. [What it is](#1-what-it-is)
2. [Structure](#2-structure)
3. [Pages and sections](#3-pages-and-sections)
4. [Motion system](#4-motion-system)
5. [Video assets](#5-video-assets)
6. [Running and editing](#6-running-and-editing)
7. [Known limitations](#7-known-limitations)
8. [Change Log](#8-change-log)

## 1. What it is
Marketing site for HyDecor, a Lebanese family atelier (since 1918, four generations) making statues, reliefs, lamps, columns and architectural décor. 110 catalog pieces in 9 categories. All inquiries go to WhatsApp (`wa.me/9613307019`). No forms post anywhere; the inquiry form builds a WhatsApp URL (`action="https://api.whatsapp.com/send" method="get"`).

## 2. Structure
```
hy-decor.com/
├── index.html               ← the whole site (hash "pages", see §3). Main <style> has 3 layers:
│                               original · "2026 visual redesign layer" · "2026-11 motion & polish layer" (§1–§11)
├── index.original.html      ← untouched copy of the downloaded page (rollback)
├── css/site-motion.css      ← shared: hover-on-motion, parallax hint, door, fly-through, closing film, About film, Custom hero film
├── js/site-motion.js        ← shared: parallax engine, homepage parallax targets, fly-through player, door, video play/pause
├── css|js/motion-about.*            ← About page (#about) motion, scoped under #about
├── css|js/motion-collection.*       ← Collection (#collection): search + Category/Height menus (`.mc-dd`, original `.filters`/`#size` kept hidden and still filter), "Show 12 more" (`.mc-more`, no scroll jump; `overflow-anchor:none` on #collection), card motion, lightbox polish
├── css|js/motion-custom-contact.*   ← #custom, #contact, picker .pk, footer links: press glow, filled empty areas, form polish
├── img/ img/w/ detail/ family/      ← product + detail photos (from the live site)
├── video/                           ← all films (§5), ~19 MB
└── robots.txt  sitemap.xml  logos/icons
```
Inline scripts in `index.html` (in order): reveal (`.rv` → `.in`), hero film control, atelier medallion control, the layer script (odometer numbers `.odo`, atelier `.journey` progress), header active-page script. Then deferred: `site-motion.js`, `motion-about.js`, `motion-collection.js`, `motion-custom-contact.js`.

## 3. Pages and sections
Pages are `<section class="page" id="…">`, shown via `:target` (`.page{display:none}`). Internal links are `index.html#xxx` (wget rewrote `#xxx`).

| Page | Key sections |
|---|---|
| `#home` | hero (horse film `.hv`, two slow gold lines `.hero-lines`) · "Browse by category" `.make` · "Our story" `#heritage` (door `.door`, stats band `.her2-stats`, timeline `.vtl`) · fly-through `.fly` · "Inside the atelier" `#atelier` (medallion, journey, details) · Selected pieces · custom teaser |
| `#about` | hero · story · Four generations film `.gen-film` · family `#family` · image strip |
| `#collection` | featured · full collection with search/filters/pagination · product targets `#ref-NNN` · category anchors `#cat-*` · lightbox `#lb` |
| `#custom` | hero with "Sketch to gilt" film `.sk-stage` · steps · spaces · start from collection · trust strip |
| `#contact` | WhatsApp card · inquiry form `#inqForm` + piece picker `.pk` · injected "How an inquiry works" + atelier card |
| shared | header `.hdr` (active page = `.nav a.is-active`) · closing `.final` (gold-lights film `.final-fx`, screen-blended) · footer `.ftr` · floating `.wa-float` (≥1360px) / `.wa-bar` (<1360px) |

## 4. Motion system
- Tokens: `--ease-out:cubic-bezier(.16,1,.3,1)`, `--gold-grad`, `--gold-hi/-mid/-deep` (motion layer, `index.html`).
- Parallax: any element with `data-px="<speed>"` gets `style.translate` (independent of `transform`) in `js/site-motion.js`; capped ±140px; rescans on hashchange.
- Odometer numbers: `.mk-n`, `.her2-year` (not on the door), `.tn`, `.hs-n` — digit strips roll to value when 60% visible.
- Door: `.her2-frame` cloned into two leaves (`.door-l/.door-r`, clip-path halves, rotateY); click/Enter opens and plays `generations-door.*`; Escape/× closes.
- Fly-through: `.fly` 320vh with sticky canvas; 120 JPEG frames scrubbed by scroll; arch-shaped clip opens to full screen; ends washing to ivory and crossfades into `#atelier`, which sits underneath (`margin-bottom:-100vh`).
- Reduced motion: every layer disables motion; the fly-through stays hidden; videos pause / show posters.
- Section heads (`.sx`, `js/site-motion.js`): every eyebrow+heading group outside heroes rises in sequence, eyebrow line draws, heading gets one gold glint (`.sx-g`, replays on hover). Skipped where a page script already animates the head.
- Owner taste (2026-11-19): slow smooth gold hairlines, draw-ins, restraint. Avoid: blobby hover background changes, dashed rotating rings, orbiting dots, flickering numbers, too many lines.

## 5. Video assets
| File(s) | Source | Used in |
|---|---|---|
| `hero-horse(.mp4/-1280.mp4/.webm)`, posters, `hero-horse-end.jpg` | owner's Gemini clip, trimmed 1.0 s (hard cut that flipped direction) | homepage hero, plays once, ends on logo |
| `atelier-medal.*` | Remotion `src/Medallion.tsx` | atelier head |
| `final-lights.*` | Remotion `src/final/` (black bg, `mix-blend-mode:screen`) | closing section, all pages |
| `generations.*`, `generations-door.*` | Remotion `src/generations/` | About film; homepage door |
| `sketch-gilt.*` | Remotion `src/sketch/` | Custom hero (replaced bronze figure photo `img/040`) |
| `fly/f000–f119.jpg`, `fly-sm/…` | Remotion `src/flythrough/` | homepage fly-through (<900px uses `fly-sm`) |

Remotion project: `../hy-decor-remotion/` (has its own APP_OVERVIEW.md with render commands).

## 6. Running and editing
`cd` here, `python3 -m http.server 8790 --bind 127.0.0.1`. Port 8765 on 127.0.0.1 is used by another local project (VineWood) — don't use it. Edit page-specific motion in the matching `css|js/motion-*.{css,js}`; shared behaviour in `site-motion.*`.

## 7. Known limitations
- 2026-11-19 — Remotion licence: free only for individuals/small companies; confirm HyDecor qualifies before publishing.
- 2026-11-19 — No Instagram link exists on the site; an Instagram section awaits the handle.
- 2026-11-19 — Collection: result line `#result` is rewritten twice per change (screen readers may announce twice); mobile `#cat-*` link lands ~6px from top (original script).
- 2026-11-19 — Picker close is instant (original handlers left untouched).
- 2026-11-19 — About strip pedestal photo has a stray mark baked into the image.
- 2026-11-19 — Generations film captions ("Shaped by hand, given colour", etc.) were written by us; awaiting owner approval.

## 8. Change Log
| Date | Change |
|---|---|
| 2026-11-19 | Round 3: About values on one line; site-wide section-head entrance; Collection ornament removed, tabs → two menus, pagination → Show more (no scroll). |
| 2026-11-19 | Closing film now runs on into the footer: `.final` extended by `--fx-run` (160px; 110px on phones), footer overlaps it with a transparent-top gradient, film masked to fade out. |
| 2026-11-19 | Mirrored hy-decor.com; motion/polish redesign across all pages; horse hero film; Remotion medallion, gold-lights, generations, sketch-to-gilt, fly-through; door; parallax; collection search/filter/pagination; header active-page fix (wget broke `href="#…"` selectors). |
