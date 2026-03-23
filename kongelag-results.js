import { S, avClass, initials } from './kongelag-state.js';
import { escHtml } from './kongelag-utils.js';

function renderResults() {
  const totRounds = S.round;
  const totRings = S.scores.reduce((s,x) => s + x.rings, 0);
  const hi = Math.max(...S.scores.map(x => x.score), 0);
  const totScore = S.scores.reduce((s,x) => s + x.score, 0);

  document.getElementById('res-sub').textContent =
    `${S.participants.length} deltakere · ${totRounds} runde${totRounds !== 1 ? 'r' : ''}`;

  document.getElementById('res-summary').innerHTML = `
    <div class="sum-card"><div class="sum-lbl">Runder spilt</div><div class="sum-val tl">${totRounds}</div></div>
    <div class="sum-card"><div class="sum-lbl">Høyeste poeng</div><div class="sum-val gd">${hi}</div></div>
    <div class="sum-card"><div class="sum-lbl">Totale ringer</div><div class="sum-val gn">${totRings}</div></div>
    <div class="sum-card"><div class="sum-lbl">Totalt poeng</div><div class="sum-val">${totScore}</div></div>`;

  const ranked = S.participants.map(p => {
    const ps = S.scores.filter(s => s.pid === p.id);
    return { ...p, tot: ps.reduce((s,x)=>s+x.score,0), rings: ps.reduce((s,x)=>s+x.rings,0), n: ps.length };
  }).sort((a,b) => b.tot - a.tot || b.rings - a.rings);

  const medals = ['🥇','🥈','🥉'];
  document.getElementById('res-lb').innerHTML = ranked.map((p,i) => `
    <div class="lb-item" style="${i===0?'border-color:rgba(240,180,41,.35);background:rgba(240,180,41,.05)':''}">
      <div class="lb-rank">${medals[i]||'#'+(i+1)}</div>
      <div class="avatar ${avClass(p.id)}" style="width:36px;height:36px;font-size:11px;flex-shrink:0">${initials(p.name)}</div>
      <div class="lb-info">
        <div class="lb-name">${escHtml(p.name)}</div>
        <div class="lb-detail">${p.rings} ringer · ${p.n} runde${p.n!==1?'r':''}</div>
      </div>
      <div class="lb-scores">
        <div class="lb-total">${p.tot}</div>
        <div class="lb-rings">${p.rings} ★</div>
      </div>
    </div>`).join('');
}

export { renderResults };
