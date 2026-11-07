const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.INFANTPEDIA_PLAYWRIGHT_MODULE || 'playwright');
const {prepare}=require('./readability-browser-fixtures.cjs');
const routes=['/','/tips?month=4','/encyclopedia?tab=health&month=4','/encyclopedia?tab=sleep&month=4','/encyclopedia?tab=feeding&month=4','/encyclopedia?tab=babyfood&month=6','/encyclopedia?tab=dental&month=8','/growth','/settings#settings-account','/wonder-weeks','/privacy'];
let browser; fs.mkdirSync(process.env.INFANTPEDIA_QA_REPORT_DIR || path.resolve(__dirname,'../docs/audits/2026-11-05/readability'),{recursive:true});
(async()=>{browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await prepare(context);const p=await context.newPage(),results=[];
for(const mode of ['light','dark'])for(const url of routes){await p.goto('http://127.0.0.1:3223'+url);await p.locator('main').first().waitFor();await p.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),mode==='dark');await p.waitForTimeout(1200);
results.push({url,mode,...await p.evaluate(()=>{
const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
function rgba(css){ctx.clearRect(0,0,1,1);ctx.fillStyle=css;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].map((v,i)=>i===3?v/255:v);}
function over(a,b){const alpha=a[3]+b[3]*(1-a[3]);return [0,1,2].map(i=>(a[i]*a[3]+b[i]*b[3]*(1-a[3]))/(alpha||1)).concat(alpha);}
function luminance(c){return c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
const sizes={},small=[],lowContrast=[],seen=new Set();let skipped=0,total=0;
for(const el of document.querySelectorAll('main *')){
 const text=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim();if(!text||!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
 const s=getComputedStyle(el),size=parseFloat(s.fontSize);sizes[size]=(sizes[size]||0)+1;total++;
 if(size<14&&small.length<15)small.push({text:text.slice(0,75),size});
 let bg=[255,255,255,1],chain=[],unknown=false;for(let a=el;a;a=a.parentElement){const st=getComputedStyle(a);if(st.backgroundImage!=='none'||+st.opacity!==1){unknown=true;break;}chain.unshift(rgba(st.backgroundColor));}
 if(unknown){skipped++;continue;}for(const c of chain)bg=over(c,bg);const fg=over(rgba(s.color),bg),a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),target=size>=24||size>=18.666&&+s.fontWeight>=700?3:4.5;
 if(ratio<target&&!seen.has(text)){seen.add(text);lowContrast.push({text:text.slice(0,85),size,ratio:+ratio.toFixed(2),color:s.color,background:bg.slice(0,3).map(Math.round),classes:el.className});}
}
return{sizes,total,small,lowContrast:lowContrast.slice(0,25),skippedComplexBackground:skipped,overflow:document.documentElement.scrollWidth>innerWidth+1};
})});}
fs.writeFileSync(path.join(process.env.INFANTPEDIA_QA_REPORT_DIR || path.resolve(__dirname,'../docs/audits/2026-11-05/readability'),(process.argv[2]||'readability-audit')+'.json'),JSON.stringify(results,null,2));console.log(results.map(r=>({url:r.url,mode:r.mode,small:r.small.length,low:r.lowContrast.length,examples:r.lowContrast.slice(0,3).map(x=>x.text+': '+x.ratio)})));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>await browser?.close());
