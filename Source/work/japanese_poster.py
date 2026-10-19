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
W,H=297*mm,420*mm; CX=W/2; CY=H-191*mm; R=103*mm; scale=R/260; sx,sy=304.5,304.8
out=base/'outputs/color-wheel-japanese-A3.pdf'; c=canvas.Canvas(str(out),pagesize=(W,H));c.setTitle('CHROMA / Color Wheel - A3');c.setAuthor('Vector reconstruction based on Peter T. Donahue ColorDisk 7.1')
ink=(.06,.08,.12)
def text(x,y,s,size=10,font='A',color=ink,center=False):
 c.setFillColorRGB(*color);c.setFont(font,size)
 (c.drawCentredString if center else c.drawString)(x,y,s)
def point(r,a):
 a=math.radians(a);return CX+r*math.cos(a),CY+r*math.sin(a)
def sector(r0,r1,a0,a1,color):
 path=c.beginPath();x,y=point(r1,a0);path.moveTo(x,y)
 path.arcTo(CX-r1,CY-r1,CX+r1,CY+r1,a0,a1-a0)
 if r0:
  x,y=point(r0,a1);path.lineTo(x,y);path.arcTo(CX-r0,CY-r0,CX+r0,CY+r0,a1,a0-a1)
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
# Japanese poster inspired editorial composition.
m=19*mm; red=(.84,.12,.10)
text(m,H-25*mm,'CHROMA',49,'B')
text(m,H-39*mm,'ESTUDO DA COR',15,'B')
text(m,H-49*mm,'MATIZ / CHROMA / PIGMENTOS',8,'A')
c.setFillColorRGB(*red);c.circle(W-31*mm,H-24*mm,10*mm,fill=1,stroke=0)
text(W-31*mm,H-26*mm,'01',15,'B',(1,1,1),center=True)
text(W-62*mm,H-47*mm,'ATLAS CROMÁTICO',8,'B')
c.setStrokeColorRGB(*ink);c.setLineWidth(1);c.line(m,H-56*mm,W-m,H-56*mm)
# Narrow vertical editorial rail.
c.saveState();c.translate(17*mm,H-192*mm);c.rotate(90)
text(0,0,'COLOR SCIENCE   /   CIECAM02   /   PIGMENT MAP',7,'B',center=True);c.restoreState()
text(W/2,H-310*mm,'ÂNGULO = MATIZ     /     RAIO = CHROMA     /     CÍRCULOS = PIGMENTOS',7.7,'B',center=True)
c.setStrokeColorRGB(*ink);c.setLineWidth(.6);c.line(m,103*mm,W-m,103*mm)
text(m,95*mm,'03 DIMENSÕES DA COR',12,'B')
# A new vector HSL diagram, explicitly distinct from the CIECAM02 disk.
import colorsys
gx,gy=70*mm,58*mm;rr=32*mm
# A schematic cutaway cylinder: hue around, saturation outward, lightness vertically.
def iso(r,a,z):
 a=math.radians(a);return gx+r*math.cos(a),gy+.40*r*math.sin(a)+z
for layer in range(5):
 z=layer*5*mm; light=.16+layer*.15
 for a in range(0,300,10):
  for ring in range(1,5):
   r0=rr*(ring-1)/4;r1=rr*ring/4
   col=colorsys.hls_to_rgb(a/360,light,ring/4*.88)
   pts=[iso(r0,a,z),iso(r1,a,z),iso(r1,a+10,z),iso(r0,a+10,z)]
   path=c.beginPath();path.moveTo(*pts[0])
   for pt in pts[1:]:path.lineTo(*pt)
   path.close();c.setFillColorRGB(*col);c.setStrokeColorRGB(1,1,1);c.setLineWidth(.2);c.drawPath(path,fill=1,stroke=1)
   if ring==4 and 180<=a<300:
    pts=[iso(r1,a,z),iso(r1,a+10,z),iso(r1,a+10,z-5*mm),iso(r1,a,z-5*mm)]
    path=c.beginPath();path.moveTo(*pts[0])
    for pt in pts[1:]:path.lineTo(*pt)
    path.close();c.setFillColorRGB(*(v*.8 for v in col));c.drawPath(path,fill=1,stroke=1)
c.setStrokeColorRGB(*red);c.setLineWidth(1.6)
c.line(gx,gy-8*mm,gx,gy+31*mm)
c.line(gx,gy+9*mm,gx+35*mm,gy-5*mm)
text(gx+2*mm,gy+32*mm,'LUMINOSIDADE',6.5,'B',red)
text(gx+12*mm,gy-10*mm,'SATURAÇÃO',6.5,'B',red)
text(gx-33*mm,gy-22*mm,'MATIZ = POSIÇÃO AO REDOR',6.5,'B')
text(126*mm,87*mm,'Mesmo grupo de matiz.',10,'B')
text(126*mm,80*mm,'Saturação e luminosidade diferentes.',9,'A')
for x,col,name in [(132*mm,(1,.83,.03),'AMARELO CÁDMIO'),(212*mm,(.70,.48,.16),'OCRE')]:
 c.setFillColorRGB(*col);c.circle(x,65*mm,5*mm,fill=1,stroke=0);text(x+8*mm,64*mm,name,7.5,'B')
text(126*mm,52*mm,'Exemplos ilustrativos; não são amostras medidas.',7,'A')
text(126*mm,45*mm,'Esquema HSL: luminosidade no eixo vertical,',7.3,'A')
text(126*mm,40*mm,'saturação do centro à borda e matiz ao redor.',7.3,'A')
text(126*mm,32*mm,'Saturação HSL e chroma CIECAM02 são medidas distintas.',7,'B')
c.setStrokeColorRGB(*ink);c.setLineWidth(.5);c.line(m,24*mm,W-m,24*mm)
text(m,17*mm,'Geometria vetorial. Posições de pigmentos da referência oficial. Cores ilustrativas para impressão.',7,'A')
text(m,11*mm,'Disco: Peter T. Donahue / @color.nerd • ColorDisk 7.1 • CC BY-NC 2.0. Layout e diagrama HSL reconstruídos.',6.7,'A')
c.showPage();c.save()
doc=fitz.open(out);assert len(doc)==1 and len(doc[0].get_images())==0
assert abs(doc[0].rect.width-W)<.01 and abs(doc[0].rect.height-H)<.01
preview=base/'outputs/color-wheel-japanese-preview.png';doc[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(preview)
print(out);print('A3 verified; vector paths:',len(doc[0].get_drawings()),'; raster images:',len(doc[0].get_images()))
