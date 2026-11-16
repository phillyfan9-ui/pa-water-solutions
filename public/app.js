// PA Water Solutions — beta front end (no framework, hash routing)
const app = document.getElementById('app');
let CONFIG = null;
const money = n => '$' + (Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2));
const getContact = () => JSON.parse(sessionStorage.getItem('contact') || '{}');
const saveContact = c => sessionStorage.setItem('contact', JSON.stringify({ ...getContact(), ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) }));
const tpl = id => document.getElementById(id).content.cloneNode(true);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const titleCase = s => String(s || '').toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()).replace(/\b(Pa|Pwsid|Mhp)\b/g, m => m.toUpperCase());
const fmt = n => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const intakeKey = a => 'intake:' + String(a).toLowerCase().trim();
const getIntake = a => JSON.parse(sessionStorage.getItem(intakeKey(a)) || 'null');
const setIntake = (a, v) => { sessionStorage.setItem(intakeKey(a), JSON.stringify(v)); sessionStorage.setItem('lastIntake', JSON.stringify(v)); };
const lastIntake = () => JSON.parse(sessionStorage.getItem('lastIntake') || 'null');

function setF(root, key, val, attr) {
  root.querySelectorAll(`[data-f="${key}"]`).forEach(el => {
    if (attr) el.setAttribute(attr, val); else el.textContent = val;
  });
}

const FORM_CONFIG = {
  'contact':       { button: 'Send message', showAddress: true },
  'advanced-test': { button: 'Request an advanced test', showMessage: false },
  'well-test':     { button: 'Book my water test', showMessage: false },
  'lookup-help':   { button: 'Have someone look it up' },
};

function mountLeadForms(root, context = {}) {
  root.querySelectorAll('.lead-slot').forEach(slot => {
    const kind = slot.dataset.form;
    const cfg = FORM_CONFIG[kind] || {};
    const frag = tpl('tpl-leadform');
    const form = frag.querySelector('form');
    form.querySelector('button').textContent = cfg.button || 'Submit';
    if (cfg.showMessage === false) form.querySelector('.msg-field').remove();
    if (context.address) form.address.value = context.address;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const err = form.querySelector('.form-error');
      err.hidden = true;
      const data = Object.fromEntries(new FormData(form));
      if (!data.phone && !data.email) { err.textContent = 'Please add a phone number or email so we can reach you.'; err.hidden = false; return; }
      const btn = form.querySelector('button'); btn.disabled = true;
      try {
        const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, type: kind, lookup: context.summary || null, page: location.hash, intake: lastIntake() }) });
        const j = await r.json();
        if (!j.ok) throw new Error(j.message || 'Could not save');
        slot.innerHTML = `<div class="success">Thanks, ${esc(data.name.split(' ')[0])}! We got your request and will be in touch soon.</div>`;
      } catch (ex) {
        err.textContent = 'Something went wrong sending your request. Please try again.'; err.hidden = false; btn.disabled = false;
      }
    });
    slot.replaceChildren(frag);
  });
}

// ---------- Screens ----------
function renderLanding() {
  app.replaceChildren(tpl('tpl-landing'));
  const form = document.getElementById('lookup-form');
  const input = document.getElementById('address');
  const last = sessionStorage.getItem('lastAddress'); if (last) input.value = last;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const a = input.value.trim();
    const err = document.getElementById('lookup-error');
    if (a.length < 8 || !/\d/.test(a)) { err.textContent = 'Please enter a full street address, including the house number.'; err.hidden = false; return; }
    location.hash = '#/result?address=' + encodeURIComponent(a);
  });
  input.focus({ preventScroll: true });
}

function renderHome(scrollTo) {
  app.replaceChildren(tpl('tpl-home'));
  mountLeadForms(app);
  if (scrollTo) document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
  else window.scrollTo(0, 0);
}

let QUESTIONS = null;
const loadQuestions = async () => QUESTIONS || (QUESTIONS = await fetch('/api/intake/questions').then(r => r.json()));

async function renderResult(address, source) {
  sessionStorage.setItem('lastAddress', address);
  app.replaceChildren(tpl('tpl-loading'));
  const step = document.getElementById('loading-step');
  const steps = ['Finding your address', 'Checking EPA water system maps', 'Pulling water quality data', 'Writing your report'];
  let i = 0; const timer = setInterval(() => { if (step && i < steps.length - 1) step.textContent = steps[++i]; }, 1600);
  let data;
  try {
    const intake = getIntake(address);
    const key = 'report:' + address.toLowerCase() + ':' + (source || 'auto') + ':' + JSON.stringify(intake || {});
    const cached = sessionStorage.getItem(key);
    if (cached) data = JSON.parse(cached);
    else {
      const r = await fetch('/api/report?address=' + encodeURIComponent(address) + (source ? '&source=' + source : '') + (intake ? '&intake=' + encodeURIComponent(JSON.stringify(intake)) : ''));
      data = await r.json();
      if (data.status === 'report') sessionStorage.setItem(key, JSON.stringify(data));
    }
  } catch { data = { status: 'error' }; }
  clearInterval(timer);
  if (data.status === 'report') { try { await loadQuestions(); } catch { /* questions optional */ } }
  if (data.status === 'report') { const y = sessionStorage.getItem('keepScroll'); sessionStorage.removeItem('keepScroll'); renderReport(data, address); if (y) { const t = document.getElementById(y); if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 80); } else window.scrollTo(0, 0); return; }
  window.scrollTo(0, 0);
  return renderNotFound(data, address);
}

function renderViolations(c) {
  if (!c) return '<p class="muted">We couldn\'t load the compliance record right now. Use the EPA report link below.</p>';
  const groups = {};
  for (const v of c.violations) {
    const k = v.rule + '|' + v.category;
    (groups[k] ||= { ...v, count: 0, periods: [] }).count++;
    groups[k].periods.push(v.period);
  }
  const list = Object.values(groups).sort((a, b) => (b.healthBased - a.healthBased) || (b.count - a.count));
  const hb = list.filter(g => g.healthBased);
  let summary;
  if (!list.length) summary = `<div class="vsum good">✅<div><strong>No violations in the last 3 years</strong>EPA records show no violations for this system in this period.</div></div>`;
  else if (hb.length) summary = `<div class="vsum bad">⚠️<div><strong>Health-based violation${hb.length > 1 ? 's' : ''} on record</strong>At least one violation in the last 3 years involved a contaminant level or required treatment step, not just paperwork. Check the utility's notices and its annual report.</div></div>`;
  else summary = `<div class="vsum warn">ℹ️<div><strong>Violations on record, none health-based</strong>EPA lists ${c.violations.length} violation period${c.violations.length > 1 ? 's' : ''} in ${c.quartersWithViolation} of the last ${c.quarterCount} quarters. These were for missed or late testing or reporting, not for contaminants found above legal limits. They don't necessarily mean the water was unsafe, but they do mean some required checks weren't done or reported on time.</div></div>`;
  const items = list.slice(0, 6).map(g => `<li><span>${esc(g.rule)}<br><span class="small muted">${esc(g.categoryLabel)} · EPA dates: ${esc(g.periods.slice(-3).join('; '))}</span></span><span class="tag ${g.healthBased ? 'hb' : ''}">${g.healthBased ? 'Health-based' : 'Monitoring / reporting'}</span></li>`).join('');
  return summary + (items ? `<ul class="vlist">${items}</ul>` : '') + (list.length > 6 ? `<p class="small muted">+ ${list.length - 6} more rule types on the EPA report.</p>` : '');
}

function mountNextSteps(root, status) {
  root.querySelectorAll('.next-steps-slot').forEach(slot => {
    const f = tpl('tpl-next-steps');
    setF(f, 'test-intro', status === 'public'
      ? "Your utility's report shows how the water leaves the plant. Only a test of the water from your own tap shows what you're actually drinking, after it passes through your pipes and fixtures."
      : "With a private well, a certified lab test is the only way to know what's in your water. The EPA recommends testing at least once a year.");
    slot.replaceChildren(f);
  });
}

function rememberLookup(d) {
  sessionStorage.setItem('lastLookup', JSON.stringify({ matchedAddress: d.geo.matchedAddress, quote: d.quote, status: d.status }));
  saveContact({ address: titleCase(d.geo.matchedAddress) });
}

function dialSVG(score) {
  const has = typeof score === 'number';
  const v = has ? Math.max(0, Math.min(100, score)) : 0;
  const R = 80, cx = 100, cy = 100, len = Math.PI * R;
  const col = !has ? '#9fb3c3' : v >= 80 ? '#2bb673' : v >= 60 ? '#f2b33d' : v >= 40 ? '#f08a3c' : '#e5534b';
  return `<svg viewBox="0 0 200 120" role="img" aria-label="Water score ${has ? v : 'not available'} out of 100">
    <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="16" stroke-linecap="round"/>
    <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${len * (1 - v / 100)}"/>
    <text x="100" y="92" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">${has ? v : '—'}</text>
    <text x="100" y="114" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.85)">out of 100</text></svg>`;
}

// Horizontal meter. zones: [[upto, cls]], max scale; value may be null (not available)
function meterHTML({ value, max, zones, limit, limitLabel }) {
  let prev = 0;
  const z = zones.map(([to, cls]) => { const w = (Math.min(to, max) - prev) / max * 100; prev = Math.min(to, max); return `<span class="${cls}" style="width:${w}%"></span>`; }).join('');
  const mark = value == null ? '' : `<div class="mark" style="left:${Math.min(100, Math.max(0, value / max * 100))}%"></div>`;
  const lim = limit == null ? '' : `<div class="limit" style="left:${limit / max * 100}%">${esc(limitLabel || 'limit')}</div>`;
  return `<div class="meter"><div class="zones">${value == null ? '<span class="z-na" style="width:100%"></span>' : z}</div>${lim}${mark}</div>`;
}

function gaugeHTML(g) {
  return `<div class="gauge">
    <div class="g-head"><h3>${esc(g.title)}</h3><span class="g-val ${g.valueText === 'Not sampled' || g.valueText === 'No data' ? 'na' : ''}">${esc(g.valueText)}</span></div>
    ${meterHTML(g)}
    <p class="g-line"><b>What this is:</b> ${esc(g.what)}</p>
    <p class="g-line"><b>Normal / the limit:</b> ${esc(g.normal)}</p>
    ${g.more ? `<details><summary>ⓘ More about this</summary><p>${esc(g.more)}</p></details>` : ''}
  </div>`;
}

function publicGauges(d) {
  const g = [];
  const pb = d.lead90?.value; const ppb = typeof pb === 'number' ? Math.round(pb * 10000) / 10 : null;
  g.push({ title: 'Lead (system 90th percentile)', value: ppb, max: 20, zones: [[10, 'z-good'], [15, 'z-warn'], [20, 'z-bad']], limit: 15, limitLabel: '15 ppb',
    valueText: ppb == null ? 'No data' : `${ppb} ppb`,
    what: "Lead measured in tap samples from homes across the system. 90% of samples were at or below this number.",
    normal: 'Below 10 ppb is typical. 15 ppb is the EPA action level, and 10 ppb is the new trigger level. The EPA goal is zero.',
    more: `This describes the system, not your house. Lead almost always comes from service lines and household plumbing. ${d.lead90 ? 'Latest sampling period ended ' + d.lead90.period + '. ' : ''}A 0 usually means below the lab's reporting limit.` });
  const pf = d.pfas;
  for (const [k, label] of [['pfoa', 'PFOA'], ['pfos', 'PFOS']]) {
    g.push({ title: `${label} (a PFAS "forever chemical")`, value: pf?.sampled ? pf[k] : null, max: 10, zones: [[2, 'z-good'], [4, 'z-warn'], [10, 'z-bad']], limit: 4, limitLabel: '4 ppt limit',
      valueText: pf?.sampled ? `${pf[k]} ppt` : 'Not sampled',
      what: `Highest average ${label} at any sampling point in EPA's 2023–2025 UCMR 5 testing. ppt = parts per trillion.`,
      normal: `EPA limit: 4 ppt, which utilities must meet by 2029. The EPA goal is zero.`,
      more: pf?.sampled ? `Highest single sample: ${pf[k + 'Max']} ppt. Tested ${pf.firstSample} to ${pf.lastSample} at ${pf.samplePoints} sampling point(s). Non-detects are counted as 0 in the average.` : "This system wasn't part of EPA's UCMR 5 sampling. Ask your utility or check its annual water quality report." });
  }
  const v5 = d.viol5;
  const hb = v5 ? v5.healthBased.length : null;
  g.push({ title: 'Health-based violations (5 years)', value: hb, max: 3, zones: [[0.5, 'z-good'], [1.5, 'z-warn'], [3, 'z-bad']], limit: null,
    valueText: hb == null ? 'No data' : String(hb),
    what: 'Times the system broke a health limit or skipped a required treatment step, per EPA records.',
    normal: `0 is what you want to see. ${v5 ? `Also on record: ${v5.monitoring.length} missed or late testing/reporting violation(s), and ${v5.unresolved.length} violation(s) not yet marked resolved.` : ''}`,
    more: v5 && v5.healthBased.length ? 'On record: ' + v5.healthBased.map(x => `${x.rule} (${x.begin}${x.resolved ? ', resolved' : ', not marked resolved'})`).join('; ') : 'Source: EPA SDWIS violation records, last 5 years.' });
  return g;
}

function wellGauges(d) {
  const p = d.report.parameters || {};
  const pct = k => (typeof p[k]?.pctFailing === 'number' ? p[k].pctFailing : null);
  const z = [[5, 'z-good'], [15, 'z-warn'], [50, 'z-bad']];
  const n = k => (p[k] ? `${p[k].samples} wells tested` : '');
  const mk = (title, k, what, normal, more) => ({ title, value: pct(k), max: 50, zones: z, limit: null, valueText: pct(k) == null ? 'No data' : `${pct(k)}% of wells`, what, normal, more: `${more} (${n(k)}). Typical for wells in ${d.report.county} County, not your home.` });
  const g = [
    mk('Bacteria (coliform)', 'TotalColiform', 'Share of tested county wells with coliform bacteria, a sign germs can get into the well.', `EPA goal: zero. ${pct('E.Coli') != null ? pct('E.Coli') + '% of county wells also had E. coli, which signals sewage or animal waste.' : ''}`, 'Bacteria often come from a worn well cap, a cracked casing, or a nearby septic system'),
    mk('Nitrate', 'Nitrate+NitriteN', 'Share of county wells over the EPA nitrate limit.', 'EPA limit: 10 mg/L. Matters most for infants under 6 months.', 'Nitrate comes from fertilizer, manure and septic systems'),
    mk('Lead (first draw)', 'Lead-1stdraw', 'Share of county wells over the EPA lead action level in the first water out of the tap.', 'EPA action level: 15 ppb. EPA goal: zero.', 'Lead in wells usually comes from plumbing and corrosive water'),
    mk('Arsenic', 'Arsenic', 'Share of county wells over the EPA arsenic limit.', 'EPA limit: 10 ppb (0.010 mg/L).', 'Arsenic occurs naturally in some Pennsylvania bedrock'),
  ];
  const h = p.Hardness?.median ?? null;
  g.push({ title: 'Hardness (typical)', value: h, max: 300, zones: [[60, 'z-good'], [120, 'z-good'], [180, 'z-warn'], [300, 'z-bad']], limit: 120, limitLabel: 'hard',
    valueText: h == null ? 'No data' : `${h} mg/L`,
    what: 'The median calcium and magnesium in tested county wells. It causes scale and spots.',
    normal: 'There is no EPA limit. Up to 60 is soft, 61–120 moderately hard, 121–180 hard, over 180 very hard (USGS).',
    more: `Highest in the county: ${p.Hardness?.max ?? '—'} mg/L. Divide by 17.1 for grains per gallon. Typical for wells in ${d.report.county} County, not your home.` });
  const fe = pct('Iron'), mn = pct('Manganese');
  g.push({ title: 'Iron & manganese', value: fe == null && mn == null ? null : Math.max(fe || 0, mn || 0), max: 50, zones: z, limit: null,
    valueText: fe == null && mn == null ? 'No data' : `${fe ?? '—'}% / ${mn ?? '—'}%`,
    what: 'Share of county wells over the EPA guideline for iron, then manganese. These cause stains and a metallic or bitter taste.',
    normal: 'EPA secondary guidelines: iron 0.3 mg/L, manganese 0.05 mg/L. These are nuisance limits, not health limits.',
    more: `The meter shows the higher of the two. Typical for wells in ${d.report.county} County, not your home.` });
  return g;
}

function renderReport(d, address) {
  const f = tpl('tpl-report');
  const r = d.report, isWell = d.source === 'well', sc = d.score || {};
  f.querySelector('[data-f="head"]').classList.add(isWell ? 'well' : 'public');
  setF(f, 'badge', isWell ? (d.overridden ? 'Private well (you told us)' : 'Likely private well') : (d.overridden ? 'Public water (you told us)' : 'Public water'));
  const addr = titleCase(d.geo.matchedAddress);
  setF(f, 'sub', isWell
    ? `${addr} · ${r.dataAvailable ? `Typical for wells in ${r.county} County, not your home` : 'No county well data available'}`
    : `${addr} · ${r.system ? titleCase(r.system.name) + ' (' + r.system.pwsid + ')' : 'Water system not matched'}`);
  // 1. score
  f.querySelector('[data-f="dial"]').innerHTML = dialSVG(sc.score);
  setF(f, 'score-label', sc.score == null ? 'No score' : `Water Score: ${sc.label}`);
  setF(f, 'score-sub', isWell ? `Typical for wells in ${r.county || 'this'} County. Not a safety rating or a test of your home.` : 'From public records for your water system. Not a safety rating or a test of your home.');
  setF(f, 'score-cost', sc.deductions?.length ? `· ${sc.deductions.length} item${sc.deductions.length > 1 ? 's' : ''} cost points` : '· nothing cost points');
  const rulesTxt = isWell
    ? 'Start at 100. For each item, subtract points in proportion to the share of tested wells in your county that exceeded the EPA standard, with a cap per item (bacteria, nitrate, lead and arsenic count most). Very hard water costs a few points.'
    : 'Start at 100. Subtract points for health-based violations in the last 5 years (15 each, max 30), violations not yet resolved (5 each, max 15), lead above 10 ppb (15) or 15 ppb (25), PFOA or PFOS above 4 ppt (15 each), other PFAS over their limits (5 each), and repeated missed testing (5 for 3+, 10 for 8+).';
  f.querySelector('[data-f="score-detail"]').innerHTML = `<p>${esc(rulesTxt)}</p>
    ${sc.deductions?.length ? `<p class="wl-k">What cost points</p><ul class="ded">${sc.deductions.map(x => `<li><span>${esc(x.label)}<small>${esc(x.detail)}</small></span><b>−${x.points}</b></li>`).join('')}</ul>` : '<p><strong>Nothing cost points</strong> under these rules.</p>'}
    ${sc.unknowns?.length ? `<p class="small muted">Not included (no data): ${esc(sc.unknowns.join('; '))}.</p>` : ''}
    <p class="small muted">The score summarizes ${isWell ? 'Penn State county well data' : 'EPA records'} so you can compare at a glance. It is <strong>not a safety rating</strong> and not a test of your home's water.</p>`;
  // source line (editable, non-blocking)
  const det = d.detection || { confidence: 'confident', guess: d.detected, reasons: [] };
  const sysName = titleCase(d.system?.name || det.systemName || '');
  const unsure = !!d.unsure;
  const userSet = !!d.intake?.source && d.intake.source !== 'unsure';
  setF(f, 'sl-text', isWell
    ? `Showing results for a private well${r.county ? ` (typical for ${r.county} County)` : ''}${d.overridden ? ', as you told us' : userSet ? ', as you confirmed' : ''}.`
    : `Showing results for public water${sysName ? ` (${sysName})` : ''}${d.overridden ? ', as you told us' : userSet ? ', as you confirmed' : ''}.`);
  setF(f, 'sl-switch', isWell ? 'On public water? Switch' : 'On a well? Switch');
  const prompt = f.querySelector('[data-f="sl-prompt"]');
  if (det.confidence !== 'confident' && !userSet) {
    prompt.hidden = false;
    f.querySelector('[data-f="srcline"]').classList.add('unsure');
    setF(f, 'sl-guess', `We're showing our best guess, ${det.guess === 'public' ? `public water${sysName ? ` (${sysName})` : ''}` : 'a private well'}. Tap the right one and the report updates.`);
    f.querySelector('[data-f="sl-reasons"]').innerHTML = det.reasons.map(x => `<li>${esc(x)}</li>`).join('');
    f.querySelectorAll('[data-f="sl-chips"] button').forEach(b => b.classList.toggle('on', unsure ? b.dataset.src === 'unsure' : b.dataset.src === d.source));
    if (unsure) f.querySelector('[data-f="howtell"]').open = true;
  }
  // 2. watch
  const w = r.watch || { items: [] };
  setF(f, 'summary', w.allClear
    ? (isWell ? d.summary.text : `Good news: EPA records for ${titleCase(r.system?.name || 'your system')} don't show anything concerning, including no health-based violations in 5 years${d.pfas?.sampled ? ' and PFAS within EPA limits' : ''}. A few things still aren't covered by federal data:`)
    : d.summary.text);
  setF(f, 'engine', d.summary.engine.startsWith('llm') ? 'AI summary' : 'Automated summary');
  f.querySelector('[data-f="watch"]').innerHTML = w.items.map(i => `
    <li class="${i.level}">
      <h3>${esc(i.title)} ${i.alsoWorth ? '<span class="pill info">Also worth knowing</span>' : i.level === 'high' || i.level === 'moderate' ? `<span class="pill ${i.level}">${esc(d.levels[i.level])}</span>` : ''}</h3>
      <p><span class="wl-k">What it is:</span> ${esc(i.what)}.</p>
      <p><span class="wl-k">Why it matters:</span> ${esc(i.why)}</p>
      ${i.note ? `<p class="you-said">🗨 ${esc(i.note)}</p>` : ''}
      ${i.fix.length ? `<p><span class="wl-k">How it's fixed:</span> ${i.fix.map(x => `<span class="chip">${esc(x)}</span>`).join(' ')}</p>` : ''}
      ${d.recs?.anchors?.[i.id] ? `<button type="button" class="fixlink" data-sol="${d.recs.anchors[i.id]}">How we fix this →</button>` : ''}
    </li>`).join('') || `<li><p>${esc(r.note || 'No data to summarize.')}</p></li>`;
  // 3. gauges
  const gauges = isWell ? (r.dataAvailable ? wellGauges(d) : []) : (r.system ? publicGauges(d) : []);
  f.querySelector('[data-f="gauges"]').innerHTML = gauges.map(gaugeHTML).join('') || '<p class="muted">No gauge data for this location.</p>';
  setF(f, 'gauge-note', isWell ? `Gauges show the share of tested wells in ${r.county} County over each EPA standard (green under 5%, amber 5–15%, red over 15%). Typical for the county, not your home.` : 'Each gauge compares your water system\'s EPA data with the federal limit. The dashed line marks the limit.');
  // 3b. detailed analysis framing
  setF(f, 'detail-intro', isWell
    ? `This report shows what's typical for well water in ${r.county || 'your'} County, from Penn State lab results for wells that homeowners chose to test. It's the source water for your area, not a test of your well or your tap.`
    : `This report covers the source water for your location. For public water, most contaminants are tested at the treatment plant or where water enters the pipe network. Bacteria and disinfection byproducts are sampled out in the pipe network, and lead and copper are sampled at customers' taps.`);
  f.querySelector('[data-f="pipeline"]').innerHTML = (isWell
    ? [['🕳️', 'Your well', 'County-typical data (this report)', 'covered'], ['⚙️', 'Pump & pressure tank', 'Can add sediment or rust', ''], ['🏠', 'Home pipes', 'Can add lead, copper, rust', ''], ['🚰', 'Your tap', 'Only a tap test shows this', 'tap']]
    : [['🏭', 'Treatment plant', 'Most contaminants tested here', 'covered'], ['〰️', 'Water mains', 'Bacteria & byproducts sampled', 'covered'], ['➖', 'Service line', 'Can add lead (older homes)', ''], ['🏠', 'Home pipes', 'Can add lead, copper, rust, sediment', ''], ['🚰', 'Your tap', 'Utility lead samples are at some taps, not yours', 'tap']])
    .map(([ic, t, sub, cls], i, a) => `<div class="pl-step ${cls}"><div class="pl-ic">${ic}</div><b>${t}</b><small>${sub}</small></div>${i < a.length - 1 ? '<div class="pl-arrow">→</div>' : ''}`).join('');
  setF(f, 'detail-after', isWell
    ? 'Your own well can be better or worse than the county typical, and plumbing can add lead, copper, rust or sediment on the way to your faucet. Two ways to go further:'
    : 'Then the water travels through the mains, your service line and your home\u2019s plumbing to your faucet, which can add lead, copper, rust or sediment. Two ways to go further:');
  // 2b. recommended for your home
  const rc = d.recs || { cards: [] };
  if (r.sensitiveNote) { const sn = f.querySelector('[data-f="sensitive"]'); sn.hidden = false; sn.textContent = r.sensitiveNote; }
  setF(f, 'rec-intro', (rc.intro || '') + (Object.keys(d.intake || {}).some(k => k !== 'source') ? '' : ' Answer a few quick questions below to personalize this.'));
  const cs = d.catalogSources || {};
  const uniqSrc = a => { const seen = new Set(); return (a || []).filter(x => { const k = x.name.split(':')[0]; if (seen.has(k)) return false; seen.add(k); return true; }); };
  const price = p => p?.startingAt != null ? `Starting at ${money(p.startingAt)} installed` : (p?.installed || '');
  f.querySelector('[data-f="rec-cards"]').innerHTML = rc.cards.map((c, i) => `
    <article class="rec-card${i === 0 ? ' top' : ''}" id="${c.anchor}">
      <div class="rec-k">${i === 0 ? 'Top recommendation · ' : ''}${esc(c.title)}</div>
      <h3>${esc(c.headline)}</h3>
      <p>${esc(c.pitch)}</p>
      <div class="rec-prod">
        <div><strong>${esc(c.primary?.name || '')}</strong><span class="small muted">${esc(c.brand)}</span></div>
        <div class="rec-price"><b>${esc(price(c.primary))}</b><small>Typical range ${esc(c.primary?.installed || '')} · upkeep ${esc(c.primary?.annual || '')}. National estimate${c.primary?.costSources?.length ? ' (' + uniqSrc(c.primary.costSources).map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name.split(':')[0])}</a>`).join(', ') + ')' : ''}, not a quote.</small></div>
      </div>
      ${c.bundle.length > 1 ? `<p class="small"><span class="wl-k">Typical setup:</span> ${c.bundle.map(b => esc(b.name)).join(' + ')}</p>` : ''}
      ${c.pickWhy ? `<p class="rec-note small"><b>${esc(c.pickWhy)}</b></p>` : ''}
      ${c.notes.map(n => `<p class="rec-note small">${esc(n)}</p>`).join('')}
      ${c.requires ? `<p class="small muted">${esc(c.requires)}</p>` : ''}
      ${c.claimNote ? `<p class="small muted claim">${esc(c.claimNote)}${c.claimSources.length ? ' Sources: ' + uniqSrc(c.claimSources).map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name.split(':')[0])}</a>`).join('; ') + '.' : ''}</p>` : ''}
      ${c.alternatives.length ? `<p class="small"><span class="wl-k">Other options:</span> ${c.alternatives.map(a => `<span class="chip">${esc(a.name)}</span>`).join(' ')}</p>` : ''}
      <div class="rec-cta"><a href="#/book?type=virtual" class="btn btn-primary">Book a free virtual consult</a>${i === 0 && rc.generic ? '<button type="button" class="btn btn-outline" data-jump="test-home">Test your tap</button>' : ''}</div>
    </article>`).join('');
  setF(f, 'rec-foot', 'Prices are rough national installed-cost ranges from consumer cost guides, labeled as estimates, not PA Water Solutions quotes. Your price depends on a test of your water and your plumbing. Brand and model names are placeholders.');
  const top = rc.top;
  if (top) {
    setF(f, 'side-title', top.title); setF(f, 'side-prod', top.product);
    setF(f, 'side-price', top.startingAt != null ? `Starting at ${money(top.startingAt)} installed (estimate)` : '');
    setF(f, 'bar-prod', top.product.replace(/ at the kitchen sink.*$/, ' system').replace(/ \(.*?\)/g, ''));
    setF(f, 'bar-price', top.startingAt != null ? `from ${money(top.startingAt)} (est.)` : '');
  } else { f.querySelector('[data-f="side"]').remove(); f.querySelector('[data-f="bar"]').remove(); }
  // 4. complete data
  const sec = (title, html, open) => `<details${open ? ' open' : ''}><summary>${esc(title)}</summary>${html}</details>`;
  const findingsHTML = r.findings.map(x => `
    <div class="finding ${x.level}">
      <div class="f-head"><h3>${esc(x.title)}</h3><span class="pill ${x.level}">${esc(d.levels[x.level])}</span><span class="pill kind">${x.kind === 'health' ? 'Health risk' : x.kind === 'nuisance' ? 'Nuisance' : 'Info'}</span></div>
      <p class="f-stat">${esc(x.stat)}</p>${x.userNote && !x.fromSymptoms ? `<p class="you-said">🗨 ${esc(x.userNote)}</p>` : ''}<p class="f-explain">${esc(x.explain)}</p>${x.fromSymptoms ? '<p class="f-flag" style="color:var(--muted)">Based on what you told us, not a measurement.</p>' : ''}<p class="f-std">Standard: ${esc(x.standard)}</p>
      ${x.smallSample ? '<p class="f-flag">⚠ Small sample (under 30 wells). Treat this as a rough indication.</p>' : ''}
      ${x.general ? '<p class="f-flag" style="color:var(--muted)">General to public water systems. Not a measured level for your system.</p>' : ''}
      ${x.solutions.length ? `<div class="f-fix"><span class="muted">Typical fix:</span>${x.solutions.map(k => `<span class="chip">${esc(d.solutions[k].name)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
  let complete = sec('All findings in detail', findingsHTML);
  if (isWell && r.dataAvailable) {
    const rows = Object.entries(r.parameters).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v.units)}</td><td>${v.samples ?? '—'}</td><td>${v.median ?? '—'}</td><td>${v.max ?? '—'}</td><td>${v.pctFailing == null ? '—' : v.pctFailing + '%'}</td><td>${esc(v.epaStandard)}</td></tr>`).join('');
    complete += sec(`Penn State well data: ${r.county} County (all parameters)`, `<div class="table-wrap"><table class="stats-table"><tr><th>Parameter</th><th>Units</th><th>Wells</th><th>Median</th><th>Max</th><th>% over std</th><th>EPA std</th></tr>${rows}</table></div>
      <p class="small muted">${r.totalSamples} samples, ${esc(r.period)}. <a href="${esc(r.source.url)}" target="_blank" rel="noopener">Source table ↗</a></p>`);
  } else if (!isWell && d.system) {
    const s = d.system, pf = d.pfas, v5 = d.viol5;
    complete += sec('Water system facts', `<div class="facts"><div><span>System</span><strong>${esc(titleCase(s.name))}</strong></div><div><span>PWSID</span><strong>${esc(s.pwsid)}</strong></div><div><span>People served</span><strong>${fmt(s.population)}</strong></div><div><span>Source</span><strong>${esc(s.source || '—')}</strong></div></div>
      <p class="small">Annual water quality report (hardness, disinfection byproducts and more): <a href="https://www.google.com/search?q=${encodeURIComponent('"' + titleCase(s.name) + '" annual water quality report ' + s.pwsid)}" target="_blank" rel="noopener">Search for this system's report ↗</a> · <a href="https://sdwis.epa.gov/fylccr" target="_blank" rel="noopener">EPA CCR finder ↗</a> · <a href="${esc(s.echoUrl)}" target="_blank" rel="noopener">EPA ECHO report ↗</a></p>`);
    complete += sec('PFAS results (EPA UCMR 5)', pf?.sampled
      ? `<p class="small">Tested ${esc(pf.firstSample)} to ${esc(pf.lastSample)} · ${pf.samplePoints} sampling point(s) · ${pf.tested} PFAS analyzed · ${pf.detected.length} detected.${pf.hazardIndex != null ? ` Hazard Index (PFHxS, PFNA, GenX, PFBS): ${pf.hazardIndex} (limit 1).` : ''}</p>
        <div class="table-wrap"><table class="stats-table"><tr><th>PFAS</th><th>Highest avg (ppt)</th><th>Highest single (ppt)</th><th>Detections</th><th>EPA MCL</th></tr>
        ${pf.detected.map(x => `<tr><td>${esc(x.name)}</td><td>${x.highestAvg}</td><td>${x.max}</td><td>${x.detections}/${x.results}</td><td>${x.mcl ? x.mcl + ' ppt' : x.name === 'PFBS' ? 'Hazard Index only' : '—'}</td></tr>`).join('') || '<tr><td colspan="5">No PFAS detected above EPA reporting limits.</td></tr>'}</table></div>
        <p class="small muted">Highest average = highest sampling-point average, with non-detects counted as 0. EPA's compliance method differs slightly (results below 4 ppt count as 0), so official compliance numbers may be lower.</p>`
      : '<p><strong>Not sampled.</strong> This system was not part of EPA\'s UCMR 5 PFAS sampling (2023–2025).</p>');
    complete += sec('Violations (EPA, last 5 years)', v5 ? (v5.all.length ? `<div class="table-wrap"><table class="stats-table"><tr><th>Rule</th><th>Type</th><th>Period start</th><th>Status</th></tr>${v5.all.map(x => `<tr><td>${esc(x.rule)}</td><td>${x.healthBased ? 'Health-based' : x.category === 'Other' ? 'Other / notice' : 'Monitoring / reporting'}</td><td>${esc(x.begin)}</td><td>${x.resolved ? 'Resolved' : 'Not marked resolved (' + esc(x.status) + ')'}</td></tr>`).join('')}</table></div>` : '<p>No violations in the last 5 years.</p>') : '<p>EPA violation data unavailable right now.</p>');
    complete += sec('Compliance by quarter (EPA ECHO, 3 years)', renderViolations(d.compliance));
  }
  complete += sec('How the score works (full rules)', `<pre class="small" style="white-space:pre-wrap">${esc(JSON.stringify(isWell ? d.scoreRules.well : d.scoreRules.public, null, 1))}</pre>`);
  f.querySelector('[data-f="complete"]').innerHTML = complete;
  setF(f, 'caveat', r.caveat || r.note || '');
  f.querySelector('[data-f="sources"]').innerHTML = isWell
    ? `Data: <a href="${esc(r.source?.url || '#')}" target="_blank" rel="noopener">${esc(r.source?.name || 'Penn State AASL')}</a>${r.period ? `, samples ${esc(r.period)}` : ''}; retrieved ${esc(r.source?.retrieved || '')}. Address location: U.S. Census geocoder.`
    : `Data: U.S. EPA Community Water System Service Area Boundaries; SDWIS via Envirofacts (violations, lead 90th percentile); ECHO; <a href="${esc(d.pfas?.source?.url || '#')}" target="_blank" rel="noopener">UCMR 5 PFAS occurrence data</a> (${esc(d.pfas?.source?.datasetNote || '')}); U.S. Census geocoder.`;
  app.replaceChildren(f);
  app.querySelectorAll('[data-jump]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById(el.dataset.jump); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }));
  const jumpTo = id => { const t = document.getElementById(id); if (!t) return; t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); };
  app.querySelectorAll('[data-sol]').forEach(el => el.addEventListener('click', () => jumpTo(el.dataset.sol)));
  app.querySelector('[data-f="side-why"]')?.addEventListener('click', () => jumpTo(rc.top?.anchor || 'recommended'));
  const setSource = src => {
    const it = getIntake(address) || {};
    setIntake(address, { ...it, source: src });
    fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, intake: { ...it, source: src } }) }).catch(() => {});
    const h = '#/result?address=' + encodeURIComponent(address);
    if (location.hash === h) route(); else location.hash = h;
  };
  app.querySelector('[data-f="sl-switch"]').addEventListener('click', () => setSource(isWell ? 'public' : 'well'));
  app.querySelectorAll('[data-f="sl-chips"] button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.src === 'unsure') { const ht = app.querySelector('[data-f="howtell"]'); ht.open = true; b.classList.add('on'); app.querySelectorAll('[data-f="sl-chips"] button').forEach(x => x !== b && x.classList.remove('on')); setSource('unsure'); return; }
    setSource(b.dataset.src);
  }));
  // quick questions (optional refinement)
  if (QUESTIONS) {
    const ans = { ...(d.intake || {}) };
    const qWrap = app.querySelector('[data-f="questions"]');
    qWrap.innerHTML = QUESTIONS.questions.map(q => `
      <div class="q" data-qid="${q.id}" ${q.showIf ? `data-showif='${esc(JSON.stringify(q.showIf))}'` : ''}>
        <div class="q-label">${esc(q.label)}${q.hint ? ` <span class="q-hint">${esc(q.hint)}</span>` : ''}</div>
        <div class="chipset ${q.type}" data-q="${q.id}">${q.options.map(([v, l]) => `<button type="button" data-v="${v}">${esc(l)}</button>`).join('')}</div>
      </div>`).join('');
    const ctx = { ...ans, source: d.source };
    const paint = () => {
      qWrap.querySelectorAll('.chipset').forEach(cs => { const v = ans[cs.dataset.q]; cs.querySelectorAll('button').forEach(b => b.classList.toggle('on', Array.isArray(v) ? v.includes(b.dataset.v) : v === b.dataset.v)); });
      qWrap.querySelectorAll('.q[data-showif]').forEach(q => {
        const cond = JSON.parse(q.dataset.showif);
        const ok = Object.entries(cond).every(([k, want]) => { const v = k === 'source' ? ctx.source : ans[k]; return Array.isArray(v) ? v.includes(want) : v === want; });
        q.hidden = !ok; if (!ok) delete ans[q.dataset.qid];
      });
    };
    qWrap.querySelectorAll('.chipset').forEach(cs => cs.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const id = cs.dataset.q, v = b.dataset.v;
      if (cs.classList.contains('multi')) {
        let cur = Array.isArray(ans[id]) ? [...ans[id]] : [];
        const excl = ['none', 'unsure', 'skip'];
        cur = cur.includes(v) ? cur.filter(x => x !== v) : excl.includes(v) ? [v] : [...cur.filter(x => !excl.includes(x)), v];
        if (cur.length) ans[id] = cur; else delete ans[id];
      } else if (ans[id] === v) delete ans[id]; else ans[id] = v;
      paint();
    }));
    paint();
    const answered = Object.keys(d.intake || {}).filter(k => k !== 'source').length;
    if (answered) setF(app, 'q-status', 'Your report below already uses these answers. Change any and update.');
    app.querySelector('[data-f="q-go"]').addEventListener('click', async () => {
      const btn = app.querySelector('[data-f="q-go"]'); btn.disabled = true; btn.textContent = 'Updating…';
      const body = { ...ans, source: (getIntake(address) || {}).source || d.intake?.source };
      if (!body.source) delete body.source;
      setIntake(address, body);
      sessionStorage.setItem('keepScroll', 'watch');
      route();
    });
  } else app.querySelector('#refine')?.remove();
  sessionStorage.setItem('lastLookup', JSON.stringify({ matchedAddress: d.geo.matchedAddress, quote: d.quote, status: d.source }));
  sessionStorage.setItem('lastReport', JSON.stringify({ address, matched: addr, source: d.source, recs: d.recs, score: d.score?.score }));
  saveContact({ address: addr });
}

function renderNotFound(d, address) {
  const f = tpl('tpl-notfound');
  if (d.status === 'error') {
    f.querySelector('h1').textContent = 'Something went wrong';
    setF(f, 'msg', d.message || 'One of the public data services didn\'t respond. Please try again in a minute.');
  }
  app.replaceChildren(f);
  mountLeadForms(app, { address });
}


// ---------- Upload ----------
function renderUpload() {
  const f = tpl('tpl-upload');
  setF(f, 'maxmb', CONFIG.MAX_UPLOAD_MB);
  app.replaceChildren(f); window.scrollTo(0, 0);
  const form = document.getElementById('upload-form');
  const c = getContact(); ['name', 'email', 'phone', 'address'].forEach(k => { if (c[k]) form[k].value = c[k]; });
  const fileInput = document.getElementById('file'), drop = document.getElementById('drop'), dropText = document.getElementById('drop-text');
  const showFile = () => { const fl = fileInput.files[0]; if (fl) dropText.innerHTML = `<strong>${esc(fl.name)}</strong><br><span class="small muted">${(fl.size / 1024 / 1024).toFixed(2)} MB · tap to change</span>`; };
  fileInput.addEventListener('change', showFile);
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; showFile(); } });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = form.querySelector('.form-error'); err.hidden = true;
    const fl = fileInput.files[0];
    const fail = m => { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = 'Upload results'; };
    const btn = form.querySelector('button[type=submit]');
    if (!fl) return fail('Please choose your lab report file.');
    if (fl.size > CONFIG.MAX_UPLOAD_MB * 1024 * 1024) return fail(`That file is over ${CONFIG.MAX_UPLOAD_MB} MB. Try a smaller photo or PDF.`);
    let type = fl.type; if (!type && /\.hei[cf]$/i.test(fl.name)) type = 'image/heic';
    btn.disabled = true; btn.textContent = 'Uploading…';
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(fl); });
    const fields = Object.fromEntries(['name', 'email', 'phone', 'address', 'notes'].map(k => [k, form[k].value.trim()]));
    try {
      const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, intake: lastIntake(), file: { name: fl.name, type, data } }) });
      const j = await r.json();
      if (!j.ok) return fail(j.message || 'Upload failed. Please try again.');
      saveContact(fields);
      sessionStorage.setItem('uploadedFile', fl.name);
      location.hash = '#/uploaded';
    } catch { fail('Upload failed. Please check your connection and try again.'); }
  });
}

function renderUploaded() {
  const f = tpl('tpl-uploaded');
  setF(f, 'filename', sessionStorage.getItem('uploadedFile') || '—');
  app.replaceChildren(f); window.scrollTo(0, 0);
}

// ---------- Booking ----------
function priceBoxHTML(q) {
  const dep = CONFIG.IN_HOME_DEPOSIT, credit = CONFIG.CREDIT_WINDOW_DAYS;
  const travel = q && !q.inServiceArea
    ? `<div class="price-line"><span>Travel fee: ${q.milesOver} mi × ${money(q.rate)} = <strong>${money(q.travelFee)}</strong><small>Non-refundable, not part of the deposit. Miles beyond ${CONFIG.SERVICE_RADIUS_MILES} (approx., straight line) at the ${esc(CONFIG.MILEAGE_RATE_SOURCE)}.</small></span><strong>${money(q.travelFee)}</strong></div>`
    : `<div class="price-line"><span>Travel fee<small>None. You're within ${CONFIG.SERVICE_RADIUS_MILES} miles.</small></span><strong>$0</strong></div>`;
  return `<div class="price-line"><span>${money(dep)} deposit, credited toward any system you buy<small>Within ${credit} days <span class="ph">Placeholder</span></small></span><strong>${money(dep)}</strong></div>${travel}
    <div class="price-line total"><span>Due for the visit</span><span>${money(q ? q.inHomeDueTotal : dep)}</span></div>`;
}

function applyQuote(q, matched) {
  const note = document.getElementById('distance-note');
  const box = document.getElementById('price-box');
  const R = CONFIG.SERVICE_RADIUS_MILES, base = CONFIG.BASE.label;
  const type = document.querySelector('#book-form input[name=option]:checked')?.value;
  if (!q) { note.hidden = true; box.hidden = type !== 'in-home'; if (type === 'in-home') box.innerHTML = priceBoxHTML(null) + '<p class="small muted">Enter your address to calculate any travel fee.</p>'; return; }
  note.hidden = false;
  note.classList.toggle('out', !q.inServiceArea);
  note.innerHTML = q.inServiceArea
    ? `📍 <strong>${esc(titleCase(matched))}</strong> is approx. <strong>${q.miles} mi</strong> from ${esc(base)} (straight line). That's inside our ${R}-mile service area: no travel fee, and installs are available.`
    : `📍 <strong>${esc(titleCase(matched))}</strong> is approx. <strong>${q.miles} mi</strong> from ${esc(base)} (straight line), outside our ${R}-mile service area. Virtual consults are free everywhere. In-home visits add a travel fee. Installs are only offered inside the service area.`;
  box.hidden = type !== 'in-home';
  box.innerHTML = priceBoxHTML(q);
}

function fmtSlot(iso, opts = {}) {
  return new Date(iso).toLocaleString('en-US', { timeZone: CONFIG.TIMEZONE, hour: 'numeric', minute: '2-digit', ...opts });
}

function renderBook() {
  const f = tpl('tpl-book');
  setF(f, 'vmin', CONFIG.VIRTUAL_MINUTES); setF(f, 'dep', CONFIG.IN_HOME_DEPOSIT); setF(f, 'credit', CONFIG.CREDIT_WINDOW_DAYS);
  setF(f, 'tz', '(Eastern Time)');
  setF(f, 'area-note', `Installs are offered only within our service area (about ${CONFIG.SERVICE_RADIUS_MILES} miles of ${CONFIG.BASE.label}). Virtual consultations are available anywhere in Pennsylvania. Distances are approximate straight-line estimates, not driving distance.`);
  app.replaceChildren(f); window.scrollTo(0, 0);
  const form = document.getElementById('book-form');
  const c = getContact(); ['name', 'email', 'phone', 'address'].forEach(k => { if (c[k]) form[k].value = c[k]; });
  const pre = new URLSearchParams(location.hash.split('?')[1] || '').get('type');
  if (pre && form.querySelector(`input[value="${pre}"]`)) form.querySelector(`input[value="${pre}"]`).checked = true;
  let quote = null, matched = null, picked = null;
  const addr = document.getElementById('book-address'), btn = document.getElementById('check-dist');
  let lastChecked = '';
  async function check(force) {
    const a = addr.value.trim(); if (a.length < 8 || (a === lastChecked && !force)) return; lastChecked = a;
    btn.disabled = true; btn.textContent = '…';
    try {
      const r = await fetch('/api/quote?address=' + encodeURIComponent(a)); const j = await r.json();
      if (j.status === 'ok') { quote = j.quote; matched = j.geo.matchedAddress; applyQuote(quote, matched); saveContact({ address: a }); }
      else { quote = null; applyQuote(null); const n = document.getElementById('distance-note'); n.hidden = false; n.classList.add('out'); n.textContent = "We couldn't find that address. Check the spelling and include the city and ZIP."; }
    } catch { applyQuote(null); }
    btn.disabled = false; btn.textContent = 'Check';
  }
  btn.addEventListener('click', () => check(true)); addr.addEventListener('change', () => check());
  const typeNow = () => form.querySelector('input[name=option]:checked')?.value;
  function updateAddrLabel() {
    setF(app, 'addr-label', typeNow() === 'in-home' ? 'Address of the home we\'ll visit (required)' : 'Address (optional for virtual)');
    applyQuote(quote, matched);
  }
  async function loadSlots(keepDate) {
    const type = typeNow(); const days = document.getElementById('cal-days'), slots = document.getElementById('cal-slots'), empty = document.getElementById('cal-empty');
    picked = null; document.getElementById('cal-picked').hidden = true;
    if (!type) return;
    empty.textContent = 'Loading open times…'; empty.hidden = false; days.innerHTML = ''; slots.innerHTML = '';
    const j = await (await fetch('/api/slots?type=' + type)).json();
    if (!j.days.length) { empty.textContent = 'No open times in the next 3 weeks. Please call or email us.'; return; }
    empty.hidden = true;
    const showDay = (date) => {
      days.querySelectorAll('.cal-day').forEach(b => b.classList.toggle('on', b.dataset.date === date));
      const day = j.days.find(x => x.date === date);
      slots.innerHTML = day.slots.map(s => `<button type="button" class="slot" data-iso="${s}">${fmtSlot(s)}</button>`).join('');
      slots.querySelectorAll('.slot').forEach(b => b.addEventListener('click', () => {
        slots.querySelectorAll('.slot').forEach(x => x.classList.remove('on')); b.classList.add('on'); picked = b.dataset.iso;
        const p = document.getElementById('cal-picked'); p.hidden = false;
        p.textContent = '✓ ' + fmtSlot(picked, { weekday: 'long', month: 'long', day: 'numeric' }) + ` ET (${type === 'virtual' ? CONFIG.APPOINTMENT.virtual.minutes + ' min video call' : CONFIG.APPOINTMENT['in-home'].minutes + ' min in-home visit'})`;
      }));
    };
    days.innerHTML = j.days.map(d => { const dt = new Date(d.date + 'T12:00:00Z');
      return `<button type="button" class="cal-day" data-date="${d.date}"><span>${d.weekday}</span><b>${dt.getUTCDate()}</b><span>${dt.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</span></button>`; }).join('');
    days.querySelectorAll('.cal-day').forEach(b => b.addEventListener('click', () => showDay(b.dataset.date)));
    showDay(keepDate && j.days.some(x => x.date === keepDate) ? keepDate : j.days[0].date);
  }
  form.querySelectorAll('input[name=option]').forEach(r => r.addEventListener('change', () => { updateAddrLabel(); loadSlots(); }));
  updateAddrLabel(); if (typeNow()) loadSlots();
  if (addr.value) check();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = form.querySelector('.form-error'); err.hidden = true;
    const fail = m => { err.textContent = m; err.hidden = false; };
    const fd = new FormData(form);
    const data = { type: 'consultation', option: fd.get('option'), name: fd.get('name').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim(), address: fd.get('address').trim(), notes: fd.get('notes').trim(), slotStart: picked, intake: lastIntake() };
    if (!data.option) return fail('Please choose virtual or in-home.');
    if (data.option === 'in-home' && !quote) return fail('Please enter and check the address for the in-home visit.');
    if (!picked) return fail('Please pick a time.');
    if (!data.name) return fail('Please add your name.');
    if (!data.phone && !data.email) return fail('Please add a phone number or email so we can confirm.');
    const sb = form.querySelector('button[type=submit]'); sb.disabled = true;
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json();
      if (r.status === 409) { const day = document.querySelector('.cal-day.on')?.dataset.date; await loadSlots(day); sb.disabled = false; return fail(j.message); }
      if (!j.ok) throw new Error(j.message);
      saveContact(data);
      sessionStorage.setItem('booking', JSON.stringify({ ...data, quote: j.quote, pricing: j.pricing, booking: j.booking }));
      location.hash = '#/booked';
    } catch (ex) { fail(ex.message || 'Something went wrong. Please try again.'); sb.disabled = false; }
  });
}

function renderBooked() {
  const b = JSON.parse(sessionStorage.getItem('booking') || 'null');
  if (!b || !b.booking) { location.hash = '#/book'; return; }
  const f = tpl('tpl-booked');
  const a = CONFIG.APPOINTMENT[b.option];
  setF(f, 'first', b.name.split(' ')[0]);
  setF(f, 'when', fmtSlot(b.booking.start, { weekday: 'long', month: 'long', day: 'numeric' }) + ' – ' + fmtSlot(b.booking.end) + ' ET');
  setF(f, 'type', b.option === 'virtual' ? 'Virtual video call' : 'In-home visit');
  setF(f, 'len', a.minutes + ' min');
  setF(f, 'id', b.booking.id.replace('bk_', '').toUpperCase());
  const pr = f.querySelector('[data-f="pricing"]');
  if (b.option === 'in-home' && b.pricing) {
    pr.innerHTML = `<div class="price-box">${priceBoxHTML({ ...b.quote, inHomeDueTotal: b.pricing.total })}</div>`;
  } else pr.innerHTML = '<div class="price-box"><div class="price-line total"><span>Virtual consultation</span><span>Free</span></div></div>';
  setF(f, 'details', b.option === 'in-home'
    ? `We'll test your water on site, look at your plumbing and the space for equipment, and send a written report with our recommendation.${b.quote ? ` Address: ${titleCase(b.quote.matchedAddress)} (approx. ${b.quote.miles} mi from ${CONFIG.BASE.label}).` : ''} Payment isn't collected online yet. We'll arrange the deposit${b.pricing?.travelFee ? ' and travel fee' : ''} when we confirm.`
    : "We'll send a video call link with your confirmation. Have your water report or lab results handy.");
  app.replaceChildren(f); window.scrollTo(0, 0);
}

// ---------- Solutions, order request, pre-install check ----------
let CATALOG = null;
const loadCatalog = async () => CATALOG || (CATALOG = await fetch('/api/solutions').then(r => r.json()));
const getCart = () => JSON.parse(sessionStorage.getItem('cart') || '[]');
const setCart = c => sessionStorage.setItem('cart', JSON.stringify([...new Set(c)]));
const solById = id => CATALOG.solutions.find(s => s.id === id);
const fromPrice = s => s.cost.startingAt != null ? `From ${money(s.cost.startingAt)} installed (estimate)` : s.cost.installed;
const POU = ['ro_pou', 'carbon_block_pou', 'arsenic_nitrate'];
const NO_INSTALL = ['pitcher_countertop', 'shower_filter', 'electronic_descaler'];

function solCardHTML(s, opts = {}) {
  const inCart = getCart().includes(s.id);
  const buyable = s.id !== 'di' && s.status !== 'dropped' && s.status !== 'option';
  return `<article class="sol-item${opts.rec ? ' rec' : ''}" data-id="${s.id}">
    ${opts.label ? `<div class="rec-k">${esc(opts.label)}</div>` : ''}
    <h3>${esc(s.name)}</h3>
    <p class="small"><span class="wl-k">Treats:</span> ${esc(s.treats.slice(0, 3).join('; '))}</p>
    <p class="small muted"><span class="wl-k">Doesn't treat:</span> ${esc(s.doesNotTreat.slice(0, 2).join('; '))}</p>
    <p class="sol-price">${esc(fromPrice(s))}<small> · upkeep ${esc(s.cost.annual)}</small></p>
    <p class="small muted">${s.suggested ? 'Suggested: ' + esc(s.suggested) : 'Brand / model: PLACEHOLDER'}</p>
    ${s.status === 'niche' || s.status === 'option' ? `<p class="small muted"><span class="wl-k">Use only for:</span> ${esc(s.bestFit)}</p>` : ''}
    <div class="sol-btns">
      ${buyable ? `<button type="button" class="btn ${inCart ? 'btn-outline added' : 'btn-primary'}" data-buy="${s.id}">${inCart ? 'Added to request ✓' : 'Buy / request this'}</button>` : '<span class="small muted">Comparison only, not sold for homes</span>'}
      <a href="#/book" class="btn btn-outline">Book a free virtual or $100 in-home consult</a>
    </div></article>`;
}

async function renderSolutions() {
  app.replaceChildren(tpl('tpl-loading'));
  await loadCatalog();
  const rep = JSON.parse(sessionStorage.getItem('lastReport') || 'null');
  const recCards = rep?.recs?.cards || [];
  const recIds = [...new Set(recCards.flatMap(c => [c.primary?.id, ...(c.bundle || []).map(b => b.id)]).filter(Boolean))];
  const live = CATALOG.solutions.filter(s => s.status !== 'dropped' && s.status !== 'component');
  const cats = [...new Set(live.map(s => s.category))];
  const dropped = CATALOG.dropped || [];
  app.innerHTML = `<section class="page solutions-page">
    ${rep ? `<a href="#/result?address=${encodeURIComponent(rep.address)}" class="back">← Back to your water report</a>` : '<a href="#/" class="back">← Check your water first</a>'}
    <h1>Solutions</h1>
    <p class="muted">${rep ? `For ${esc(rep.matched)}. ` : ''}Request a system and we'll confirm the details before anything is installed, or book a consult if you'd like advice first. Prices are rough national estimates, not quotes.</p>
    ${recIds.length ? `<div class="card rec-panel"><h2>Recommended for your home</h2><p class="small muted">Based on your report${rep?.recs?.generic ? ' (nothing stood out, so these are for taste and peace of mind)' : ''}.</p>
      <div class="sol-grid2">${recIds.map((id, i) => { const c = recCards.find(k => k.primary?.id === id); return solCardHTML(solById(id), { rec: true, label: c ? (i === 0 ? 'Top pick · ' : '') + c.title : 'Part of the typical setup' }); }).join('')}</div></div>` : ''}
    <h2 class="section-title">Full catalog</h2>
    ${cats.map(c => `<h3 class="cat-h">${esc(c)}</h3><div class="sol-grid2">${live.filter(s => s.category === c).map(s => solCardHTML(s)).join('')}</div>`).join('')}
    ${dropped.length ? `<details class="card dropped"><summary>Products we don't sell, and why</summary><ul class="small">${dropped.map(d => `<li><b>${esc(d.item)}:</b> ${esc(d.why)}</li>`).join('')}</ul></details>` : ''}
    <p class="small muted">${esc(CATALOG.meta.costNote)} Full details: SOLUTIONS.md.</p>
    <div class="order-bar" data-f="obar" hidden><span data-f="ocount"></span><a href="#/order" class="btn btn-primary">Request order →</a></div>
  </section>`;
  const paintBar = () => { const n = getCart().length; const b = app.querySelector('[data-f="obar"]'); b.hidden = !n; app.querySelector('[data-f="ocount"]').textContent = `${n} item${n === 1 ? '' : 's'} selected`; };
  app.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.buy; const c = getCart();
    setCart(c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
    app.querySelectorAll(`[data-buy="${id}"]`).forEach(x => { const on = getCart().includes(id); x.className = 'btn ' + (on ? 'btn-outline added' : 'btn-primary'); x.textContent = on ? 'Added to request ✓' : 'Buy / request this'; });
    paintBar();
  }));
  paintBar(); window.scrollTo(0, 0);
}

async function renderOrder() {
  await loadCatalog();
  const cart = getCart();
  if (!cart.length) { location.hash = '#/solutions'; return; }
  const c = getContact();
  app.innerHTML = `<section class="page narrow">
    <a href="#/solutions" class="back">← Back to solutions</a>
    <h1>Request your order</h1>
    <p class="muted">No payment today. We'll confirm sizing, compatibility and your exact price before anything is installed.</p>
    <div class="card"><h2>Your request</h2><ul class="order-list">${cart.map(id => { const s = solById(id); return `<li><span><strong>${esc(s.name)}</strong><small>${esc(fromPrice(s))}</small></span><button type="button" class="linkish" data-rm="${id}">Remove</button></li>`; }).join('')}</ul>
      <p class="small muted">Estimates are national ranges. Your quote depends on your water test, plumbing and install site. Brand / model: PLACEHOLDER.</p></div>
    <form class="card leadform" id="order-form">
      <h2>Your details</h2>
      <label>Name<input name="name" required value="${esc(c.name || '')}"></label>
      <label>Email<input name="email" type="email" value="${esc(c.email || '')}"></label>
      <label>Phone<input name="phone" type="tel" value="${esc(c.phone || '')}"></label>
      <label>Install address<input name="address" required value="${esc(c.address || '')}"></label>
      <label>Anything we should know? (optional)<textarea name="notes" rows="3"></textarea></label>
      <div class="pay-note"><span class="ph">Placeholder checkout</span> Payment isn't collected online yet. It will be added later through Stripe. Submitting this sends us your request; it is not a purchase.</div>
      <p class="form-error error" hidden></p>
      <button type="submit" class="btn btn-primary btn-lg">Request order</button>
    </form></section>`;
  app.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { setCart(getCart().filter(x => x !== b.dataset.rm)); renderOrder(); }));
  const form = document.getElementById('order-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const err = form.querySelector('.form-error'); err.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    if (!data.phone && !data.email) { err.textContent = 'Please add a phone number or email.'; err.hidden = false; return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, type: 'order', products: getCart(), intake: lastIntake(), report: JSON.parse(sessionStorage.getItem('lastReport') || 'null')?.recs?.top || null }) });
      const j = await r.json(); if (!j.ok) throw new Error(j.message);
      saveContact(data);
      sessionStorage.setItem('order', JSON.stringify({ id: j.id, products: j.products, contact: data }));
      setCart([]);
      location.hash = '#/preinstall';
    } catch (ex) { err.textContent = ex.message || 'Something went wrong. Please try again.'; err.hidden = false; btn.disabled = false; }
  });
  window.scrollTo(0, 0);
}

function shotList(products) {
  const ids = products.map(p => p.id);
  const pou = ids.some(id => POU.includes(id));
  const whole = ids.some(id => !POU.includes(id) && !NO_INSTALL.includes(id));
  const lists = [];
  if (pou) lists.push(['Under-sink system (RO / filter)', ['Under the kitchen sink with the cabinet doors open', 'A tape measure across the cabinet showing width, depth and height', 'The faucet and countertop, including any spare hole or soap dispenser', 'The nearest electrical outlet (under the sink or close by)']]);
  if (whole) lists.push(['Whole-house or hard-water system', ['Where the main water line enters the house, and the main shutoff valve', 'The area around the water heater / utility space (stand back so we see the space)', 'The nearest floor drain or laundry drain', 'The nearest electrical outlet']]);
  return lists;
}

async function renderPreinstall() {
  const o = JSON.parse(sessionStorage.getItem('order') || 'null');
  if (!o) { location.hash = '#/solutions'; return; }
  const lists = shotList(o.products);
  const first = o.contact.name.split(' ')[0];
  app.innerHTML = `<section class="page narrow preinstall">
    <div class="success big">✓ Thanks, ${esc(first)}! We received your order request.</div>
    <h1>Pre-install check</h1>
    <p class="muted">So we bring the right parts and give you an exact price, we need a quick look at your install spot. Pick one:</p>
    ${!lists.length ? '<div class="card"><p>Your items don\'t need installation, so there\'s no pre-install check. We\'ll be in touch to confirm your order.</p><a class="btn btn-primary" href="#/">Done</a></div>' : `
    <div class="pi-options">
      <label class="pi-opt"><input type="radio" name="pi" value="media" checked><span><b>Send us a quick video or photos</b> <span class="pill info">Recommended</span><small>Fastest. Take them whenever it suits you.</small></span></label>
      <label class="pi-opt"><input type="radio" name="pi" value="call"><span><b>Prefer a live call</b><small>A 15-minute video call on FaceTime, Zoom or Google Meet.</small></span></label>
    </div>
    <div class="card" data-f="pi-media">
      <h2>What to film or photograph</h2>
      ${lists.map(([t, items]) => `<h3>${esc(t)}</h3><ul class="shot-list">${items.map(x => `<li>📷 ${esc(x)}</li>`).join('')}</ul>`).join('')}
      <p class="small muted">One walk-through video is fine, or several photos. MP4, MOV, JPG, PNG or HEIC, up to ${CONFIG.PREINSTALL_MAX_MB} MB per file.</p>
      <label class="drop" id="pi-drop"><input type="file" id="pi-files" multiple accept="video/mp4,video/quicktime,image/jpeg,image/png,image/heic,image/heif,.mov,.heic,.heif" hidden><span id="pi-drop-text"><strong>Tap to add video or photos</strong><br><span class="small muted">or drag them here</span></span></label>
      <ul class="pi-files" id="pi-list"></ul>
      <label class="small">Note for our installer (optional)<textarea id="pi-note" rows="2"></textarea></label>
      <p class="form-error error" id="pi-err" hidden></p>
      <button type="button" class="btn btn-primary btn-lg" id="pi-send">Send for review</button>
    </div>
    <div class="card" data-f="pi-call" hidden>
      <h2>Book a 15-minute pre-install call</h2>
      <div class="q-label">Which app?</div>
      <div class="chipset single" id="pi-app">${CONFIG.PREINSTALL_APPS.map(a => `<button type="button" data-v="${a}">${a}</button>`).join('')}</div>
      <div class="q-label">Pick a time <span class="q-hint">(Eastern Time)</span></div>
      <div class="cal"><div class="cal-days" id="cal-days"></div><div class="cal-slots" id="cal-slots"></div><p class="small muted" id="cal-empty">Loading open times…</p><p class="cal-picked" id="cal-picked" hidden></p></div>
      <p class="form-error error" id="pc-err" hidden></p>
      <button type="button" class="btn btn-primary btn-lg" id="pc-book">Book my call</button>
    </div>`}
  </section>`;
  window.scrollTo(0, 0);
  if (!lists.length) return;
  const show = v => { app.querySelector('[data-f="pi-media"]').hidden = v !== 'media'; app.querySelector('[data-f="pi-call"]').hidden = v !== 'call'; if (v === 'call') loadCallSlots(); };
  app.querySelectorAll('input[name=pi]').forEach(r => r.addEventListener('change', () => show(r.value)));
  // media upload: each file is sent as its own streamed request body (no base64, never fully loaded into memory)
  const files = []; const list = document.getElementById('pi-list'), input = document.getElementById('pi-files');
  const paint = () => { list.innerHTML = files.map((f, i) => `<li><span>${esc(f.file.name)} <small>${f.file.size < 1048576 ? Math.max(1, Math.round(f.file.size / 1024)) + ' KB' : (f.file.size / 1048576).toFixed(1) + ' MB'}</small></span><span class="pi-st ${f.state}">${f.state === 'done' ? '✓ Uploaded' : f.state === 'up' ? Math.round(f.pct) + '%' : f.state === 'err' ? esc(f.msg) : 'Ready'}</span></li>`).join(''); };
  const add = fl => { for (const f of fl) files.push({ file: f, state: 'ready', pct: 0 }); paint(); };
  input.addEventListener('change', () => add(input.files));
  const drop = document.getElementById('pi-drop');
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', e => { e.preventDefault(); add(e.dataTransfer.files); });
  const typeOf = f => f.type || (/\.mov$/i.test(f.name) ? 'video/quicktime' : /\.hei[cf]$/i.test(f.name) ? 'image/heic' : '');
  const upload = f => new Promise(res => {
    const x = new XMLHttpRequest();
    x.open('POST', `/api/preinstall/upload?lead=${encodeURIComponent(o.id)}&name=${encodeURIComponent(f.file.name)}`);
    x.setRequestHeader('Content-Type', typeOf(f.file));
    x.upload.onprogress = e => { if (e.lengthComputable) { f.pct = e.loaded / e.total * 100; paint(); } };
    x.onload = () => { let j = {}; try { j = JSON.parse(x.responseText); } catch {} f.state = j.ok ? 'done' : 'err'; f.msg = j.message || 'Failed'; paint(); res(); };
    x.onerror = () => { f.state = 'err'; f.msg = 'Network error'; paint(); res(); };
    f.state = 'up'; paint(); x.send(f.file);
  });
  document.getElementById('pi-send').addEventListener('click', async () => {
    const err = document.getElementById('pi-err'); err.hidden = true;
    if (!files.length) { err.textContent = 'Please add at least one video or photo.'; err.hidden = false; return; }
    const big = files.find(f => f.file.size > CONFIG.PREINSTALL_MAX_MB * 1048576);
    if (big) { err.textContent = `${big.file.name} is over ${CONFIG.PREINSTALL_MAX_MB} MB.`; err.hidden = false; return; }
    const btn = document.getElementById('pi-send'); btn.disabled = true; btn.textContent = 'Uploading…';
    for (const f of files.filter(f => f.state !== 'done')) await upload(f);
    if (files.some(f => f.state === 'err')) { err.textContent = 'Some files didn\'t upload. Check the list and try again.'; err.hidden = false; btn.disabled = false; btn.textContent = 'Send for review'; return; }
    await fetch('/api/preinstall/done', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: o.id, note: document.getElementById('pi-note').value }) });
    sessionStorage.setItem('preinstallDone', JSON.stringify({ method: 'media', count: files.length }));
    location.hash = '#/preinstall-done';
  });
  // live call
  let picked = null, appPick = null, loaded = false;
  app.querySelectorAll('#pi-app button').forEach(b => b.addEventListener('click', () => { appPick = b.dataset.v; app.querySelectorAll('#pi-app button').forEach(x => x.classList.toggle('on', x === b)); }));
  async function loadCallSlots(keep) {
    if (loaded && !keep) return; loaded = true;
    const days = document.getElementById('cal-days'), slots = document.getElementById('cal-slots'), empty = document.getElementById('cal-empty');
    const j = await (await fetch('/api/slots?type=preinstall')).json();
    if (!j.days.length) { empty.textContent = 'No open times in the next 3 weeks. Please send photos instead.'; return; }
    empty.hidden = true;
    const showDay = date => {
      days.querySelectorAll('.cal-day').forEach(b => b.classList.toggle('on', b.dataset.date === date));
      slots.innerHTML = j.days.find(x => x.date === date).slots.map(s => `<button type="button" class="slot" data-iso="${s}">${fmtSlot(s)}</button>`).join('');
      slots.querySelectorAll('.slot').forEach(b => b.addEventListener('click', () => { slots.querySelectorAll('.slot').forEach(x => x.classList.remove('on')); b.classList.add('on'); picked = b.dataset.iso; const p = document.getElementById('cal-picked'); p.hidden = false; p.textContent = '✓ ' + fmtSlot(picked, { weekday: 'long', month: 'long', day: 'numeric' }) + ' ET (15 min)'; }));
    };
    days.innerHTML = j.days.map(d => { const dt = new Date(d.date + 'T12:00:00Z'); return `<button type="button" class="cal-day" data-date="${d.date}"><span>${d.weekday}</span><b>${dt.getUTCDate()}</b><span>${dt.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</span></button>`; }).join('');
    days.querySelectorAll('.cal-day').forEach(b => b.addEventListener('click', () => showDay(b.dataset.date)));
    showDay(keep && j.days.some(x => x.date === keep) ? keep : j.days[0].date);
  }
  document.getElementById('pc-book').addEventListener('click', async () => {
    const err = document.getElementById('pc-err'); err.hidden = true;
    if (!appPick) { err.textContent = 'Choose FaceTime, Zoom or Google Meet.'; err.hidden = false; return; }
    if (!picked) { err.textContent = 'Please pick a time.'; err.hidden = false; return; }
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'preinstall-call', orderId: o.id, app: appPick, slotStart: picked, name: o.contact.name, email: o.contact.email, phone: o.contact.phone }) });
    const j = await r.json();
    if (r.status === 409) { await loadCallSlots(document.querySelector('.cal-day.on')?.dataset.date); err.textContent = j.message; err.hidden = false; return; }
    if (!j.ok) { err.textContent = j.message || 'Something went wrong.'; err.hidden = false; return; }
    sessionStorage.setItem('preinstallDone', JSON.stringify({ method: 'call', app: appPick, booking: j.booking }));
    location.hash = '#/preinstall-done';
  });
}

function renderPreinstallDone() {
  const d = JSON.parse(sessionStorage.getItem('preinstallDone') || 'null');
  if (!d) { location.hash = '#/'; return; }
  app.innerHTML = `<section class="page narrow center">
    <div class="success big">✓ ${d.method === 'call' ? 'Your pre-install call is booked' : 'Got your video and photos'}</div>
    <h1>We'll take it from here</h1>
    ${d.method === 'call' ? `<p><strong>${esc(fmtSlot(d.booking.start, { weekday: 'long', month: 'long', day: 'numeric' }))} ET</strong> · 15 minutes on <strong>${esc(d.app)}</strong>. We'll send the call details with your confirmation.</p>` : `<p>${d.count} file${d.count === 1 ? '' : 's'} received.</p>`}
    <p>We'll review and reach out to schedule your install; we may ask for one more photo.</p>
    <a href="#/" class="btn btn-outline">Back to home</a></section>`;
  window.scrollTo(0, 0);
}

// ---------- Router ----------
function route() {
  const h = location.hash || '#/';
  const [path, qs] = h.slice(1).split('?');
  const params = new URLSearchParams(qs || '');
  if (path === '/home') return renderHome(sessionStorage.getItem('scrollTo') && (sessionStorage.removeItem('scrollTo'), 'contact'));
  if (path === '/result' && params.get('address')) return renderResult(params.get('address'), params.get('source'));
  if (path === '/upload') return renderUpload();
  if (path === '/uploaded') return renderUploaded();
  if (path === '/book') return renderBook();
  if (path === '/solutions') return renderSolutions();
  if (path === '/order') return renderOrder();
  if (path === '/preinstall') return renderPreinstall();
  if (path === '/preinstall-done') return renderPreinstallDone();
  if (path === '/booked') return renderBooked();
  window.scrollTo(0, 0);
  return renderLanding();
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-scroll]');
  if (a) { if (location.hash === '#/home') { e.preventDefault(); document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); } else sessionStorage.setItem('scrollTo', a.dataset.scroll); }
});
window.addEventListener('hashchange', route);
fetch('/api/config').then(r => r.json()).then(c => { CONFIG = c; route(); });
