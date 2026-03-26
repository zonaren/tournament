const AV = ['av0','av1','av2','av3','av4','av5','av6','av7'];

function loadState() {
  try {
    return {
      name:         localStorage.getItem('sk_n') || '',
      participants: JSON.parse(localStorage.getItem('sk_p') || '[]'),
      scores:       JSON.parse(localStorage.getItem('sk_s') || '[]'),
      assignments:  JSON.parse(localStorage.getItem('sk_a') || '[]'),
      round:        parseInt(localStorage.getItem('sk_r') || '1'),
      active:       localStorage.getItem('sk_x') === '1',
    };
  } catch(e) { return { participants:[], scores:[], assignments:[], round:1, active:false }; }
}

function saveState() {
  localStorage.setItem('sk_n', S.name || '');
  localStorage.setItem('sk_p', JSON.stringify(S.participants));
  localStorage.setItem('sk_s', JSON.stringify(S.scores));
  localStorage.setItem('sk_a', JSON.stringify(S.assignments));
  localStorage.setItem('sk_r', S.round);
  localStorage.setItem('sk_x', S.active ? '1' : '0');
}

const S = loadState();
const SC = { lane: null, pid: null, score: '', rings: null, editId: null, fromTov: false, origScore: null, origRings: null, pendingReplace: false };

function initials(name) {
  return name.split(' ').map(w => w[0] || '').join('').slice(0,2).toUpperCase() || '?';
}
function avClass(pid) {
  const i = S.participants.findIndex(p => p.id === pid);
  return AV[i % 8];
}

export { S, SC, AV, loadState, saveState, initials, avClass };
