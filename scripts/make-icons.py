"""Render the app's simple geometric mark, without external assets."""
from pathlib import Path
import struct
import zlib

root = Path(__file__).resolve().parent.parent / 'assets'
def chunk(name, data):
    return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data) & 0xffffffff)

for size in (180, 192, 512):
    pixels = bytearray()
    for row in range(size):
        pixels.append(0)
        for col in range(size):
            x, y = col * 512 / size, row * 512 / size
            color = (79, 36, 149)
            if (116 <= x <= 174 and 140 <= y <= 374) or (174 <= x <= 210 and 140 <= y <= 306) or ((x-210)**2 + (y-223)**2 <= 83**2 and x>=174): color=(255,255,255)
            if (x-210)**2 + (y-223)**2 <= 30**2: color=(79,36,149)
            if (x-360)**2 + (y-185)**2 <= 40**2: color=(255,105,79)
            if 320 <= x <= 400 and 264 <= y <= 374: color=(103,216,198)
            pixels.extend(color)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(pixels)))+chunk(b'IEND',b'')
    (root / f'icon-{size}.png').write_bytes(png)
print('Created three app icons')
