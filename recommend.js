// "Recommended for your home": maps report concerns + intake answers to solution bundles in data/solutions.json.
// Claims come only from the catalog (with sources). Brands are PLACEHOLDER; prices are "starting at" national estimates.
const fs = require('fs');
const path = require('path');
const CAT = JSON.parse(fs.readFileSync(require('./paths').SOLUTIONS_FILE, 'utf8'));
const SOL = Object.fromEntries(CAT.solutions.map(s => [s.id, s]));
const CONCERN_OF = {};
for (const [code, c] of Object.entries(CAT.concerns)) for (const id of c.findingIds) CONCERN_OF[id] = code;
const BUNDLE_OF = {};
for (const b of CAT.bundles) for (const c of b.concerns) BUNDLE_OF[c] ||= b;
const HEALTH = new Set(['pfas', 'health_violation', 'lead', 'bacteria', 'nitrate', 'arsenic']);
const GOAL_FIT = { safety: ['pfas_chemicals', 'bacteria', 'lead', 'nitrate_arsenic', 'violation'], taste: ['chlorine', 'iron_sulfur', 'general'], protect: ['hardness', 'low_ph', 'iron_sulfur', 'sediment'], skin: ['hardness', 'chlorine'], all: [] };
const src = ids => (ids || []).map(id => ({ id, ...CAT.meta.sources[id] })).filter(x => x.url);
const card = id => { const s = SOL[id]; return s && { id, name: s.name, installed: s.cost.installed, annual: s.cost.annual, startingAt: s.cost.startingAt ?? null, estimate: !!s.cost.estimate, costSources: src(s.cost.sources) }; };

// Softener vs salt-free (TAC) for one home. Uses typical hardness (Penn State county well data) when we have it,
// plus symptoms and intake answers. Thresholds: data/solutions.json hardnessTiers / softenerVsTac.
function pickHardness(rep, intake = {}, source) {
  const mg = rep.parameters?.Hardness?.median ?? null;           // mg/L as CaCO3 (well county median), null for public water
  const gpg = mg == null ? null : Math.round(mg / 17.1 * 10) / 10;
  const has = id => rep.findings.some(f => f.id === id);
  const metalsSym = has('sym-iron') || has('sym-manganese');
  const fe = rep.parameters?.Iron?.pctFailing, mn = rep.parameters?.Manganese?.pctFailing;
  const metalsArea = source === 'well' && (fe >= 10 || mn >= 25);
  const tankless = intake.heater === 'tankless';
  const notes = []; const why = [];
  let pick = 'tac';
  if (mg != null && mg > 300) { pick = 'twin'; why.push(`typical hardness here is about ${gpg} gpg, which is extremely hard`); }
  else if (mg != null && mg > 180) { pick = 'softener'; why.push(`typical hardness here is about ${gpg} gpg (very hard)`); }
  if (metalsSym) { if (pick === 'tac') pick = 'softener'; why.push('you reported iron or manganese staining, which salt-free media can\'t tolerate'); }
  if (tankless && (mg == null || mg > 200)) { if (pick === 'tac') pick = 'softener'; why.push('tankless heaters have hardness limits in their warranties (Rinnai: 200 mg/L, about 11.7 gpg)'); }
  if (intake.goal === 'skin') { if (pick === 'tac') pick = 'softener'; why.push('you care most about how water feels, and only softening changes that'); }
  const overTac = mg != null && mg > 513;                          // ~30 gpg: typical TAC maker limit
  let alts;
  if (pick === 'tac') {
    alts = ['softener_salt', ...(source === 'well' ? [] : ['combo_carbon_tac']), 'polyphosphate'];
    notes.push('Want spot-free glass and soft-feeling water, or have a tankless heater? A high-efficiency metered softener is the better pick for that. Salt-free leaves the minerals in.');
    if (metalsArea) notes.push('Salt-free conditioners need low iron, manganese and sulfide. Many wells here have iron or manganese, so a lab test decides between salt-free, a softener, or an iron filter first.');
    else if (source === 'well') notes.push('Salt-free conditioners need low iron, manganese and sulfide. On a well, a lab test confirms that first.');
  } else {
    alts = [pick === 'twin' ? 'softener_salt' : 'softener_twin', ...(overTac ? [] : ['tac_nac'])];
    notes.push(overTac ? 'Salt-free conditioners aren\'t rated for water this hard (makers cap them around 30 gpg).'
      : mg == null ? 'Prefer no salt? A salt-free conditioner still cuts scale in lab tests, but it leaves the minerals in, so spotting stays. A metered high-efficiency softener uses far less salt than older timer units.'
      : 'Prefer no salt? A salt-free conditioner still cuts scale in lab tests, but at this hardness you would see spotting. A metered high-efficiency softener uses far less salt than older units.');
    if (metalsSym || metalsArea) notes.push('Softeners handle low iron and manganese. Above about 3 mg/L iron, an iron filter goes first; a lab test tells us which.');
    if (tankless && mg == null) notes.push('We\'ll confirm your hardness: Rinnai\'s limit is 200 mg/L (11.7 gpg). Below that, salt-free plus regular flushing can be enough.');
    if (intake.septic === 'yes') notes.push('Softeners are allowed with septic in Pennsylvania, and efficient, metered models don\'t hurt septic performance in industry-funded testing. Salt-free is the no-brine alternative.');
  }
  if (pick === 'tac' && intake.septic === 'yes') notes.push('With a septic system, salt-free means no brine going into your tank.');
  if (intake.goal === 'skin') notes.push('Honest note: softened water feels softer, but a randomized trial (SWET, 2011) found softeners didn\'t improve children\'s eczema beyond usual care.');
  return { pick, alts, notes, why: why.length ? 'Why: ' + why.join('; ') + '.' : null, gpg };
}

function build(rep, intake = {}, source) {
  const T = new Set(intake.treatment || []);
  const rent = intake.tenure === 'rent';
  const items = (rep.watch?.items || []);
  // Concerns in watch order (strong first), then any other moderate+ finding.
  const order = [];
  const push = (fid, level, strong) => { const c = CONCERN_OF[fid]; if (!c || c === 'general') return; const b = BUNDLE_OF[c]; if (!b) return;
    let e = order.find(o => o.bundle.id === b.id);
    if (!e) { e = { bundle: b, findings: [], health: false, strong: false, level }; order.push(e); }
    e.findings.push(fid); e.health ||= HEALTH.has(c) && (level === 'high' || level === 'moderate'); e.strong ||= strong; };
  items.forEach(i => push(i.id, i.level, !i.alsoWorth && !rep.watch.allClear && (i.level === 'high' || i.level === 'moderate')));
  if (!rep.watch?.allClear) rep.findings.filter(f => (f.level === 'high' || f.level === 'moderate') && !items.some(i => i.id === f.id)).forEach(f => push(f.id, f.level, true));
  const strongAny = order.some(o => o.strong);
  // Goal reordering: high-level health concerns stay first, then what the homeowner said matters most.
  const fit = GOAL_FIT[intake.goal] || [];
  const rankOf = (o, i) => (o.strong ? 0 : 50) + (o.level === 'high' && o.health ? -20 : 0) + (fit.includes(o.bundle.id) ? -5 : 0) + i;
  const ranked = order.map((o, i) => ({ o, r: rankOf(o, i) })).sort((a, b) => a.r - b.r).map(x => x.o);
  // Collapse bundles that share a primary product (e.g. lead + nitrate -> one RO card), then take 3.
  const merged = [];
  for (const o of ranked.filter(x => x.strong)) {
    const same = merged.find(m => m.bundle.primary === o.bundle.primary);
    if (same) {
      // Keep the most specific bundle as the card's face (PFAS beats a generic violation card), list the other as "also covers".
      const PRI = ['pfas_chemicals', 'lead', 'nitrate_arsenic', 'violation'];
      const pi = x => { const i = PRI.indexOf(x); return i < 0 ? 99 : i; };
      if (pi(o.bundle.id) < pi(same.bundle.id)) { same.alsoCovers.push(same.bundle.title); same.extraConcerns.push(...same.bundle.concerns); same.bundle = o.bundle; }
      else { same.alsoCovers.push(o.bundle.title); same.extraConcerns.push(...o.bundle.concerns); }
      same.findings.push(...o.findings);
    }
    else merged.push({ ...o, alsoCovers: [], extraConcerns: [] });
  }
  let chosen = strongAny ? merged.slice(0, 3) : [];
  if (!chosen.length) chosen = [{ bundle: CAT.bundles.find(b => b.id === 'general'), findings: [], general: true }];
  const hasWholeCarbon = !rent && (chosen.some(o => o.bundle.typicalBundle.includes('carbon_whole')) || T.has('whole'));

  const cards = chosen.map(o => {
    const b = o.bundle;
    let primary = b.primary, notes = [], alts = [...b.alternatives], bundle = [...b.typicalBundle], pick = null;
    // Shower filter only when no whole-house carbon.
    if (hasWholeCarbon) { alts = alts.filter(x => x !== 'shower_filter'); bundle = bundle.filter(x => x !== 'shower_filter'); }
    // Existing equipment -> service first.
    if (primary === 'ro_pou' && T.has('ro')) notes.push('You already have reverse osmosis. We\'ll check it is certified for this (NSF/ANSI 58 with the right claim) and that filters and membrane are on schedule.');
    if (b.id === 'hardness' && T.has('softener')) notes.push('You already have a softener. If you still see scale, it may need salt, service or resizing. If it is an old timer model, a metered high-efficiency valve uses 26–60% less salt (Univ. of Minnesota).');
    if (b.id === 'bacteria' && T.has('uv')) notes.push('You already have UV. Bacteria with UV in place usually means a lamp past its life, a dirty sleeve or a prefilter problem. We\'ll check it.');
    if (b.id === 'chlorine' && T.has('whole')) notes.push('You already have a whole-house filter. Chlorine taste can mean the media is spent or isn\'t rated for chloramine.');
    // Hardness: pick softener vs salt-free per home (v0.6: best option for the home, not "sell against softeners").
    if (b.id === 'hardness') {
      const hp = pickHardness(rep, intake, source);
      const P = CAT.hardnessPicks[hp.pick];
      primary = P.primary; bundle = [...P.bundle]; alts = hp.alts; pick = { ...P, why: hp.why };
      notes.push(...hp.notes);
    }
    if (rent && ['carbon_whole', 'tac_nac', 'uv', 'iron_air', 'neutralizer', 'anion_pfas'].includes(primary)) {
      notes.push('Renting? Ask your landlord about whole-house equipment. Meanwhile, a certified pitcher or countertop filter (and a shower filter for chlorine) needs no install.');
      if (!alts.includes('pitcher_countertop')) alts.unshift('pitcher_countertop');
    }
    if (o.alsoCovers?.length) notes.unshift(`The same system also covers: ${o.alsoCovers.join(', ').toLowerCase()}.`);
    return {
      anchor: 'sol-' + b.id, bundleId: b.id, concerns: [...b.concerns, ...(o.extraConcerns || [])], findings: o.findings || [], title: b.title, headline: pick?.headline || b.headline, pitch: pick?.pitch || b.pitch, pickWhy: pick?.why || null,
      primary: card(primary), alternatives: alts.map(card).filter(Boolean).slice(0, 4), bundle: bundle.map(card).filter(Boolean),
      claimNote: pick?.claimNote || b.claimNote, claimSources: src(pick?.claimSources || b.claimSources), requires: b.requires || null, notes,
      brand: SOL[primary]?.suggested ? 'Suggested: ' + SOL[primary].suggested : 'Brand / model: PLACEHOLDER',
    };
  });
  const anchors = {};
  for (const c of cards) for (const f of c.findings) anchors[f] ||= c.anchor;
  // Also link non-strong watch items whose concern maps to a shown card.
  for (const i of items) { const c = CONCERN_OF[i.id]; const hit = c && cards.find(k => k.concerns.includes(c)); if (hit) anchors[i.id] ||= hit.anchor; }
  const top = cards[0];
  return {
    generic: !strongAny, cards, anchors,
    intro: strongAny ? 'Based on what your report shows' + (intake.symptoms?.length && !intake.symptoms.includes('none') ? ' and what you told us' : '') + ', here is what we would put in your home.'
      : 'Nothing in the public data stands out, which is good news. Here is what homeowners in your situation usually choose for taste and peace of mind, plus the one step that gives a real answer: a test of your own tap.',
    top: top && { anchor: top.anchor, title: top.headline, product: top.primary?.name, startingAt: top.primary?.startingAt, installed: top.primary?.installed },
    costNote: CAT.meta.costNote,
  };
}

module.exports = { build, pickHardness, CAT, CONCERN_OF };
