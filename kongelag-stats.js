import { loadArchive } from './kongelag-archive.js';

function showParticipantStats(tournamentId, participantIdx) {
  const arch = loadArchive();
  const t = arch.find(x => x.id === tournamentId);
  if (!t) return;
  const p = t.ranked[participantIdx];
  if (!p) return;

  const medals = ['🥇','🥈','🥉'];
  const rank = participantIdx + 1;
  const rankLabel = medals[participantIdx] || '#' + rank;
  const avg = p.n > 0 ? (p.tot / p.n).toFixed(1) : '0';

  document.getElementById('pstat-name').textContent = rankLabel + ' ' + p.name;
  document.getElementById('pstat-sub').textContent =
    t.date + ' · ' + t.rounds + ' runde' + (t.rounds !== 1 ? 'r' : '');

  document.getElementById('pstat-kpi').innerHTML = `
    <div class="pstat-kpi-card">
      <div class="pstat-kpi-val" style="color:var(--teal)">${p.tot}</div>
      <div class="pstat-kpi-lbl">Totalt</div>
    </div>
    <div class="pstat-kpi-card">
      <div class="pstat-kpi-val" style="color:var(--gold)">${p.rings}</div>
      <div class="pstat-kpi-lbl">Ringer ★</div>
    </div>
    <div class="pstat-kpi-card">
      <div class="pstat-kpi-val" style="color:var(--green)">${avg}</div>
      <div class="pstat-kpi-lbl">Snitt/runde</div>
    </div>`;

  const roundsEl = document.getElementById('pstat-rounds');
  if (p.roundScores && p.roundScores.length > 0) {
    roundsEl.innerHTML = p.roundScores.map(r => `
      <div class="pstat-round-row">
        <div class="pstat-rnd-num">R${r.round}</div>
        <div class="pstat-rnd-lane" style="color:var(--text2)">Bane ${r.lane}</div>
        <div class="pstat-rnd-score">${r.score}</div>
        <div class="pstat-rnd-rings">${r.rings} ★</div>
      </div>`).join('');
  } else {
    roundsEl.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:12px 0">
      Ingen runde-data tilgjengelig (eldre turnering)</div>`;
  }

  document.getElementById('pstat-overlay').classList.add('open');
}
function closePstatPopup() { document.getElementById('pstat-overlay').classList.remove('open'); }
function handlePstatOverlayClick(e) { if (e.target.id === 'pstat-overlay') closePstatPopup(); }

export { showParticipantStats, closePstatPopup, handlePstatOverlayClick };
