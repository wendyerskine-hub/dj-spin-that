// Builds one share page per played show: s/<slug>.html (its own link preview) + s/<slug>-<hash>.jpg (1200x630 preview image).
// The page sends people on to https://djspinthat.net/#<slug>. Run after shows.json changes:
//   node tools/share/build-show-pages.js        (only rebuilds shows whose songs changed)
//   node tools/share/build-show-pages.js --all  (rebuilds every image)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(__dirname,'../..'),OUT=path.join(ROOT,'s');fs.mkdirSync(OUT,{recursive:true});
const ALL=process.argv.includes('--all');
const shows=JSON.parse(fs.readFileSync(path.join(ROOT,'shows.json'),'utf8')).shows;
const citySlug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const slugOf=s=>citySlug(s.city)+'-'+((s.night.match(/\d+/)||['1'])[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=iso=>new Date(iso+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const played=shows.filter(s=>s.status!=='cancelled'&&s.songs&&s.songs.length);
(async()=>{let b=null,page=null,made=0;const index=[];
 for(const s of played){const slug=slugOf(s),titles=s.songs.map(x=>x.title),night=s.night.replace(' (FESTA)','');
  const sig=crypto.createHash('sha1').update(JSON.stringify([s.city,s.night,s.date,titles,!!s.disputed])).digest('hex').slice(0,8);
  const png=`${slug}-${sig}.jpg`;index.push({slug,city:s.city,night,date:s.date,songs:titles});
  if(ALL||!fs.existsSync(path.join(OUT,png))){
   if(!b){b=await chromium.launch();page=await b.newPage({viewport:{width:1200,height:630}});await page.goto('file://'+path.join(__dirname,'og.html'));await page.evaluate(()=>document.fonts.ready)}
   await page.evaluate(d=>window.fill(d),{kick:`BTS ARIRANG Tour · ${fmt(s.date)}`,city:s.city,night:`${night} · surprise songs`,songs:titles,note:s.disputed?'Reported live by ARMY':'Every night, every surprise song'});
   await page.waitForTimeout(120);await page.screenshot({path:path.join(OUT,png),type:'jpeg',quality:86});made++;
   for(const f of fs.readdirSync(OUT))if(f.startsWith(slug+'-')&&f.endsWith('.jpg')&&f!==png&&/^[0-9a-f]{8}\.jpg$/.test(f.slice(slug.length+1)))fs.rmSync(path.join(OUT,f))}
  const pair=titles.join(' × '),title=`${s.city} ${night}: ${pair}`,desc=`BTS ARIRANG tour, ${s.venue||s.city}, ${fmt(s.date)}. The DJ spun ${pair}. Every night's surprise songs on DJ Spin That (fan-made).`;
  const url=`https://djspinthat.net/s/${slug}.html`,dest=`https://djspinthat.net/#${slug}`,img=`https://djspinthat.net/s/${png}`;
  fs.writeFileSync(path.join(OUT,slug+'.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)} · DJ Spin That</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${dest}">
<meta property="og:type" content="website"><meta property="og:site_name" content="DJ Spin That">
<meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=${dest}">
<style>body{margin:0;background:#0c0a12;color:#fff;font:16px system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:16px}a{color:#c9a8ff}</style>
</head><body><p><b>${esc(title)}</b><br><a href="${dest}">Open DJ Spin That</a></p><script>location.replace(${JSON.stringify(dest)})</script></body></html>
`)}
 fs.writeFileSync(path.join(OUT,'index.json'),JSON.stringify(index));
 if(b)await b.close();console.log(`${played.length} share pages, ${made} new images`)})();
