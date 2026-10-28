(()=>{
  const output=document.querySelector('#visitor-total');
  if(!output)return;
  let started=false;
  async function recordVisit(){
    if(started||document.visibilityState!=='visible')return;
    started=true;
    let visitorId;
    try {
      const key='xinyu-visitor-id-v1';
      visitorId=localStorage.getItem(key);
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId||'')){
        visitorId=crypto.randomUUID();localStorage.setItem(key,visitorId);
      }
    } catch { visitorId=undefined; }
    try {
      const response=await fetch('/api/visits',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(visitorId?{visitorId}:{}),signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new Error('unavailable');
      const data=await response.json();
      if(!Number.isSafeInteger(data.total)||data.total<0)throw new Error('invalid count');
      output.textContent=new Intl.NumberFormat('zh-CN').format(data.total);
    } catch {
      output.textContent='—';
      document.querySelector('.visitor-count').title='统计暂时不可用，请稍后刷新。';
    }
  }
  document.addEventListener('visibilitychange',recordVisit);
  recordVisit();
})();
