# Local homepage preview

Run from the repository root:

```sh
python3 _preview/serve.py --port 8765
node --check assets/js/homepage.js
node --test _preview/check_behavior.cjs
git diff --check
```

Open http://127.0.0.1:8765/. The server inserts the HTML body of
`_pages/about.md` into `_layouts/homepage.html` and serves local images/assets.
This checks the actual homepage templates but is not a full Jekyll build.
The local Ruby environment currently lacks the repository's Jekyll dependencies.
No commit, push, or deployment is required for this preview.

## Presentation and behavior

- Pure white page background; 20px introduction (18px on phones), 22px
  publication titles, 16px summaries, and 15px author names.
- Author lists retain source order and show as many complete names as fit on one
  line, then “et al.”; at least two names remain, wrapping only when necessary.
  Full names remain in HTML data and the author row's hover title.
- Videos load when visible, pause offscreen or when the tab is hidden, and have
  individual pause buttons. Reduced-motion/data-saving preferences keep posters
  until a visitor explicitly plays a clip. Failed videos fall back to posters.
- Stars appear only when the count is strictly greater than 100. The HTML holds
  an October 29, 2026 snapshot. Public GitHub API requests refresh counts with a
  six-hour browser cache; network failure retains the dated snapshot.

## Media provenance

All previews are derived from existing videos on the author's research project
pages, with no synthesized research results:

| Project | Source files | Edit |
| --- | --- | --- |
| [EMOSH](https://eastbeanzhang.github.io/EMOSH/) | `emosh-mesh.mp4`, `emosh-woman.mp4`, `emosh.mp4` | Synchronized driving mesh/result pairs; woman then man, 4.8s each |
| [GUAVA](https://eastbeanzhang.github.io/GUAVA/) | `guava-cross.mp4` (`show-cross-reenactment.mp4`) | Cyan/purple subjects with reference insets, 1–13s; postprocessed white background |
| [HRAvatar](https://eastbeanzhang.github.io/HRAvatar/) | `hravatar.mp4` (`show_animation_relighting.mp4`) | First two subjects, 0.5–10.5s, showing expressions and changing lighting |
| [GS-W](https://eastbeanzhang.github.io/GS-W/) | `gsw.mp4` | Full Brandenburg Gate view/appearance sequence at 2.5× speed |

The EMOSH sources are in `static/videos/crossact/`:
`buleman_dance_mesh.mp4`, `woman3_to_buleman_dance_crossact.mp4`, and
`012_to_buleman_dance_crossact.mp4`.

Videos are silent H.264/yuv420p, 720×450 at 24fps, with fast-start metadata.
Aspect ratios are preserved with padding. JPEG posters are sampled from each
finished preview. To regenerate, put the named source files in a directory and
run `python3 _preview/make_previews.py /path/to/sources` with ffmpeg available.

The homepage uses the approved white-background GUAVA animation
preview. This is a postprocessed version of the black-background source, not a
native alpha render. Reproduce it separately with
`python3 _preview/guava/make_candidates.py /path/to/sources`; its macOS Vision
pipeline and limitations are documented in `_preview/guava/README.md`.
The main `make_previews.py` still reproduces the earlier black-background GUAVA
asset for reference; it does not overwrite the selected white-background file.
