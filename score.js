// 0–100 Water Score: start at 100 and subtract transparent points. All rules live here.
// Not a safety rating and not a test of any home; it summarizes public records / county well data.
const RULES = {
  public: {
    healthViolation:   { label: 'Health-based violation (last 5 years)', pointsEach: 15, cap: 30 },
    unresolved:        { label: 'Violation not yet resolved', pointsEach: 5, cap: 15 },
    lead15:            { label: 'Lead 90th percentile above 15 ppb (EPA action level)', points: 25 },
    lead10:            { label: 'Lead 90th percentile above 10 ppb (new EPA trigger level)', points: 15 },
    pfoa:              { label: 'PFOA above EPA limit (4 ppt)', points: 15 },
    pfos:              { label: 'PFOS above EPA limit (4 ppt)', points: 15 },
    pfasOther:         { label: 'Other PFAS above EPA limit (PFHxS, PFNA, GenX 10 ppt; Hazard Index 1)', pointsEach: 5, cap: 10 },
    monitoring3:       { label: '3+ missed/late monitoring or reporting violations (5 years)', points: 5 },
    monitoring8:       { label: '8+ missed/late monitoring or reporting violations (5 years)', points: 10 },
  },
  // Wells: points = min(cap, % of county wells over the standard × factor). Typical for the county, not a home.
  well: {
    'E.Coli':           { label: 'E. coli', factor: 1.5, cap: 12 },
    TotalColiform:      { label: 'Coliform bacteria', factor: 0.25, cap: 10 },
    'Nitrate+NitriteN': { label: 'Nitrate', factor: 0.8, cap: 10 },
    'Lead-1stdraw':     { label: 'Lead (first draw)', factor: 0.8, cap: 10 },
    Arsenic:            { label: 'Arsenic', factor: 0.8, cap: 10 },
    Manganese:          { label: 'Manganese', factor: 0.2, cap: 4 },
    Iron:               { label: 'Iron', factor: 0.2, cap: 4 },
    pH:                 { label: 'pH outside 6.5–8.5', factor: 0.1, cap: 3 },
    CorrosivityIndex:   { label: 'Corrosive water', factor: 0.04, cap: 3 },
    hardness:           { label: 'Hard water (median)', over120: 2, over180: 4 },
  },
  bands: [[80, 'Few flags'], [60, 'Some flags'], [40, 'Several flags'], [0, 'Many flags']],
};

const r1 = n => Math.round(n * 10) / 10;

function publicScore(lk) {
  const R = RULES.public, d = [];
  const v5 = lk.viol5 || null;
  if (v5) {
    if (v5.healthBased.length) d.push({ label: R.healthViolation.label, detail: `${v5.healthBased.length} on record`, points: Math.min(R.healthViolation.cap, v5.healthBased.length * R.healthViolation.pointsEach) });
    if (v5.unresolved.length) d.push({ label: R.unresolved.label, detail: `${v5.unresolved.length} not marked returned-to-compliance`, points: Math.min(R.unresolved.cap, v5.unresolved.length * R.unresolved.pointsEach) });
    const mr = v5.monitoring.length;
    if (mr >= 8) d.push({ label: R.monitoring8.label, detail: `${mr} in 5 years`, points: R.monitoring8.points });
    else if (mr >= 3) d.push({ label: R.monitoring3.label, detail: `${mr} in 5 years`, points: R.monitoring3.points });
  }
  const pb = lk.lead90?.value;
  if (typeof pb === 'number') {
    if (pb > 0.015) d.push({ label: R.lead15.label, detail: `${r1(pb * 1000)} ppb`, points: R.lead15.points });
    else if (pb > 0.010) d.push({ label: R.lead10.label, detail: `${r1(pb * 1000)} ppb`, points: R.lead10.points });
  }
  const p = lk.pfas;
  if (p && p.sampled) {
    if (p.pfoa > 4) d.push({ label: R.pfoa.label, detail: `highest average ${p.pfoa} ppt`, points: R.pfoa.points });
    if (p.pfos > 4) d.push({ label: R.pfos.label, detail: `highest average ${p.pfos} ppt`, points: R.pfos.points });
    const others = p.overOther || [];
    if (others.length) d.push({ label: R.pfasOther.label, detail: others.join(', '), points: Math.min(R.pfasOther.cap, others.length * R.pfasOther.pointsEach) });
  }
  const unknowns = [];
  if (!p || !p.sampled) unknowns.push('PFAS (system not sampled in EPA\'s UCMR 5)');
  if (typeof pb !== 'number') unknowns.push('Lead 90th percentile (no EPA record found)');
  if (!v5) unknowns.push('5-year violation history (EPA data unavailable right now)');
  return finish(d, unknowns, 'public');
}

function wellScore(psuCounty, countyName) {
  if (!psuCounty) return { score: null, label: 'No data', deductions: [], unknowns: [`No Penn State well data for ${countyName || 'this county'}`], kind: 'well' };
  const R = RULES.well, p = psuCounty.parameters, d = [];
  for (const [key, rule] of Object.entries(R)) {
    if (key === 'hardness') continue;
    const x = p[key]; if (!x || typeof x.pctFailing !== 'number' || x.pctFailing <= 0) continue;
    const pts = r1(Math.min(rule.cap, x.pctFailing * rule.factor));
    if (pts >= 0.5) d.push({ label: rule.label, detail: `${x.pctFailing}% of county wells over the standard`, points: pts });
  }
  const h = p.Hardness?.median;
  if (h > 180) d.push({ label: R.hardness.label, detail: `${h} mg/L (very hard)`, points: R.hardness.over180 });
  else if (h > 120) d.push({ label: R.hardness.label, detail: `${h} mg/L (hard)`, points: R.hardness.over120 });
  return finish(d, ['Radon, PFAS, VOCs and bacteria in your own well (not in county data)'], 'well');
}

function finish(deductions, unknowns, kind) {
  deductions.sort((a, b) => b.points - a.points);
  const total = deductions.reduce((s, x) => s + x.points, 0);
  const score = Math.max(0, Math.round(100 - total));
  const label = RULES.bands.find(([min]) => score >= min)[1];
  return { score, label, deductions, unknowns, kind };
}

module.exports = { RULES, publicScore, wellScore };
