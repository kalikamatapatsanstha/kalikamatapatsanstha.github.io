
(function(){
 const keys=["notices","services","branches"];
 const get=k=>{try{return JSON.parse(localStorage.getItem("patsanstha_"+k)||"[]")}catch(e){return []}};
 const set=(k,v)=>localStorage.setItem("patsanstha_"+k,JSON.stringify(v));
 const status=document.getElementById("status");
 const msg=t=>status.textContent=t;
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".admin-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById("panel-"+b.dataset.tab).classList.add("active")}));
 function render(k){const list=document.getElementById(k.slice(0,-1)+"-list");const items=get(k);list.innerHTML=items.length?items.map((x,i)=>`<div class="item-row"><div><b>${esc(x.title)}</b><p>${esc(x.body||x.address||"")}</p>${x.phone?`<small>${esc(x.phone)}</small>`:""}</div><button data-delete="${k}" data-index="${i}">काढून टाका</button></div>`).join(""):'<p class="muted">अद्याप कोणतीही नोंद नाही.</p>';}
 function refresh(){keys.forEach(render)}
 document.getElementById("notice-form").addEventListener("submit",e=>{e.preventDefault();let a=get("notices");a.unshift({title:document.getElementById("notice-title").value.trim(),body:document.getElementById("notice-body").value.trim()});set("notices",a);e.target.reset();refresh();msg("सूचना स्थानिक ब्राउझरमध्ये जतन झाली.");});
 document.getElementById("service-form").addEventListener("submit",e=>{e.preventDefault();let a=get("services");a.unshift({title:document.getElementById("service-title").value.trim(),body:document.getElementById("service-body").value.trim()});set("services",a);e.target.reset();refresh();msg("सेवा स्थानिक ब्राउझरमध्ये जतन झाली.");});
 document.getElementById("branch-form").addEventListener("submit",e=>{e.preventDefault();let a=get("branches");a.unshift({title:document.getElementById("branch-title").value.trim(),address:document.getElementById("branch-address").value.trim(),phone:document.getElementById("branch-phone").value.trim()});set("branches",a);e.target.reset();refresh();msg("शाखेची माहिती स्थानिक ब्राउझरमध्ये जतन झाली.");});
 document.addEventListener("click",e=>{let b=e.target.closest("[data-delete]");if(!b)return;let k=b.dataset.delete,a=get(k);a.splice(Number(b.dataset.index),1);set(k,a);refresh();msg("नोंद काढून टाकली.");});
 document.getElementById("export-btn").addEventListener("click",()=>{const data={};keys.forEach(k=>data[k]=get(k));const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="patsanstha-backup.json";a.click();URL.revokeObjectURL(a.href);msg("बॅकअप डाउनलोड सुरू झाला.");});
 document.getElementById("import-file").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());keys.forEach(k=>{if(Array.isArray(d[k]))set(k,d[k])});refresh();msg("बॅकअप आयात केला.");}catch(err){msg("फाईल वाचता आली नाही. योग्य JSON बॅकअप निवडा.");}e.target.value="";});
 document.getElementById("reset-btn").addEventListener("click",()=>{if(confirm("स्थानिक सूचना, सेवा आणि शाखांची नोंद रिकामी करायची?")){keys.forEach(k=>set(k,[]));refresh();msg("स्थानिक व्यवस्थापन डेटा रिकामा केला.");}});
 refresh();
})();
