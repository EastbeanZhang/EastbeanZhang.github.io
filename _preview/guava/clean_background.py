"""Remove low-confidence segmentation spill only over black source pixels."""
import subprocess
import sys
import ctypes
import tempfile
from pathlib import Path
FFMPEG='/opt/homebrew/bin/ffmpeg'

def clean(source, matte, output):
    temp=tempfile.TemporaryDirectory()
    library=Path(temp.name)/'background.dylib'
    subprocess.run(['clang++','-O2','-std=c++17','-dynamiclib',str(Path(__file__).with_name('known_background.cpp')),'-o',str(library)],check=True)
    native=ctypes.CDLL(str(library)).clear_background
    native.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_int,ctypes.c_int]
    native.restype=None
    readers=[subprocess.Popen([FFMPEG,'-v','error','-i',str(p),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE) for p in (source,matte)]
    writer=subprocess.Popen([FFMPEG,'-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','720x450','-r','24','-i','-','-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
    size=720*450*3
    count=0
    while True:
        a=readers[0].stdout.read(size)
        b=readers[1].stdout.read(size)
        if not a and not b: break
        if len(a)!=size or len(b)!=size: raise RuntimeError('Mismatched or incomplete video frames')
        original=ctypes.create_string_buffer(a)
        result=ctypes.create_string_buffer(b)
        native(original,result,720,450)
        writer.stdin.write(result.raw[:size])
        count+=1
    writer.stdin.close()
    for process in readers+[writer]:
        if process.wait()!=0: raise RuntimeError('Video decode/encode failed')
    temp.cleanup()
    print(f'Cleaned {count} frames',flush=True)

if __name__=='__main__': clean(*sys.argv[1:4])
