// Water report builder: deterministic, rule-based "AI" summary.
// Produces ranked findings from real data only (Penn State county well summaries, EPA SDWIS/ECHO).
// LLM hook: set LLM_PROVIDER (+ its key) and implement llmSummarize() to rewrite the plain-English
// summary. The ranked findings (facts) always come from the rules below, never from the LLM.
const fs = require('fs');
const path = require('path');

const PSU = JSON.parse(fs.readFileSync(path.join(require('./paths').REF_DIR, 'psu-well-summaries.json'), 'utf8'));

// Generic solution categories (no brand names). Product names, if added later, should be marked PLACEHOLDER.
const SOLUTIONS = {
  uv: { name: 'UV disinfection', blurb: 'An ultraviolet lamp on the main line kills bacteria and viruses without chemicals. Usually paired with a well inspection or shock chlorination.' },
  ro: { name: 'Reverse osmosis (RO) drinking water system', blurb: 'An under-sink RO system removes most dissolved contaminants, such as nitrate, arsenic, lead and sodium, from the water you drink and cook with.' },
  softener: { name: 'High-efficiency water softener', blurb: 'Removes the calcium and magnesium that cause scale on fixtures, water heaters and glassware. Also handles low levels of iron. Best for very hard water.' },
  iron: { name: 'Iron & manganese filter', blurb: 'A whole-house oxidizing filter that removes iron and manganese before they stain fixtures and laundry.' },
  neutralizer: { name: 'Acid neutralizer', blurb: 'Raises the pH of acidic, corrosive water so it stops eating at copper pipes and leaching metals like lead and copper.' },
  carbon: { name: 'Activated carbon filtration', blurb: 'Whole-house or point-of-use carbon reduces chlorine and chloramine taste and odor, disinfection byproducts and, with systems certified for it (NSF/ANSI 53), PFAS such as PFOA and PFOS.' },
  leadfilter: { name: 'Certified lead-reduction filter', blurb: 'A point-of-use filter certified for lead reduction (NSF/ANSI 53 or 58) at the kitchen tap.' },
  saltfree: { name: 'Salt-free conditioner (TAC)', blurb: 'Reduces scale buildup in the water heater and pipes with no salt, no brine and usually no power. It does not remove hardness, so some spotting remains.' },
  sediment: { name: 'Sediment filter', blurb: 'Catches sand, silt and rust particles before they reach fixtures and other equipment.' },
  anode: { name: 'Water heater anode rod swap', blurb: 'Replacing the magnesium anode rod usually stops a rotten-egg smell that only comes from hot water.' },
};

// Rules for Penn State county parameters. weight: how much a % failure counts toward urgency.
const WELL_RULES = [
  { key: 'E.Coli', title: 'E. coli bacteria', kind: 'health', weight: 4, solutions: ['uv'],
    standard: 'EPA: no E. coli allowed in drinking water (MCL)',
    explain: 'E. coli means sewage or animal waste is reaching the well, and it can cause serious stomach illness. It\'s the most urgent thing a well test can find.' },
  { key: 'TotalColiform', title: 'Coliform bacteria', kind: 'health', weight: 2.2, solutions: ['uv'],
    standard: 'EPA goal: zero total coliform (Revised Total Coliform Rule)',
    explain: 'Coliform bacteria are an indicator that surface water or contamination can get into the well, which means harmful germs can too. It\'s often caused by a worn well cap, a cracked casing or nearby septic systems.' },
  { key: 'Nitrate+NitriteN', title: 'Nitrate', kind: 'health', weight: 3, solutions: ['ro'],
    standard: 'EPA MCL: 10 mg/L (as nitrogen)',
    explain: 'Nitrate comes from fertilizer, manure and septic systems. Above the EPA limit it is a particular risk for infants under 6 months, so it should never be used to mix formula.' },
  { key: 'Lead-1stdraw', title: 'Lead (first water out of the tap)', kind: 'health', weight: 3, solutions: ['neutralizer', 'leadfilter', 'ro'],
    standard: 'EPA action level: 0.015 mg/L (15 ppb). EPA goal: zero',
    explain: 'Lead usually comes from household plumbing, such as solder, brass fixtures and older pipes, especially when the water is corrosive. No level of lead is considered safe, especially for children and during pregnancy.' },
  { key: 'Arsenic', title: 'Arsenic', kind: 'health', weight: 3, solutions: ['ro'],
    standard: 'EPA MCL: 0.010 mg/L (10 ppb)',
    explain: 'Arsenic occurs naturally in some Pennsylvania bedrock. It has no taste or smell, and long-term exposure above the EPA limit is linked to serious health effects.' },
  { key: 'Copper', title: 'Copper', kind: 'health', weight: 1.5, solutions: ['neutralizer', 'ro'],
    standard: 'EPA action level: 1.3 mg/L',
    explain: 'Copper usually comes from corroding copper pipes. High levels can upset the stomach and leave blue-green stains on fixtures.' },
  { key: 'Manganese', title: 'Manganese', kind: 'nuisance', weight: 1, solutions: ['iron'],
    standard: 'EPA secondary standard: 0.05 mg/L',
    explain: 'Manganese causes black or brown staining and a bitter taste. At much higher levels the EPA also has health advisories, so it\'s worth knowing your number.' },
  { key: 'Iron', title: 'Iron', kind: 'nuisance', weight: 1, solutions: ['iron', 'softener'],
    standard: 'EPA secondary standard: 0.3 mg/L',
    explain: 'Iron causes orange-red stains on sinks, tubs and laundry, a metallic taste, and can feed iron bacteria that clog plumbing.' },
  { key: 'pH', title: 'Acidic or off-balance pH', kind: 'nuisance', weight: 1, solutions: ['neutralizer'],
    standard: 'EPA secondary range: pH 6.5–8.5',
    explain: 'Acidic water (low pH) corrodes pipes and fixtures, causes blue-green stains and pinhole leaks, and can pull lead and copper into the water.' },
  { key: 'CorrosivityIndex', title: 'Corrosive water', kind: 'nuisance', weight: 0.35, solutions: ['neutralizer'],
    standard: 'Penn State criterion: corrosivity index below -0.5 or above 0.5 (no EPA standard)',
    explain: 'Corrosive water slowly dissolves metal plumbing. It\'s the main reason lead and copper show up at the tap, and it shortens the life of water heaters and fixtures.' },
  { key: 'TotalDissolvedSolids', title: 'Dissolved solids (TDS)', kind: 'nuisance', weight: 0.8, solutions: ['ro'],
    standard: 'EPA secondary standard: 500 mg/L',
    explain: 'High TDS can make water taste salty or bitter and leave spots and scale.' },
  { key: 'Chloride', title: 'Chloride (salt)', kind: 'nuisance', weight: 0.8, solutions: ['ro'],
    standard: 'EPA secondary standard: 250 mg/L',
    explain: 'Chloride, often from road salt, gives water a salty taste and speeds up corrosion.' },
];

// One-line "what is it" for the summary at the top of the report.
const WHAT = {
  'E.Coli': 'Bacteria from sewage or animal waste',
  TotalColiform: 'Bacteria that signal the well can be contaminated',
  'Nitrate+NitriteN': 'A chemical from fertilizer, manure and septic systems',
  'Lead-1stdraw': 'A toxic metal, usually from household plumbing',
  Arsenic: 'A naturally occurring toxic element in some PA bedrock',
  Copper: 'A metal from corroding copper pipes',
  Manganese: 'A metal that causes black staining and bitter taste',
  Iron: 'A metal that causes orange-red stains and a metallic taste',
  pH: 'How acidic or alkaline the water is',
  CorrosivityIndex: 'Water that slowly dissolves metal plumbing',
  TotalDissolvedSolids: 'Total minerals and salts dissolved in the water',
  Chloride: 'Salt, often from road salt',
  hardness: 'Calcium and magnesium minerals',
  'hb-violation': 'A legal limit or required treatment step was missed',
  lead90: "Lead measured at homes across your utility's system",
  pfas: '"Forever chemicals" used in non-stick, stain-proof and firefighting products',
  disinfectant: 'Chlorine/chloramine added to keep germs out of pipes',
  'mr-violation': 'Required tests or reports that were late or missed',
  'hardness-unknown': 'Calcium and magnesium minerals',
  'home-plumbing': 'Pipes, solder and fixtures inside your home',
  'sym-hardness': 'Calcium and magnesium minerals that leave scale',
  'sym-iron': 'Iron, a metal that leaves orange-red stains',
  'sym-manganese': 'Manganese, a metal that leaves black or brown stains',
  'sym-sulfur': 'Hydrogen sulfide gas, or bacteria that make it',
  'sym-corrosion': 'Water that dissolves copper and other metal plumbing',
  'sym-cloudy': 'Particles or air in the water',
  'sym-chlorine': 'Chlorine/chloramine added to keep germs out of pipes',
};

function countyData(name) {
  const key = Object.keys(PSU.counties).find(k => k.toLowerCase() === String(name || '').toLowerCase());
  return key ? PSU.counties[key] : null;
}

function buildWatch(r) {
  const sol = ks => ks.map(k => SOLUTIONS[k].name);
  const why = f => f.explain.split(/(?<=[a-z0-9)]\.)\s+(?=[A-Z])/)[0];
  const item = f => ({ id: f.id, title: f.title, level: f.level, kind: f.kind, what: WHAT[f.id] || '', why: why(f), fix: sol(f.solutions), fromSymptoms: !!(f.fromSymptoms || f.symptomMatch), note: f.userNote || null });
  const strong = r.findings.filter(f => f.level === 'high' || f.level === 'moderate');
  // Up to 4 concerns; symptom-based concerns get up to 2 guaranteed slots so what the homeowner sees isn't crowded out.
  const sym = strong.filter(f => f.fromSymptoms || f.symptomMatch).slice(0, 2);
  const data = strong.filter(f => !sym.includes(f)).slice(0, 4 - sym.length);
  const concerns = strong.filter(f => sym.includes(f) || data.includes(f)).map(item);
  const fillers = () => {
    const out = [{ id: 'home-plumbing', title: 'The pipes in your own home', level: 'info', kind: 'unknown', what: WHAT['home-plumbing'],
      why: 'Public records describe the water system, not your house. Lead and copper usually come from household plumbing, especially in homes built before 1986.', fix: sol(['leadfilter']) }];
    for (const id of ['disinfectant', 'hardness-unknown']) { const f = r.findings.find(x => x.id === id); if (f) out.push({ id, title: f.title, level: f.level, kind: f.kind, what: WHAT[id], why: why(f), fix: sol(f.solutions) }); }
    return out.filter(o => !concerns.some(c => c.id === o.id));
  };
  if (concerns.length >= 1) {
    if (r.kind === 'public' && concerns.length < 3) concerns.push(...fillers().slice(0, 3 - concerns.length).map(x => ({ ...x, alsoWorth: true })));
    return { allClear: false, items: concerns };
  }
  const items = [];
  if (r.kind === 'public') items.push(...fillers());
  else r.findings.slice(0, 3).forEach(f => items.push(item(f)));
  return { allClear: true, items };
}

function level(score) { return score >= 25 ? 'high' : score >= 8 ? 'moderate' : 'low'; }
const LEVEL_LABEL = { high: 'High concern', moderate: 'Worth checking', low: 'Lower concern', info: 'Good to know' };

function hardnessFinding(p, area) {
  const m = p?.Hardness?.median; if (m == null) return null;
  const cls = m > 180 ? 'very hard' : m > 120 ? 'hard' : m > 60 ? 'moderately hard' : 'soft';
  if (cls === 'soft') return null;
  const gpg = (m / 17.1).toFixed(1);
  return { id: 'hardness', title: `Hard water (typical: ${cls})`, kind: 'nuisance', level: m > 120 ? 'moderate' : 'low', score: m > 180 ? 12 : m > 120 ? 9 : 4,
    stat: `Median hardness ${m} mg/L (about ${gpg} grains per gallon) across ${p.Hardness.samples} tested wells in ${area}; highest ${p.Hardness.max} mg/L.`,
    explain: 'Hard water leaves white scale on faucets, showerheads and glassware, makes soap less effective, and shortens the life of water heaters and appliances. It isn\'t a health risk.',
    standard: 'No EPA limit. USGS scale: 61–120 mg/L moderately hard, 121–180 hard, over 180 very hard',
    solutions: m > 180 ? ['softener', 'saltfree'] : ['saltfree', 'softener'] };
}

function buildWellReport(countyName) {
  const key = Object.keys(PSU.counties).find(k => k.toLowerCase() === String(countyName || '').toLowerCase());
  const src = { name: PSU.source.name, url: key ? PSU.counties[key].url : PSU.source.url, retrieved: PSU.source.retrieved };
  if (!key) return { kind: 'well', county: countyName || null, dataAvailable: false, findings: [], source: src,
    note: `We don't have Penn State summary data for ${countyName ? countyName + ' County' : 'this location'}, so we can't estimate typical well water here. A certified lab test is the way to know.` };
  const c = PSU.counties[key]; const p = c.parameters; const area = `${key} County`;
  const findings = [];
  for (const r of WELL_RULES) {
    const d = p[r.key]; if (!d || typeof d.pctFailing !== 'number' || d.pctFailing < 1) continue;
    const score = d.pctFailing * r.weight;
    const small = (d.samples || 0) < 30;
    findings.push({ id: r.key, title: r.title, kind: r.kind, level: r.kind === 'health' ? level(score) : (score >= 15 ? 'moderate' : 'low'), score,
      pct: d.pctFailing, samples: d.samples,
      stat: `${d.pctFailing}% of ${d.samples} tested wells in ${area} ${r.key === 'pH' ? 'fell outside the EPA range' : r.key === 'CorrosivityIndex' ? 'were corrosive by Penn State\'s criterion' : 'exceeded the standard'}. Highest result: ${d.max} ${d.units === '-' ? '' : d.units}.`.replace(/\s+\./, '.'),
      smallSample: small, explain: r.explain, standard: r.standard, solutions: r.solutions });
  }
  const h = hardnessFinding(p, area); if (h) findings.push(h);
  findings.sort((a, b) => (rank(b) - rank(a)) || (b.score - a.score));
  const rep = { kind: 'well', county: key, dataAvailable: true, findings,
    period: `${c.periodStart} – ${c.periodEnd}`, totalSamples: c.totalSamples, source: src,
    caveat: `Typical for wells in ${area}, not your home. These are Penn State lab results from wells and springs that homeowners chose to test (${c.totalSamples} samples, ${c.periodStart}–${c.periodEnd}). Your own well can be better or worse.` };
  rep.watch = buildWatch(rep); rep.parameters = p;
  return rep;
}
function rank(f) { return ({ high: 3, moderate: 2, low: 1, info: 0 })[f.level] * 100 + (f.kind === 'health' ? 10 : 0); }

function buildPublicReport(lookup) {
  const s = lookup.system, c = lookup.compliance, lcr = lookup.lead90;
  const findings = [];
  if (!s) return { kind: 'public', dataAvailable: false, findings: [],
    note: "You told us you're on public water, but we couldn't match your address to a water system in EPA's map. Your water company's annual water quality report (CCR) has the details. Find it on your water bill or at EPA's CCR finder." };
  const v5 = lookup.viol5;
  const hb = v5 ? v5.healthBased : (c?.violations || []).filter(v => v.healthBased);
  if (hb.length) {
    const rules = [...new Set(hb.map(v => v.rule))];
    const open = hb.filter(v => v.resolved === false).length;
    findings.push({ id: 'hb-violation', title: rules.length === 1 ? `Health-based violation: ${rules[0]}${open ? '' : ' (resolved)'}` : 'Health-based violations on record', kind: 'health', level: open ? 'high' : 'moderate', score: open ? 100 : 60,
      stat: `EPA lists ${hb.length} health-based violation(s) ${v5 ? 'in the last 5 years' : 'in the last 3 years'}: ${rules.join('; ')}${v5 ? (open ? `. ${open} not yet marked resolved.` : '. All are marked resolved (returned to compliance).') : '.'}`,
      explain: 'A health-based violation means a contaminant was above its legal limit, or a required treatment step wasn\'t met, at some point. Your utility must notify customers. Check its notices and annual report for what was involved and whether it\'s resolved.',
      standard: 'Safe Drinking Water Act: MCL / treatment technique violations', solutions: ['ro', 'carbon'] });
  }
  if (lcr && typeof lcr.value === 'number') {
    const v = lcr.value, ppb = Math.round(v * 1000 * 10) / 10;
    const lv = v > 0.015 ? 'high' : v >= 0.005 ? 'moderate' : 'low';
    findings.push({ id: 'lead90', title: v > 0.015 ? 'Lead above EPA action level in system testing' : 'Lead: system-wide testing', kind: 'health', level: lv, score: lv === 'high' ? 90 : lv === 'moderate' ? 30 : 6,
      stat: `90th-percentile lead from the utility's home tap sampling (period ending ${lcr.period}): ${ppb} ppb (${v} mg/L).${v === 0 ? ' A 0 usually means below the lab\'s reporting limit.' : ''}`,
      explain: 'This tells you about the system overall, not your house. Lead in tap water almost always comes from service lines and household plumbing, so homes built before 1986 (when lead solder was banned) are the ones to check first. No level of lead is considered safe.',
      standard: 'EPA Lead and Copper Rule action level: 15 ppb (0.015 mg/L). EPA goal: zero', solutions: ['leadfilter', 'ro'] });
  }
  const pf = lookup.pfas;
  if (pf && pf.sampled) {
    const over = [pf.pfoa > 4 && `PFOA ${pf.pfoa} ppt`, pf.pfos > 4 && `PFOS ${pf.pfos} ppt`, ...(pf.overOther || [])].filter(Boolean);
    const others = pf.detected.filter(x => !['PFOA', 'PFOS'].includes(x.name)).map(x => x.name);
    const near = !over.length && (pf.pfoa >= 2 || pf.pfos >= 2);
    const lv = over.length ? 'high' : near ? 'moderate' : pf.detected.length ? 'low' : 'info';
    findings.push({ id: 'pfas', title: over.length ? 'PFAS above the new EPA limits' : near ? 'PFAS close to the new EPA limits' : pf.detected.length ? 'PFAS detected, below EPA limits' : 'PFAS: not detected', kind: 'health', level: lv, score: over.length ? 95 : near ? 40 : 8,
      stat: `EPA UCMR 5 testing (${pf.firstSample} to ${pf.lastSample}, ${pf.samplePoints} sampling point${pf.samplePoints > 1 ? 's' : ''}): highest average PFOA ${pf.pfoa} ppt and PFOS ${pf.pfos} ppt (single-sample highs ${pf.pfoaMax} / ${pf.pfosMax} ppt).` +
        (others.length ? ` Other PFAS detected: ${others.join(', ')}.` : '') + (over.length ? ` Over the limit: ${over.join('; ')}.` : ''),
      explain: 'Long-term exposure to PFOA and PFOS above the EPA limits is linked to certain cancers, liver and immune effects, and effects on infants. PFAS are "forever chemicals" that build up in the body, and utilities must meet the new limits by 2029.',
      standard: 'EPA MCLs (2024 rule, compliance by Apr 2029): PFOA 4 ppt, PFOS 4 ppt; PFHxS, PFNA, GenX 10 ppt; Hazard Index 1. EPA has proposed (May 2026, not final) to drop the last four and allow some systems until 2031 for PFOA/PFOS.',
      solutions: ['ro', 'carbon'] });
  } else {
    findings.push({ id: 'pfas', title: 'PFAS: not sampled', kind: 'info', level: 'info', score: 2,
      stat: 'This system was not sampled in EPA\'s UCMR 5 PFAS monitoring (2023–2025). Small systems serving under 3,300 people were mostly sampled only if selected. Check your annual water quality report or ask your utility.',
      explain: 'PFAS are "forever chemicals" that are now regulated in drinking water. No federal data is available for this system yet.',
      standard: 'EPA MCLs: PFOA 4 ppt, PFOS 4 ppt (compliance by 2029)', solutions: ['ro', 'carbon'] });
  }
  findings.push({ id: 'disinfectant', title: 'Chlorine taste & disinfection byproducts', kind: 'nuisance', level: 'low', score: 5, general: true,
    stat: 'Applies to essentially all public water. Public systems are required to disinfect, usually with chlorine or chloramine. Your CCR lists your system\'s measured disinfection byproduct levels.',
    explain: 'Disinfection keeps germs out of the pipes, but it can leave a pool-like taste and smell, and it forms byproducts (TTHMs and HAA5s) that are regulated at low levels. Many homeowners filter them out at the tap or for the whole house.',
    standard: 'EPA MCLs: TTHM 0.080 mg/L, HAA5 0.060 mg/L; chlorine MRDL 4 mg/L', solutions: ['carbon'] });
  const mr = v5 ? v5.monitoring : (c?.violations || []).filter(v => !v.healthBased);
  if (mr.length) findings.push({ id: 'mr-violation', title: 'Missed or late required testing', kind: 'info', level: mr.length >= 8 ? 'moderate' : 'low', score: 3,
    stat: `${mr.length} monitoring or reporting violation(s) ${v5 ? 'in the last 5 years' : 'in the last 3 years'} (${[...new Set(mr.map(v => v.rule))].join('; ')}).`,
    explain: 'When required tests are skipped or late, there\'s less proof the water met standards during those periods. That isn\'t evidence of a problem by itself, but it\'s a gap in the record.',
    standard: 'Safe Drinking Water Act monitoring & reporting requirements', solutions: [] });
  findings.push({ id: 'hardness-unknown', title: 'Hardness: check your CCR', kind: 'nuisance', level: 'info', score: 1, general: true,
    stat: s.source && /ground/i.test(s.source) ? 'Your system uses groundwater, which in Pennsylvania is often moderately hard to hard.' : 'EPA doesn\'t track hardness for public systems.',
    explain: 'Hardness isn\'t regulated, but it causes scale on fixtures and water heaters. Your utility\'s annual report or customer service can tell you the typical hardness.',
    standard: 'No EPA limit', solutions: ['saltfree', 'softener'] });
  findings.sort((a, b) => (rank(b) - rank(a)) || (b.score - a.score));
  const rep = { kind: 'public', dataAvailable: true, findings, system: s,
    caveat: 'This describes your water system overall from EPA records, not the water at your tap. Your home\'s pipes and fixtures can change what comes out of the faucet.' };
  rep.watch = buildWatch(rep);
  return rep;
}

// ---- Intake answers -> extra concerns (never changes the score) ----
const SYM_LABEL = { scale: 'spots or scale on fixtures', crust: 'white crust on showerheads', orange: 'rust/orange stains', black: 'black or brown stains', bluegreen: 'blue-green stains', egg: 'a rotten-egg smell', chlorine: 'chlorine taste or smell', cloudy: 'cloudy water', metallic: 'a metallic taste', skin: 'dry skin or hair', appliances: 'appliances wearing out early' };
const LV = { info: 0, low: 1, moderate: 2, high: 3 };
const atLeast = (f, lv) => { if (LV[f.level] < LV[lv]) f.level = lv; };
const listOf = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a.slice(-1) : a[0];

function applyIntake(rep, intake) {
  if (!intake || !rep.dataAvailable) return rep;
  const S = new Set(intake.symptoms || []), T = new Set(intake.treatment || []), H = new Set(intake.household || []);
  const F = id => rep.findings.find(f => f.id === id);
  const said = keys => listOf(keys.filter(k => S.has(k)).map(k => SYM_LABEL[k]));
  const well = rep.kind === 'well';
  const note = (f, txt) => { f.userNote = f.userNote ? f.userNote + ' ' + txt : txt; };
  const add = f => { rep.findings.push({ fromSymptoms: true, kind: 'nuisance', ...f }); };

  // Hardness / scale
  if (['scale', 'crust', 'appliances'].some(k => S.has(k))) {
    const extra = S.has('skin') ? ' Dry skin or hair is also commonly linked to hard water, though it has many causes.' : '';
    const soft = T.has('softener') ? ' You already have a softener, so these symptoms may mean it needs service, salt or resizing.' : '';
    const h = F('hardness');
    if (h) { atLeast(h, 'moderate'); h.symptomMatch = true; note(h, `You reported ${said(['scale', 'crust', 'appliances'])}, which matches typical hardness here.${soft}`); }
    else {
      rep.findings = rep.findings.filter(f => f.id !== 'hardness-unknown');
      add({ id: 'sym-hardness', title: 'Scale and spotting: your symptoms suggest hard water', level: 'moderate', score: 20,
        stat: `You reported ${said(['scale', 'crust', 'appliances'])}. Penn State lists scale on fixtures and water-heater elements as the classic sign of hardness above about 120 mg/L (7 grains per gallon).${well ? '' : ' EPA does not track hardness for public systems, so your utility\'s annual water quality report or a test will give the number.'}${soft}`,
        explain: `Hard water leaves scale that coats water-heater elements and boiler parts and clogs fixtures. It isn't a health risk, but it costs efficiency and appliance life.${extra}`,
        standard: 'No EPA limit. USGS: 121–180 mg/L hard, over 180 very hard. Source: Penn State Extension', solutions: ['saltfree', 'softener'] });
    }
  }
  // Iron (orange) / manganese (black)
  const metal = (sym, id, symId, title, sols) => {
    if (!S.has(sym)) return;
    const f = F(id);
    if (f) { atLeast(f, 'moderate'); f.symptomMatch = true; note(f, `You reported ${SYM_LABEL[sym]}, which matches this.`); return; }
    add({ id: symId, title, level: 'moderate', score: 18,
      stat: `You reported ${SYM_LABEL[sym]}. Penn State lists this as a typical sign of ${id === 'Iron' ? 'iron above 0.3 mg/L' : 'manganese above 0.05 mg/L'}.${well ? '' : ' On public water it can also come from older iron or galvanized pipes in the street or your home.'}`,
      explain: id === 'Iron' ? 'Iron leaves orange-red stains on sinks, tubs and laundry and a metallic taste. It is a nuisance, not a health limit, but it fouls other equipment.' : 'Manganese leaves black or brown stains and a bitter taste. EPA also has health advisories at higher levels, so it is worth testing.',
      standard: id === 'Iron' ? 'EPA secondary standard: 0.3 mg/L' : 'EPA secondary standard: 0.05 mg/L', solutions: sols });
  };
  metal('orange', 'Iron', 'sym-iron', 'Orange stains: your symptoms suggest iron', ['iron']);
  metal('black', 'Manganese', 'sym-manganese', 'Black stains: your symptoms suggest manganese', ['iron']);
  // Rotten egg
  if (S.has('egg')) {
    const hot = intake.eggHotOnly === 'hot';
    add(hot
      ? { id: 'sym-sulfur', title: 'Rotten-egg smell in hot water: likely the water heater', level: 'moderate', score: 12,
          stat: 'You reported a rotten-egg smell from hot water only. Penn State says this is usually a reaction with the water heater\'s magnesium anode rod, not the water itself.',
          explain: 'Swapping the anode rod for a different metal usually fixes it. Removing the rod entirely can void the heater warranty.', standard: 'No EPA limit (odor)', solutions: ['anode'] }
      : { id: 'sym-sulfur', title: 'Rotten-egg smell: your symptoms suggest hydrogen sulfide', level: 'moderate', score: 22,
          stat: `You reported a rotten-egg smell${intake.eggHotOnly === 'both' ? ' in hot and cold water' : ''}. Penn State links this to hydrogen sulfide or sulfur-reducing bacteria in groundwater.${well ? '' : ' On public water, an odor at only one sink is often bacteria in the drain rather than the water.'}`,
          explain: 'Hydrogen sulfide smells at very low levels, tarnishes silver and can leave black stains. It is mainly a nuisance, but it is corrosive to plumbing.',
          standard: 'No EPA limit; any amount can cause odor (Penn State)', solutions: ['iron', 'carbon'] });
  }
  // Corrosion
  if (S.has('bluegreen') || S.has('metallic')) {
    const f = well ? (F('pH') || F('CorrosivityIndex') || F('Copper')) : null;
    if (f) { atLeast(f, 'moderate'); f.symptomMatch = true; note(f, `You reported ${said(['bluegreen', 'metallic'])}, which matches corrosive water.`); }
    else add({ id: 'sym-corrosion', title: 'Blue-green stains or metallic taste: your symptoms suggest corrosive water', level: 'moderate', kind: 'health', score: 30,
      stat: `You reported ${said(['bluegreen', 'metallic'])}. Penn State links blue-green stains and metallic taste to corrosive water dissolving copper (and possibly lead) from plumbing.`,
      explain: well ? 'Corrosive (acidic) water eats copper pipes, causes pinhole leaks and can pull lead and copper into the water. Test for pH, copper and lead.' : 'Your utility treats water to limit corrosion, but home plumbing can still leach copper or lead. A lead and copper test at your tap is the way to know.',
      standard: 'EPA action levels: lead 15 ppb, copper 1.3 mg/L; pH 6.5–8.5 (secondary)', solutions: well ? ['neutralizer', 'leadfilter'] : ['leadfilter', 'ro'] });
  }
  if (S.has('cloudy')) add({ id: 'sym-cloudy', title: 'Cloudy water', level: 'low', score: 4,
    stat: 'You reported cloudy water. If it clears from the bottom up in a glass, it is usually air bubbles. If particles settle, it is sediment (Penn State).',
    explain: 'Sediment can clog fixtures and protect germs from UV treatment, so it matters most on wells.', standard: 'EPA turbidity rules apply to utilities, not homes', solutions: ['sediment'] });
  if (S.has('chlorine')) {
    const d = F('disinfectant');
    if (d) { atLeast(d, 'moderate'); d.userNote = 'You reported a chlorine taste or smell.'; d.fromSymptoms = true; }
  }
  // Year built -> lead
  if (intake.built === 'pre1950' || intake.built === '1950-1985') {
    const old = intake.built === 'pre1950';
    const txt = `You said your home was built ${old ? 'before 1950' : 'between 1950 and 1985'}. EPA notes lead pipes, solder and fixtures are more likely in homes built before 1986.${old && !well ? ' The oldest homes are the most likely to have a lead service line; your utility\'s lead service line inventory can tell you.' : ''}`;
    const f = well ? F('Lead-1stdraw') : null;
    if (f) { atLeast(f, 'moderate'); note(f, txt); }
    else rep.findings.push({ id: 'home-plumbing', title: 'Older home plumbing: worth checking for lead', kind: 'health', level: 'moderate', score: 28,
      stat: txt, explain: 'Lead usually comes from service lines, solder and fixtures, not from the water source. No level of lead is considered safe, especially for children and during pregnancy.',
      standard: 'EPA action level 15 ppb; goal zero. Source: EPA basic information about lead in drinking water', solutions: ['leadfilter', 'ro'], userNote: txt, fromSymptoms: true });
  }
  // Septic (wells)
  if (well && intake.septic === 'yes') for (const id of ['TotalColiform', 'E.Coli', 'Nitrate+NitriteN']) { const f = F(id); if (f) note(f, 'You have a septic system, a common source of bacteria and nitrate in nearby wells. Keep it pumped and well away from the well.'); }
  // Sensitive household (EPA language only, no medical advice)
  const sens = [];
  if (H.has('infant')) { const n = F('Nitrate+NitriteN'); if (n) { atLeast(n, 'moderate'); note(n, 'EPA\'s nitrate limit is set to protect infants under 6 months, so test before using well water for formula.'); } sens.push('EPA\'s nitrate limit is set to protect infants under 6 months, and EPA says no level of lead is safe for children.'); }
  if (H.has('pregnant')) sens.push('EPA notes lead exposure is a particular concern during pregnancy.');
  if (H.has('immune') || H.has('older')) sens.push('EPA requires utilities to note that some people, such as people with weakened immune systems and some elderly people, may be more vulnerable to germs in drinking water and should ask their health care providers for advice.');
  if (H.has('infant') || H.has('pregnant')) for (const id of ['lead90', 'Lead-1stdraw', 'home-plumbing']) { const f = F(id); if (f && f.level !== 'low' && f.level !== 'info') atLeast(f, 'moderate'); }
  if (sens.length) rep.sensitiveNote = [...new Set(sens)].join(' ') + ' This is general information, not medical advice.';
  rep.intake = intake;
  rep.findings.sort((a, b) => (rank(b) - rank(a)) || (b.score - a.score));
  rep.watch = buildWatch(rep);
  return rep;
}

// ---- Summary (template now; LLM later) ----
function templateSummary(r) {
  if (!r.dataAvailable) return r.note;
  const symF = r.findings.filter(f => (f.fromSymptoms || f.symptomMatch) && (f.level === 'moderate' || f.level === 'high'));
  const nm = f => f.symptomMatch ? f.title.replace(/ \(.*\)$/, '').toLowerCase() : f.title.split(':')[0].toLowerCase();
  const symTxt = symF.length ? ` What you told us also points to ${listOf(symF.map(nm))}. Those come from your answers, not a test.` : '';
  return (templateCore(r, r.findings.filter(f => !f.fromSymptoms)).trim() + symTxt).trim();
}
function templateCore(r, findings) {
  r = { ...r, findings };
  const top = r.findings.filter(f => f.level === 'high' || f.level === 'moderate');
  const pick = (top.length ? top : r.findings).slice(0, 3);
  const names = pick.map(f => f.title.replace(/ \(.*\)$/, '')).map(t => /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
  const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.slice(-1) : names[0];
  if (r.kind === 'well') {
    const health = pick.filter(f => f.kind === 'health').length;
    const more = r.findings.filter(f => f.kind === 'health' && f.level !== 'low').length - health;
    return `For private wells in ${r.county} County, the top concerns in Penn State testing are ${list}. ` +
      (health ? `${health === pick.length ? (pick.length > 1 ? 'All of these are' : 'This is') : health + ' of these are'} health-related, and you can't see, smell or taste them. ` : '') +
      (more > 0 ? `${more} more health item${more > 1 ? 's' : ''} also show${more > 1 ? '' : 's'} up below. ` : '') +
      'Only a test of your own well can rule these out, and each one has a proven treatment. ' +
      '';
  }
  const nm = String(r.system.name).toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase());
  const lead = r.findings.find(f => f.id === 'lead90');
  const leadTxt = lead && lead.level === 'low' ? ' Lead in the utility\'s latest home tap sampling was below the EPA action level.' : '';
  return top.length
    ? `EPA records for ${nm} point to ${list} as the main thing${top.length > 1 ? 's' : ''} to watch. Below is what ${top.length > 1 ? 'each means' : 'it means'} and how homeowners typically address it.`
    : `EPA records for ${nm} show no health-based violations in the last 5 years.${leadTxt} The most common reasons homeowners on public water still treat their water are chlorine taste and odor, lead from older home plumbing, and hard water.`;
}

async function llmSummarize(report) {
  // Hook: implement with your provider of choice (e.g. call an LLM with report.findings as JSON and the
  // instruction "summarize in plain English, no medical advice, cite the EPA standard given"). Return a string.
  throw new Error('LLM not configured');
}

async function summarize(report) {
  if (process.env.LLM_PROVIDER) {
    try { return { text: await llmSummarize(report), engine: 'llm:' + process.env.LLM_PROVIDER }; } catch { /* fall back */ }
  }
  return { text: templateSummary(report).trim(), engine: 'rules-v1' };
}

module.exports = { applyIntake, WHAT, countyData, buildWellReport, buildPublicReport, summarize, SOLUTIONS, LEVEL_LABEL, PSU };
