import sys,math,statistics,colorsys
sys.path.insert(0,'/private/tmp/colordisk-libs')
import pymupdf as fitz
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
base=Path.cwd(); source=fitz.open('/Users/raffribeiro/Downloads/The ColorDisk 7.pdf'); p=source[0]
pix=p.get_pixmap(matrix=fitz.Matrix(2,2)); im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
for name,f in [('A','Arial.ttf'),('B','Arial Bold.ttf'),('N','Arial Narrow.ttf')]:pdfmetrics.registerFont(TTFont(name,'/System/Library/Fonts/Supplemental/'+f))
W,H=297*mm,420*mm;c=canvas.Canvas(str(base/'outputs/atlas-cor-artistas-A3.pdf'),pagesize=(W,H));c.setTitle('Teoria da cor para artistas | Atlas visual A3')
black=(.08,.08,.085);gray=(.36,.37,.38);red=(.85,.13,.10)
def txt(x,y,s,size=8,font='A',color=black,align='left'):
 c.setFillColorRGB(*color);c.setFont(font,size);{'left':c.drawString,'center':c.drawCentredString,'right':c.drawRightString}[align](x*mm,H-y*mm,s)
def line(x1,y1,x2,y2,width=.45,color=black):
 c.setStrokeColorRGB(*color);c.setLineWidth(width);c.line(x1*mm,H-y1*mm,x2*mm,H-y2*mm)
def rect(x,y,w,h,col):
 c.setFillColorRGB(*col);c.rect(x*mm,H-(y+h)*mm,w*mm,h*mm,fill=1,stroke=0)
def poly(points,col,stroke=False):
 path=c.beginPath();path.moveTo(points[0][0]*mm,H-points[0][1]*mm)
 for x,y in points[1:]:path.lineTo(x*mm,H-y*mm)
 path.close();c.setFillColorRGB(*col);c.setStrokeColorRGB(1,1,1);c.setLineWidth(.18);c.drawPath(path,fill=1,stroke=stroke)
def sample(a,r):
 x=int((304.5+r*math.cos(math.radians(a)))*2);y=int((304.8-r*math.sin(math.radians(a)))*2);ls=[]
 for dx in range(-5,6):
  for dy in range(-5,6):
   v=im.getpixel((x+dx,y+dy))
   if max(v)-min(v)>35 and max(v)>90:ls.append(v)
 if not ls:ls=[im.getpixel((x,y))]
 return tuple(statistics.median(v[i] for v in ls)/255 for i in range(3))
palette=[sample(a+2.5,212) for a in range(0,360,5)]
rim=[sample(a+2.5,250) for a in range(0,360,5)]
def annulus(x,y,r0,r1,a,b,col):
 X=x*mm;Y=H-y*mm;r0*=mm;r1*=mm
 path=c.beginPath();path.moveTo(X+r1*math.cos(math.radians(a)),Y+r1*math.sin(math.radians(a)))
 path.arcTo(X-r1,Y-r1,X+r1,Y+r1,a,b-a)
 if r0:
  path.lineTo(X+r0*math.cos(math.radians(b)),Y+r0*math.sin(math.radians(b)));path.arcTo(X-r0,Y-r0,X+r0,Y+r0,b,a-b)
 else:path.lineTo(X,Y)
 path.close();c.setFillColorRGB(*col);c.drawPath(path,fill=1,stroke=0)
def wheel(x,y,r,atten=1,labels=False,angles=False,mask=None):
 for j in range(72):
  a=j*5; rgb=palette[j]
  if mask is not None:
   selected=any(abs((a-q+180)%360-180)<=w for q,w in mask)
   if not selected:rgb=(.56,.56,.56)
  rgb=tuple(.5+(v-.5)*atten for v in rgb)
  for k in range(9):
   t=((k+.5)/9)**.80;col=tuple(.53*(1-t)+v*t for v in rgb);annulus(x,y,r*k/9*.9,r*(k+1)/9*.9,a,a+5.04,col)
  rc=tuple(.5+(v-.5)*atten for v in rim[j])
  if mask is not None and not selected:rc=(.56,.56,.56)
  annulus(x,y,.9*r,r,a,a+5.04,rc)
 c.setStrokeColorRGB(.2,.2,.2);c.setStrokeAlpha(.23);c.setLineWidth(.25)
 for k in range(1,10):c.circle(x*mm,H-y*mm,.9*r*k/9*mm,fill=0,stroke=1)
 for a in range(0,360,15):line(x,y,x+.9*r*math.cos(math.radians(a)),y-.9*r*math.sin(math.radians(a)),.2,(.3,.3,.3))
 c.setStrokeAlpha(1)
 if labels:
  for a,s in [(96,'LIME'),(60,'YELLOW'),(29,'ORANGE'),(0,'RED'),(327,'PINK'),(274,'PURPLE'),(232,'BLUE'),(170,'TURQUOISE'),(138,'GREEN')]:
   xx=(x+.946*r*math.cos(math.radians(a)))*mm;yy=H-(y-.946*r*math.sin(math.radians(a)))*mm
   c.saveState();c.translate(xx,yy);c.rotate(a-90+(180 if a>180 else 0));c.setFillColorRGB(*black);c.setFont('B',max(5.7,r*.22));c.drawCentredString(0,-2,s);c.restoreState()
 if angles:
  for a in range(0,360,30):txt(x+(r+3)*math.cos(math.radians(a)),y-(r+3)*math.sin(math.radians(a))+1,str(a)+'°',5.4,align='center')
# Header with a visible spectrum and strong editorial title.
txt(12,16,'TEORIA DA COR',29,'B');txt(12,25,'PARA ARTISTAS / ATLAS VISUAL',11,'B')
for j in range(72):rect(207+j*78/72,10,78/72+.02,7,colorsys.hsv_to_rgb((.75-j*.75/71)%1,.9,.85))
txt(285,23,'MATIZ • CHROMA • LUMINOSIDADE',6.5,'B',align='right');line(12,30,285,30,1.3)
txt(12,38,'01 / DA COR VIVA AO NEUTRO',10,'B');txt(285,38,'Reduções ilustrativas de cor em sRGB',6.8,align='right')
for x,title,at in [(57,'VIVA',1),(148.5,'ATENUADA',.56),(240,'QUASE NEUTRA',.20)]:
 txt(x,47,title,8,'B',align='center');wheel(x,88,36,at,labels=True)
 txt(x,130,'MESMO MATIZ / INTENSIDADE DIFERENTE',5.7,'B',align='center')
# Readable explanatory strip.
line(12,136,285,136,.75)
for x,title,sub in [(12,'MATIZ','Família da cor: vermelho, amarelo, azul...'),(106,'CHROMA','Distância de uma cor ao neutro no modelo.'),(205,'LUMINOSIDADE','Do escuro ao claro; eixo do esquema HSL.')]:
 txt(x,144,title,8,'B');txt(x,150,sub,6.5)
line(12,155,285,155,.6)
# Middle scientific map flanked by compact swatch charts.
txt(12,164,'02 / MAPA DE PIGMENTOS',10,'B');txt(285,164,'CIECAM02 / POSIÇÕES DA REFERÊNCIA OFICIAL',6.4,'B',align='right')
wheel(148.5,238,62,labels=True,angles=True)
select={'PY154','PY35','PY43','PG17','PG7','PG36','PG50','PB15','PB29','PB60','PV23','PV16','PR122','PR254','PR179','PO73'}
for i,d in enumerate(p.get_drawings()):
 if i not in range(99,190,2):continue
 rr=d['rect'];xx=(rr.x0+rr.x1)/2;yy=(rr.y0+rr.y1)/2
 X=148.5+(xx-304.5)*62/260;Y=238+(yy-304.8)*62/260
 c.setFillColorRGB(*black);c.setStrokeColorRGB(1,1,1);c.setLineWidth(.7);c.circle(X*mm,H-Y*mm,1.05*mm,fill=1,stroke=1)
for b in p.get_text('dict')['blocks']:
 for l in b.get('lines',[]):
  for s in l['spans']:
   if s['text'] not in select or s['bbox'][1]>470:continue
   ox,oy=s['origin'];txt(148.5+(ox-304.5)*62/260,238+(oy-304.8)*62/260,s['text'],5.6,'N',(1,1,1))
# HSL swatch plates; hue angles here are illustrative RGB, not pigment measurements.
for side,x,hs in [('left',12,[0,30,60,90,120,150]),('right',245,[180,210,240,270,300,330])]:
 for n,hue in enumerate(hs):
  yy=178+n*20.2
  for row in range(5):
   L=.86-row*.17
   for col in range(7):rect(x+col*5.7,yy+row*2.7,5.25,2.28,colorsys.hls_to_rgb(hue/360,L,.12+col*.14))
  txt(x,yy+17,f'HSL {hue:03d}°  /  CLARO → ESCURO',5.3,'B')
txt(148.5,309,'Marcadores = pigmentos. Rótulos = seleção. Cores do campo = ilustração.',6.4,align='center')
txt(12,318,'PB: azul  /  PG: verde  /  PY: amarelo  /  PR: vermelho  /  PV: violeta  /  PO: laranja',6.5)
line(12,323,285,323,.8)
# Bottom: harmonies, conceptual 3D HSL and composition.
txt(12,332,'03 / HARMONIAS',9,'B');txt(124,332,'04 / VOLUME DA COR',9,'B');txt(229,332,'05 / COMPOSIÇÃO',9,'B')
patterns=[('COMPLEMENTAR',[(0,13),(180,13)]),('ANÁLOGA',[(45,35)]),('TRIÁDICA',[(0,13),(120,13),(240,13)]),('DIVIDIDA',[(0,13),(150,13),(210,13)]),('TETRÁDICA',[(0,12),(90,12),(180,12),(270,12)]),('MONOCROMÁTICA',[(240,12)])]
for i,(name,mask) in enumerate(patterns):
 x=28+(i%3)*33;yy=349+(i//3)*34;wheel(x,yy,12,mask=mask);txt(x,yy+16,name,5.6,'B',align='center')
# Isometric HSL volume: new vector geometry.
gx,gy=170,375;R=29
def iso(r,a,z):return gx+r*math.cos(math.radians(a)),gy-.4*r*math.sin(math.radians(a))-z
for layer in range(5):
 z=layer*4
 for a in range(0,300,15):
  for ring in range(1,5):
   rr=R*ring/4;r0=R*(ring-1)/4;co=colorsys.hls_to_rgb(a/360,.15+layer*.16,ring/4*.90)
   poly([iso(r0,a,z),iso(rr,a,z),iso(rr,a+15,z),iso(r0,a+15,z)],co,True)
   if ring==4 and 180<=a<300:poly([iso(rr,a,z),iso(rr,a+15,z),iso(rr,a+15,z-4),iso(rr,a,z-4)],tuple(v*.8 for v in co),True)
line(gx,gy+7,gx,gy-29,1.2,red);line(gx,gy-6,gx+34,gy+7,1.2,red)
txt(gx+1,gy-30,'LUMINOSIDADE',5.4,'B',red);txt(gx+18,gy+12,'SATURAÇÃO',5.4,'B',red)
txt(170,399,'MATIZ AO REDOR / ESQUEMA HSL',5.8,'B',align='center')
# An abstract palette composition, replacing the photo example with original vector art.
rect(229,340,56,40,(.22,.24,.27));poly([(229,378),(229,361),(250,349),(260,359),(249,380)],(.17,.33,.57));poly([(250,350),(258,341),(265,352),(258,359)],(.35,.49,.68));rect(271,345,9,5,(.96,.78,.08))
txt(233,347,'DOMINANTE',5.4,'B',(1,1,1));txt(233,373,'APOIO',5.4,'B',(1,1,1));txt(271,357,'ACENTO',5.1,'B',(1,1,1))
for yy,label in [(388,'Dominante: maior área visual.'),(393,'Apoio: estrutura a paleta.'),(398,'Acento: pequeno foco de contraste.')]:txt(229,yy,label,5.9)
# Final provenance and accuracy note.
line(12,404,285,404,.65)
txt(12,409,'Cores ilustrativas: não use como amostras calibradas de tinta. Saturação HSL e chroma CIECAM02 são medidas distintas.',6.0)
txt(12,414,'Disco baseado em Peter T. Donahue / ColorDisk 7.1 / CC BY-NC 2.0. Diagramas e layout próprios. A3: 297 × 420 mm.',5.9)
c.showPage();c.save()
d=fitz.open(base/'outputs/atlas-cor-artistas-A3.pdf');assert len(d)==1 and len(d[0].get_images())==0
assert abs(d[0].rect.width-W)<.01 and abs(d[0].rect.height-H)<.01
# Raster only for on-screen preview; the deliverable PDF remains entirely vector.
d[0].get_pixmap(matrix=fitz.Matrix(1.8,1.8)).save(base/'outputs/atlas-cor-artistas-preview.png')
print('Verified A3; paths:',len(d[0].get_drawings()),'; raster images: 0')
