const AV = ['av0','av1','av2','av3','av4','av5','av6','av7'];

function loadState() {
  try {
    return {
      participants: JSON.parse(localStorage.getItem('sk_p') || '[]'),
      scores:       JSON.parse(localStorage.getItem('sk_s') || '[]'),
      assignments:  JSON.parse(localStorage.getItem('sk_a') || '[]'),
      round:        parseInt(localStorage.getItem('sk_r') || '1'),
      active:       localStorage.getItem('sk_x') === '1',
    };
  } catch(e) { return { participants:[], scores:[], assignments:[], round:1, active:false }; }
}
function saveState() {
  localStorage.setItem('sk_p', JSON.stringify(S.participants));
  localStorage.setItem('sk_s', JSON.stringify(S.scores));
  localStorage.setItem('sk_a', JSON.stringify(S.assignments));
  localStorage.setItem('sk_r', S.round);
  localStorage.setItem('sk_x', S.active ? '1' : '0');
}

const S = loadState();
const SC = { lane: null, pid: null, score: '', rings: null, editId: null, fromTov: false, origScore: null, origRings: null, pendingReplace: false };
let tovOpenPid = null; // husker hvilket kort som er åpent i Turnerings Oversikt

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-' + id).classList.add('active');
  if (id === 'overview') renderOverview();
  if (id === 'results') renderResults();
  if (id === 'tov') renderTov();
}

function initials(name) {
  return name.split(' ').map(w => w[0] || '').join('').slice(0,2).toUpperCase() || '?';
}
function avClass(pid) {
  const i = S.participants.findIndex(p => p.id === pid);
  return AV[i % 8];
}

// ═══ REGISTRATION ═══
function renderReg() {
  const list = document.getElementById('pList');
  const empty = document.getElementById('pEmpty');
  list.querySelectorAll('.p-item').forEach(e => e.remove());

  S.participants.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'p-item';
    d.innerHTML = `
      <div class="avatar ${AV[i%8]}">${initials(p.name)}</div>
      <div class="p-name">${escHtml(p.name)}</div>
      <div class="p-num">#${i+1}</div>
      <button class="rm-btn" onclick="rmParticipant('${p.id}')">×</button>`;
    list.appendChild(d);
  });

  empty.style.display = S.participants.length === 0 ? '' : 'none';
  const n = S.participants.length;
  document.getElementById('pCount').textContent = n + ' deltaker' + (n !== 1 ? 'e' : '');
  const ok = n >= 2;
  const sb = document.getElementById('startBtn');
  sb.disabled = !ok;
  const ch = document.getElementById('readyChip');
  ch.className = 'chip ' + (ok ? 'chip-ok' : 'chip-warn');
  ch.textContent = ok ? '✓ Klar til start' : 'Minst 2 kreves';
}

function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast('Filen er tom eller har feil format!'); return; }

    // Find header row and locate "Navn" column (case-insensitive)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const navnIdx = headers.findIndex(h => h === 'navn');
    if (navnIdx === -1) { toast('Fant ikke "Navn"-kolonne i CSV-filen!'); return; }

    let added = 0, skipped = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const name = (cols[navnIdx] || '').trim();
      if (!name) continue;
      if (S.participants.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        skipped++; continue;
      }
      S.participants.push({ id: 'p' + Date.now() + i, name });
      added++;
    }
    saveState(); renderReg();
    // Reset input so same file can be re-imported if needed
    event.target.value = '';
    if (added > 0 && skipped === 0)  toast(`✅ Importerte ${added} deltaker${added !== 1 ? 'e' : ''}`);
    else if (added > 0)              toast(`✅ La til ${added}, hoppet over ${skipped} duplikat${skipped !== 1 ? 'er' : ''}`);
    else                             toast(`Alle navn finnes allerede (${skipped} duplikater)`);
  };
  reader.readAsText(file, 'UTF-8');
}

function addParticipant() {
  const inp = document.getElementById('nameInput');
  const name = inp.value.trim();
  if (!name) return;
  if (S.participants.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    toast('Navn finnes allerede!'); return;
  }
  S.participants.push({ id: 'p' + Date.now(), name });
  saveState(); inp.value = ''; renderReg();
}
function rmParticipant(id) {
  S.participants = S.participants.filter(p => p.id !== id);
  saveState(); renderReg();
}

function startTournament() {
  if (S.participants.length < 2) return;
  const sh = [...S.participants].sort(() => Math.random() - 0.5);
  S.assignments = sh.map((p, i) => ({ pid: p.id, lane: i + 1 }));
  S.round = 1; S.scores = []; S.active = true;
  saveState(); go('overview');
}

// ═══ OVERVIEW ═══
function renderOverview() {
  const rScores = S.scores.filter(s => s.round === S.round);
  const total = S.assignments.length, done = rScores.length;

  document.getElementById('ov-round').textContent = S.round;
  document.getElementById('ov-sub').textContent = `Runde ${S.round} · ${done}/${total} fullført`;
  document.getElementById('ov-prog-txt').textContent = `${done} av ${total} fullført denne runden`;
  document.getElementById('ov-bar').style.width = `${(done/total)*100}%`;

  const table = document.getElementById('ov-table');
  table.innerHTML = '';

  const rows = S.assignments.map(a => {
    const p = S.participants.find(x => x.id === a.pid);
    const rs = rScores.find(s => s.pid === a.pid);
    const totScore = S.scores.filter(s => s.pid === a.pid).reduce((sum, s) => sum + s.score, 0);
    const totRings = S.scores.filter(s => s.pid === a.pid).reduce((sum, s) => sum + s.rings, 0);
    const prevRnd = S.round > 1 ? S.scores.find(s => s.pid === a.pid && s.round === S.round - 1) : null;
    const prevScores = S.scores.filter(s => s.pid === a.pid && s.round < S.round);
    const prevTotal = prevScores.reduce((sum, s) => sum + s.score, 0);
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
      <div class="name-cell" style="display:flex;align-items:center;gap:9px">
        <div class="avatar ${avClass(row.p.id)}" style="width:34px;height:34px;font-size:11px">${initials(row.p.name)}</div>
        <div>
          <div class="nm">${escHtml(row.p.name)}</div>
          <div class="st${row.rs?' ok':''}">${row.rs ? '✓ Ført' : 'Venter…'}</div>
          ${prevLine}
        </div>
      </div>
      <div class="lane-pill">B${row.a.lane}</div>
      <div class="score-cell" style="color:${row.rs?'var(--text)':'var(--text3)'}">
        ${row.rs ? row.totScore : '—'}
      </div>
      <div class="rings-cell">${row.rs ? row.totRings + ' ★' : '—'}</div>
      <div style="display:flex;align-items:center;justify-content:center">
        ${row.rs ? `<button class="edit-btn" title="Rediger poengsum">✏</button>` : ''}
      </div>`;
    if (row.rs) {
      const eb = d.querySelector('.edit-btn');
      eb.onclick = (e) => { e.stopPropagation(); editPop(row.a.lane, row.a.pid); };
      d.onclick = () => {};
    } else {
      d.onclick = () => openPop(row.a.lane, row.a.pid);
    }
    table.appendChild(d);
  });

  const pending = rows.find(r => !r.rs);
  const nb = document.getElementById('nextScoreBtn');
  if (pending) nb.textContent = `Bane ${pending.a.lane}: ${pending.p.name} →`;
  else nb.textContent = 'Runden er ferdig — Neste runde →';
}

function scoreNext() {
  const rs = S.scores.filter(s => s.round === S.round);
  const pend = S.assignments.find(a => !rs.find(s => s.pid === a.pid));
  if (pend) openPop(pend.lane, pend.pid);
  else nextRound();
}

function nextRound() {
  const rs = S.scores.filter(s => s.round === S.round);
  if (rs.length < S.assignments.length) { toast('Fullfør alle baner i denne runden først!'); return; }
  S.round++;
  saveState(); renderOverview();
  toast(`Runde ${S.round} startet! 🏹`);
}

function archiveTournament() {
  if (!S.participants.length || !S.scores.length) return;
  const arch = loadArchive();
  const ranked = S.participants.map(p => {
    const ps = S.scores.filter(s => s.pid === p.id);
    const roundScores = ps.map(s => ({ round: s.round, lane: s.lane, score: s.score, rings: s.rings }))
      .sort((a, b) => a.round - b.round);
    return {
      name: p.name,
      tot: ps.reduce((a,x)=>a+x.score,0),
      rings: ps.reduce((a,x)=>a+x.rings,0),
      n: ps.length,
      roundScores
    };
  }).sort((a,b) => b.tot - a.tot || b.rings - a.rings);
  arch.push({
    id: 'arc' + Date.now(),
    date: new Date().toLocaleDateString('no-NO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    rounds: S.round,
    ranked
  });
  saveArchive(arch);
}

function loadArchive() {
  try { return JSON.parse(localStorage.getItem('sk_arch') || '[]'); } catch(e) { return []; }
}
function saveArchive(arch) {
  localStorage.setItem('sk_arch', JSON.stringify(arch));
}

function openArchive() {
  renderArchive();
  document.getElementById('arch-overlay').classList.add('open');
}
function closeArchive() { document.getElementById('arch-overlay').classList.remove('open'); }
function handleArchOverlayClick(e) { if (e.target.id === 'arch-overlay') closeArchive(); }

function renderArchive() {
  const arch = loadArchive();
  const list = document.getElementById('arch-list');
  if (!arch.length) {
    list.innerHTML = `<div class="arch-empty">
      <div class="arch-empty-ico">📭</div>
      <div class="arch-empty-ttl">Ingen fullførte turneringer ennå</div>
      <div class="arch-empty-sub">Avsluttede turneringer vises her</div>
    </div>`;
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  list.innerHTML = [...arch].reverse().map((t, i) => {
    const winner = t.ranked[0];
    const rows = t.ranked.map((p, j) => `
      <div class="arch-lb-row">
        <div class="arch-lb-rank">${medals[j]||'#'+(j+1)}</div>
        <div class="arch-lb-name">${escHtml(p.name)}</div>
        <div style="text-align:right;flex-shrink:0">
          <div class="arch-lb-score">${p.tot}</div>
          <div class="arch-lb-rings">${p.rings} ★</div>
        </div>
      </div>`).join('');

    const participantCards = t.ranked.map((p, j) => `
      <div class="arch-pstat-card" onclick="showParticipantStats('${t.id}', ${j})">
        <div class="arch-pstat-name">${medals[j]||'#'+(j+1)} ${escHtml(p.name)}</div>
        <div class="arch-pstat-vals">
          <span class="arch-pstat-score">${p.tot} poeng</span>
          <span class="arch-pstat-rings">${p.rings} ★</span>
        </div>
      </div>`).join('');

    return `<div class="arch-item" id="arc-${t.id}">
      <div class="arch-item-hdr" onclick="toggleArchItem('${t.id}')">
        <div class="arch-trophy">🏆</div>
        <div style="flex:1;min-width:0">
          <div class="arch-date">${t.date} · ${t.ranked.length} deltakere · ${t.rounds} runde${t.rounds!==1?'r':''}</div>
          <div class="arch-winner">${escHtml(winner.name)}</div>
          <div class="arch-meta">${winner.tot} poeng · ${winner.rings} ringer</div>
        </div>
        <div class="arch-chevron" id="chev-${t.id}">▼</div>
      </div>
      <div class="arch-detail" id="det-${t.id}">
        <div style="padding-top:10px">${rows}</div>
        <div style="margin-top:14px">
          <div class="sec-lbl" style="margin-bottom:9px">Deltaker statistikk</div>
          <div class="arch-participants-grid">${participantCards}</div>
        </div>
        <div class="arch-action-row">
          <button class="arch-pdf-btn" id="pdf-btn-${t.id}" onclick="generatePDF('${t.id}')">📄 Last ned PDF</button>
          <button class="arch-del-btn" onclick="deleteArchEntry('${t.id}')">🗑 Slett oppføring</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleArchItem(id) {
  const det = document.getElementById('det-' + id);
  const chev = document.getElementById('chev-' + id);
  det.classList.toggle('open');
  chev.classList.toggle('open');
}

function deleteArchEntry(id) {
  if (!confirm('Slette denne oppføringen?')) return;
  const arch = loadArchive().filter(t => t.id !== id);
  saveArchive(arch);
  renderArchive();
}

function confirmEnd() {
  if (confirm('Avslutt turneringen og se sluttresultat?')) {
    archiveTournament();
    S.active = false; saveState(); go('results');
  }
}

function newTournament() {
  if (!confirm('Start ny turnering? All data slettes.')) return;
  S.participants = []; S.scores = []; S.assignments = []; S.round = 1; S.active = false;
  saveState(); renderReg(); go('reg');
}
function goToReg() {
  renderReg(); go('reg');
}

// ═══ TURNERINGS OVERSIKT ═══
function renderTov() {
  const completedRounds = S.round - 1; // rounds with all scores filled
  // If current round is fully scored, include it
  const rsCurrent = S.scores.filter(s => s.round === S.round);
  const currentComplete = rsCurrent.length === S.assignments.length && S.assignments.length > 0;
  const totalRounds = currentComplete ? S.round : completedRounds;

  document.getElementById('tov-sub').textContent =
    `Runde ${S.round} · ${S.participants.length} deltakere`;

  const list = document.getElementById('tov-list');
  const medals = ['🥇','🥈','🥉'];

  // Sort participants by total score desc
  const ranked = S.participants.map(p => {
    const ps = S.scores.filter(s => s.pid === p.id);
    return { p, tot: ps.reduce((a,x)=>a+x.score,0), rings: ps.reduce((a,x)=>a+x.rings,0), scores: ps };
  }).sort((a,b) => b.tot - a.tot || b.rings - a.rings);

  list.innerHTML = ranked.map((row, ri) => {
    const { p, tot, rings, scores } = row;
    const medal = medals[ri] || `#${ri+1}`;

    // Build round rows for all rounds that have a score for this participant
    const roundNums = [...new Set(scores.map(s => s.round))].sort((a,b)=>a-b);
    const roundRows = roundNums.map(rn => {
      const sc = scores.find(s => s.round === rn);
      const ass = S.assignments.find(a => a.pid === p.id);
      const lane = sc.lane || (ass ? ass.lane : '?');
      return `<div class="tov-rnd-row">
        <div class="tov-rnd-num">R${rn}</div>
        <div class="tov-rnd-lane">Bane ${lane}</div>
        <div class="tov-rnd-score">${sc.score}</div>
        <div class="tov-rnd-rings">${sc.rings} ★</div>
        <button class="tov-edit-btn" onclick="event.stopPropagation();editPop(${lane},'${p.id}',${rn},true)">✏</button>
      </div>`;
    }).join('');

    const noRounds = roundNums.length === 0
      ? `<div style="text-align:center;padding:10px 0;font-size:13px;color:var(--text3)">Ingen runder ført ennå</div>`
      : '';

    return `<div class="tov-p-card" id="tov-card-${p.id}">
      <div class="tov-p-hdr" onclick="toggleTovP('${p.id}')">
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

  // Gjenåpne kortet som var åpent før re-render
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
  tovOpenPid = isOpen ? null : pid; // husk åpent kort
}

function confirmEndTov() {
  if (!confirm('Fullfør turneringen?\n\nEtter fullføring kan ikke poeng lenger redigeres. Turneringen arkiveres.')) return;
  archiveTournament();
  S.active = false; saveState(); go('results');
}
function openPop(lane, pid) {
  const p = S.participants.find(x => x.id === pid);
  const already = S.scores.find(s => s.pid === pid && s.round === S.round);
  if (already) { toast(`${p.name} er allerede ført — trykk ✏ for å redigere`); return; }

  SC.lane = lane; SC.pid = pid; SC.score = ''; SC.rings = null; SC.editId = null;
  SC.origScore = null; SC.origRings = null; SC.pendingReplace = false;
  document.getElementById('pop-lane').textContent = `Bane ${lane} · Runde ${S.round}`;
  document.getElementById('pop-name').textContent = p.name;
  document.getElementById('pop-edit-badge').style.display = 'none';
  document.getElementById('regBtn').textContent = 'Registrer og fullfør ✓';
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
  updateScoreDisp();
  document.getElementById('pop').classList.add('open');
}

function editPop(lane, pid, round, fromTov) {
  round = (round !== undefined) ? round : S.round;
  const p = S.participants.find(x => x.id === pid);
  const existing = S.scores.find(s => s.pid === pid && s.round === round);
  if (!existing) { openPop(lane, pid); return; }

  SC.lane = lane; SC.pid = pid; SC.editId = existing.id; SC.fromTov = !!fromTov;
  SC.score = existing.score > 0 ? String(existing.score) : '';
  SC.rings = existing.rings;
  SC.origScore = existing.score; SC.origRings = existing.rings; SC.pendingReplace = true;

  document.getElementById('pop-lane').textContent = `Bane ${lane} · Runde ${round}`;
  document.getElementById('pop-name').textContent = p.name;
  document.getElementById('pop-edit-badge').style.display = '';
  document.getElementById('regBtn').textContent = 'Lagre endringer ✓';
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
  updateScoreDisp();
  document.getElementById('pop').classList.add('open');
}

function closePop() { document.getElementById('pop').classList.remove('open'); }
function handleOverlayClick(e) { if (e.target.id === 'pop') closePop(); }

function np(d) {
  if (SC.pendingReplace) { SC.score = ''; SC.pendingReplace = false; }
  if (SC.score.length >= 4) return;
  const next = SC.score + d;
  if (parseInt(next) > 20) return;
  SC.score = next;
  updateScoreDisp();
}
function npDel() {
  if (SC.pendingReplace) { SC.pendingReplace = false; SC.score = ''; }
  else { SC.score = SC.score.slice(0,-1); }
  updateScoreDisp();
}
function updateScoreDisp() {
  const el = document.getElementById('score-disp');
  const fromEl = document.getElementById('score-from');
  el.textContent = SC.score || '0';
  el.className = 'score-num' + (!SC.score ? ' ph' : '');
  if (SC.editId && SC.origScore !== null) {
    const cur = parseInt(SC.score || '0');
    fromEl.style.display = '';
    fromEl.textContent = (SC.pendingReplace || cur === SC.origScore)
      ? `var: ${SC.origScore}`
      : `${SC.origScore} → ${cur}`;
  } else {
    fromEl.style.display = 'none';
  }
}

function goRings() {
  document.getElementById('st-score').style.display = 'none';
  document.getElementById('st-rings').style.display = '';
  document.getElementById('step1').className = 'step done';
  document.getElementById('step2').className = 'step active';
  const newScore = parseInt(SC.score || '0');
  document.getElementById('score-confirm').textContent = newScore;
  const fromConfirm = document.getElementById('score-from-confirm');
  if (SC.editId && SC.origScore !== null && newScore !== SC.origScore) {
    fromConfirm.textContent = `${SC.origScore} → ${newScore}`;
    fromConfirm.style.display = '';
  } else {
    fromConfirm.style.display = 'none';
  }
  const ringsFrom = document.getElementById('rings-from');
  if (SC.editId && SC.origRings !== null) {
    ringsFrom.textContent = `var: ${SC.origRings} ringer`;
    ringsFrom.style.display = '';
  } else {
    ringsFrom.style.display = 'none';
  }
  document.querySelectorAll('.r-btn').forEach(b => b.classList.remove('sel'));
  document.getElementById('regBtn').disabled = true;
  applyRingRules(newScore);
}
function backScore() {
  document.getElementById('st-score').style.display = '';
  document.getElementById('st-rings').style.display = 'none';
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
}

function selRings(v) {
  SC.rings = v;
  document.querySelectorAll('.r-btn').forEach(b => {
    b.classList.toggle('sel', parseInt(b.dataset.v) === v);
  });
  const ringsFrom = document.getElementById('rings-from');
  if (SC.editId && SC.origRings !== null) {
    ringsFrom.textContent = v !== SC.origRings
      ? `${SC.origRings} → ${v} ringer`
      : `var: ${SC.origRings} ringer (uendret)`;
    ringsFrom.style.display = '';
  }
  document.getElementById('regBtn').disabled = false;
}

function registerScore() {
  if (SC.rings === null) return;
  const score = Math.min(20, parseInt(SC.score || '0'));
  const p = S.participants.find(x => x.id === SC.pid);
  if (SC.editId) {
    const idx = S.scores.findIndex(s => s.id === SC.editId);
    if (idx !== -1) S.scores[idx] = { ...S.scores[idx], score, rings: SC.rings };
    saveState(); closePop();
    const scorePart = score !== SC.origScore ? `${SC.origScore}→${score} poeng` : `${score} poeng`;
    const ringsPart = SC.rings !== SC.origRings ? `${SC.origRings}→${SC.rings} ringer` : `${SC.rings} ringer`;
    toast(`${p.name}: ${scorePart}, ${ringsPart} ✏`);
    if (SC.fromTov) renderTov(); else renderOverview();
  } else {
    S.scores.push({ id: 'sc' + Date.now(), pid: SC.pid, lane: SC.lane, round: S.round, score, rings: SC.rings });
    saveState(); closePop();
    toast(`${p.name}: ${score} poeng, ${SC.rings} ringer ✓`);
    renderOverview();
    setTimeout(() => {
      const rs = S.scores.filter(s => s.round === S.round);
      const pend = S.assignments.find(a => !rs.find(s => s.pid === a.pid));
      if (pend) openPop(pend.lane, pend.pid);
    }, 1300);
  }
}

// ═══ RESULTS ═══
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

// ═══ UTIL ═══
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══ PARTICIPANT STATS POPUP ═══
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
  const best = p.roundScores && p.roundScores.length > 0
    ? Math.max(...p.roundScores.map(r => r.score)) : p.tot;

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

// ═══ PDF GENERATION ═══
function generatePDF(tournamentId) {
  const arch = loadArchive();
  const t = arch.find(x => x.id === tournamentId);
  if (!t) { toast('Turnering ikke funnet'); return; }

  const btn = document.getElementById('pdf-btn-' + tournamentId);
  if (btn) { btn.textContent = '⏳ Genererer…'; btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }

  setTimeout(() => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const medals = ['1.', '2.', '3.'];
      const pageW = 210, margin = 18;
      let y = margin;

      // ── HEADER BLOCK ──
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, y, pageW - margin*2, 28, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Hestesko kasting — Turneringsresultat', margin + 6, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(t.date, margin + 6, y + 17);
      doc.text(t.ranked.length + ' deltakere  ·  ' + t.rounds + ' runde' + (t.rounds !== 1 ? 'r' : ''), margin + 6, y + 23);
      y += 35;

      // ── WINNER BANNER ──
      const winner = t.ranked[0];
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(margin, y, pageW - margin*2, 16, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('🏆  Vinner: ' + winner.name + '   —   ' + winner.tot + ' poeng  /  ' + winner.rings + ' ringer', margin + 5, y + 10.5);
      y += 23;

      // ── OVERALL STANDINGS TABLE ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text('Sluttresultat', margin, y);
      y += 6;

      const tableRows = t.ranked.map((p, i) => {
        const avg = p.n > 0 ? (p.tot / p.n).toFixed(1) : '0';
        const best = p.roundScores && p.roundScores.length > 0
          ? Math.max(...p.roundScores.map(r => r.score)) : '—';
        return [
          (medals[i] || '#' + (i + 1)),
          p.name,
          String(p.tot),
          String(p.rings),
          String(p.n),
          avg,
          String(best)
        ];
      });

      doc.autoTable({
        startY: y,
        head: [['Pl.', 'Navn', 'Poeng', 'Ringer', 'Runder', 'Snitt', 'Beste']],
        body: tableRows,
        margin: { left: margin, right: margin },
        styles: { font: 'helvetica', fontSize: 9, textColor: [0,0,0], lineColor: [180,180,180], lineWidth: 0.2 },
        headStyles: { fillColor: [50,50,50], textColor: [255,255,255], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          2: { halign: 'center' }, 3: { halign: 'center' },
          4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' }
        },
        alternateRowStyles: { fillColor: [245,245,245] },
        rowPageBreak: 'auto',
        theme: 'grid'
      });

      y = doc.lastAutoTable.finalY + 14;

      // ── PER-PARTICIPANT ROUND BREAKDOWN ──
      const participants = t.ranked.filter(p => p.roundScores && p.roundScores.length > 0);
      if (participants.length > 0) {
        // Check if we need a new page
        if (y > 220) { doc.addPage(); y = margin; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text('Detaljer per deltaker', margin, y);
        y += 6;

        participants.forEach((p, pi) => {
          // Each participant gets a mini-section; check for page break
          const rowsNeeded = p.roundScores.length * 6 + 16;
          if (y + rowsNeeded > 275) { doc.addPage(); y = margin; }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0);
          const rankStr = (medals[pi] || '#' + (pi+1));
          doc.text(rankStr + '  ' + p.name + '  —  ' + p.tot + ' poeng, ' + p.rings + ' ringer', margin, y + 1);
          y += 5;

          const roundRows = p.roundScores.map(r => [
            'Runde ' + r.round,
            'Bane ' + r.lane,
            String(r.score),
            r.rings + ' ★'
          ]);

          doc.autoTable({
            startY: y,
            head: [['Runde', 'Bane', 'Poeng', 'Ringer']],
            body: roundRows,
            margin: { left: margin + 4, right: margin },
            styles: { font: 'helvetica', fontSize: 8, textColor: [0,0,0], lineColor: [200,200,200], lineWidth: 0.15 },
            headStyles: { fillColor: [100,100,100], textColor: [255,255,255], fontStyle: 'bold', halign: 'center', fontSize: 7 },
            columnStyles: {
              0: { halign: 'left', cellWidth: 28 },
              1: { halign: 'center', cellWidth: 22 },
              2: { halign: 'center', cellWidth: 22 },
              3: { halign: 'center', cellWidth: 22 }
            },
            alternateRowStyles: { fillColor: [248,248,248] },
            theme: 'grid',
            tableWidth: 94
          });
          y = doc.lastAutoTable.finalY + 9;
        });
      }

      // ── FOOTER ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let pg = 1; pg <= pageCount; pg++) {
        doc.setPage(pg);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(160);
        doc.text('Hestesko kasting turneringssystem  ·  Side ' + pg + ' av ' + pageCount, margin, 290);
        doc.text(t.date, pageW - margin, 290, { align: 'right' });
      }

      const safeName = winner.name.replace(/[^a-zA-Z0-9æøåÆØÅ]/g, '_').slice(0, 30);
      doc.save('turnering_' + safeName + '.pdf');
      toast('📄 PDF lastet ned!');
    } catch(err) {
      console.error('PDF error:', err);
      toast('Feil ved PDF-generering: ' + err.message);
    } finally {
      if (btn) { btn.textContent = '📄 Last ned PDF'; btn.style.opacity = ''; btn.style.pointerEvents = ''; }
    }
  }, 50);
}

// ═══ TEST DATA GENERATOR ═══
function generateTestData() {
  if (!confirm('Dette vil lage en ferdig 3-runders turnering med 4 testdeltakere og tilfeldige poeng (maks 20/runde). Fortsette?')) return;

  // Reset state
  S.participants = [];
  S.scores = [];
  S.assignments = [];
  S.round = 1;
  S.active = false;

  // Add 4 test participants
  const names = ['Ola Nordmann', 'Kari Hansen', 'Per Dahl', 'Anne Berg'];
  names.forEach((name, i) => {
    S.participants.push({ id: 'tp' + i, name });
  });

  // Assign fixed lanes (no rotation — same fix as nextRound)
  S.assignments = S.participants.map((p, i) => ({ pid: p.id, lane: i + 1 }));

  // Generate 3 rounds of random scores (0–20 poeng, 0–4 ringer)
  const ROUNDS = 3;
  for (let round = 1; round <= ROUNDS; round++) {
    S.assignments.forEach(a => {
      S.scores.push({
        id: 'tsc_r' + round + '_' + a.pid,
        pid: a.pid,
        lane: a.lane,
        round: round,
        score: Math.floor(Math.random() * 21),   // 0–20
        rings: Math.floor(Math.random() * 5)      // 0–4
      });
    });
  }

  S.round = ROUNDS;
  S.active = true;
  saveState();

  // Archive and go to results
  archiveTournament();
  S.active = false;
  saveState();
  renderReg();
  go('results');
  toast('🧪 Testdata generert — 4 deltakere, 3 runder, maks 20 poeng/runde');
}

// Init
if (S.active) go('overview'); else { renderReg(); go('reg'); }
