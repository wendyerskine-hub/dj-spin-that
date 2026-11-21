// Renders the DJ Spin That handout cards (no photos): PNGs, a 9-up US Letter print PDF, and flip GIFs.
// Usage: node tools/freebies/render-cards.js [outDir]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const OUT=process.argv[2]||path.join(__dirname,'../../social/freebies/live-viewing');fs.mkdirSync(OUT,{recursive:true});
const IDS=['rm','jin','suga','jhope','jimin','v','jk','ot7','dj'];const TPL='file://'+path.join(__dirname,'card.html');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:650,height:1004}});
 const shot=async(m,side,file)=>{await p.goto(`${TPL}?m=${m}&side=${side}`);await p.waitForFunction(()=>window.READY);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);await p.screenshot({path:file})};
 for(const m of IDS)await shot(m,'front',path.join(OUT,`card-${m}-front.png`));
 await shot('jk','back',path.join(OUT,'card-back.png'));
 // print PDF: page 1 = 9 fronts, page 2 = 9 backs (all backs match, so they line up either way)
 const uri=f=>'data:image/png;base64,'+fs.readFileSync(path.join(OUT,f)).toString('base64');
 const grid=imgs=>`<div class="pg"><div class="g">${imgs.map(s=>`<img src="${s}">`).join('')}</div><p>Print at 100% (Actual size) on 250–300 gsm cardstock · cut on the card edges · djspinthat.net</p></div>`;
 const html=`<!doctype html><html><head><style>@page{size:8.5in 11in;margin:0}body{margin:0}.pg{width:8.5in;height:11in;display:flex;flex-direction:column;align-items:center;justify-content:center;page-break-after:always;font:9pt sans-serif;color:#666}
 .g{display:grid;grid-template-columns:repeat(3,55mm);grid-auto-rows:85mm;gap:0;outline:0.2mm solid #bbb}.g img{width:55mm;height:85mm;display:block;outline:0.2mm solid #bbb}p{margin-top:6mm}</style></head><body>
 ${grid(IDS.map(m=>uri(`card-${m}-front.png`)))}${grid(IDS.map(()=>uri('card-back.png')))}</body></html>`;
 const pp=await b.newPage();await pp.setContent(html);await pp.pdf({path:path.join(OUT,'dj-spin-that-photocards-print.pdf'),width:'8.5in',height:'11in',printBackground:true});
 // flip GIFs (front -> back -> front), 360px wide
 const fl=await b.newPage({viewport:{width:420,height:600}});
 for(const m of IDS){const d=fs.mkdtempSync(path.join(os.tmpdir(),'flip-'));
  await fl.setContent(`<html><body style="margin:0;background:#0b0912;display:grid;place-items:center;height:600px;perspective:1400px"><div id="c" style="position:relative;width:325px;height:502px;transform-style:preserve-3d"><img src="${uri(`card-${m}-front.png`)}" style="position:absolute;inset:0;width:100%;height:100%;border-radius:16px;backface-visibility:hidden"><img src="${uri('card-back.png')}" style="position:absolute;inset:0;width:100%;height:100%;border-radius:16px;backface-visibility:hidden;transform:rotateY(180deg)"></div></body></html>`);
  const N=72;for(let f=0;f<N;f++){const t=f/N;let a;if(t<.3)a=0;else if(t<.45)a=180*((t-.3)/.15);else if(t<.8)a=180;else if(t<.95)a=180+180*((t-.8)/.15);else a=360;
   const e=a%180===0?a:a;await fl.evaluate(a=>document.getElementById('c').style.transform=`rotateY(${a}deg)`,e);await fl.screenshot({path:`${d}/f${String(f).padStart(3,'0')}.png`})}
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','18','-i',`${d}/f%03d.png`,'-vf','scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',path.join(OUT,`flip-${m}.gif`)]);
  fs.rmSync(d,{recursive:true,force:true})}
 await b.close();console.log('done',OUT)})();
