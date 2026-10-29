# GUAVA white-background previews

The homepage uses the cleaned animation video and its matching poster.
The novel-view version is a local alternative and is not included in the published assets.

- `guava-white-animation-clean.mp4`: first 1–13 seconds of
  https://eastbeanzhang.github.io/GUAVA/static/videos/show-cross-reenactment.mp4
  (local source name `guava-cross.mp4`), cropped to the cyan-shirt and purple-shirt
  output subjects with their source-image insets. Original speed.
- `guava-white-views-clean.mp4`: first 12 seconds of
  https://eastbeanzhang.github.io/GUAVA/static/videos/show-novel-views-1.mp4
  (local source name `guava-view-1.mp4`), cropped to the same two subjects and
  their source-image insets. Original speed.

These are postprocessed versions of the authors' published black-background
videos, not native alpha renders. The current version uses macOS Vision person
segmentation for the main people and separate enlarged crops for the small
source-image insets. Masks are contracted by 1.5 output pixels before compositing
onto pure white. Large near-black connected regions from the original video
then clear segmentation spill outside the subjects, including beneath the cropped
torsos. Small dark facial details are excluded from that background classification.
This replaces the earlier color-threshold approach, which left
black fringes or damaged dark hair when its threshold was increased.

No generative model redraws the subjects. Segmentation is still an approximation:
very fine hair, motion-blurred fingers, or thin features can be softened or lost.
These presentation previews should not be used for quantitative comparisons or
presented as untouched original renderings. The source MP4s remain the reference
for the research results.

Reproduce both videos with:

```sh
python3 _preview/guava/make_candidates.py /path/to/original/videos
```

Requires macOS Vision/AVFoundation, swiftc, clang++, and ffmpeg
(`/opt/homebrew/bin/ffmpeg` in this local script). The system video decoder and
Vision compute service must be accessible; a restricted sandbox may block them.
Output: silent 720×450 H.264/yuv420p, 24fps, 12 seconds, fast-start metadata.
Six sampled frames per version were reviewed; a full decode check completed
without errors. The animation version provides a clearer view of face and hand
motion; the novel-view version better emphasizes 3D viewpoint changes.

Earlier threshold-only versions and the comparison page are local review artifacts;
they are not included in this publication.
