import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('This test writes test visitors; use only a local preview.');
const total=async()=>{const r=await fetch(base+'/api/visits');assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');return(await r.json()).total;};
const post=(body,extra={})=>fetch(base+'/api/visits',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,...extra},body:JSON.stringify(body)});
const initial=await total();const id=crypto.randomUUID();
let r=await post({visitorId:id});assert.equal(r.status,200);assert.equal((await r.json()).total,initial+1);
const cookie=r.headers.get('set-cookie').split(';')[0];
const repeats=await Promise.all(Array.from({length:8},()=>post({visitorId:id})));
for(const repeat of repeats){assert.equal(repeat.status,200);assert.equal((await repeat.json()).total,initial+1);}
assert.equal(await total(),initial+1,'read-only GET must not increment');
r=await post({visitorId:crypto.randomUUID()});assert.equal((await r.json()).total,initial+2,'new visitor must increment once');
r=await post({},{Cookie:cookie});assert.equal((await r.json()).total,initial+2,'cookie fallback must deduplicate');
assert.equal((await post({visitorId:'invalid'})).status,400);
assert.equal((await post({visitorId:crypto.randomUUID()},{Origin:'https://unrelated.example'})).status,403);
assert.equal(await total(),initial+2,'invalid/cross-site requests must not count');
const home=await fetch(base);assert.equal(home.status,200);const page=await home.text();assert(page.includes('mailto:plum11252021@163.com'));assert(page.includes('visitor-total'));assert(page.includes('image10-cutout.png'));
for(const file of ['assets/portfolio/image2-cutout.png','assets/portfolio/image10-cutout.png','assets/portfolio/image11-cutout.png','visitors.js'])assert.equal((await fetch(base+'/'+file)).status,200,file);
console.log('Passed: persistent totals, concurrent deduplication, distinct visitors, cookie fallback, read-only GET, invalid input, cross-site rejection and page/assets.');
