/* DJ Spin That · "Save my card" images.
   DJCard.make(opts) draws a 1080x1920 story card (PNG blob); DJCard.share(opts) opens the phone's share sheet
   with the image (Save Image / Instagram / TikTok), or shows it with a Download button on computers.
   opts: {kicker, headline, sub, label, lines:[string|{text,hl}], cta, url, file, text, track}            */
(function(){
const W=1080,H=1920,PAD=84;
const C={bg:"#0c0a12",ink:"#ffffff",lilac:"#d9c6ff",red:"#ff2a4b",violet:"#a855f7",dim:"rgba(255,255,255,.62)"};
const F={head:"Outfit, system-ui, sans-serif",mono:"'JetBrains Mono', ui-monospace, Menlo, monospace"};
function wrap(ctx,text,maxW){const words=String(text).split(/\s+/);const out=[];let line="";
  for(const w of words){const t=line?line+" "+w:w;if(ctx.measureText(t).width<=maxW||!line)line=t;else{out.push(line);line=w}}if(line)out.push(line);return out}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
async function fonts(){try{await Promise.all([document.fonts.load("800 120px Outfit"),document.fonts.load("600 50px Outfit"),document.fonts.load("400 40px Outfit"),document.fonts.load("600 40px 'JetBrains Mono'")])}catch(e){}}
async function make(o){await fonts();const cv=document.createElement("canvas");cv.width=W;cv.height=H;const ctx=cv.getContext("2d");
  // ground: red glow top-left, violet glow bottom-right
  ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
  let g=ctx.createRadialGradient(0,0,0,0,0,1100);g.addColorStop(0,"rgba(255,42,75,.55)");g.addColorStop(1,"rgba(255,42,75,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createRadialGradient(W,H,0,W,H,1200);g.addColorStop(0,"rgba(168,85,247,.6)");g.addColorStop(1,"rgba(168,85,247,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // vinyl, bottom right
  const vx=W-60,vy=H-330,vr=330;ctx.save();ctx.beginPath();ctx.arc(vx,vy,vr,0,Math.PI*2);ctx.fillStyle="#08070c";ctx.fill();
  for(let r=vr-8;r>vr*.38;r-=9){ctx.beginPath();ctx.arc(vx,vy,r,0,Math.PI*2);ctx.strokeStyle=r%18<9?"#1b1626":"#120f1a";ctx.lineWidth=3;ctx.stroke()}
  ctx.beginPath();ctx.moveTo(vx,vy);ctx.arc(vx,vy,vr*.36,-Math.PI/2,Math.PI/2);ctx.fillStyle=C.red;ctx.fill();
  ctx.beginPath();ctx.moveTo(vx,vy);ctx.arc(vx,vy,vr*.36,Math.PI/2,Math.PI*1.5);ctx.fillStyle=C.violet;ctx.fill();
  ctx.beginPath();ctx.arc(vx,vy,12,0,Math.PI*2);ctx.fillStyle="#08070c";ctx.fill();ctx.restore();
  // logo top right
  ctx.textBaseline="alphabetic";ctx.textAlign="right";ctx.font=`800 64px ${F.head}`;ctx.fillStyle=C.red;ctx.fillText("DJ SPIN",W-PAD,PAD+70);ctx.fillStyle=C.violet;ctx.fillText("THAT",W-PAD,PAD+136);
  ctx.textAlign="left";let y=PAD+60;
  // kicker
  if(o.kicker){ctx.font=`600 34px ${F.mono}`;ctx.fillStyle=C.lilac;for(const l of wrap(ctx,o.kicker.toUpperCase(),W-PAD*2-300)){ctx.fillText(l,PAD,y);y+=46}}
  y=Math.max(y,PAD+220);
  // headline: shrink until it fits in 3 lines
  const maxW=W-PAD*2;let size=o.headMax||150,lines;
  do{ctx.font=`800 ${size}px ${F.head}`;lines=[].concat(...String(o.headline||"").split("\n").map(p=>wrap(ctx,p,maxW)));size-=6}while((lines.length>3||lines.some(l=>ctx.measureText(l).width>maxW))&&size>60);
  size+=6;ctx.fillStyle=C.ink;for(const l of lines){y+=size*.98;ctx.fillText(l,PAD,y)}
  y+=30;
  if(o.sub){ctx.font=`400 40px ${F.head}`;ctx.fillStyle=C.lilac;for(const l of wrap(ctx,o.sub,maxW)){y+=50;ctx.fillText(l,PAD,y)}}
  // list
  const items=(o.lines||[]).map(x=>typeof x==="string"?{text:x}:x);
  if(items.length){y+=56;if(o.label){ctx.font=`600 30px ${F.mono}`;ctx.fillStyle=C.dim;ctx.fillText(o.label.toUpperCase(),PAD,y);y+=20}
    // long lists (a whole remix) go in two columns and stop above the record
    const cols=items.length>12?2:1,per=Math.ceil(items.length/cols),colW=cols===2?(maxW-40)/2:maxW-40;
    const room=(cols===2?H-700:H-420)-y;let ls=Math.min(62,Math.floor(room/per/1.32));ls=Math.max(ls,24);const lh=Math.round(ls*1.32);
    const y0=y;items.forEach((it,k)=>{const c=Math.floor(k/per),x=PAD+c*(colW+40);const yy=y0+(k%per+1)*lh;
      ctx.font=`${it.hl?800:600} ${ls}px ${F.head}`;let t=it.text;while(ctx.measureText(t).width>colW-(it.hl?24:0)&&t.length>4)t=t.slice(0,-2);if(t!==it.text)t=t.trim()+"…";
      if(it.hl){const w=ctx.measureText(t).width;rr(ctx,x-12,yy-lh*.82,w+24,lh*.92,lh*.3);ctx.fillStyle="rgba(255,42,75,.85)";ctx.fill()}
      ctx.fillStyle=C.ink;ctx.fillText(t,x,yy-lh*.22)});
    y=y0+per*lh}
  // footer
  const fy=H-PAD-40;ctx.font=`600 40px ${F.head}`;ctx.fillStyle=C.ink;ctx.fillText(o.cta||"Make yours 👇",PAD,fy-110);
  const url=(o.url||"djspinthat.net").replace(/^https?:\/\//,"").replace(/\.html$/,"");ctx.font=`600 44px ${F.mono}`;const uw=ctx.measureText(url).width;
  rr(ctx,PAD,fy-74,uw+64,96,48);ctx.fillStyle="rgba(0,0,0,.55)";ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=C.violet;ctx.stroke();ctx.fillStyle=C.ink;ctx.fillText(url,PAD+32,fy-10);
  ctx.font=`400 26px ${F.head}`;ctx.fillStyle=C.dim;ctx.fillText("Fan-made · not affiliated with BTS, HYBE or BIGHIT MUSIC",PAD,H-48);
  return await new Promise(r=>cv.toBlob(r,"image/png"))}

function modal(blob,o){const u=URL.createObjectURL(blob);let m=document.getElementById("djcard-modal");
  if(!m){m=document.createElement("div");m.id="djcard-modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Your card");
    m.innerHTML=`<style>#djcard-modal{position:fixed;inset:0;z-index:9999;background:rgba(6,4,10,.86);display:grid;place-items:center;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}#djcard-modal .box{display:grid;gap:12px;justify-items:center;max-width:min(420px,100%)}#djcard-modal img{max-height:72vh;max-width:100%;border-radius:18px;box-shadow:0 10px 40px #000}#djcard-modal .row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}#djcard-modal a,#djcard-modal button{font:700 15px Outfit,system-ui,sans-serif;border-radius:999px;padding:11px 20px;min-height:44px;cursor:pointer;text-decoration:none;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff}#djcard-modal a.dl{background:linear-gradient(90deg,#ff2a4b,#a855f7);border:0}#djcard-modal p{margin:0;color:#d9c6ff;font:14px Outfit,system-ui,sans-serif;text-align:center}</style><div class="box"><img alt=""><p>On a phone: press and hold the picture, then Save to Photos. Post it to your Story with a link sticker.</p><div class="row"><a class="dl" download="dj-spin-that-card.png">Download image</a><button type="button" class="cl">Close</button></div></div>`;
    document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m||e.target.closest(".cl"))m.hidden=true});document.addEventListener("keydown",e=>{if(e.key==="Escape")m.hidden=true})}
  const img=m.querySelector("img"),a=m.querySelector("a.dl");img.src=u;img.alt=o.headline||"Your card";a.href=u;a.download=(o.file||"dj-spin-that-card")+".png";m.hidden=false;m.querySelector(".cl").focus()}

async function share(o,btn){const old=btn&&btn.textContent;if(btn){btn.disabled=true;btn.textContent="Making your card…"}
  try{const blob=await make(o);const file=new File([blob],(o.file||"dj-spin-that-card")+".png",{type:"image/png"});
    try{if(typeof window.goatcounter!=="undefined"&&goatcounter.count)goatcounter.count({path:"card/"+(o.track||"card"),event:true})}catch(e){}
    const touch=matchMedia("(hover:none) and (pointer:coarse)").matches;
    if(touch&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:o.text||"",title:"DJ Spin That"});return}catch(e){if(e&&e.name==="AbortError")return}}
    modal(blob,o)}
  finally{if(btn){btn.disabled=false;btn.textContent=old}}}
window.DJCard={make,share};
})();
