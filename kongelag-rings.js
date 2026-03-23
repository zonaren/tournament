function getRingOptions(score) {
  if (score < 5)   return { allowed: [0],       auto: 0 };
  if (score <= 9)  return { allowed: [0, 1],    auto: null };
  if (score <= 12) return { allowed: [0, 1, 2], auto: null };
  if (score <= 14) return { allowed: [1, 2],    auto: null };
  if (score <= 16) return { allowed: [2, 3],    auto: null };
  if (score <= 19) return { allowed: [3],       auto: 3 };
  return           { allowed: [4],              auto: 4 };
}

function applyRingRules(score) {
  const { allowed, auto } = getRingOptions(score);
  document.querySelectorAll('.r-btn').forEach(b => {
    b.disabled = !allowed.includes(parseInt(b.dataset.v));
  });
  if (auto !== null) {
    selRings(auto);
  } else if (SC.rings !== null && allowed.includes(SC.rings)) {
    selRings(SC.rings);
  } else {
    SC.rings = null;
    document.getElementById('regBtn').disabled = true;
  }
}
