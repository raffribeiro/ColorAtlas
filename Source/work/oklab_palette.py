"""Small offline palette-authoring helper: OKLCH to gamut-fitted 8-bit sRGB."""
import math


def linear_rgb(l, c, h):
    a, b = c*math.cos(math.radians(h)), c*math.sin(math.radians(h))
    ll = (l+.3963377774*a+.2158037573*b)**3
    mm = (l-.1055613458*a-.0638541728*b)**3
    ss = (l-.0894841775*a-1.291485548*b)**3
    return (4.0767416621*ll-3.3077115913*mm+.2309699292*ss,
            -1.2684380046*ll+2.6097574011*mm-.3413193965*ss,
            -.0041960863*ll-.7034186147*mm+1.707614701*ss)


def color(l, c, h, gamut_margin=1):
    low, high = 0, c
    for _ in range(36):
        middle = (low+high)/2
        if all(0 <= v <= 1 for v in linear_rgb(l, middle, h)):
            low = middle
        else:
            high = middle
    rgb = linear_rgb(l, low*gamut_margin, h)
    encoded = (12.92*v if v <= .0031308 else 1.055*v**(1/2.4)-.055 for v in rgb)
    return '#' + ''.join(f'{max(0,min(255,round(v*255))):02X}' for v in encoded)
