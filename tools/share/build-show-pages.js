// Builds the share + search pages from shows.json:
//   s/<city>-<n>.html      one page per played show: its songs, venue, notes, fancam links, its own link preview
//   s/<city>-<n>-<hash>.jpg the 1200x630 preview image for that page (new file name when the songs change)
//   s/index.html           every show, city by city
//   s/index.json           list the site's Share buttons read
//   og-remix.jpg, og-moments.jpg, og-tour.jpg   preview images for those pages
//   sitemap.xml, robots.txt
// Run after shows.json changes:  node tools/share/build-show-pages.js   (--all redraws every image)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(__dirname,'../..'),OUT=path.join(ROOT,'s');fs.mkdirSync(OUT,{recursive:true});
const ALL=process.argv.includes('--all');const SITE='https://djspinthat.net';
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'shows.json'),'utf8'));const shows=data.shows.filter(s=>s.status!=='cancelled').sort((a,b)=>(a.order||0)-(b.order||0));
const citySlug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const nightNo=s=>(s.night.match(/\d+/)||['1'])[0];
const slugOf=s=>citySlug(s.city)+'-'+nightNo(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=iso=>new Date(iso+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const nightLabel=s=>s.night.replace(' (FESTA)','');
const tagOf=c=>'BTS_WORLDTOUR_ARIRANG_'+c.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]/g,'').toUpperCase();
const played=shows.filter(s=>s.songs&&s.songs.length);
const PLAYS={};played.forEach(s=>s.songs.forEach(x=>{(PLAYS[x.title]=PLAYS[x.title]||[]).push(s)}));
const today=new Date().toISOString().slice(0,10);

const CSS=`*{box-sizing:border-box}:root{--bg:#0c0a12;--panel:#16121f;--line:#2e2840;--ink:#f3effa;--muted:#b6a9d0;--red:#ff2a4b;--violet:#a855f7;--lilac:#d9c6ff;color-scheme:dark}
body{margin:0;background:radial-gradient(60% 40% at 0% 0%,rgba(255,42,75,.22),transparent 70%),radial-gradient(60% 40% at 100% 100%,rgba(168,85,247,.25),transparent 70%),var(--bg);color:var(--ink);font:16px/1.55 Outfit,system-ui,-apple-system,"Segoe UI",sans-serif;min-height:100vh}
main{max-width:860px;margin:0 auto;padding-block:28px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:grid;gap:22px}
a{color:var(--lilac)}nav.crumbs{font:13px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;color:var(--muted)}nav.crumbs a{color:var(--muted)}
.brand{font:800 22px Outfit,sans-serif;text-decoration:none;text-transform:uppercase;letter-spacing:.02em}.brand .r{color:var(--red)}.brand .p{color:var(--violet)}
h1{font-size:clamp(30px,6vw,48px);line-height:1.05;margin:0;text-wrap:balance}h1 small{display:block;font:600 14px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--lilac);margin-bottom:10px}
.meta{color:var(--muted);margin:0}.songs{display:grid;gap:12px}
.song{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px;display:grid;gap:4px}
.song h2{margin:0;font-size:26px;line-height:1.15}.song .al{color:var(--muted);font-size:14px}.song .note{margin:6px 0 0;color:var(--ink)}
.song .pl{font-size:14px;color:var(--lilac)}.warn{border:1px solid #ffb547;color:#ffd590;border-radius:12px;padding:10px 14px;margin:0}
.row{display:flex;flex-wrap:wrap;gap:10px}.btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);font:600 15px Outfit,sans-serif;text-decoration:none;cursor:pointer}
.btn.main{background:linear-gradient(90deg,var(--red),var(--violet));border:0;color:#fff}.btn:focus-visible{outline:2px solid var(--lilac);outline-offset:2px}
h3{margin:0 0 8px;font:600 13px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.list{display:grid;gap:8px}.list a,.list span.up{display:flex;justify-content:space-between;gap:12px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:var(--panel);text-decoration:none;color:var(--ink)}
.list a b{font-weight:600}.list .d{font:13px "JetBrains Mono",monospace;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}.list .sg{color:var(--lilac);font-size:14px;display:block}
.list span.up{opacity:.6}.pn{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
footer{color:var(--muted);font-size:13px;display:grid;gap:8px;border-top:1px solid var(--line);padding-top:16px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;
const HEAD=(title,desc,url,img,extra='')=>`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="DJ Spin That">
<meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/og-card.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@600&family=Geist:wght@400;600;700&family=Black+Han+Sans&display=swap">
<script data-goatcounter="https://djspinthat.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<style>${CSS}.brand{font-family:"Black Han Sans","Geist",sans-serif!important;font-weight:400!important;display:inline-flex;flex-direction:column;gap:4px;line-height:1}.brand::after{content:"";display:block;height:3px;border-radius:2px;background:linear-gradient(90deg,#ff2a4b,#ff63a9 50%,#a855f7)}body{font-family:"Geist",system-ui,sans-serif!important;font-size:17px}h1{font-family:"Black Han Sans","Geist",sans-serif!important;font-weight:400!important}.song h2{font-family:"Black Han Sans","Geist",sans-serif!important;font-weight:400!important}.song,.list a,.list span.up{border-radius:14px}.btn{border-radius:10px!important}.btn.main{background:#ff5c7f!important;color:#1a0b14!important}</style>${extra}</head><body><main>
<a class="brand" href="/"><span class="r">DJ Spin</span> <span class="p">That</span></a>`;
const FOOT=`<footer><div class="row"><a class="btn" href="https://www.tiktok.com/@djspinthat0" target="_blank" rel="noopener me">TikTok @djspinthat0</a><a class="btn" href="https://www.instagram.com/djspinthat0613/" target="_blank" rel="noopener me">Instagram @djspinthat0613</a><a class="btn" href="https://www.threads.com/@djspinthat0613" target="_blank" rel="noopener me">Threads @djspinthat0613</a></div>
<div><a href="https://ko-fi.com/djspinthat0613" target="_blank" rel="noopener">☕ Love the tracker? Send a spin to keep it free &amp; updating 💜</a></div>
<div>Fan-made · not affiliated with BTS, HYBE or BIGHIT MUSIC. Songs from fan reports and press, checked after every show.</div></footer></main>`;

(async()=>{let b=null,page=null,made=0;const index=[];
 const browser=async()=>{if(!b){b=await chromium.launch();page=await b.newPage({viewport:{width:1200,height:630}});await page.goto('file://'+path.join(__dirname,'og.html'));await page.evaluate(()=>document.fonts.ready)}return page};
 const shot=async(file,d)=>{const p=await browser();await p.evaluate(x=>window.fill(x),d);await p.waitForTimeout(120);await p.screenshot({path:file,type:'jpeg',quality:86});made++};

 played.forEach((s,i)=>{s._slug=slugOf(s)});
 for(let i=0;i<played.length;i++){const s=played[i],slug=s._slug,titles=s.songs.map(x=>x.title),night=nightLabel(s),pair=titles.join(' × ');
  const sig=crypto.createHash('sha1').update(JSON.stringify([s.city,s.night,s.date,titles,!!s.disputed])).digest('hex').slice(0,8);
  const jpg=`${slug}-${sig}.jpg`;index.push({slug,city:s.city,night,date:s.date,songs:titles});
  if(ALL||!fs.existsSync(path.join(OUT,jpg))){
   await shot(path.join(OUT,jpg),{kick:`BTS ARIRANG Tour · ${fmt(s.date)}`,city:s.city,night:`${night} · surprise songs`,songs:titles,note:s.disputed?'Reported live by ARMY':'Every night, every surprise song'});
   for(const f of fs.readdirSync(OUT))if(f.startsWith(slug+'-')&&f!==jpg&&/^[0-9a-f]{8}\.(jpg|png)$/.test(f.slice(slug.length+1)))fs.rmSync(path.join(OUT,f))}
  const url=`${SITE}/s/${slug}.html`,img=`${SITE}/s/${jpg}`;
  const title=`BTS ${s.city} ${night} Surprise Songs: ${pair} · ARIRANG Tour`;
  const desc=`BTS ARIRANG World Tour, ${s.city} ${night} (${fmt(s.date)}, ${s.venue||s.city}). Surprise songs: ${pair}. Fancams, notes and every other night on DJ Spin That (fan-made).`;
  const ld={"@context":"https://schema.org","@type":"MusicEvent","name":`BTS World Tour ARIRANG · ${s.city} ${night}`,"startDate":s.date,"eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode",
   "location":{"@type":"Place","name":s.venue||s.city,"address":{"@type":"PostalAddress","addressLocality":s.city,"addressCountry":s.country||""}},"performer":{"@type":"MusicGroup","name":"BTS"},"image":[img],"url":url,"description":desc};
  const tag=tagOf(s.city),d6=(s.date||'').replace(/-/g,'').slice(2);
  const songCards=s.songs.map(x=>{const pl=PLAYS[x.title]||[];const others=pl.filter(o=>o!==s).map(o=>`${o.city} N${nightNo(o)}`);
   return `<article class="song"><h2>${esc(x.title)}</h2><div class="al">${esc([x.album,x.year,x.unit&&x.unit!=='OT7'?x.unit:''].filter(Boolean).join(' · '))}</div>
<div class="pl">${pl.length>1?`Played ${pl.length}× on the ARIRANG tour · also ${esc(others.slice(0,8).join(', '))}${others.length>8?'…':''}`:'Only played here so far on the ARIRANG tour'}</div>${s.notes&&s.notes[x.title]?`<p class="note">${esc(s.notes[x.title])}</p>`:''}</article>`}).join('\n');
  const prev=played[i-1],next=played[i+1];
  const html=HEAD(title,desc,url,img,`<script type="application/ld+json">${JSON.stringify(ld)}</script>`)+`
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">DJ Spin That</a> › <a href="/s/">ARIRANG tour surprise songs</a> › ${esc(s.city)}</nav>
<header><h1><small>BTS ARIRANG Tour · ${esc(fmt(s.date))}</small>${esc(s.city)} ${esc(night)}: the surprise songs</h1>
<p class="meta">${esc([s.venue,s.city,s.country].filter(Boolean).join(' · '))}</p></header>
${s.disputed?'<p class="warn">Reported live by ARMY at the show. We mark it confirmed once a second source matches.</p>':''}
<section class="songs" aria-label="Surprise songs">${songCards}</section>
<div class="row"><a class="btn main" href="/#${slug}">Open on DJ Spin That</a><button class="btn" type="button" id="share">Share</button><button class="btn" type="button" id="card">📸 I was there: save my card</button></div>
<section><h3>Fancams from this night</h3><div class="row">
<a class="btn" href="https://www.tiktok.com/search/video?q=${encodeURIComponent('#'+tag)}" target="_blank" rel="noopener">TikTok #${esc(tag)}</a>
<a class="btn" href="https://www.instagram.com/explore/tags/${encodeURIComponent(tag.toLowerCase())}/" target="_blank" rel="noopener">Instagram #${esc(tag)}</a>
<a class="btn" href="https://www.youtube.com/results?search_query=${encodeURIComponent(`BTS ${s.city} ${d6} ${titles[0]}`)}" target="_blank" rel="noopener">YouTube</a></div></section>
<section><h3>More from the tour</h3><div class="row"><a class="btn" href="/remix.html">Remix the ARIRANG set</a><a class="btn" href="/#spin">Spin a surprise song</a><a class="btn" href="/moments.html">Tour scrapbook</a></div></section>
<nav class="pn" aria-label="Other nights">${prev?`<a href="/s/${prev._slug}.html">← ${esc(prev.city)} ${esc(nightLabel(prev))}</a>`:'<span></span>'}<a href="/s/">All nights</a>${next?`<a href="/s/${next._slug}.html">${esc(next.city)} ${esc(nightLabel(next))} →</a>`:'<span></span>'}</nav>
${FOOT}
<script src="/share-card.js?v=2"></script>
<script>(function(){var u=${JSON.stringify(url)},t=${JSON.stringify(`${s.city} ${night}: ${pair} 🎧`)};
document.getElementById('share').addEventListener('click',function(){if(navigator.share)navigator.share({title:'DJ Spin That',text:t,url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(function(){document.getElementById('share').textContent='Link copied'});});
document.getElementById('card').addEventListener('click',function(e){if(!window.DJCard)return;DJCard.share({kicker:${JSON.stringify('BTS ARIRANG Tour · '+fmt(s.date))},headline:${JSON.stringify('I was at '+s.city+'\n'+night)},sub:${JSON.stringify(s.venue||'')},label:'The DJ spun',lines:${JSON.stringify(titles)},cta:'What did YOUR night get? 👇',url:${JSON.stringify('djspinthat.net/s/'+slug)},file:${JSON.stringify('dj-spin-that-'+slug)},text:t+' '+u,track:${JSON.stringify('show/'+slug)}},e.currentTarget)});})();</script>
</body></html>
`;
  fs.writeFileSync(path.join(OUT,slug+'.html'),html)}

 // every night, city by city
 const legs={};for(const s of shows){const k=s.date.slice(0,7);(legs[k]=legs[k]||[]).push(s)}
 const month=k=>new Date(k+'-15T12:00:00Z').toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
 const allTitle='Every BTS ARIRANG Tour Surprise Song, City by City · DJ Spin That';
 const allDesc=`All ${played.length} nights of BTS ARIRANG World Tour surprise songs so far, from ${played[0]?played[0].city:''} to ${played.length?played[played.length-1].city:''}. Updated after every show. Fan-made.`;
 if(ALL||!fs.existsSync(path.join(ROOT,'og-tour.jpg')))await shot(path.join(ROOT,'og-tour.jpg'),{kick:'BTS ARIRANG Tour · every night',city:'Surprise songs',night:'City by city · updated after every show',songs:played.slice(-2).map(s=>`${s.city} N${nightNo(s)}`),note:`${played.length} nights so far`});
 fs.writeFileSync(path.join(OUT,'index.html'),HEAD(allTitle,allDesc,`${SITE}/s/`,`${SITE}/og-tour.jpg`)+`
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">DJ Spin That</a> › ARIRANG tour surprise songs</nav>
<header><h1><small>BTS ARIRANG World Tour</small>Every surprise song, city by city</h1><p class="meta">${played.length} nights so far · updated after every show</p></header>
${Object.keys(legs).sort().reverse().map(k=>`<section><h3>${esc(month(k))}</h3><div class="list">${legs[k].slice().reverse().map(s=>s.songs&&s.songs.length?`<a href="/s/${slugOf(s)}.html"><span><b>${esc(s.city)} ${esc(nightLabel(s))}</b><span class="sg">${esc(s.songs.map(x=>x.title).join(' × '))}</span></span><span class="d">${esc(fmt(s.date))}</span></a>`:`<span class="up"><span><b>${esc(s.city)} ${esc(nightLabel(s))}</b><span class="sg">Coming up</span></span><span class="d">${esc(fmt(s.date))}</span></span>`).join('')}</div></section>`).join('\n')}
${FOOT}</body></html>
`);
 fs.writeFileSync(path.join(OUT,'index.json'),JSON.stringify(index));

 // preview images for the Remix and Moments pages
 if(ALL||!fs.existsSync(path.join(ROOT,'og-remix.jpg')))await shot(path.join(ROOT,'og-remix.jpg'),{kick:'BTS ARIRANG Tour · ARMY edition',city:'Remix the set',night:'Move any song · add one of your own',songs:['Your song','after Butter?'],note:'Spin the 2 surprise songs too'});
 if(ALL||!fs.existsSync(path.join(ROOT,'og-moments.jpg'))){let m=[];try{m=JSON.parse(fs.readFileSync(path.join(ROOT,'moments.json'),'utf8')).moments.map(x=>x.label)}catch(e){}
  await shot(path.join(ROOT,'og-moments.jpg'),{kick:'BTS ARIRANG Tour · fancams',city:'Tour scrapbook',night:'The moments ARMY waits for, city by city',songs:m.slice(0,3).length?['Hooligan outfits','The monitor spin']:['Every show','every moment'],note:'Send your fancam'})}

 // sitemap + robots
 const urls=[[`${SITE}/`,today,'daily','1.0'],[`${SITE}/s/`,today,'daily','0.9'],[`${SITE}/remix.html`,today,'weekly','0.7'],[`${SITE}/moments.html`,today,'weekly','0.7'],[`${SITE}/played/`,today,'daily','0.8'],...played.map(s=>[`${SITE}/s/${slugOf(s)}.html`,s.date,'monthly','0.8'])];
 fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u,d,c,p])=>`  <url><loc>${u}</loc><lastmod>${d}</lastmod><changefreq>${c}</changefreq><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
 fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /post-kit.html\nDisallow: /komca-check.html\nDisallow: /gif-labeler.html\nDisallow: /tools/\nDisallow: /little-army/\n\nSitemap: ${SITE}/sitemap.xml\n`);
 if(b)await b.close();console.log(`${played.length} show pages, ${made} new images, sitemap ${urls.length} URLs`)})();
