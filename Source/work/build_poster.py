import sys,math,io
sys.path.insert(0,'/private/tmp/colordisk-libs')
import pymupdf as fitz
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader,PdfWriter
from pypdf.generic import DecodedStreamObject,NameObject
from pathlib import Path
base=Path.cwd(); out=base/'outputs/color-wheel-poster-A3.pdf'
font='/System/Library/Fonts/Supplemental/'
pdfmetrics.registerFont(TTFont('Arial',font+'Arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold',font+'Arial Bold.ttf'))
src=fitz.open('/Users/raffribeiro/Downloads/The ColorDisk 7.pdf'); p=src[0]
# Remove only the contained signature artwork, leaving the large scientific field intact.
p.add_redact_annot(fitz.Rect(250,477,360,519),fill=False)
p.apply_redactions(images=0,graphics=1,text=0)
p.clean_contents()
# Clip to the exact circular disk, eliminating the original surrounding page layout.
cx,cy,r=304.5,304.8,260.0; yy=792-cy; k=.552284749831*r
clip=f'q {cx+r} {yy} m {cx+r} {yy+k} {cx+k} {yy+r} {cx} {yy+r} c {cx-k} {yy+r} {cx-r} {yy+k} {cx-r} {yy} c {cx-r} {yy-k} {cx-k} {yy-r} {cx} {yy-r} c {cx+k} {yy-r} {cx+r} {yy-k} {cx+r} {yy} c W n\n'
xref=p.get_contents()[0]; src.update_stream(xref,clip.encode()+src.xref_stream(xref)+b'\nQ')
clean=base/'work/disk.pdf'; src.save(clean)
W,H=297*mm,420*mm
buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=(W,H)); c.setTitle('Color Wheel | ColorDisk - A3'); c.setAuthor('Adaptacao do ColorDisk de Peter T. Donahue')
navy='#141D30'; muted='#586171'
def txt(x,y,s,size=10,bold=False,color=navy):
 c.setFillColor(color); c.setFont('ArialBold' if bold else 'Arial',size); c.drawString(x,y,s)
margin=19*mm
txt(margin,H-23*mm,'CHROMATIC ATLAS   /   01',9,True)
txt(margin,H-44*mm,'COLOR WHEEL',44,True)
txt(margin,H-55*mm,'HUE  /  CHROMA  /  ARTIST PIGMENTS',10,True,muted)
c.setStrokeColorRGB(.82,.84,.87); c.line(margin,H-64*mm,W-margin,H-64*mm)
# A 246 mm diameter keeps the diagram large while allowing a true polar angle scale.
R=123*mm; Cx=W/2; Cy=H-211*mm
for deg in range(0,360,15):
 a=math.radians(deg); x=Cx+(R+5*mm)*math.cos(a); y=Cy+(R+5*mm)*math.sin(a)
 c.setStrokeColorRGB(.25,.29,.36); c.setLineWidth(.4)
 c.line(Cx+(R+1*mm)*math.cos(a),Cy+(R+1*mm)*math.sin(a),Cx+(R+2.5*mm)*math.cos(a),Cy+(R+2.5*mm)*math.sin(a))
 c.setFont('Arial',8); c.setFillColor(navy); c.drawCentredString(x,y-2.5,str(deg)+'°')
footer=65*mm
c.setStrokeColorRGB(.82,.84,.87); c.line(margin,footer,W-margin,footer)
txt(margin,footer-9*mm,'READ THE DISK',9,True)
txt(margin,footer-16*mm,'Angle = hue. Distance from the center = chroma.',9,color=muted)
txt(margin,footer-22*mm,'Circles locate common artist pigments in the reference model.',9,color=muted)
txt(margin,footer-33*mm,'A COLOR MAP, NOT A PRINTED PAINT SWATCH',9,True)
txt(margin,footer-40*mm,'Printed colors are illustrative; paper, ink and color profiles affect reproduction.',8,color=muted)
txt(margin,16*mm,'Based on The ColorDisk 7.1 • Peter T. Donahue / @color.nerd • CC BY-NC 2.0',7,color=muted)
txt(margin,11*mm,'CIECAM02 reference • Pigment positions retained from the author’s vector artwork.',7,color=muted)
c.showPage(); c.save()
layout=fitz.open(stream=buf.getvalue(),filetype='pdf'); disk=fitz.open(clean)
rect=fitz.Rect(Cx-R,H-Cy-R,Cx+R,H-Cy+R)
layout[0].show_pdf_page(rect,disk,0,clip=fitz.Rect(cx-r,cy-r,cx+r,cy+r),keep_proportion=True)
layout.save(out,garbage=4,deflate=True)
check=fitz.open(out)
assert len(check)==1 and abs(check[0].rect.width-W)<.01 and abs(check[0].rect.height-H)<.01
check[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(base/'work/poster-preview.png')
print(out);print('A3 verified:',check[0].rect,'vector paths:',len(check[0].get_drawings()),'raster images:',len(check[0].get_images()))
