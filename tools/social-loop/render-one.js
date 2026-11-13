// Make the GIF (540x960, 15 fps) and TikTok MP4 (1080x1920, 30 fps) for one show night.
// Usage: node tools/social-loop/render-one.js "<City>" <nightNumber> "<Mon D>" "Song A|Song B" [framesDir]
// Writes social/cities/dj-spin-that-<city>-night-<n>.gif and social/cities-mp4/dj-spin-that-<city>-night-<n>.mp4
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const [,,city,n,date,songs,framesArg]=process.argv;
if(!city||!n||!songs){console.error('usage: render-one.js "<City>" <n> "<Mon D>" "Song A|Song B"');process.exit(1)}
const root=path.join(__dirname,'../..');const comp=path.join(__dirname,'comp.html');
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const name=`${slug(city)}-night-${n}`;const frames=framesArg||fs.mkdtempSync(path.join(os.tmpdir(),'djst-'));
const qs=new URLSearchParams({city,night:`Night ${n}${date?' · '+date:''}`,songs}).toString();
(async()=>{const b=await chromium.launch();
for(const [dsf,N] of [[1,126],[2,252]]){const d=path.join(frames,`${name}-${dsf}`);fs.mkdirSync(d,{recursive:true});
 const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:dsf});await p.goto('file://'+comp+'?'+qs);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 for(let f=0;f<N;f++){await p.evaluate(t=>setFrame(t),f/N);await p.screenshot({path:`${d}/f${String(f).padStart(4,'0')}.png`});}await p.close();
 if(dsf===1)execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','15','-i',`${d}/f%04d.png`,'-vf','split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',path.join(root,'social/cities',`dj-spin-that-${name}.gif`)]);
 else execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${d}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-profile:v','high','-crf','20','-preset','medium','-movflags','+faststart',path.join(root,'social/cities-mp4',`dj-spin-that-${name}.mp4`)]);
 fs.rmSync(d,{recursive:true,force:true});}
await b.close();console.log('made',name)})();
