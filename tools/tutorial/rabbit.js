// Records the "rabbit hole" TikTok series. Usage: node tools/tutorial/rabbit.js <scenario|all> [outDir]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'../..'),STAGE=path.join(__dirname,'stage.html');
const OUTDIR=process.argv[3]||path.join(ROOT,'social/rabbit-hole');
const mime={'.webm':'video/webm','.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png','.gif':'image/gif','.json':'application/json','.html':'text/html'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function makeHelpers(page,fr){
  const tap=async(sel,opts={})=>{const el=fr.locator(sel).first();
    await el.evaluate(e=>{const d=e.closest('details');if(d&&!d.open&&e.tagName!=='SUMMARY')d.open=true;const r=e.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-90)window.scrollTo({top:r.top+scrollY-innerHeight/2+r.height/2,behavior:'smooth'})});await wait(550);
    await el.evaluate(e=>{const r=e.getBoundingClientRect();const d=document.createElement('div');d.className='tapfx';d.style.left=(r.left+r.width/2)+'px';d.style.top=(r.top+r.height/2)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)});
    await wait(180);if(opts.select)await el.selectOption(opts.select);else await el.evaluate(e=>e.click());await wait(opts.after||700)};
  const scrollToSel=async(sel,off=60,ms=1000)=>{await fr.evaluate(([s,o])=>{const e=document.querySelector(s);if(e)window.scrollTo({top:e.getBoundingClientRect().top+scrollY-o,behavior:'smooth'})},[sel,off]);await wait(ms)};
  const cap=(a,b,c)=>page.evaluate(([a,b,c])=>caption(a,b,c),[a,b,c]);
  const tab=t=>tap(`#tabbar button[data-tab=${t}]`,{after:800});
  const unitRow=async t=>{await fr.evaluate(t=>{const s=[...document.querySelectorAll('#unitPlayed details.urow')].find(d=>d.querySelector('.ut').textContent.trim()===t);if(s)s.setAttribute('data-pick',t)},t);await tap(`#unitPlayed details.urow[data-pick="${t}"] > summary`,{after:1600})};
  return {tap,scrollToSel,cap,tab,unitRow,end:q=>page.evaluate(q=>endCard(q),q)};
}
const SCENARIOS={
 '01-new-army-starter-pack':async({fr,tap,scrollToSel,cap,tab,end})=>{
   await cap('New to BTS?','Let the <em>concert</em> pick your first songs','Every ARIRANG night, two surprise songs from the vault');await wait(3000);
   await cap('Step 1','<em>Spin</em>','A random surprise song from the tour');await scrollToSel('#spin',10,900);await tap('#spinBtn',{after:3000});
   await cap('Step 2','<em>Play</em> it','Spotify, Apple Music or YouTube, one tap');await scrollToSel('#spinBtns',300,1200);await wait(1800);
   await cap('Step 3','Go <em>deeper</em>','Translations, where it was played, and why');await tab('more');await tap('#vaultSel',{select:'Spring Day',after:400});await scrollToSel('#vaultResult',30,1200);await wait(1200);await fr.evaluate(()=>window.scrollBy({top:380,behavior:'smooth'}));await wait(1800);
   await cap('Keep going','Spin <em>again</em>','Your first ten songs are one tap away');await tab('spin');await scrollToSel('#spin',10,700);await tap('#spinBtn',{after:2900});await tap('#spinBtn',{after:2900});
   await cap('','','');await end('Your BTS rabbit hole<br>starts here');await wait(3000)},
 '02-the-vault-is-66-songs-deep':async({fr,tap,scrollToSel,cap,tab,end})=>{
   await cap('ARIRANG Tour','<em>66</em> songs out of the vault','How many do you know?');await tab('list');await scrollToSel('#disco',10,900);await wait(2200);
   await cap('2013','<em>10 songs</em> from the debut era','They remember. Do you?');await tap('#discoList details.alb:nth-child(1) > summary',{after:500});await tap('#discoList details.alb:nth-child(2) > summary',{after:600});
   await tap('#discoList .dsong[aria-label^="No More Dream:"]',{after:2400});
   await cap('Still waiting','What’s <em>your</em> vault song?','The ones BTS haven’t played yet');await tap('#disco .seg button[data-f=left]',{after:900});await scrollToSel('#discoList',120,1000);await wait(2400);
   await cap('','','');await end('Which song are you<br>still waiting for?');await wait(3000)},
 '03-why-tokyo-got-crystal-snow':async({fr,tap,scrollToSel,cap,tab,end})=>{
   await cap('Tokyo · Night 1','BTS played <em>Crystal Snow</em>','That wasn’t random');await tab('show');await tap('#findSel',{select:'tokyo-1',after:600});await scrollToSel('#cityResult',20,1200);await wait(1800);
   await cap('Why Tokyo?','A <em>Japanese original</em>','From Face Yourself (2018), saved for Japanese ARMY');await tab('more');await tap('#vaultSel',{select:'Crystal Snow',after:500});await scrollToSel('#vaultResult .v-play',80,1300);await wait(2600);
   await cap('Your city','What’s <em>your</em> theory?','Send it in on djspinthat.net');await tap('#vaultResult .v-add',{after:1500});await wait(1600);
   await cap('','','');await end('Why did your city<br>get its song?');await wait(3000)},
 '04-rap-line-vs-vocal-line':async({fr,tap,scrollToSel,cap,tab,unitRow,end})=>{
   await cap('Station 4','Rap line <em>vs</em> vocal line','Who’s winning the surprise-song segment?');await tab('bias');await scrollToSel('#units',10,1100);await wait(1800);
   await cap('Rap line · 5','<em>Cypher</em> energy','Cypher Pt.3, Cypher Pt.4, UGH!, DDAENG, Outro: Tear');await unitRow('UGH!');await wait(900);
   await cap('Vocal line · 4','<em>Vocal line</em> magic','Dimple, House of Cards, Lost, 00:00');await unitRow('Dimple');await wait(900);
   await cap('Still in the vault','Respect? <em>Friends?</em> Jamais Vu?','Which unit song do you want in Asia?');await scrollToSel('.unit-left',140,1100);await wait(2400);
   await cap('','','');await end('Rap line or<br>vocal line?');await wait(3000)},
 '05-let-your-bias-pick':async({fr,tap,scrollToSel,cap,tab,end})=>{
   await cap('Song of the day','Let your <em>bias</em> pick','An OT7 song or one of their solo tracks');await tab('bias');await scrollToSel('#bias',10,900);await wait(1200);
   for(const [id,name] of [['rm','RM'],['v','V'],['jk','Jung Kook'],['jin','Jin']]){await cap('Bias pick',`<em>${name}</em> picks…`,'It’s a coin flip');await tap(`.chip[data-id=${id}]`,{after:2100});}
   await cap('Then watch it','Dance practice <em>or</em> live stage','One tap to YouTube');await scrollToSel('#biasResult a.svc.dp',300,1100);await wait(1800);
   await cap('','','');await end('Who’s your bias and<br>what did you get?');await wait(3000)},
 '06-before-the-show-kaohsiung':async({fr,tap,scrollToSel,cap,tab,end})=>{
   await fr.evaluate(()=>document.querySelectorAll('#nextShow em').forEach(e=>e.remove()));
   await cap('Next stop','<em>Kaohsiung</em> Night 1','Place your bets');await wait(3000);
   await cap('Most played so far','<em>Mikrokosmos</em>, Silver Spoon, Outro: Wings','4 plays each');await tab('list');await tap('#discoList .dsong[aria-label^="Mikrokosmos:"]',{after:2600});
   await cap('Tonight','Repeat or <em>deep cut?</em>','Results on djspinthat.net after the show');await tab('spin');await scrollToSel('#spin',10,800);await tap('#spinBtn',{after:3000});
   await cap('','','');await end('Repeat or<br>deep cut?');await wait(3000)},
};
async function record(name){
  const srv=http.createServer((q,r)=>{const u=q.url.split('?')[0].split('#')[0];const f=u==='/__stage'?STAGE:path.join(ROOT,u==='/'?'index.html':u);
    fs.readFile(f,(e,d)=>{if(e){r.statusCode=404;return r.end()}r.setHeader('Content-Type',mime[path.extname(f)]||'text/html');r.end(d)})}).listen(0);
  const port=srv.address().port;const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:540,height:960},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await ctx.route('**/gc.zgo.at/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));await ctx.route('**/itunes.apple.com/**',r=>r.abort());
  const page=await ctx.newPage();await page.goto(`http://localhost:${port}/__stage`);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(p=>document.getElementById('site').src=`http://localhost:${p}/`,port);await wait(3800);
  const fr=page.frames().find(f=>f.url().startsWith(`http://localhost:${port}/`)&&!f.url().includes('__stage'));
  await fr.addStyleTag({content:'.tapfx{position:fixed;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;border:3px solid #fff;background:rgba(199,125,255,.35);pointer-events:none;z-index:9999;animation:tapfx .6s ease-out forwards}@keyframes tapfx{from{transform:scale(.4);opacity:1}to{transform:scale(1.4);opacity:0}}'});
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rh-'));const cdp=await ctx.newCDPSession(page);const ts=[];
  cdp.on('Page.screencastFrame',f=>{fs.writeFileSync(`${tmp}/f${String(ts.length).padStart(5,'0')}.jpg`,Buffer.from(f.data,'base64'));ts.push(f.metadata.timestamp);cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:1080,maxHeight:1920});
  await SCENARIOS[name]({page,fr,...makeHelpers(page,fr)});
  await cdp.send('Page.stopScreencast');await wait(300);await b.close();srv.close();
  const list=ts.map((t,i)=>`file '${tmp}/f${String(i).padStart(5,'0')}.jpg'\nduration ${Math.max((ts[i+1]||t+1)-t,0.001).toFixed(4)}`).join('\n')+`\nfile '${tmp}/f${String(ts.length-1).padStart(5,'0')}.jpg'\n`;
  fs.writeFileSync(`${tmp}/list.txt`,list);fs.mkdirSync(OUTDIR,{recursive:true});const out=path.join(OUTDIR,name+'.mp4');
  execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${tmp}/list.txt`,'-vf','fps=30,scale=1080:1920:flags=lanczos,format=yuv420p','-c:v','libx264','-profile:v','high','-crf','19','-preset','medium','-movflags','+faststart','-an',out]);
  fs.rmSync(tmp,{recursive:true,force:true});console.log('made',out,((ts[ts.length-1]-ts[0])).toFixed(1)+'s');
}
(async()=>{const which=process.argv[2]||'all';for(const n of (which==='all'?Object.keys(SCENARIOS):[which]))await record(n)})().catch(e=>{console.error(e);process.exit(1)});
