# Gregorio Orlando — portfolio

A single-page static portfolio for robotics and AI research, built for GitHub Pages.
No framework, no dependencies, no build step for the site itself: edit `index.html`, push, done.

Live at **https://gringoloco7.github.io/gringo_portfolio/**

---

## Layout

```
index.html                 The whole site. One page.
assets/css/site.css        All styling. Design tokens at the top.
assets/js/site.js          Mobile menu, clip playback, scroll reveal.
assets/img/<project>/      Optimised web media (committed).
assets/cv/                 The published CV.
tools/build-assets.py      Turns projects_assets/ into assets/img/.
projects_assets/           Original full-res photos and video. NOT committed.
me.md, CV.pdf              Private source material. NOT committed.
```

`.gitignore` keeps `projects_assets/`, `me.md` and `CV.pdf` out of the repository. GitHub Pages
serves every committed file publicly, so leave those entries alone.

---

## Adding or replacing images and video

Originals go in `projects_assets/<project>/`. Then:

```bash
python tools/build-assets.py
```

That resizes photos to WebP, turns GIFs into small looping MP4s, trims and compresses video, and
writes a poster frame for every clip into `assets/img/`. The 340 MB of originals become about 7 MB
of web assets — worth re-running rather than hand-optimising.

To add a **new** file, open `tools/build-assets.py` and add one line to `main()`:

```python
img("botzo/new_photo.jpg",  "botzo/new.webp", 1100)          # image, 1100px wide
vid("botzo/new_clip.mp4",   "botzo/new.mp4", 1000, ss=4, t=20, speed=2.0)   # clip: skip 4s, take 20s, 2x
frame("botzo/long.mp4",     "botzo/still.webp", 60)          # single still at 60s
```

Then reference it in `index.html`.

### Putting media on the page

An image:

```html
<figure class="fig m3">
  <img src="assets/img/botzo/new.webp" width="1100" height="825" loading="lazy" decoding="async"
       alt="Describe what is in the picture.">
  <figcaption>Caption.</figcaption>
</figure>
```

A clip:

```html
<figure class="fig m3">
  <div class="clipwrap" style="--ar: 16 / 10">
    <video width="1000" height="625" poster="assets/img/botzo/new-poster.webp"
           muted loop playsinline preload="none" controls aria-label="What happens in the clip.">
      <source src="assets/img/botzo/new.mp4" type="video/mp4">
    </video>
  </div>
  <figcaption>Caption.</figcaption>
</figure>
```

Clips ship paused with a poster and controls, so they work with no JavaScript. When JavaScript runs
and the visitor has not asked for reduced motion, the controls come off and the clip loops silently
**only while it is on screen** — so a page full of video stays cheap.

**Always write real `alt` text**, and always set `width`/`height` to the file's true pixel size — that
is what stops the page jumping as images load.

### Sizing classes

Figures sit in a six-column bed. `<div class="mgrid">` opens a row; each figure takes
`m2` (a third), `m3` (a half), `m4` (two thirds) or `m6` (full width). They collapse to one column
on phones automatically.

| Class | Use |
|---|---|
| `fig--pad` | Diagrams and renders — letterboxed on white instead of bleeding to the edge |
| `fig--crop` + `style="--ar: 4 / 3"` | Force a ratio by cropping. Use to align a row of photos |
| `fig--fit` + `style="--ar: 4 / 3"` | Force a ratio by letterboxing. Use to align a row of diagrams |

Rows look untidy when the sources have different shapes — that is what `fig--crop` and `fig--fit`
are for.

---

## Editing text

It is all plain HTML in `index.html`, in the order it appears on screen: hero, projects, also built,
about, experience, skills, gallery, footer. Each project is one `<article class="proj">` with a
heading block and then its media rows.

To change the look, every colour, font and spacing value is a CSS custom property under `:root` at
the top of `assets/css/site.css`. Change `--accent` and it propagates everywhere. Dark mode has its
own block below and follows the visitor's system setting.

---

## Running it locally

```bash
python -m http.server 8000
# http://localhost:8000
```

Use a server, not `file://` — relative paths and video behave differently otherwise.

---

## Deploying

Settings → Pages → Build and deployment → Deploy from a branch → `main`, folder `/ (root)`.

`.nojekyll` is already present so GitHub serves the files as-is. Every path is relative, so the site
works from `/gringo_portfolio/` without changes.

See `ASSETS.md` for the handful of facts worth confirming before you share the link.
