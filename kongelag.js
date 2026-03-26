import { S, saveState } from './kongelag-state.js';
import { toast } from './kongelag-utils.js';
import { renderReg, importCSV, addParticipant, rmParticipant, startTournament, newTournament } from './kongelag-registration.js';
import { renderOverview, scoreNext, renderTov, toggleTovP, confirmEndTov } from './kongelag-tournament.js';
import { getRingOptions, openPop, editPop, closePop, handleOverlayClick, np, npDel, goRings, backScore, selRings, registerScore } from './kongelag-scoring.js';
import { openArchive, closeArchive, handleArchOverlayClick, toggleArchItem, deleteArchEntry, generatePDF, archiveTournament } from './kongelag-archive.js';
import { renderResults } from './kongelag-results.js';
import { showParticipantStats, closePstatPopup, handlePstatOverlayClick } from './kongelag-stats.js';

// ═══ NAVIGATION ═══
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-' + id).classList.add('active');
  if (id === 'overview') renderOverview();
  if (id === 'results')  renderResults();
  if (id === 'tov')      renderTov();
}
function goToReg() { renderReg(); go('reg'); }

// ═══ TEST DATA GENERATOR ═══
function generateTestData() {
  if (!confirm('Dette vil lage en ferdig 10-runders turnering med 12 testdeltakere og tilfeldige poeng (maks 20/runde). Fortsette?')) return;

  S.participants = [];
  S.scores = [];
  S.assignments = [];
  S.round = 1;
  S.active = false;

  const names = ['Ola Nordmann', 'Kari Hansen', 'Per Dahl', 'Anne Berg', 'Lars Johansen', 'Eva Olsen', 'Tommy Nilsen', 'Mona Kristiansen', 'Erik Hansen', 'Ingrid Larsen', 'Svein Pedersen', 'Knut Andersen'];
  names.forEach((name, i) => {
    S.participants.push({ id: 'tp' + i, name });
  });

  S.assignments = S.participants.map((p, i) => ({ pid: p.id, lane: i + 1 }));

  const ROUNDS = 10;
  for (let round = 1; round <= ROUNDS; round++) {
    S.assignments.forEach(a => {
      const score = Math.floor(Math.random() * 21);
      const { allowed, auto } = getRingOptions(score);
      const rings = auto !== null ? auto : allowed[Math.floor(Math.random() * allowed.length)];
      S.scores.push({ id: 'tsc_r' + round + '_' + a.pid, pid: a.pid, lane: a.lane, round, score, rings });
    });
  }

  S.round = ROUNDS;
  S.active = true;
  saveState();
  archiveTournament();
  S.active = false;
  saveState();
  renderReg();
  go('results');
  toast('🧪 Testdata generert — 12 deltakere, 10 runder, maks 20 poeng/runde');
}

// ═══ INIT ═══
if (S.active) go('overview'); else { renderReg(); go('reg'); }

// ═══ CUSTOM EVENT WIRING ═══
document.addEventListener('tournament-started', () => go('overview'));
document.addEventListener('tournament-ended',  () => go('results'));
document.addEventListener('navigate', e => go(e.detail.screen));
document.addEventListener('score-registered', e => {
  if (e.detail.fromTov) {
    renderTov();
  } else {
    renderOverview();
    setTimeout(() => {
      const rs = S.scores.filter(s => s.round === S.round);
      const pend = S.assignments.find(a => !rs.find(s => s.pid === a.pid));
      if (pend) openPop(pend.lane, pend.pid);
    }, 600);
  }
});

// ═══ EVENT LISTENERS ═══
document.getElementById('btn-new-tournament').addEventListener('click', newTournament);
document.getElementById('csvInput').addEventListener('change', importCSV);
document.getElementById('btn-open-archive').addEventListener('click', openArchive);
document.getElementById('btn-test-data').addEventListener('click', generateTestData);
document.getElementById('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') addParticipant(); });
document.getElementById('tournamentNameInput').addEventListener('input', e => { S.name = e.target.value.trim(); });
document.getElementById('btn-add-participant').addEventListener('click', addParticipant);
document.getElementById('startBtn').addEventListener('click', startTournament);
document.getElementById('btn-go-tov').addEventListener('click', () => go('tov'));
document.getElementById('btn-menu').addEventListener('click', () => document.getElementById('side-menu-overlay').classList.add('open'));
document.getElementById('btn-close-menu').addEventListener('click', () => document.getElementById('side-menu-overlay').classList.remove('open'));
document.getElementById('side-menu-overlay').addEventListener('click', e => { if (e.target.id === 'side-menu-overlay') document.getElementById('side-menu-overlay').classList.remove('open'); });
document.getElementById('menu-new-tournament').addEventListener('click', () => { document.getElementById('side-menu-overlay').classList.remove('open'); newTournament(); });
document.getElementById('menu-select-tournament').addEventListener('click', () => { document.getElementById('side-menu-overlay').classList.remove('open'); openArchive(); });
document.getElementById('nextScoreBtn').addEventListener('click', scoreNext);
document.getElementById('btn-go-reg').addEventListener('click', goToReg);
document.getElementById('arch-overlay').addEventListener('click', handleArchOverlayClick);
document.getElementById('btn-close-archive').addEventListener('click', closeArchive);
document.getElementById('btn-go-overview').addEventListener('click', () => go('overview'));
document.getElementById('btn-confirm-end-tov').addEventListener('click', confirmEndTov);
document.getElementById('pop').addEventListener('click', handleOverlayClick);
document.querySelector('.numpad').addEventListener('click', e => {
  const btn = e.target.closest('[data-digit]');
  if (btn) np(btn.dataset.digit);
});
document.getElementById('btn-close-pop').addEventListener('click', closePop);
document.getElementById('btn-np-del').addEventListener('click', npDel);
document.getElementById('btn-go-rings').addEventListener('click', goRings);
document.querySelector('.rings-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-v]');
  if (btn && !btn.disabled) selRings(parseInt(btn.dataset.v));
});
document.getElementById('regBtn').addEventListener('click', registerScore);
document.getElementById('btn-back-score').addEventListener('click', backScore);
document.getElementById('pstat-overlay').addEventListener('click', handlePstatOverlayClick);
document.getElementById('btn-close-pstat').addEventListener('click', closePstatPopup);

// Dynamic content delegation
document.getElementById('pList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="rm"]');
  if (btn) rmParticipant(btn.dataset.pid);
});
document.getElementById('arch-list').addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, id, tid, idx } = el.dataset;
  if (action === 'toggle-arch') toggleArchItem(id);
  else if (action === 'pstat')  showParticipantStats(tid, parseInt(idx));
  else if (action === 'pdf')    generatePDF(id);
  else if (action === 'del-arch') deleteArchEntry(id);
});
document.getElementById('tov-list').addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, pid, lane, rn } = el.dataset;
  if (action === 'toggle-tov') toggleTovP(pid);
  else if (action === 'edit') { e.stopPropagation(); editPop(parseInt(lane), pid, parseInt(rn), true); }
});
