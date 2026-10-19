// Package the existing licensed vendor, exposing only the API used by this app.
const fs=require('fs'),assert=require('assert');
const esbuild=require(process.env.COLOR_ATLAS_ESBUILD||'/Users/raffribeiro/Documents/Codex/RPG_Narrator/narrative-engine/node_modules/esbuild');
const original=fs.readFileSync('work/vendor/motion-14.0.0.js','utf8');
const marker='t.AsyncMotionValueAnimation=Gn,t.DOMKeyframesResolver=';
assert.equal(original.split(marker).length,2);assert(original.includes('t.animate=Zl,'));
const trimmed=original.slice(0,original.lastIndexOf(marker))+'t.animate=Zl});';
const result=esbuild.transformSync(trimmed,{minify:true,treeShaking:true,legalComments:'inline',target:'es2022'}).code;
fs.writeFileSync('work/vendor/motion-14.0.0-animate.js',result);
console.log('Motion subset:',result.length,'bytes; original',original.length);
