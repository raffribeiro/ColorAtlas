import sys,math,io,statistics
sys.path.insert(0,'/private/tmp/colordisk-libs')
import pymupdf as fitz
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
from pathlib import Path
base=Path.cwd(); src=fitz.open('/Users/raffribeiro/Downloads/The ColorDisk 7.pdf'); p=src[0]
pix=p.get_pixmap(matrix=fitz.Matrix(2,2)); im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
fonts='/System/Library/Fonts/Supplemental/'
for n,f in [('A','Arial.ttf'),('B','Arial Bold.ttf'),('N','Arial Narrow.ttf')]:pdfmetrics.registerFont(TTFont(n,fonts+f))
W,H=297*mm,420*mm; CX=W/2; CY=H-216*mm; R=122*mm; scale=R/260; sx,sy=304.5,304.8
out=base/'outputs/color-wheel-rebuilt-A3.pdf'; c=canvas.Canvas(str(out),pagesize=(W,H));c.setTitle('CHROMA / Color Wheel - A3');c.setAuthor('Vector reconstruction based on Peter T. Donahue ColorDisk 7.1')
ink=(.06,.08,.12)
def text(x,y,s,size=10,font='A',color=ink,center=False):
 c.setFillColorRGB(*color);c.setFont(font,size)
 (c.drawCentredString if center else c.drawString)(x,y,s)
def point(r,a):
 a=math.radians(a);return CX+r*math.cos(a),CY+r*math.sin(a)
def sector(r0,r1,a0,a1,color):
 path=c.beginPath();x,y=point(r1,a0);path.moveTo(x,y)
 path.arc(CX-r1,CY-r1,CX+r1,CY+r1,a0,a1-a0)
 if r0:
  x,y=point(r0,a1);path.lineTo(x,y);path.arc(CX-r0,CY-r0,CX+r0,CY+r0,a1,a0-a1)
 else:path.lineTo(CX,CY)
 path.close();c.setFillColorRGB(*color);c.drawPath(path,fill=1,stroke=0)
def sample(a,r):
 x=int((sx+r*math.cos(math.radians(a)))*2);y=int((sy-r*math.sin(math.radians(a)))*2)
 colors=[]
 for dx in range(-7,8):
  for dy in range(-7,8):
   rgb=im.getpixel((x+dx,y+dy));
   if max(rgb)-min(rgb)>35 and max(rgb)>95:colors.append(rgb)
 if not colors:colors=[im.getpixel((x,y))]
 return tuple(statistics.median(v[i] for v in colors)/255 for i in range(3))
# Entire color field is newly drawn as regular vector sectors and circular bands.
for j in range(144):
 a=j*2.5; outer=sample(a+1.25,250);basecol=sample(a+1.25,212)
 sector(R*.89,R,a,a+2.52,outer)
 for ring in range(12):
  r0=R*.89*ring/12;r1=R*.89*(ring+1)/12
  t=((ring+.5)/12)**.82; col=tuple(.48*(1-t)+v*t for v in basecol)
  sector(r0,r1,a,a+2.52,col)
c.setStrokeColorRGB(.12,.17,.23);c.setStrokeAlpha(.16);c.setLineWidth(.35)
for j in range(1,13):c.circle(CX,CY,R*.89*j/12,fill=0,stroke=1)
for a in range(0,360,15):
 x,y=point(R*.89,a);c.line(CX,CY,x,y)
c.setStrokeAlpha(1)
# Degree ticks are constructed with exact polar geometry.
for a in range(360):
 if a%5:continue
 x,y=point(R+1.1*mm,a);xx,yy=point(R+(3 if a%15==0 else 1.9)*mm,a)
 c.setStrokeColorRGB(*ink);c.setLineWidth(.55 if a%15==0 else .25);c.line(x,y,xx,yy)
 if a%15==0:
  xx,yy=point(R+6*mm,a);text(xx,yy-2.5,f'{a}°',7.5,'A',center=True)
# Names form an evenly typeset outer ring, with orientation adjusted for readability.
for a,name in [(96,'LIME'),(60,'YELLOW'),(29,'ORANGE'),(0,'RED'),(327,'PINK'),(274,'PURPLE'),(232,'BLUE'),(170,'TURQUOISE'),(138,'GREEN')]:
 x,y=point(R*.945,a);c.saveState();c.translate(x,y);rot=a-90
 if 180<a<360:rot+=180
 c.rotate(rot);text(0,-4,name,13,'B',center=True);c.restoreState()
# Pigment coordinates come from the original vector marker paths, not the generated image.
for i,d in enumerate(p.get_drawings()):
 if i not in range(99,190,2):continue
 r=d['rect'];x=(r.x0+r.x1)/2;y=(r.y0+r.y1)/2
 X=CX+(x-sx)*scale;Y=CY-(y-sy)*scale
 c.setFillColorRGB(*ink);c.setStrokeColorRGB(1,1,1);c.setLineWidth(1.2);c.circle(X,Y,4.45*scale,fill=1,stroke=1)
# Retain label anchors, but reset every label with a clean embedded font.
for b in p.get_text('dict')['blocks']:
 for l in b.get('lines',[]):
  for s in l['spans']:
   st=s['text'];bb=s['bbox']
   if bb[1]>=470:continue
   if st.startswith(('PY','PG','PB','PV','PR','PO','PBr','†')) or st in ['RU','BU','♂V']:
    if st in ['PURPLE','PINK']:continue
    ox,oy=s['origin'];X=CX+(ox-sx)*scale;Y=CY-(oy-sy)*scale
    text(X,Y,st,7.7*scale,'N',(1,1,1))
c.setFillColorRGB(1,1,1);c.circle(CX,CY,3.0,fill=1,stroke=0)
# Bold editorial hierarchy and clear scientific provenance.
m=19*mm
text(m,H-24*mm,'CHROMA',48,'B')
text(m,H-38*mm,'COLOR WHEEL',17,'B')
text(W-62*mm,H-22*mm,'HUE / CHROMA',9,'B')
text(W-62*mm,H-28*mm,'PIGMENT ATLAS',9,'B')
text(W-62*mm,H-37*mm,'01  /  CIECAM02',8,'A')
c.setStrokeColorRGB(*ink);c.setLineWidth(1);c.line(m,H-48*mm,W-m,H-48*mm)
text(m,H-57*mm,'A map of color relationships.',10,'A')
text(m,60*mm,'ANGLE',9,'B');text(m,53*mm,'Hue in degrees',8)
text(111*mm,60*mm,'RADIUS',9,'B');text(111*mm,53*mm,'Chroma in the reference model',8)
text(211*mm,60*mm,'MARKERS',9,'B');text(211*mm,53*mm,'Artist pigment positions',8)
c.setLineWidth(.5);c.line(m,45*mm,W-m,45*mm)
text(m,36*mm,'Scientific positions. Illustrative colors.',11,'B')
text(m,29*mm,'Color fields reconstructed for this poster; not calibrated paint samples.',8)
text(m,23*mm,'Printed appearance depends on the paper, printer and color profile.',8)
text(m,14*mm,'Adapted from The ColorDisk 7.1 • Peter T. Donahue / @color.nerd • CC BY-NC 2.0',7)
text(m,9*mm,'Pigment marker positions retained from the original. Polar grid and artwork rebuilt as vectors.',7)
c.showPage();c.save()
doc=fitz.open(out);assert len(doc)==1 and len(doc[0].get_images())==0
assert abs(doc[0].rect.width-W)<.01 and abs(doc[0].rect.height-H)<.01
preview=base/'outputs/color-wheel-rebuilt-preview.png';doc[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(preview)
print(out);print('A3 verified; vector paths:',len(doc[0].get_drawings()),'; raster images:',len(doc[0].get_images()))
