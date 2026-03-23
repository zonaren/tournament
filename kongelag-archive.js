import { S, saveState } from './kongelag-state.js';
import { escHtml, toast } from './kongelag-utils.js';

function loadArchive() {
  try { return JSON.parse(localStorage.getItem('sk_arch') || '[]'); } catch(e) { return []; }
}
function saveArchive(arch) {
  localStorage.setItem('sk_arch', JSON.stringify(arch));
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
      <div class="arch-pstat-card" data-action="pstat" data-tid="${t.id}" data-idx="${j}">
        <div class="arch-pstat-name">${medals[j]||'#'+(j+1)} ${escHtml(p.name)}</div>
        <div class="arch-pstat-vals">
          <span class="arch-pstat-score">${p.tot} poeng</span>
          <span class="arch-pstat-rings">${p.rings} ★</span>
        </div>
      </div>`).join('');

    return `<div class="arch-item" id="arc-${t.id}">
      <div class="arch-item-hdr" data-action="toggle-arch" data-id="${t.id}">
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
          <button class="arch-pdf-btn" id="pdf-btn-${t.id}" data-action="pdf" data-id="${t.id}">📄 Last ned PDF</button>
          <button class="arch-del-btn" data-action="del-arch" data-id="${t.id}">🗑 Slett oppføring</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

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

      const winner = t.ranked[0];
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(margin, y, pageW - margin*2, 16, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('🏆  Vinner: ' + winner.name + '   —   ' + winner.tot + ' poeng  /  ' + winner.rings + ' ringer', margin + 5, y + 10.5);
      y += 23;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text('Sluttresultat', margin, y);
      y += 6;

      const tableRows = t.ranked.map((p, i) => {
        const avg = p.n > 0 ? (p.tot / p.n).toFixed(1) : '0';
        const best = p.roundScores && p.roundScores.length > 0
          ? Math.max(...p.roundScores.map(r => r.score)) : '—';
        return [(medals[i] || '#' + (i + 1)), p.name, String(p.tot), String(p.rings), String(p.n), avg, String(best)];
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

      const participants = t.ranked.filter(p => p.roundScores && p.roundScores.length > 0);
      if (participants.length > 0) {
        if (y > 220) { doc.addPage(); y = margin; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text('Detaljer per deltaker', margin, y);
        y += 6;

        participants.forEach((p, pi) => {
          const rowsNeeded = p.roundScores.length * 6 + 16;
          if (y + rowsNeeded > 275) { doc.addPage(); y = margin; }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0);
          const rankStr = (medals[pi] || '#' + (pi+1));
          doc.text(rankStr + '  ' + p.name + '  —  ' + p.tot + ' poeng, ' + p.rings + ' ringer', margin, y + 1);
          y += 5;

          const roundRows = p.roundScores.map(r => ['Runde ' + r.round, 'Bane ' + r.lane, String(r.score), r.rings + ' ★']);

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

export { loadArchive, saveArchive, archiveTournament,
         openArchive, closeArchive, handleArchOverlayClick,
         renderArchive, toggleArchItem, deleteArchEntry, generatePDF };
