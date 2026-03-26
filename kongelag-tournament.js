import { S, saveState, initials, avClass } from './kongelag-state.js';
import { escHtml, toast } from './kongelag-utils.js';
import { archiveTournament } from './kongelag-archive.js';
import { openPop, editPop } from './kongelag-scoring.js';

const TOTAL_ROUNDS = 10;

let tovOpenPid = null;

// ═══ OVERVIEW ═══
function renderOverview() {
  const rScores = S.scores.filter(s => s.round === S.round && s.heat === S.heat);
  const total = S.assignments.length, done = rScores.length;

  document.getElementById('ov-tourney-name').textContent = S.name || 'Kongelag';
  document.getElementById('ov-round').textContent = S.round;

  const heatEl = document.getElementById('ov-heat');
  if (S.numHeats > 1) {
    heatEl.textContent = `Pulje ${S.heat}/${S.numHeats}`;
    heatEl.style.display = '';
  } else {
    heatEl.style.display = 'none';
  }

  document.getElementById('ov-sub').textContent = S.numHeats > 1
    ? `Pulje ${S.heat}/${S.numHeats} · Runde ${S.round}/${TOTAL_ROUNDS} · ${done}/${total} fullført`
    : `Runde ${S.round} · ${done}/${total} fullført`;
  document.getElementById('ov-prog-txt').textContent = `${done} av ${total} fullført denne runden`;
  document.getElementById('ov-bar').style.width = `${(done/total)*100}%`;

  const table = document.getElementById('ov-table');
  table.innerHTML = '';

  const rows = S.assignments.map(a => {
    const p = S.participants.find(x => x.id === a.pid);
    const rs = rScores.find(s => s.pid === a.pid);
    const heatScores  = S.scores.filter(s => s.pid === a.pid && s.heat === S.heat);
    const totScore    = heatScores.reduce((sum, s) => sum + s.score, 0);
    const totRings    = heatScores.reduce((sum, s) => sum + s.rings, 0);
    const prevRnd     = S.round > 1 ? S.scores.find(s => s.pid === a.pid && s.round === S.round - 1 && s.heat === S.heat) : null;
    const prevScores  = S.scores.filter(s => s.pid === a.pid && s.round < S.round && s.heat === S.heat);
    const prevTotal   = prevScores.reduce((sum, s) => sum + s.score, 0);
    const prevTotalRings = prevScores.reduce((sum, s) => sum + s.rings, 0);
    return { a, p, rs, totScore, totRings, prevRnd, prevTotal, prevTotalRings, prevCount: prevScores.length };
  }).sort((x,y) => (!x.rs && y.rs) ? -1 : (x.rs && !y.rs) ? 1 : x.a.lane - y.a.lane);

  rows.forEach(row => {
    const d = document.createElement('div');
    d.className = 'tbl-row' + (row.rs ? ' done' : '');
    const prevLine = row.prevRnd
      ? `<div class="prev-rnd">Runde ${S.round - 1}: ${row.prevRnd.score} p · ${row.prevRnd.rings} ★${row.prevCount > 1 ? ` &nbsp;|&nbsp; Samlet: ${row.prevTotal} p · ${row.prevTotalRings} ★` : ''}</div>`
      : '';
    d.innerHTML = `
      <div class="lane-pill">B${row.a.lane}</div>
      <div class="name-cell">
        <div class="nm">${escHtml(row.p.name)}</div>
        <div class="st${row.rs?' ok':''}">${row.rs ? '✓ Ført' : 'Venter…'}</div>
        ${prevLine}
      </div>
      <div class="score-cell" style="color:${row.rs?'var(--text)':'var(--text3)'}">
        ${row.rs ? row.totScore : '—'}
      </div>
      <div class="rings-cell">${row.rs ? row.totRings + ' ★' : '—'}</div>`;
    if (row.rs) {
      d.onclick = () => editPop(row.a.lane, row.a.pid, S.round, S.heat, false);
    } else {
      d.onclick = () => openPop(row.a.lane, row.a.pid);
    }
    table.appendChild(d);
  });

  const pending = rows.find(r => !r.rs);
  const nb = document.getElementById('nextScoreBtn');
  if (pending) {
    nb.textContent = `Bane ${pending.a.lane}: ${pending.p.name} →`;
  } else if (S.round < TOTAL_ROUNDS) {
    nb.textContent = 'Runden er ferdig — Neste runde →';
  } else if (S.heat < S.numHeats) {
    nb.textContent = `Pulje ${S.heat} ferdig — Neste pulje →`;
  } else {
    nb.textContent = 'Alle puljer ferdig — Se resultater →';
  }
}

function scoreNext() {
  const rs = S.scores.filter(s => s.round === S.round && s.heat === S.heat);
  const pend = S.assignments.find(a => !rs.find(s => s.pid === a.pid));
  if (pend) openPop(pend.lane, pend.pid);
  else nextRound();
}

function nextRound() {
  const rs = S.scores.filter(s => s.round === S.round && s.heat === S.heat);
  if (rs.length < S.assignments.length) { toast('Fullfør alle baner i denne runden først!'); return; }
  if (S.round < TOTAL_ROUNDS) {
    S.round++;
    saveState(); renderOverview();
    toast(`Runde ${S.round} startet! 🏹`);
  } else {
    advanceHeat();
  }
}

function advanceHeat() {
  if (S.heat < S.numHeats) {
    S.heat++;
    S.assignments = S.heats[S.heat - 1].assignments;
    S.round = 1;
    saveState();
    toast(`Pulje ${S.heat} av ${S.numHeats} startet! 🏹`);
    document.dispatchEvent(new CustomEvent('navigate', { detail: { screen: 'overview' } }));
  } else {
    document.dispatchEvent(new CustomEvent('navigate', { detail: { screen: 'tov' } }));
  }
}

// ═══ TOURNAMENT DETAILS ═══
function renderTov() {
  const heatPids = S.heats[S.heat - 1]?.pids;
  const participants = heatPids
    ? S.participants.filter(p => heatPids.includes(p.id))
    : S.participants;

  const allHeatsComplete = S.heat >= S.numHeats &&
    S.scores.filter(s => s.round === TOTAL_ROUNDS && s.heat === S.heat).length === S.assignments.length &&
    S.assignments.length > 0;

  document.getElementById('tov-sub').textContent = S.numHeats > 1
    ? `${S.name || 'Kongelag'} · Pulje ${S.heat}/${S.numHeats} · Runde ${S.round} · ${participants.length} deltakere`
    : `${S.name || 'Kongelag'} · Runde ${S.round} · ${participants.length} deltakere`;

  const endBtn = document.getElementById('btn-confirm-end-tov');
  if (!allHeatsComplete && S.numHeats > 1) {
    endBtn.disabled = true;
    endBtn.title = 'Alle puljer må fullføres (10 runder) før turneringen kan avsluttes';
  } else {
    endBtn.disabled = false;
    endBtn.title = '';
  }

  const list = document.getElementById('tov-list');
  const medals = ['🥇','🥈','🥉'];

  const ranked = participants.map(p => {
    const ps = S.scores.filter(s => s.pid === p.id && s.heat === S.heat);
    return { p, tot: ps.reduce((a,x)=>a+x.score,0), rings: ps.reduce((a,x)=>a+x.rings,0), scores: ps };
  }).sort((a,b) => b.tot - a.tot || b.rings - a.rings);

  list.innerHTML = ranked.map((row, ri) => {
    const { p, tot, rings, scores } = row;
    const medal = medals[ri] || `#${ri+1}`;

    const roundNums = [...new Set(scores.map(s => s.round))].sort((a,b)=>a-b);
    const roundRows = roundNums.map(rn => {
      const sc = scores.find(s => s.round === rn);
      const lane = sc.lane || '?';
      return `<div class="tov-rnd-row">
        <div class="tov-rnd-num">R${rn}</div>
        <div class="tov-rnd-lane">Bane ${lane}</div>
        <div class="tov-rnd-score">${sc.score}</div>
        <div class="tov-rnd-rings">${sc.rings} ★</div>
        <button class="tov-edit-btn" data-action="edit" data-lane="${lane}" data-pid="${p.id}" data-rn="${rn}" data-heat="${sc.heat ?? S.heat}">✏</button>
      </div>`;
    }).join('');

    const noRounds = roundNums.length === 0
      ? `<div style="text-align:center;padding:10px 0;font-size:13px;color:var(--text3)">Ingen runder ført ennå</div>`
      : '';

    return `<div class="tov-p-card" id="tov-card-${p.id}">
      <div class="tov-p-hdr" data-action="toggle-tov" data-pid="${p.id}">
        <div class="avatar ${avClass(p.id)}" style="width:38px;height:38px;font-size:12px;flex-shrink:0">${initials(p.name)}</div>
        <div class="tov-p-info">
          <div class="tov-p-name">${medal} ${escHtml(p.name)}</div>
          <div class="tov-p-meta">${roundNums.length} runde${roundNums.length!==1?'r':''} ført</div>
        </div>
        <div class="tov-p-total">
          <div class="tov-p-score">${tot}</div>
          <div class="tov-p-rings">${rings} ★</div>
        </div>
        <div class="tov-chevron" id="tov-chev-${p.id}">▼</div>
      </div>
      <div class="tov-p-body" id="tov-body-${p.id}">
        <div class="tov-rnd-row header-row">
          <div>Runde</div><div>Bane</div><div style="text-align:right">Poeng</div><div style="text-align:right">Ringer</div><div></div>
        </div>
        ${roundRows}${noRounds}
      </div>
    </div>`;
  }).join('');

  if (tovOpenPid) {
    const body = document.getElementById('tov-body-' + tovOpenPid);
    const chev = document.getElementById('tov-chev-' + tovOpenPid);
    const card = document.getElementById('tov-card-' + tovOpenPid);
    if (body) { body.classList.add('open'); chev.classList.add('open'); card.classList.add('expanded'); }
  }
}

function toggleTovP(pid) {
  const body = document.getElementById('tov-body-' + pid);
  const chev = document.getElementById('tov-chev-' + pid);
  const card = document.getElementById('tov-card-' + pid);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open', !isOpen);
  card.classList.toggle('expanded', !isOpen);
  tovOpenPid = isOpen ? null : pid;
}

function confirmEndTov() {
  if (!confirm('Fullfør turneringen?\n\nEtter fullføring kan ikke poeng lenger redigeres. Turneringen arkiveres.')) return;
  archiveTournament();
  S.active = false; saveState();
  document.dispatchEvent(new CustomEvent('tournament-ended'));
}

export { renderOverview, scoreNext, nextRound, advanceHeat, renderTov, toggleTovP, confirmEndTov };
