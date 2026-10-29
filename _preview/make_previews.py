"""Create compact, silent previews from the authors' existing project videos.

Usage: python3 _preview/make_previews.py /path/to/downloaded/source/videos
Source URLs and editorial choices are recorded in README.md in this directory.
"""
import subprocess
import sys
from pathlib import Path

source = Path(sys.argv[1])
out = Path(__file__).resolve().parents[1] / 'assets/previews'
out.mkdir(parents=True, exist_ok=True)


def encode(name, inputs, filters, complex_filter=False):
    args = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error']
    for item in inputs:
        args += ['-i', str(source / item)]
    args += ['-filter_complex' if complex_filter else '-vf', filters]
    if complex_filter:
        args += ['-map', '[out]']
    args += ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24',
             '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out / (name + '.mp4'))]
    subprocess.run(args, check=True)


# Each shot keeps the mesh and its matching generated result at the same source time.
em_filter = (
    '[0:v]split=2[m0][m1];'
    '[m0]trim=0:4.8,setpts=PTS-STARTPTS,fps=24,scale=360:360[a];'
    '[m1]trim=0:4.8,setpts=PTS-STARTPTS,fps=24,scale=360:360[b];'
    '[1:v]trim=0:4.8,setpts=PTS-STARTPTS,fps=24,scale=360:360[c];'
    '[2:v]trim=0:4.8,setpts=PTS-STARTPTS,fps=24,scale=360:360[d];'
    '[a][c]hstack=2,pad=720:450:0:44:color=0x101725[s0];'
    '[b][d]hstack=2,pad=720:450:0:44:color=0x101725[s1];'
    '[s0][s1]concat=n=2:v=1:a=0,setsar=1[out]'
)
encode('emosh', ['emosh-mesh.mp4', 'emosh-woman.mp4', 'emosh.mp4'], em_filter, True)

# Select complete panels from the original multi-person layouts, preserving their input insets.
encode('guava', ['guava-novel.mp4'],
       'trim=0:12,setpts=PTS-STARTPTS,crop=1280:620:0:0,fps=24,scale=720:-2,'
       'pad=720:450:0:(oh-ih)/2:color=0x000000,setsar=1')
encode('hravatar', ['hravatar.mp4'],
       'trim=0.5:10.5,setpts=PTS-STARTPTS,crop=960:540:0:0,fps=24,scale=720:-2,'
       'pad=720:450:0:(oh-ih)/2:color=0x101725,setsar=1')

# Preserve the full appearance/view sequence at 2.5x speed; no image geometry is stretched.
encode('gsw', ['gsw-sacre.mp4'],
       'setpts=0.4*(PTS-STARTPTS),fps=24,scale=720:450:force_original_aspect_ratio=decrease:force_divisible_by=2,'
       'pad=720:450:(ow-iw)/2:(oh-ih)/2:color=0x101725,setsar=1')

for name, timestamp in [('emosh', 2), ('guava', 4), ('hravatar', 3), ('gsw', 8)]:
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(timestamp),
                    '-i', str(out / (name + '.mp4')), '-frames:v', '1', '-q:v', '3',
                    str(out / (name + '.jpg'))], check=True)
    print(name, (out / (name + '.mp4')).stat().st_size, 'bytes', flush=True)
