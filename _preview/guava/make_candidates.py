"""Create white-background GUAVA previews with macOS Vision person segmentation."""
import subprocess
import sys
import tempfile
from pathlib import Path
from clean_background import clean
src=Path(sys.argv[1])
root=Path(__file__).resolve().parents[2]
out=root/'assets/previews'
ffmpeg='/opt/homebrew/bin/ffmpeg'
with tempfile.TemporaryDirectory() as tmp:
    temp=Path(tmp)
    binary=temp/'segment_video'
    subprocess.run(['swiftc','-suppress-warnings','-module-cache-path',str(temp/'swift-cache'),str(Path(__file__).with_name('segment_video.swift')),'-o',str(binary)],check=True)
    cases=[('guava-white-animation-clean','guava-cross.mp4','trim=1:13,setpts=PTS-STARTPTS,crop=896:540:1024:0,pad=960:600:32:30:black,scale=720:450','animation',2),
           ('guava-white-views-clean','guava-view-1.mp4','trim=0:12,setpts=PTS-STARTPTS,crop=1300:682:620:0,scale=960:504,pad=960:600:0:48:black,scale=720:450','views',4)]
    for name,file,filters,kind,poster in cases:
        original=temp/(name+'-original.mp4')
        matte=temp/(name+'-matte.mp4')
        subprocess.run([ffmpeg,'-y','-hide_banner','-loglevel','error','-i',str(src/file),'-vf',filters+',fps=24,setsar=1','-an','-c:v','libx264','-crf','14',str(original)],check=True)
        subprocess.run([str(binary),str(original),str(matte),kind],check=True)
        clean(original,matte,out/(name+'.mp4'))
        subprocess.run([ffmpeg,'-y','-hide_banner','-loglevel','error','-ss',str(poster),'-i',str(out/(name+'.mp4')),'-frames:v','1','-q:v','2',str(out/(name+'.jpg'))],check=True)
        print(name,flush=True)
