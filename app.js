(() => {
  let bank = (window.QUESTION_BANK && window.QUESTION_BANK.questions) ? window.QUESTION_BANK.questions : [];
  let generated = [];
  const $ = id => document.getElementById(id);
  const letters = ['A','B','C','D','E'];
  const tierLabel = t => ({1:'Fácil',2:'Médio',3:'Difícil'})[t] || `Tier ${t}`;

  function updateBankStatus(){ $('bankStatus').textContent = `Banco: ${bank.length} questões`; }
  function counts(){ return {1:+$('tier1').value||0,2:+$('tier2').value||0,3:+$('tier3').value||0}; }
  function totalTier(){ const c=counts(); return c[1]+c[2]+c[3]; }
  function validateMix(){
    const n=+$('questionsPerTest').value||0, sum=totalTier();
    $('mixHint').textContent = sum===n ? `Distribuição válida: ${sum} questões.` : `A soma dos tiers é ${sum}; deve ser ${n}.`;
    $('mixHint').style.color = sum===n ? '#15803d' : '#b45309';
    return sum===n && n>0;
  }
  ['questionsPerTest','tier1','tier2','tier3'].forEach(id=>$(id).addEventListener('input',validateMix));

  function shuffle(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; }
  function setMessage(text, bad=false){ $('message').textContent=text; $('message').style.color=bad?'#b91c1c':'#6b7280'; }
  function sampleTier(tier, n, excluded){ const pool=shuffle(bank.filter(q=>q.tier===tier && !excluded.has(q.id))); return pool.slice(0,n); }

  function generate(){
    if(!validateMix()) return setMessage('Ajuste a soma das dificuldades antes de gerar.', true);
    const testCount=+$('testCount').value, c=counts(), excluded=new Set();
    const needed={1:c[1]*testCount,2:c[2]*testCount,3:c[3]*testCount};
    for(const t of [1,2,3]){
      const avail=bank.filter(q=>q.tier===t).length;
      if(avail<needed[t]) return setMessage(`Banco insuficiente no Tier ${t}: são necessárias ${needed[t]} questões distintas, mas há ${avail}. Importe um JSON maior ou reduza esse tier.`,true);
    }
    generated=[];
    for(let i=0;i<testCount;i++){
      let qs=[];
      for(const t of [1,2,3]){ const s=sampleTier(t,c[t],excluded); s.forEach(q=>excluded.add(q.id)); qs.push(...s); }
      generated.push({label:testCount===3?`${i+1}º trimestre`:`Prova ${i+1}`, questions:shuffle(qs)});
    }
    render();
    setMessage(`${testCount} prova(s) gerada(s). Nenhuma questão se repete entre as avaliações.`);
  }

  function render(){
    $('emptyState').style.display=generated.length?'none':'block';
    $('rerollBtn').disabled=!generated.length; $('printTestsBtn').disabled=!generated.length; $('printKeyBtn').disabled=!generated.length; $('exportJsonBtn').disabled=!generated.length;
    $('testsContainer').innerHTML=generated.map((test,ti)=>{
      const rows=test.questions.map((q,qi)=>`<div class="question-row"><div class="qnum">${qi+1}</div><div><div class="qprompt">${escapeHtml(q.prompt)}</div><div class="options">${q.options.map((o,oi)=>`<div class="option"><b>${letters[oi]})</b> ${escapeHtml(o)}</div>`).join('')}</div><div class="meta"><span class="tag tier${q.tier}">Tier ${q.tier} · ${tierLabel(q.tier)}</span><span class="tag">${escapeHtml(q.topic||'História')}</span><span class="tag">${escapeHtml(q.source?.exam||'Fonte não informada')} · Q${q.source?.question??'?'}</span></div></div><label class="reroll-check" title="Selecionar para reroll"><input class="rr" type="checkbox" data-ti="${ti}" data-qi="${qi}"></label></div>`).join('');
      return `<article class="test-card"><div class="test-head"><h2>${escapeHtml($('testTitle').value)} — ${test.label}</h2><span>${test.questions.length} questões</span></div>${rows}<div class="summary">Reroll preserva o tier e impede repetição com qualquer outra questão já usada nas provas atuais.</div></article>`;
    }).join('');
  }

  function rerollSelected(){
    const selected=[...document.querySelectorAll('.rr:checked')];
    if(!selected.length) return setMessage('Marque uma ou mais questões pelo checkbox para fazer reroll.',true);
    const occupied=new Set(); generated.forEach(t=>t.questions.forEach(q=>occupied.add(q.id)));
    for(const el of selected){
      const ti=+el.dataset.ti, qi=+el.dataset.qi, old=generated[ti].questions[qi]; occupied.delete(old.id);
      const pool=shuffle(bank.filter(q=>q.tier===old.tier && !occupied.has(q.id)));
      if(!pool.length){ occupied.add(old.id); return setMessage(`Não há outra questão disponível no Tier ${old.tier} sem criar repetição.`,true); }
      generated[ti].questions[qi]=pool[0]; occupied.add(pool[0].id);
    }
    render(); setMessage(`${selected.length} questão(ões) substituída(s), mantendo a dificuldade e sem repetições.`);
  }

  function header(label){
    return `<div class="print-header"><img src="assets/logo.svg"><div><h1>EMEF UNIVERSITÁRIO — LAJEADO/RS</h1><p>${escapeHtml($('testTitle').value)} · ${escapeHtml(label)}</p><p>História • Questões selecionadas do banco IFSUL</p></div></div>`;
  }
  function printTests(){
    $('printArea').innerHTML=generated.map(test=>`<section class="print-page">${header(test.label)}<div class="student-line"><div>Nome: ________________________________________________</div><div>Turma: ${escapeHtml($('className').value||'________________')}</div></div>${test.questions.map((q,i)=>`<div class="print-question"><b>${i+1}. ${escapeHtml(q.prompt)}</b>${q.options.map((o,oi)=>`<div class="print-option">${letters[oi]}) ${escapeHtml(o)}</div>`).join('')}</div>`).join('')}<div class="source-note">EMEF Universitário • Banco auxiliar de questões de História do IFSUL. Professor(a): ${escapeHtml($('teacherName').value||'________________')}.</div></section>`).join('');
    window.print();
  }
  function printKey(){
    $('printArea').innerHTML=generated.map(test=>`<section class="print-page">${header(`Gabarito — ${test.label}`)}<p><b>Professor(a):</b> ${escapeHtml($('teacherName').value||'—')} &nbsp; <b>Turma:</b> ${escapeHtml($('className').value||'—')}</p><div class="answer-grid">${test.questions.map((q,i)=>`<div class="answer-cell"><b>${i+1}</b><br>${letters[q.answer]}</div>`).join('')}</div><h3 style="margin-top:22px">Rastreabilidade</h3>${test.questions.map((q,i)=>`<div class="print-question">${i+1}. ${escapeHtml(q.source?.exam||'Fonte não informada')} — questão ${q.source?.question??'?'} · Tier ${q.tier} · ${escapeHtml(q.topic||'História')}</div>`).join('')}</section>`).join('');
    window.print();
  }
  function exportJson(){
    const payload={generated_at:new Date().toISOString(),school:'EMEF Universitário — Lajeado/RS',title:$('testTitle').value,class_name:$('className').value,teacher:$('teacherName').value,tests:generated};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='provas_historia_ifsul.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  async function importJson(ev){
    try{ const text=await ev.target.files[0].text(), obj=JSON.parse(text); const arr=Array.isArray(obj)?obj:obj.questions; if(!Array.isArray(arr)) throw new Error('Formato inválido');
      const ids=new Set(); for(const q of arr){ if(!q.id||!q.prompt||!Array.isArray(q.options)||!Number.isInteger(q.answer)||![1,2,3].includes(q.tier)) throw new Error(`Questão inválida: ${q.id||'sem id'}`); if(ids.has(q.id)) throw new Error(`ID duplicado: ${q.id}`); ids.add(q.id); }
      bank=arr; generated=[]; render(); updateBankStatus(); setMessage(`Banco importado com ${bank.length} questões.`);
    }catch(e){ setMessage(`Falha ao importar JSON: ${e.message}`,true); }
  }
  function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  $('generateBtn').addEventListener('click',generate); $('rerollBtn').addEventListener('click',rerollSelected); $('printTestsBtn').addEventListener('click',printTests); $('printKeyBtn').addEventListener('click',printKey); $('exportJsonBtn').addEventListener('click',exportJson); $('importJson').addEventListener('change',importJson);
  updateBankStatus(); validateMix(); render();
})();
