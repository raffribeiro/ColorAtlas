import numpy as np,json,re
from pathlib import Path
M=np.array([[.8951,.2664,-.1614],[-.7502,1.7135,.0367],[.0389,-.0685,1.0296]])
def white(x,y):return np.array([x/y,1,(1-x-y)/y])
A=np.linalg.inv(M)@np.diag((M@white(.3127,.3290))/(M@white(.31006,.31616)))@M
SR=np.array([[3.2404542,-1.5371385,-.4985314],[-.9692660,1.8760108,.0415560],[.0556434,-.2040259,1.0572252]])
def render(xyz):
 lin=SR@A@xyz;outside=bool(min(lin)<-1e-5 or max(lin)>1.00001)
 enc=np.where(lin<=.0031308,12.92*lin,1.055*np.maximum(lin,0)**(1/2.4)-.055)
 rgb=np.rint(np.clip(enc,0,1)*255).astype(int).tolist()
 return ['#'+''.join(f'{v:02x}' for v in rgb),int(outside),rgb]
D={}
for line in Path('work/munsell-real.dat').read_text().splitlines()[1:]:
 h,v,c,x,y,Y=line.split();x,y,Y=float(x),float(y),float(Y)*.975/100
 D.setdefault(h,{}).setdefault(v,{})[c]=render(np.array([x*Y/y,Y,(1-x-y)*Y/y]))[:2]
N={}
for v in range(11):
 if v==0:Y=0
 elif v==10:Y=1
 else:Y=.975*(1.2219*v-.23111*v*v+.23951*v**3-.021009*v**4+.0008404*v**5)/100
 # neutral is adapted white C with Y scaled by the renotation value relation
 N[v]=render(white(.31006,.31616)*Y)[0]
assert N[0]=='#000000' and N[10]=='#ffffff'
Path('work/munsell-colors.json').write_text(json.dumps({'samples':D,'neutrals':N},separators=(',',':')))
print('samples',sum(len(cs) for hv in D.values() for cs in hv.values()),'5R 5/6',D['5R']['5']['6'],'neutral5',N[5])
