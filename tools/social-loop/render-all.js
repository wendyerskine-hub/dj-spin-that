// Renders one looping GIF frame set per played show from ../../shows.json.
// Usage: node render-all.js <framesDir> [workers] [mp4OutDir]
// With mp4OutDir: renders 1080x1920 at 30 fps and encodes an MP4 per night (frames deleted after).
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[2];const WORKERS=+process.argv[3]||6;const MP4=process.argv[4];
const N=MP4?252:126; // 30 fps MP4 or 15 fps GIF, 8.4 s loop
const {execFileSync}=require('child_process');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../../shows.json'),'utf8'));
const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const jobs=data.shows.filter(s=>s.status==='played'&&s.songs&&s.songs.length).map(s=>{
  const n=(s.night.match(/\d+/)||['1'])[0];
  const qs=new URLSearchParams({city:s.city,night:`Night ${n}${s.date?' · '+fmt(s.date):''}`,songs:s.songs.map(x=>x.title).join('|')});
  if(s.disputed)qs.set('disputed','1');
  return {name:`${slug(s.city)}-night-${n}`,qs:qs.toString()};
});
(async()=>{const b=await chromium.launch();let i=0;
  async function worker(){const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:MP4?2:1});
    while(i<jobs.length){const j=jobs[i++];const d=path.join(OUT,j.name);fs.mkdirSync(d,{recursive:true});
      await p.goto('file://'+path.join(__dirname,'comp.html')+'?'+j.qs);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
      for(let f=0;f<N;f++){await p.evaluate(t=>setFrame(t),f/N);await p.screenshot({path:`${d}/f${String(f).padStart(4,'0')}.png`});}
      if(MP4){execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','30','-i',`${d}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-profile:v','high','-crf','20','-preset','medium','-movflags','+faststart',path.join(MP4,`dj-spin-that-${j.name}.mp4`)]);fs.rmSync(d,{recursive:true,force:true});}
      console.log('rendered',j.name);}
    await p.close();}
  await Promise.all(Array.from({length:WORKERS},worker));await b.close();
  fs.writeFileSync(path.join(OUT,'jobs.json'),JSON.stringify(jobs.map(j=>j.name)));console.log('total',jobs.length);})();
