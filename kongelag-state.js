const AV = ['av0','av1','av2','av3','av4','av5','av6','av7'];

function loadState() {
  try {
    return {
      name:         localStorage.getItem('sk_n') || '',
      lanes:        parseInt(localStorage.getItem('sk_l') || '4'),
      location:     localStorage.getItem('sk_loc') || '',
      eventDate:    localStorage.getItem('sk_d') || '',
      eventTime:    localStorage.getItem('sk_t') || '',
      participants: JSON.parse(localStorage.getItem('sk_p') || '[]'),
      scores:       JSON.parse(localStorage.getItem('sk_s') || '[]'),
      assignments:  JSON.parse(localStorage.getItem('sk_a') || '[]'),
      round:        parseInt(localStorage.getItem('sk_r') || '1'),
      active:       localStorage.getItem('sk_x') === '1',
      heat:         parseInt(localStorage.getItem('sk_h') || '1'),
      numHeats:     parseInt(localStorage.getItem('sk_nh') || '1'),
      heats:        JSON.parse(localStorage.getItem('sk_hs') || '[]'),
      ongoingId:    localStorage.getItem('sk_oid') || null,
    };
  } catch(e) {
    return { name:'', lanes:4, location:'', eventDate:'', eventTime:'',
             participants:[], scores:[], assignments:[], round:1, active:false,
             heat:1, numHeats:1, heats:[], ongoingId:null };
  }
}

function saveState() {
  localStorage.setItem('sk_n',   S.name || '');
  localStorage.setItem('sk_l',   S.lanes || 4);
  localStorage.setItem('sk_loc', S.location || '');
  localStorage.setItem('sk_d',   S.eventDate || '');
  localStorage.setItem('sk_t',   S.eventTime || '');
  localStorage.setItem('sk_p',   JSON.stringify(S.participants));
  localStorage.setItem('sk_s',   JSON.stringify(S.scores));
  localStorage.setItem('sk_a',   JSON.stringify(S.assignments));
  localStorage.setItem('sk_r',   S.round);
  localStorage.setItem('sk_x',   S.active ? '1' : '0');
  localStorage.setItem('sk_h',   S.heat);
  localStorage.setItem('sk_nh',  S.numHeats);
  localStorage.setItem('sk_hs',  JSON.stringify(S.heats));
  localStorage.setItem('sk_oid', S.ongoingId || '');
}

function calcHeats(participants, lanes) {
  const n = participants.length;
  const numHeats = Math.max(2, Math.ceil(n / lanes));
  const baseSize = Math.floor(n / numHeats);
  const extras = n % numHeats;
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const heats = [];
  let idx = 0;
  for (let i = 0; i < numHeats; i++) {
    const size = i < extras ? baseSize + 1 : baseSize;
    const ps = shuffled.slice(idx, idx + size);
    heats.push({
      heatNum: i + 1,
      pids: ps.map(p => p.id),
      assignments: ps.map((p, j) => ({ pid: p.id, lane: j + 1 }))
    });
    idx += size;
  }
  return heats;
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

export { S, SC, AV, loadState, saveState, calcHeats, initials, avClass };
