# -*- coding: utf-8 -*-
"""Show actual app interpolation on ramps and a shared synthetic shading mask."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
import json

rows = json.loads(Path('work/tone-expansion-preview.json').read_text())
im = Image.new('RGB', (1500, 700), '#0f141c')
draw = ImageDraw.Draw(im)
fontpath = '/System/Library/Fonts/Supplemental/Arial.ttf'
font = ImageFont.truetype(fontpath, 16)
small = ImageFont.truetype(fontpath, 13)
title = ImageFont.truetype(fontpath, 26)
draw.text((24, 20), 'COLOR ATLAS · 12 NEW TONE SHIFTS', font=title, fill='#e6edf4')
draw.text((24, 57), '12 palettes · independent hue/chroma · shared OKLab lightness · neutral-value comparison below each ramp', font=small, fill='#afc0d3')
light = (-.65, -.4, .64)
norm = math.sqrt(sum(v*v for v in light))
light = tuple(v/norm for v in light)

for i, p in enumerate(rows):
    x, y = 24+(i % 3)*492, 108+(i//3)*140
    draw.text((x, y), p['name'].replace('Tone Shift · ', ''), font=font, fill='#dce7f1')
    pixels = p['pixels']
    for col in range(330):
        draw.line((x+col, y+35, x+col, y+67), fill=tuple(pixels[round(col/329*1024)]))
    for col in range(330):
        gray = p['grayPixels'][round(col/329*1024)]
        draw.line((x+col, y+75, x+col, y+85), fill=(gray, gray, gray))
    draw.text((x, y+96), f"{p['count']} keys · Smooth", font=small, fill='#94adc7')
    cx, cy, radius = x+400, y+57, 51
    # Continuous half-light mask: dim ambient shadow, then soft direct light.
    for sy in range(-radius, radius+1):
        for sx in range(-radius, radius+1):
            nx, ny = sx/radius, sy/radius
            square = nx*nx+ny*ny
            if square > 1:
                continue
            nz = math.sqrt(1-square)
            diffuse = nx*light[0]+ny*light[1]+nz*light[2]
            t = .32+.13*diffuse if diffuse <= 0 else .32+.66*diffuse**.75
            im.putpixel((cx+sx, cy+sy), tuple(pixels[round(max(0, min(1, t))*1024)]))

draw.text((24, 677), 'Identical lighting for every sphere. Color ramps differ; their neutral equivalents retain the same tonal relationships.', font=small, fill='#94adc7')
im.save('outputs/tone-expansion-palettes.png')
