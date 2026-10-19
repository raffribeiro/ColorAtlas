from pathlib import Path
from PIL import Image
import json,base64,copy
# Match the Preview importer's 512px PNG asset format; preserve the supplied source separately.
image=Image.open('work/TEMP_PresetDesign.jpeg').convert('RGB')
image.thumbnail((512,512),Image.Resampling.LANCZOS)
canvas=Image.new('RGB',(512,512));canvas.paste(image,((512-image.width)//2,(512-image.height)//2));canvas.save('work/design-preview.png')
ramp={'colors':[{'t':i/4,'hex':h} for i,h in enumerate(['#000000','#404040','#808080','#BFBFBF','#FFFFFF'])],'alphas':[{'t':0,'a':1},{'t':1,'a':1}],'preset':'custom','transition':'smooth'}
doc={'version':1,'selected':'temp-design-image','randomOn':['temp-design-image'],'layers':[{'id':'temp-design-image','name':'TEMP_PresetDesign','blend':'normal','opacity':1,'visible':True,'asset':'data:image/png;base64,'+base64.b64encode(Path('work/design-preview.png').read_bytes()).decode(),'map':{'layers':{id:copy.deepcopy(ramp) for id in ['emission','smoke']},'active':'emission','view':'active','split':.62}}]}
Path('work/design-preview.json').write_text(json.dumps(doc,separators=(',',':')))
