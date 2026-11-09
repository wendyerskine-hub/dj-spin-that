const {chromium}=require('playwright');const [,,S,name,qs,W,H]=process.argv;const N=252;const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:+W,height:+H},deviceScaleFactor:2});
await p.goto('file://'+S+'/comp.html?'+qs);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const d=S+'/fr_'+name;fs.mkdirSync(d,{recursive:true});
for(let i=0;i<N;i++){await p.evaluate(t=>setFrame(t),i/N);await p.screenshot({path:`${d}/f${String(i).padStart(4,'0')}.png`});}
await b.close();console.log('done',name)})();
