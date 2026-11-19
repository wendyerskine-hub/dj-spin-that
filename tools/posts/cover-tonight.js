// "Who's ready for the DJ to spin that s**t?" cover for show night, in the branded console style.
// Usage: node tools/posts/cover-tonight.js "<City>" "<Night n>" [flag emoji] [local-language line] [outDir]
// Writes cover PNGs (9:16, 4:5, 1:1) and looping MP4s (9:16, 4:5) named tonight-<city>-night-<n>-*.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const [,,city,night,flag='',localArg,outArg]=process.argv;const local=localArg||'';if(!city||!night){console.error('usage: cover-tonight.js "<City>" "<Night n>" [flag] [outDir]');process.exit(1)}
const out=outArg||path.join(__dirname,'../../social/posts');const comp=path.join(__dirname,'../social-loop/comp.html');
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const base=`tonight-${slug(city)}-${slug(night)}`;
async function page(b,W,H){const p=await b.newPage({viewport:{width:W/2,height:H/2},deviceScaleFactor:2});
 await p.goto('file://'+comp+'?'+new URLSearchParams({w:W/2,h:H/2}));await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(([city,night,flag,local])=>{document.getElementById('kick').textContent=`ARIRANG Tour · ${city} · ${night} · Tonight ${flag}`.trim();
   const q=document.getElementById('q');q.innerHTML=`<em>${city} ARMY</em> ${flag}<br>Who's ready for the DJ<br>to <em>spin that s**t?</em>`+(local?`<div style="font-family:'Noto Sans TC','Noto Sans CJK TC','PingFang TC',sans-serif;font-weight:700;font-size:.62em;letter-spacing:.06em;margin-top:.45em;color:#E2E8F0">${local}</div>`:'');q.style.fontSize=(innerHeight<=innerWidth?32:42)+'px';
   if(innerHeight/innerWidth<1.5){const c=document.querySelector('svg.ctrl');c.style.width=(innerHeight<=innerWidth?300:380)+'px';c.style.margin='0';c.style.flexShrink='0';document.querySelector('.word').style.fontSize=(innerHeight<=innerWidth?46:56)+'px';q.style.fontSize=(innerHeight<=innerWidth?24:28)+'px';document.querySelector('.wrap').style.gap='12px';document.querySelector('.wrap').style.padding='28px 22px'}
   const u=document.querySelector('.url');if(u)u.lastChild.textContent='DJSPINTHAT.NET';},[city,night,flag,local]);
 await p.waitForTimeout(300);return p}
(async()=>{const b=await chromium.launch();
 for(const [W,H,tag] of [[1080,1920,'9x16'],[1080,1350,'4x5'],[1080,1080,'1x1']]){const p=await page(b,W,H);await p.evaluate(()=>setFrame(0.12));await p.screenshot({path:path.join(out,`${base}-cover-${tag}.png`)});
  if(tag!=='1x1'){const d=fs.mkdtempSync(path.join(os.tmpdir(),'cov-'));const N=252;for(let f=0;f<N;f++){await p.evaluate(t=>setFrame(t),f/N);await p.screenshot({path:`${d}/f${String(f).padStart(4,'0')}.png`})}
   execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${d}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-preset','medium','-movflags','+faststart',path.join(out,`${base}-${tag}.mp4`)]);fs.rmSync(d,{recursive:true,force:true})}
  await p.close()}
 await b.close();console.log('made',base)})();
