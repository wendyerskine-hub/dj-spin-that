// Render any post template that exposes window.DUR and setFrame(t) to a 1080x1920, 30 fps MP4 (no audio).
// Usage: node tools/posts/render-html.js <template.html> <out.mp4> [query string]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const [,,tpl,out,qs]=process.argv;if(!tpl||!out){console.error('usage: render-html.js <template.html> <out.mp4> [query]');process.exit(1)}
const FPS=30;
(async()=>{const frames=fs.mkdtempSync(path.join(os.tmpdir(),'post-'));const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
 await p.goto('file://'+path.resolve(tpl)+(qs?'?'+qs:''));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
 const N=Math.round(await p.evaluate(()=>window.DUR)*FPS);
 for(let f=0;f<N;f++){await p.evaluate(t=>setFrame(t),f/FPS);await p.screenshot({path:`${frames}/f${String(f).padStart(4,'0')}.png`})}
 await b.close();
 execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',`${frames}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-profile:v','high','-crf','19','-preset','medium','-movflags','+faststart',out]);
 fs.rmSync(frames,{recursive:true,force:true});console.log('made',out)})();
