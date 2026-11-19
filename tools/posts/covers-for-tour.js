// Make "who's ready for the DJ to spin that s**t?" covers for every upcoming show in a date range,
// with the local-language line from tools/posts/local.json.
// Usage: node tools/posts/covers-for-tour.js [fromYYYY-MM-DD] [toYYYY-MM-DD] [--video]
// Writes social/posts/tonight/tonight-<city>-night-<n>-cover-{9x16,4x5,1x1}.png (+ loops with --video).
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'../..');const args=process.argv.slice(2);const video=args.includes('--video');
const [from='0000-00-00',to='9999-99-99']=args.filter(a=>!a.startsWith('--'));
const shows=JSON.parse(fs.readFileSync(path.join(root,'shows.json'),'utf8')).shows;
const L=JSON.parse(fs.readFileSync(path.join(__dirname,'local.json'),'utf8'));
const out=path.join(root,'social/posts/tonight');fs.mkdirSync(out,{recursive:true});
for(const s of shows.filter(s=>s.status==='upcoming'&&s.date>=from&&s.date<=to)){
  const c=L[s.country]||{};const lc=(c.local||{})[s.city]||s.city;
  const line=(c.ready||'').replace(/\{local\}/g,lc);
  console.log(s.city,s.night,s.date,line);
  execFileSync('node',[path.join(__dirname,'cover-tonight.js'),s.city,s.night,c.flag||'',line,out],{stdio:'inherit',env:{...process.env,...(video?{}:{NOVIDEO:'1'})}});
}
