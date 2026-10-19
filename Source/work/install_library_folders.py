from pathlib import Path
BASE=Path(__file__).parent
SOURCE=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html')
def install():
    s=SOURCE.read_text()
    a=s.index('// Bundled preset data\n') if '// Bundled preset data\n' in s else s.index('const gradientPresets=[')
    b=s.index('// Reviewed library metadata;',a)
    s=s[:a]+BASE.joinpath('atlas-preset-data-bundle.js').read_text()+s[b:]
    a=s.index('// Balanced library folders\n') if '// Balanced library folders\n' in s else s.index("let studioLibrarySignature='';")
    b=s.index("$('[data-action=\"gradient-blackbody\"]').addEventListener",a)
    s=s[:a]+BASE.joinpath('atlas-library-folders-bundle.js').read_text()+s[b:]
    assert len(s.encode())<1_000_000
    SOURCE.write_text(s)
    print('Installed balanced library folders:',len(s.encode()),'bytes')
if __name__=='__main__':install()
