"""Build the startup grayscale-to-chroma filter, independent of editor startup."""
from pathlib import Path
import json
BASE=Path(__file__).parent

def linear_rgb(l,a,b):
    m=[(l+.3963377774*a+.2158037573*b)**3,
       (l-.1055613458*a-.0638541728*b)**3,
       (l-.0894841775*a-1.291485548*b)**3]
    return [4.0767416621*m[0]-3.3077115913*m[1]+.2309699292*m[2],
            -1.2684380046*m[0]+2.6097574011*m[1]-.3413193965*m[2],
            -.0041960863*m[0]-.7034186147*m[1]+1.707614701*m[2]]

def encode(x):
    x=max(0,min(1,x))
    return 12.92*x if x<=.0031308 else 1.055*x**(1/2.4)-.055

def build():
    ramp=json.loads(BASE.joinpath('atlas-splash-ramp.json').read_text())
    assert ramp[0]['t']==0 and ramp[-1]['t']==1
    assert all(a['t']<b['t'] for a,b in zip(ramp,ramp[1:]))
    tables=[[],[],[]]
    for i in range(65):
        t=i/64
        j=max(j for j,k in enumerate(ramp) if k['t']<=t)
        a,b=ramp[j],ramp[min(j+1,len(ramp)-1)]
        f=(t-a['t'])/(b['t']-a['t']) if b['t']>a['t'] else 0
        lab=[x+(y-x)*f for x,y in zip(a['lab'],b['lab'])]
        for table,v in zip(tables,linear_rgb(*lab)):table.append(f'{encode(v):.6f}')
    chroma=''.join(f'<feFunc{ch} type="table" tableValues="{" ".join(table)}"/>' for ch,table in zip('RGB',tables))
    contrast=''.join(f'<feFunc{ch} type="linear" slope="3" intercept="-1"/>' for ch in 'RGB')
    svg='<svg class="splash-noise" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><filter id="splash-perlin" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".0018 .0024" numOctaves="1" seed="11" stitchTiles="noStitch" result="perlin"><animate attributeName="baseFrequency" values=".0018 .0024;.0028 .0018;.0018 .0024" dur="6s" repeatCount="indefinite"/></feTurbulence><feColorMatrix in="perlin" type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1" result="neutral"/><feComponentTransfer in="neutral" result="contrast">'+contrast+'</feComponentTransfer><feGaussianBlur in="contrast" stdDeviation="12" result="grayscale"/><feComponentTransfer in="grayscale" data-splash-ramp="oklab">'+chroma+'<feFuncA type="identity"/></feComponentTransfer></filter></defs><rect width="1200" height="800" fill="#fff" filter="url(#splash-perlin)"/></svg>'
    BASE.joinpath('atlas-splash-noise.svg').write_text(svg+'\n')
    return svg

if __name__=='__main__':build()
