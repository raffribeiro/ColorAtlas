// The standalone app must not depend on remote executable assets or eval.
const fs=require('fs'),assert=require('assert');
for(const file of ['standalone-shell.html','standalone-frame-prefix.html']){
 const source=fs.readFileSync('work/'+file,'utf8');
 const policy=source.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
 const directives=Object.fromEntries(policy.split(';').map(s=>s.trim().split(/\s+/)).filter(a=>a[0]).map(([k,...v])=>[k,v]));
 assert.deepEqual(directives['script-src'],["'unsafe-inline'"],file+': only embedded scripts, no eval or remote origins');
 for(const d of ['connect-src','object-src','base-uri','form-action','worker-src'])assert.deepEqual(directives[d],["'none'"],file+': '+d);
 assert(!/https?:|unsafe-eval|wasm-unsafe-eval/.test(policy),file+': no remote/eval allowances');
}
const shell=fs.readFileSync('work/standalone-shell.html','utf8');
const sandbox=shell.match(/<iframe[^>]*sandbox="([^"]+)"/)[1].split(' ');assert(!sandbox.includes('allow-same-origin'));
const suffix=fs.readFileSync('work/standalone-frame-suffix.html','utf8');
assert(!/<script\b[^>]*\bsrc\s*=/i.test(suffix),'No remote lucide/runtime scripts in generated frame');
console.log('PASS: restricted host/frame CSP, opaque iframe sandbox and no remote executable asset');
