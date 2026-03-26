import { S, AV, saveState, calcHeats, initials } from './kongelag-state.js';
import { escHtml, toast } from './kongelag-utils.js';
import { saveCurrentToOngoing } from './kongelag-archive.js';

function renderHeatPreview() {
  const el = document.getElementById('heat-preview');
  if (!el) return;
  const n = S.participants.length;
  const lanes = S.lanes || 4;
  if (n < 2) { el.textContent = ''; return; }
  const numHeats = Math.max(2, Math.ceil(n / lanes));
  const baseSize = Math.floor(n / numHeats);
  const extras = n % numHeats;
  const sizeHigh = baseSize + (extras > 0 ? 1 : 0);
  const sizeLow  = baseSize;
  const sizeStr  = sizeHigh === sizeLow ? `${sizeHigh}` : `${sizeLow}–${sizeHigh}`;
  el.textContent = `${numHeats} puljer · ${sizeStr} deltakere per pulje`;
}

function renderReg() {
  const parts = [S.name || 'Ingen navn', `${S.lanes || 4} baner`];
  if (S.location) parts.push(S.location);
  document.getElementById('settings-summary').textContent = parts.join(' · ');

  const list  = document.getElementById('pList');
  const empty = document.getElementById('pEmpty');
  list.querySelectorAll('.p-item').forEach(e => e.remove());

  S.participants.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'p-item';
    d.innerHTML = `
      <div class="avatar ${AV[i%8]}">${initials(p.name)}</div>
      <div class="p-name">${escHtml(p.name)}</div>
      <div class="p-num">#${i+1}</div>
      <button class="rm-btn" data-action="rm" data-pid="${p.id}">×</button>`;
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

  renderHeatPreview();
}

function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast('Filen er tom eller har feil format!'); return; }

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

  S.name      = document.getElementById('tournamentNameInput').value.trim() || 'Kongelag';
  S.lanes     = parseInt(document.getElementById('lanesInput').value) || 4;
  S.location  = document.getElementById('locationInput').value.trim();
  S.eventDate = document.getElementById('eventDateInput').value;
  S.eventTime = document.getElementById('eventTimeInput').value;

  const heats   = calcHeats(S.participants, S.lanes);
  S.heats       = heats;
  S.numHeats    = heats.length;
  S.heat        = 1;
  S.assignments = heats[0].assignments;
  S.round       = 1;
  S.scores      = [];
  S.active      = true;
  saveState();
  document.dispatchEvent(new CustomEvent('tournament-started'));
}

function newTournament() {
  const msg = S.active
    ? 'Start ny turnering? Gjeldende turnering lagres under Pågående.'
    : 'Start ny turnering? All data slettes.';
  if (!confirm(msg)) return;
  if (S.active) saveCurrentToOngoing();
  S.name = ''; S.lanes = 4; S.location = ''; S.eventDate = ''; S.eventTime = '';
  S.participants = []; S.scores = []; S.assignments = [];
  S.round = 1; S.active = false;
  S.heat = 1; S.numHeats = 1; S.heats = [];
  S.ongoingId = null;
  saveState(); renderReg();
  document.dispatchEvent(new CustomEvent('navigate', { detail: { screen: 'reg' } }));
}

function openSettings() {
  document.getElementById('tournamentNameInput').value = S.name || '';
  document.getElementById('lanesInput').value          = S.lanes || 4;
  document.getElementById('locationInput').value       = S.location || '';
  document.getElementById('eventDateInput').value      = S.eventDate || '';
  document.getElementById('eventTimeInput').value      = S.eventTime || '';
  renderHeatPreview();
  document.getElementById('settings-overlay').classList.add('open');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
  renderReg();
}
function handleSettingsOverlayClick(e) {
  if (e.target.id === 'settings-overlay') closeSettings();
}

export { renderReg, renderHeatPreview, importCSV, addParticipant, rmParticipant, startTournament, newTournament, openSettings, closeSettings, handleSettingsOverlayClick };
