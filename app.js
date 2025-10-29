const PROJECTS=['pp1','pp2','pp3','pp4','pp5'];
const project=document.body.dataset.project||'pp1';
const STORAGE_PREFIX='checklist-';
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.tabs a').forEach(a=>{
    const href=a.getAttribute('href'); if(href && href.toLowerCase().startsWith(project)) a.classList.add('active');
  });
  document.getElementById('diagnose')?.addEventListener('click',runDiagnostics);
  loadProject(project);
});
async function loadProject(p){
  try{ const data=await loadJsonFor(p); renderPage(data,p); restore(p); wireUp(p); }
  catch(e){
    const host=document.getElementById('sections');
    host.innerHTML=`<div class="criteria"><p class="crit-text">Could not load data for <strong>${p}</strong>.<br>${e.message}</p></div>`;
  }
}
async function loadJsonFor(p){
  const paths=[`data/${p}.json`,`data/${p.toUpperCase()}.json`,`data/${p[0].toUpperCase()+p.slice(1)}.json`];
  let err; for(const path of paths){ try{ const res=await fetch(`${path}?v=${Date.now()}`,{cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status} for ${path}`); return await res.json(); } catch(e){ err=e; } }
  throw err||new Error(`Unable to fetch any variant of ${p}.json`);
}
async function runDiagnostics(){
  const host=document.getElementById('sections'); const rows=[];
  for(const p of PROJECTS){
    const variants=[`data/${p}.json`,`data/${p.toUpperCase()}.json`,`data/${p[0].toUpperCase()+p.slice(1)}.json`];
    let status='❌ not found',detail='';
    for(const v of variants){
      try{ const r=await fetch(`${v}?v=${Date.now()}`,{cache:'no-store'});
        if(r.ok){ status='✅ OK'; detail=v; break; } detail=`${v} → HTTP ${r.status}`;
      } catch(e){ detail=`${v} → ${e.message}`; }
    }
    rows.push(`<div class="criteria"><p class="crit-text"><span class="crit-id">${p.toUpperCase()}</span> ${status}<br><code>${detail}</code></p></div>`);
  }
  const diag=document.createElement('div'); diag.className='card';
  const inner=document.createElement('div'); inner.className='card-inner';
  inner.innerHTML=`<div class="criteria"><p class="crit-text"><strong>Diagnostics</strong></p></div>${rows.join('')}`;
  diag.appendChild(inner); host.prepend(diag);
}
function storageKey(p){return `checklist-${p}-v1`;}
function el(tag,attrs={},children=[]){const n=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='html') n.innerHTML=v; else if(v!==null) n.setAttribute(k,v);});
  [].concat(children).forEach(ch=>{ if(typeof ch==='string') n.appendChild(document.createTextNode(ch)); else if(ch) n.appendChild(ch);}); return n; }
function renderPage(data,p){
  document.title=`${data.title} | Assessment Checklist`;
  document.getElementById('project-title').textContent=data.title||'Portfolio Project';
  document.getElementById('project-subtitle').textContent=data.subtitle||'Assessment Handbook';
  const host=document.getElementById('sections'); host.innerHTML='';
  (data.sections||[]).forEach((section,si)=>{
    const details=el('details',{class:'card',open:section.open?'open':null});
    const summary=el('summary',{},[el('span',{class:'pill'},[section.pill||section.id||'Section']),document.createTextNode(' '+(section.title||''))]);
    details.appendChild(summary);
    const inner=el('div',{class:'card-inner'});
    (section.items||[]).forEach((item,ii)=>{
      const row=el('div',{class:'criteria','data-text':(item.searchText||'')});
      const ptxt=el('p',{class:'crit-text'}); if(item.id) ptxt.appendChild(el('span',{class:'crit-id'},[item.id]));
      ptxt.appendChild(document.createTextNode(' '+item.text)); row.appendChild(ptxt);
      const chk=el('label',{class:'tick'},[el('input',{type:'checkbox',id:`${p}-${si}-${ii}`})]); row.appendChild(chk);
      inner.appendChild(row);
    }); details.appendChild(inner); host.appendChild(details);
  });
}
function save(p){const inputs=[...document.querySelectorAll('input[type="checkbox"]')];
  const data=Object.fromEntries(inputs.map(i=>[i.id,i.checked])); localStorage.setItem(storageKey(p),JSON.stringify(data));}
function restore(p){const data=JSON.parse(localStorage.getItem(storageKey(p))||'{}');
  document.querySelectorAll('input[type="checkbox"]').forEach(i=>{ if(data[i.id]) i.checked=true; });}
function wireUp(p){
  document.querySelectorAll('input[type="checkbox"]').forEach(i=> i.addEventListener('change',()=>save(p)));
  document.getElementById('clearTicks')?.addEventListener('click',()=>{ document.querySelectorAll('input[type="checkbox"]').forEach(i=> i.checked=false); save(p);});
  const cards=[...document.querySelectorAll('details.card')];
  document.getElementById('expandAll')?.addEventListener('click',()=>cards.forEach(d=>d.open=true));
  document.getElementById('collapseAll')?.addEventListener('click',()=>cards.forEach(d=>d.open=false));
  document.getElementById('search')?.addEventListener('input',e=>{
    const q=e.target.value.toLowerCase().trim();
    document.querySelectorAll('.criteria').forEach(row=>{
      const t=(row.innerText+' '+(row.dataset.text||'')).toLowerCase();
      row.style.display = (q && !t.includes(q)) ? 'none' : '';
    });
  });
}
