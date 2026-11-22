
(function(){
  const read=(k)=>{try{return JSON.parse(localStorage.getItem("patsanstha_"+k)||"[]")}catch(e){return []}};
  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  const notices=document.getElementById("public-notices");
  if(notices){const items=read("notices");notices.innerHTML=items.length?items.map(x=>`<article class="card"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join(""):'<p class="muted">सध्या कोणतीही नवीन सूचना उपलब्ध नाही.</p>';}
  const services=document.getElementById("public-services");
  if(services){const items=read("services");if(items.length)services.innerHTML=items.map(x=>`<article class="card"><div class="ico">✦</div><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join("");}
  const branches=document.getElementById("public-branches");
  if(branches){const items=read("branches");if(items.length)branches.innerHTML=items.map(x=>`<article class="card"><div class="ico">⌖</div><h3>${esc(x.title)}</h3><p>${esc(x.address)}</p>${x.phone?`<p><b>संपर्क:</b> ${esc(x.phone)}</p>`:""}</article>`).join("");}
})();
