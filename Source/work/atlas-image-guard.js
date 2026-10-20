// Validate compressed metadata before browser decode. Limits also apply after
// decode: dimensions in a corrupt header must never authorize canvas work.
const PREVIEW_MAX_EDGE=8192,PREVIEW_MAX_PIXELS=32_000_000;
function previewImageDimensionsOK(width,height){return Number.isInteger(width)&&Number.isInteger(height)&&width>0&&height>0&&width<=PREVIEW_MAX_EDGE&&height<=PREVIEW_MAX_EDGE&&width*height<=PREVIEW_MAX_PIXELS;}
function previewImageHeader(bytes){
 const n=bytes.length,u16=i=>bytes[i]*256+bytes[i+1],u24=i=>bytes[i]+bytes[i+1]*256+bytes[i+2]*65536,u32=i=>bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3],text=(i,s)=>[...s].every((c,j)=>bytes[i+j]===c.charCodeAt(0));
 if(n>=24&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)&&u32(8)===13&&text(12,'IHDR'))return{width:u32(16),height:u32(20)};
 if(n>=4&&bytes[0]===255&&bytes[1]===216){
  // JPEG may carry long EXIF/ICC sections before a start-of-frame marker.
  let i=2;while(i<n){if(bytes[i++]!==255)return null;while(i<n&&bytes[i]===255)i++;if(i>=n)return null;const marker=bytes[i++];if(marker===217||marker===218)return null;if(marker===1||(marker>=208&&marker<=215))continue;if(i+2>n)return null;const length=u16(i);if(length<2||i+length>n)return null;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){if(length<8)return null;return{width:u16(i+5),height:u16(i+3)};}i+=length;
  }
 }
 if(n>=20&&text(0,'RIFF')&&text(8,'WEBP')){
  if(text(12,'VP8X')&&n>=30)return{width:1+u24(24),height:1+u24(27)};
  if(text(12,'VP8L')&&n>=25&&bytes[20]===47)return{width:1+bytes[21]+((bytes[22]&63)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)};
  if(text(12,'VP8 ')&&n>=30&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return{width:(bytes[26]+bytes[27]*256)&16383,height:(bytes[28]+bytes[29]*256)&16383};
 }
 return null;
}
async function previewCheckImageFile(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('format');
 // File size is bounded before allocating this compressed buffer (20 MiB).
 const dimensions=previewImageHeader(new Uint8Array(await file.arrayBuffer()));
 if(!dimensions)throw new Error('format');
 if(!previewImageDimensionsOK(dimensions.width,dimensions.height))throw new Error('dimensions');
 return dimensions;
}
function previewCheckImageDataURL(url){
 if(typeof url!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>3e6)throw new Error('format');
 const bytes=Uint8Array.from(atob(url.slice(url.indexOf(',')+1)),c=>c.charCodeAt(0)),dimensions=previewImageHeader(bytes);
 if(!dimensions||!previewImageDimensionsOK(dimensions.width,dimensions.height))throw new Error('dimensions');
 return dimensions;
}
