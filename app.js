const LS=localStorage,GH='https://api.github.com/repos/';
const guess=()=>{const h=location.hostname,p=location.pathname.split('/')[1];return h.endsWith('github.io')?{owner:h.split('.')[0],repo:p&&!['admin','login','view'].includes(p)?p:h}:{owner:'',repo:''}};
const cfg=()=>({...guess(),...JSON.parse(LS.tufcfg||'{}'),token:LS.tuftok||''});
async function gh(path,method='GET',body){const c=cfg(),r=await fetch(`${GH}${c.owner}/${c.repo}/contents/${path}`+(method==='GET'?'?t='+Date.now():''),{method,headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'},body:body&&JSON.stringify(body)});
 if(!r.ok)throw new Error(r.status===401?'That token was rejected.':r.status===404?'Repository or file not found. Check the username and repository name.':r.status===409||r.status===422?'This changed somewhere else. Reload the page and try again.':'GitHub returned error '+r.status);return r.json()}
const dec=b=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g,'')),c=>c.charCodeAt(0))));
const enc=o=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o,null,2))));
const load=async f=>{const j=await gh(f);return{data:dec(j.content),sha:j.sha}};
const save=async(f,d,sha,msg)=>(await gh(f,'PUT',{message:msg,content:enc(d),sha})).content.sha;
const pub=async f=>(await fetch(f+'?t='+Date.now(),{cache:'no-store'})).json();
const ld=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const hm=d=>d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function state(ct,st,now=new Date()){const[h,m]=ct.club.due.split(':'),due=new Date(now);due.setHours(+h,+m,0,0);const today=ld(now),cx=ct.cancelled.find(x=>x.date===today);
 if(cx)return{c:'idle',t:'Club cancelled today',n:cx.reason||''};
 if(st.done&&st.day===today){const at=new Date(st.at);return{c:'ok',t:'Register complete',n:'Submitted at '+hm(at)+(at>due?' (late)':'')}}
 if(now.getDay()===+ct.club.day){if(now>=due)return{c:'late',t:'Register overdue',n:'It was due by '+hm(due)};const k=Math.ceil((due-now)/6e4);return{c:'due',t:'Register due by '+hm(due),n:k>=60?Math.floor(k/60)+'h '+k%60+'m left':k+' min left'}}
 return{c:'idle',t:'No club today',n:''}}
function sessions(ct,n){const o=[],d=new Date();d.setHours(12,0,0,0);while(d.getDay()!==+ct.club.day)d.setDate(d.getDate()+1);for(let i=0;i<n;i++){const iso=ld(d);o.push({date:iso,d:new Date(d),x:ct.cancelled.find(x=>x.date===iso)});d.setDate(d.getDate()+7)}return o}
const fdate=d=>d.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
