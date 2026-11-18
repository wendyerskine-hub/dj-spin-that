// Render the holiday TikTok (1080x1920, 30 fps, no audio: add "Dynamite (Holiday Remix)" from TikTok's sound library).
// Usage: node tools/holiday/render.js [out.mp4] [query string, e.g. "nojin=1"]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const out=process.argv[2]||path.join(__dirname,'../../social/posts/holiday-dynamite-snowman-suga.mp4');const qs=process.argv[3]||'';
const FPS=30;
(async()=>{const frames=fs.mkdtempSync(path.join(os.tmpdir(),'holiday-'));const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
 await p.goto('file://'+path.join(__dirname,'holiday.html')+(qs?'?'+qs:''));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
 const N=Math.round(await p.evaluate(()=>window.DUR)*FPS);
 for(let f=0;f<N;f++){await p.evaluate(t=>setFrame(t),f/FPS);await p.screenshot({path:`${frames}/f${String(f).padStart(4,'0')}.png`})}
 await b.close();
 execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',`${frames}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-profile:v','high','-crf','19','-preset','medium','-movflags','+faststart',out]);
 fs.rmSync(frames,{recursive:true,force:true});console.log('made',out)})();
