from pathlib import Path
p=Path('/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html');s=p.read_text()
a=s.index('<div class="studio-bottom">');b=s.index('<details class="studio-card studio-help">',a);bottom=s[a:b]
c=bottom[bottom.index('<div class="viz-row">'):bottom.index('</div></section>')+6]
c=c.replace('class="viz-row"','class="preview-controls"',1)
start=s.index('<section class="studio-card studio-preview">');end=s.index('</section></div>',start)
s=s[:end]+c+s[end:]
a=s.index('<div class="studio-bottom">');b=s.index('<details class="studio-card studio-help">',a)
s=s[:a]+'<div data-field="vfx-mapping" hidden></div>\n'+s[b:]
buttons='<button class="btn" type="button" data-action="gradient-png">Export PNG</button><button class="btn" type="button" data-action="gradient-code">Copy gradient data</button>'
s=s.replace('</button></div><svg class="mp-gradient', '</button><span class="studio-export-actions">'+buttons+'</span></div><svg class="mp-gradient',1)
s=s.replace('<span class="text-small" data-field="gradient-status" aria-live="polite">','<span class="text-small" data-field="gradient-status" aria-live="polite" hidden>')
a=s.index('      <div class="text-small">Estimated luminance masks:');b=s.index('</div>',a)+6;s=s[:a]+s[b:]
css='''
#munsell-picker .studio-help{display:none!important}
.studio-sidebar>.studio-muted{display:none}.studio-preview>p.studio-muted,.studio-author>p.studio-muted,.studio-keys>p.studio-muted{display:none}
.preview-controls{display:grid;grid-template-columns:145px minmax(80px,1fr) 38px;gap:8px;align-items:center;margin-top:12px}.preview-controls .form-label{font-size:11px;margin:0}.preview-controls output{font-size:11px;text-align:right}.preview-controls select{grid-column:2/4}.studio-export-actions{display:flex;gap:6px;margin-left:auto}.studio-ramp-title{flex-wrap:wrap}
@media(min-width:1000px){.studio-shell{grid-template-columns:220px minmax(0,1fr)}.studio-author .mp-vfx-lab{height:300px!important}.studio-preview canvas{max-height:340px!important}.studio-preview .mp-explosion-previews{position:relative}.studio-preview figure:first-child{position:absolute;bottom:8px;left:8px;width:60px}.studio-preview figure:first-child figcaption{display:none}.studio-library{height:510px;max-height:510px}.studio-main{padding:16px}.studio-columns{gap:12px}.studio-card{padding:13px}}
'''
s=s.replace('</style>',css+'\n</style>',1);p.write_text(s)
