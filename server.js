// PA Water Solutions — beta server (Node 18+, no dependencies)
// Serves the static site in /public and a small JSON API:
//   GET  /api/lookup?address=...   -> geocode + water system lookup
//   POST /api/lead                 -> saves a lead to data/leads.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = require('./config');
const PATHS = require('./paths');
PATHS.seed();
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const UPLOAD_DIR = PATHS.UPLOAD_DIR;
const ALLOWED_UPLOADS = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic', 'image/heif': '.heif' };

// Straight-line (great-circle) distance in miles
function milesBetween(lat1, lon1, lat2, lon2) {
  const R = 3958.8, rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function quoteFor(geo) {
  const miles = Math.round(milesBetween(CONFIG.BASE.lat, CONFIG.BASE.lon, geo.lat, geo.lon) * 10) / 10;
  const inArea = miles <= CONFIG.SERVICE_RADIUS_MILES;
  const milesOver = inArea ? 0 : Math.ceil(miles - CONFIG.SERVICE_RADIUS_MILES);
  const travelFee = Math.round(milesOver * CONFIG.MILEAGE_RATE_PER_MILE * 100) / 100;
  return { miles, inServiceArea: inArea, milesOver, rate: CONFIG.MILEAGE_RATE_PER_MILE, travelFee, deposit: CONFIG.IN_HOME_DEPOSIT,
    inHomeDueTotal: Math.round((CONFIG.IN_HOME_DEPOSIT + travelFee) * 100) / 100, installsAvailable: inArea };
}
function readLeads() { return fs.existsSync(LEADS_FILE) ? JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')) : []; }
function saveLead(lead) {
  fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
  const leads = readLeads(); const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...lead, receivedAt: new Date().toISOString() };
  leads.push(rec); PATHS.writeJSON(LEADS_FILE, leads); return rec;
}
function updateLead(id, fn) {
  const leads = readLeads(); const rec = leads.find(l => l.id === id);
  if (!rec) return null; fn(rec); PATHS.writeJSON(LEADS_FILE, leads); return rec;
}
const PREINSTALL_DIR = PATHS.PREINSTALL_DIR;
const PREINSTALL_TYPES = { 'video/mp4': '.mp4', 'video/quicktime': '.mov', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/heic': '.heic', 'image/heif': '.heif' };
// Streams the request body straight to disk (no buffering), enforcing the size limit as bytes arrive.
function streamUpload(req, dest, maxBytes) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(dest); let n = 0, failed = false;
    const fail = err => { if (failed) return; failed = true; req.unpipe(out); out.destroy(); fs.rm(dest, { force: true }, () => {}); req.resume(); reject(err); };
    req.on('data', c => { n += c.length; if (n > maxBytes) fail(Object.assign(new Error('too large'), { code: 413 })); });
    req.on('error', fail); out.on('error', fail);
    out.on('finish', () => !failed && resolve(n));
    req.pipe(out);
  });
}
async function readBody(req, max) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > max) throw Object.assign(new Error('too large'), { code: 413 }); chunks.push(c); }
  return Buffer.concat(chunks).toString('utf8');
}
const PUBLIC_DIR = path.join(__dirname, 'public');
const LEADS_FILE = PATHS.LEADS_FILE;

const CENSUS = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const REPORT = require('./report');
const SCHED = require('./scheduler');
const SCORE = require('./score');
const INTAKE = require('./intake');
const RECS = require('./recommend');
const CONFIRM_FILE = PATHS.CONFIRM_FILE;

// User-confirmed water source by address (one record per matched address; latest answer wins).
// Kept for a future well map. Address + coordinates + answer only, no names or contact details.
function saveConfirmation(lk, answer) {
  const all = fs.existsSync(CONFIRM_FILE) ? JSON.parse(fs.readFileSync(CONFIRM_FILE, 'utf8')) : {};
  const key = lk.geo.matchedAddress;
  const prev = all[key];
  all[key] = { matchedAddress: key, lat: lk.geo.lat, lon: lk.geo.lon, county: lk.geo.county, answer,
    detected: lk.detection?.guess || lk.status, confidence: lk.detection?.confidence || null, reasons: lk.detection?.reasons || [],
    system: lk.system ? { pwsid: lk.system.pwsid, name: lk.system.name } : null, boundary: lk.detection?.boundary || null,
    agreesWithDetection: answer === 'unsure' ? null : answer === (lk.detection?.guess || lk.status),
    firstAt: prev?.firstAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: (prev?.answers || 0) + 1 };
  PATHS.writeJSON(CONFIRM_FILE, all);
  return all[key];
}
const UCMR5 = JSON.parse(fs.readFileSync(path.join(PATHS.REF_DIR, 'ucmr5-pa-pfas.json'), 'utf8'));
const PFAS_MCL = { PFOA: 4, PFOS: 4, PFHxS: 10, PFNA: 10, 'HFPO-DA': 10 };
const HI_HBWC = { PFHxS: 10, PFNA: 10, 'HFPO-DA': 10, PFBS: 2000 }; // Hazard Index health-based water concentrations (ppt)
const RULE_NAMES = { 110: 'Total Coliform Rule', 111: 'Revised Total Coliform Rule', 121: 'Surface Water Treatment Rule', 122: 'Long Term 1 Enhanced Surface Water Treatment Rule', 123: 'Long Term 2 Enhanced Surface Water Treatment Rule', 130: 'Filter Backwash Recycling Rule', 140: 'Ground Water Rule', 210: 'Stage 1 Disinfectants & Disinfection Byproducts Rule', 220: 'Stage 2 Disinfectants & Disinfection Byproducts Rule', 310: 'Volatile Organic Chemicals', 320: 'Synthetic Organic Chemicals', 331: 'Nitrates', 332: 'Arsenic', 333: 'Inorganic Chemicals', 340: 'Radionuclides', 350: 'Lead and Copper Rule', 410: 'Public Notification Rule', 420: 'Consumer Confidence Rule', 430: 'Variances & Exemptions', 500: 'Other' };

function pfasFor(pwsid) {
  const s = UCMR5.systems[pwsid];
  if (!s) return { sampled: false, source: UCMR5.source };
  const c = s.contaminants;
  const avg = k => (c[k] ? c[k].highestAvg : null);
  const detected = Object.entries(c).filter(([, v]) => v.detections > 0)
    .map(([k, v]) => ({ name: k, highestAvg: v.highestAvg, max: v.max, detections: v.detections, results: v.results, mcl: PFAS_MCL[k] ?? null }))
    .sort((a, b) => b.highestAvg - a.highestAvg);
  const overOther = ['PFHxS', 'PFNA', 'HFPO-DA'].filter(k => (avg(k) || 0) > PFAS_MCL[k]);
  const hiParts = Object.keys(HI_HBWC).filter(k => (avg(k) || 0) > 0);
  const hazardIndex = hiParts.length >= 2 ? Math.round(hiParts.reduce((t, k) => t + avg(k) / HI_HBWC[k], 0) * 100) / 100 : null;
  if (hazardIndex != null && hazardIndex > 1) overOther.push(`Hazard Index ${hazardIndex}`);
  return { sampled: true, name: s.name, firstSample: s.firstSample, lastSample: s.lastSample, samplePoints: s.samplePoints, sampleEvents: s.sampleEvents,
    pfoa: avg('PFOA') ?? 0, pfos: avg('PFOS') ?? 0, pfoaMax: c.PFOA?.max ?? 0, pfosMax: c.PFOS?.max ?? 0,
    hazardIndex, hazardIndexParts: hiParts, overOther, detected, tested: Object.keys(c).length, source: UCMR5.source };
}

async function violations5(pwsid) {
  try {
    const since = new Date(Date.now() - 5 * 365.25 * 86400000).toISOString().slice(0, 10);
    const d = await getJSON(`${ENVIROFACTS}/sdwis.violation/pwsid/equals/${pwsid}/compl_per_begin_date/greaterThan/${since}/JSON`, 30000);
    const rows = d.map(v => ({ id: v.violation_id, rule: RULE_NAMES[v.rule_code] || `Rule ${v.rule_code}`, category: v.violation_category_code,
      healthBased: v.is_health_based_ind === 'Y', status: v.compliance_status_code, resolved: ['R', 'A'].includes(v.compliance_status_code),
      begin: (v.compl_per_begin_date || '').slice(0, 10), end: (v.compl_per_end_date || '').slice(0, 10) }))
      .sort((a, b) => b.begin.localeCompare(a.begin));
    return { since, all: rows, healthBased: rows.filter(r => r.healthBased), unresolved: rows.filter(r => !r.resolved),
      monitoring: rows.filter(r => ['MR', 'MON', 'RPT'].includes(r.category)) };
  } catch { return null; }
}
// EPA Community Water System Service Area Boundaries (owner: EPA, ArcGIS Online item 80c6912ef14f46e480f5afd807767b4b)
const EPA_SA = 'https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Water_System_Boundaries/FeatureServer/0/query';
const ENVIROFACTS = 'https://data.epa.gov/efservice';
const ECHO_DFR = 'https://echodata.epa.gov/echo/dfr_rest_services.get_sdwis_compliance';

const RESIDENTIAL_TYPES = ['Residential Area', 'Mobile Home Park', 'Other Residential'];
const CATEGORY_LABELS = {
  MCL: 'Contaminant level above the legal limit',
  MRDL: 'Disinfectant level above the legal limit',
  TT: 'Required treatment step not met',
  MR: 'Missed or late testing / reporting',
  MON: 'Missed or late testing',
  RPT: 'Missed or late reporting',
  Other: 'Other (often public notice or paperwork)',
};
const HEALTH_CATEGORIES = ['MCL', 'MRDL', 'TT'];

async function getJSON(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'PA-Water-Solutions-beta' } });
    if (!r.ok) throw new Error(`HTTP ${r.status} from ${new URL(url).host}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function geocode(address) {
  const u = `${CENSUS}?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties%2CUrban%20Areas&format=json`;
  const d = await getJSON(u);
  const m = d?.result?.addressMatches || [];
  if (!m.length) return null;
  const best = m[0];
  return {
    matchedAddress: best.matchedAddress,
    state: best.addressComponents?.state,
    county: best.geographies?.Counties?.[0]?.BASENAME || null,
    urban: (best.geographies?.['Urban Areas'] || []).length > 0,
    approx: (() => { const a = String(address).match(/^\s*(\d+)/), m = String(best.matchedAddress).match(/^\s*(\d+)/); return !a || !m || a[1] !== m[1]; })(),
    lon: best.coordinates.x,
    lat: best.coordinates.y,
  };
}

// Distance in meters from a point to the nearest edge of a polygon (rings in lon/lat, local equirectangular projection).
function edgeMeters(lon, lat, rings) {
  const kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110540;
  let best = Infinity;
  for (const ring of rings || []) for (let i = 1; i < ring.length; i++) {
    const ax = (ring[i - 1][0] - lon) * kx, ay = (ring[i - 1][1] - lat) * ky, bx = (ring[i][0] - lon) * kx, by = (ring[i][1] - lat) * ky;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return Math.round(best);
}

async function serviceAreas(lon, lat) {
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`, geometryType: 'esriGeometryPoint', inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects', returnGeometry: 'true', outSR: '4326', maxAllowableOffset: '0.00003', f: 'json',
    outFields: 'PWSID,PWS_Name,Service_Area_Type,Population_Served_Count,Service_Connections_Count,Symbology_Field,Model_Method,Data_Provider_Type,Feature_Type,Detailed_Facility_Report',
  });
  const d = await getJSON(`${EPA_SA}?${params}`);
  if (d.error) throw new Error('EPA service area query failed: ' + (d.error.message || ''));
  return (d.features || []).map(f => ({ ...f.attributes, edgeMeters: f.geometry ? edgeMeters(lon, lat, f.geometry.rings) : null }));
}

// Residential service areas whose mapped boundary is within `meters` of the point (used when no system contains it).
async function nearbyAreas(lon, lat, meters) {
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`, geometryType: 'esriGeometryPoint', inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
    distance: String(meters), units: 'esriSRUnit_Meter', returnGeometry: 'false', f: 'json',
    outFields: 'PWSID,PWS_Name,Service_Area_Type,Symbology_Field',
  });
  try { const d = await getJSON(`${EPA_SA}?${params}`); return (d.features || []).map(f => f.attributes).filter(a => RESIDENTIAL_TYPES.includes(a.Service_Area_Type)); }
  catch { return []; }
}

const BOUNDARY_LABEL = a => a.Symbology_Field === 'Modeled'
  ? ({ 'Decision Tree': 'estimated by EPA from town boundaries', 'Random Forest': 'estimated by an EPA computer model', OSM: 'estimated from OpenStreetMap data' }[a.Model_Method] || 'estimated by EPA')
  : ({ 'State Agency': 'mapped by the state', 'Water Utility': 'mapped by the utility' }[a.Data_Provider_Type] || 'mapped by the system or state');

// How sure are we about public vs. well? confident = well inside a precisely mapped (not modeled) area, or clearly far from any.
function detectionFor(out, chosen, near) {
  const reasons = [];
  const NEAR = CONFIG.BOUNDARY_NEAR_METERS;
  if (out.geo.approx) reasons.push("The address match is approximate (the house number didn't match exactly).");
  if (CONFIG.RURAL_IS_UNSURE && !out.geo.urban) reasons.push('The address is in a rural area, where address locations can be off by a few hundred feet.');
  if (chosen) {
    if (chosen.Symbology_Field === 'Modeled') reasons.push(`The service-area map here is ${BOUNDARY_LABEL(chosen)}, not mapped by the utility.`);
    if (chosen.edgeMeters != null && chosen.edgeMeters < NEAR) reasons.push(`The home is about ${chosen.edgeMeters} m from the edge of the mapped service area.`);
    if ((out.otherSystems || []).length) reasons.push('More than one water system\'s map covers this spot.');
  } else {
    if (near.length) reasons.push(`A public water system's mapped area (${near.map(n => n.PWS_Name).slice(0, 2).join(', ')}) is within about ${NEAR} m.`);
    else reasons.push('No public water system was found on EPA\'s map at this address.');
  }
  // Per spec, "no system found" is itself a not-sure signal: wells are always confirmed by the homeowner.
  const confident = !!chosen && reasons.length === 0;
  return {
    guess: chosen ? 'public' : 'well',
    confidence: confident ? 'confident' : 'not_sure',
    reasons,
    systemName: chosen ? (out.system?.name || chosen.PWS_Name) : null,
    boundary: chosen ? { method: chosen.Symbology_Field, model: chosen.Model_Method || null, provider: chosen.Data_Provider_Type || null, label: BOUNDARY_LABEL(chosen), edgeMeters: chosen.edgeMeters } : null,
    nearbySystems: near.map(n => ({ pwsid: n.PWSID, name: n.PWS_Name, boundary: n.Symbology_Field })),
    nearMeters: NEAR,
  };
}

async function waterSystem(pwsid) {
  try {
    const d = await getJSON(`${ENVIROFACTS}/sdwis.water_system/pwsid/equals/${pwsid}/JSON`);
    return d[0] || null;
  } catch { return null; }
}

async function lead90(pwsid) {
  try {
    const [res, samples] = await Promise.all([
      getJSON(`${ENVIROFACTS}/sdwis.lcr_sample_result/pwsid/equals/${pwsid}/JSON`),
      getJSON(`${ENVIROFACTS}/sdwis.lcr_sample/pwsid/equals/${pwsid}/JSON`)]);
    const end = Object.fromEntries(samples.map(x => [x.sample_id, x.sampling_end_date]));
    const pb = res.filter(r => r.contaminant_code === 'PB90' && end[r.sample_id]).sort((a, b) => end[b.sample_id].localeCompare(end[a.sample_id]));
    if (!pb.length) return null;
    return { value: Number(pb[0].sample_measure), unit: pb[0].unit_of_measure, period: end[pb[0].sample_id].slice(0, 10), source: 'EPA SDWIS lcr_sample_result (PB90)' };
  } catch { return null; }
}

async function compliance(pwsid) {
  try {
    const d = await getJSON(`${ECHO_DFR}?p_id=${pwsid}&output=JSON`, 25000);
    const c = d?.Results?.SDWISCompliance;
    if (!c) return null;
    const quarters = [];
    for (let i = 1; i <= 13; i++) if (c[`Qtr${i}Start`]) quarters.push({ start: c[`Qtr${i}Start`], end: c[`Qtr${i}End`] });
    const src = (c.Sources || [])[0] || {};
    const status = src.Status || {};
    const quarterStatus = quarters.map((q, i) => ({ ...q, status: status[`Qtr${i + 1}Status`] || 'Unknown' }));
    const violations = [];
    for (const r of src.RulesViolated || []) {
      quarters.forEach((q, i) => {
        const p = r[`Qtr${i + 1}Status`];
        if (p) violations.push({
          rule: r.DrinkingWaterRule,
          category: r.ViolationCategoryCode,
          categoryLabel: CATEGORY_LABELS[r.ViolationCategoryCode] || r.ViolationCategoryCode,
          healthBased: HEALTH_CATEGORIES.includes(r.ViolationCategoryCode),
          period: p,
        });
      });
    }
    return {
      windowStart: quarters[0]?.start, windowEnd: quarters[quarters.length - 1]?.end,
      quartersWithViolation: quarterStatus.filter(q => /violation/i.test(q.status) && !/no violation/i.test(q.status)).length,
      quarterCount: quarters.length,
      violations,
    };
  } catch { return null; }
}

const LOOKUP_CACHE = new Map();
async function lookup(address) {
  const key = address.toLowerCase().replace(/\s+/g, ' ');
  const hit = LOOKUP_CACHE.get(key);
  if (hit && Date.now() - hit.t < CONFIG.SOURCE_CACHE_MINUTES * 60000) return hit.v;
  const v = await lookupUncached(address);
  if (v.status !== 'not_found') LOOKUP_CACHE.set(key, { t: Date.now(), v });
  return v;
}

async function lookupUncached(address) {
  const geo = await geocode(address);
  if (!geo) return { status: 'not_found' };
  const out = { geo, quote: quoteFor(geo) };
  if (geo.state && geo.state !== 'PA') out.outsidePA = true;

  const areas = await serviceAreas(geo.lon, geo.lat);
  // Prefer community (residential) systems; confirm type with SDWIS.
  const enriched = await Promise.all(areas.map(async a => ({ a, ws: await waterSystem(a.PWSID) })));
  const community = enriched.filter(({ a, ws }) => ws ? ws.pws_type_code === 'CWS' : RESIDENTIAL_TYPES.includes(a.Service_Area_Type));
  out.nonCommunityNearby = enriched.filter(e => !community.includes(e)).map(({ a }) => ({ pwsid: a.PWSID, name: a.PWS_Name, type: a.Service_Area_Type }));

  if (!community.length) {
    out.status = 'well';
    out.detection = detectionFor(out, null, await nearbyAreas(geo.lon, geo.lat, CONFIG.BOUNDARY_NEAR_METERS));
    return out;
  }

  community.sort((x, y) => (y.a.Population_Served_Count || 0) - (x.a.Population_Served_Count || 0));
  const { a, ws } = community[0];
  const [comp, pb, v5] = await Promise.all([compliance(a.PWSID), lead90(a.PWSID), violations5(a.PWSID)]);
  out.lead90 = pb; out.viol5 = v5; out.pfas = pfasFor(a.PWSID);
  out.status = 'public';
  out.system = {
    pwsid: a.PWSID,
    name: (ws?.pws_name || a.PWS_Name || '').trim(),
    population: ws?.population_served_count ?? a.Population_Served_Count,
    connections: ws?.service_connections_count ?? a.Service_Connections_Count,
    source: ws ? ({ SW: 'Surface water (river, lake or reservoir)', GW: 'Groundwater (wells)', GU: 'Groundwater influenced by surface water', SWP: 'Purchased surface water', GWP: 'Purchased groundwater', GUP: 'Purchased groundwater (surface-influenced)' }[ws.primary_source_code] || ws.primary_source_code) : null,
    city: ws?.city_name || null,
    boundaryMethod: a.Symbology_Field, // "System Sourced" (from utility/state) or "Modeled" (estimated)
    echoUrl: a.Detailed_Facility_Report || `https://echo.epa.gov/detailed-facility-report?fid=${a.PWSID}&sys=SDWIS`,
  };
  out.otherSystems = community.slice(1).map(({ a }) => ({ pwsid: a.PWSID, name: a.PWS_Name }));
  out.compliance = comp;
  out.detection = detectionFor(out, a, []);
  return out;
}

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/healthz') {
    let writable = true; try { fs.accessSync(PATHS.DATA_DIR, fs.constants.W_OK); } catch { writable = false; }
    return send(res, writable ? 200 : 503, { ok: writable, dataDirWritable: writable, uptime: Math.round(process.uptime()) });
  }
  // Reject oversized bodies up front (the streamed pre-install upload has its own, larger limit).
  const declared = Number(req.headers['content-length'] || 0);
  const bodyCap = url.pathname === '/api/preinstall/upload' ? CONFIG.PREINSTALL_MAX_MB * 1024 * 1024 : url.pathname === '/api/upload' ? CONFIG.MAX_UPLOAD_MB * 1.4 * 1024 * 1024 : 100 * 1024;
  if (req.method !== 'GET' && req.method !== 'HEAD' && declared > bodyCap) { req.resume(); return send(res, 413, { ok: false, message: 'Request too large.' }); }
  try {
    if (url.pathname === '/api/lookup') {
      const address = (url.searchParams.get('address') || '').trim();
      if (address.length < 5) return send(res, 400, { status: 'error', message: 'Please enter a full street address.' });
      return send(res, 200, await lookup(address));
    }
    if (url.pathname === '/api/config') return send(res, 200, CONFIG);
    if (url.pathname === '/api/solutions') return send(res, 200, RECS.CAT);
    if (url.pathname === '/api/preinstall/upload' && req.method === 'POST') {
      const lead = url.searchParams.get('lead') || '';
      const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      const ext = PREINSTALL_TYPES[type];
      const max = CONFIG.PREINSTALL_MAX_MB * 1024 * 1024;
      if (!/^[a-z0-9]{6,20}$/.test(lead) || !readLeads().some(l => l.id === lead && l.type === 'order')) { req.resume(); return send(res, 400, { ok: false, message: 'Unknown order.' }); }
      if (!ext) { req.resume(); return send(res, 415, { ok: false, message: 'Please upload MP4/MOV video or JPG/PNG/HEIC photos.' }); }
      if (Number(req.headers['content-length'] || 0) > max) { req.resume(); return send(res, 413, { ok: false, message: `Each file must be under ${CONFIG.PREINSTALL_MAX_MB} MB.` }); }
      const dir = path.join(PREINSTALL_DIR, lead); fs.mkdirSync(dir, { recursive: true });
      const safe = String(url.searchParams.get('name') || 'file').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40) || 'file';
      const stored = `${new Date().toISOString().replace(/[:.]/g, '-')}_${safe}${ext}`;
      try {
        const bytes = await streamUpload(req, path.join(dir, stored), max);
        const file = { original: url.searchParams.get('name') || '', stored: PATHS.rel(path.join(dir, stored)), type, bytes, at: new Date().toISOString() };
        updateLead(lead, r => { r.preinstall ||= { method: 'media', files: [] }; r.preinstall.method = 'media'; (r.preinstall.files ||= []).push(file); });
        return send(res, 200, { ok: true, file: { name: file.original, bytes } });
      } catch (e) { return send(res, e.code === 413 ? 413 : 500, { ok: false, message: e.code === 413 ? `Each file must be under ${CONFIG.PREINSTALL_MAX_MB} MB.` : 'Upload failed.' }); }
    }
    if (url.pathname === '/api/preinstall/done' && req.method === 'POST') {
      const b = JSON.parse((await readBody(req, 5000)) || '{}');
      const rec = updateLead(String(b.lead || ''), r => { r.preinstall ||= { method: 'media', files: [] }; r.preinstall.submittedAt = new Date().toISOString(); r.preinstall.note = String(b.note || '').slice(0, 1000); });
      return send(res, rec ? 200 : 400, { ok: !!rec });
    }
    if (url.pathname === '/api/intake/questions') return send(res, 200, { questions: INTAKE.QUESTIONS, considered: INTAKE.CONSIDERED, nearMeters: CONFIG.BOUNDARY_NEAR_METERS });
    if (url.pathname === '/api/intake' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req, 20000)) || '{}');
      const address = String(body.address || '').trim();
      const intake = INTAKE.clean(body.intake);
      if (address.length < 5 || !intake.source) return send(res, 400, { ok: false, message: 'Please confirm your water source.' });
      const lk = await lookup(address);
      if (lk.status === 'not_found') return send(res, 200, { ok: false, status: 'not_found' });
      const rec = saveConfirmation(lk, intake.source);
      return send(res, 200, { ok: true, confirmation: { answer: rec.answer, agreesWithDetection: rec.agreesWithDetection } });
    }
    if (url.pathname === '/api/report') {
      const address = (url.searchParams.get('address') || '').trim();
      const override = url.searchParams.get('source'); // 'well' | 'public' | null
      const intake = INTAKE.clean(url.searchParams.get('intake'));
      if (address.length < 5) return send(res, 400, { status: 'error', message: 'Please enter a full street address.' });
      const lk = await lookup(address);
      if (lk.status === 'not_found') return send(res, 200, lk);
      const detected = lk.status;
      const pick = override === 'well' || override === 'public' ? override : (intake.source === 'well' || intake.source === 'public') ? intake.source : detected;
      const source = pick;
      let report = source === 'well' ? REPORT.buildWellReport(lk.geo.county) : REPORT.buildPublicReport(lk);
      report = REPORT.applyIntake(report, { ...intake, source });
      const summary = await REPORT.summarize(report);
      const score = source === 'well' ? SCORE.wellScore(REPORT.countyData(lk.geo.county), lk.geo.county) : (lk.system ? SCORE.publicScore(lk) : { score: null, label: 'No data', deductions: [], unknowns: ['No water system matched'] });
      const recs = RECS.build(report, intake, source);
      return send(res, 200, { ...lk, status: 'report', detected, source, overridden: source !== detected, unsure: intake.source === 'unsure', intake, report, summary, score, scoreRules: SCORE.RULES, psuSource: REPORT.PSU.source,
        solutions: REPORT.SOLUTIONS, levels: REPORT.LEVEL_LABEL, recs, catalogSources: RECS.CAT.meta.sources });
    }
    if (url.pathname === '/api/slots') {
      const type = url.searchParams.get('type');
      if (!CONFIG.APPOINTMENT[type]) return send(res, 400, { ok: false, message: 'Unknown appointment type.' });
      return send(res, 200, { ok: true, type, timezone: CONFIG.TIMEZONE, days: SCHED.availableSlots(type) });
    }
    if (url.pathname === '/api/quote') {
      const address = (url.searchParams.get('address') || '').trim();
      if (address.length < 5) return send(res, 400, { status: 'error', message: 'Please enter a full street address.' });
      const geo = await geocode(address);
      if (!geo) return send(res, 200, { status: 'not_found' });
      return send(res, 200, { status: 'ok', geo, quote: quoteFor(geo) });
    }
    if (url.pathname === '/api/lead' && req.method === 'POST') {
      const lead = JSON.parse((await readBody(req, 20000)) || '{}');
      if (!lead.name || !(lead.email || lead.phone)) return send(res, 400, { ok: false, message: 'Name and a phone or email are required.' });
      if (lead.intake) lead.intake = INTAKE.clean(lead.intake);
      if (lead.type === 'order') {
        const ids = new Set(RECS.CAT.solutions.filter(x => x.status !== 'dropped' && x.id !== 'di').map(x => x.id));
        lead.products = (Array.isArray(lead.products) ? lead.products : []).filter(x => ids.has(x)).slice(0, 12)
          .map(id => { const x = RECS.CAT.solutions.find(s => s.id === id); return { id, name: x.name, category: x.category, estimate: x.cost.installed }; });
        if (!lead.products.length) return send(res, 400, { ok: false, message: 'Pick at least one product.' });
        lead.payment = { status: 'not_collected', note: 'Placeholder checkout. Payment will be collected later via Stripe (not connected).' };
        const rec = saveLead(lead);
        return send(res, 200, { ok: true, id: rec.id, products: lead.products });
      }
      if (lead.type === 'preinstall-call') {
        const order = readLeads().find(l => l.id === lead.orderId && l.type === 'order');
        if (!order) return send(res, 400, { ok: false, message: 'Unknown order.' });
        if (!CONFIG.PREINSTALL_APPS.includes(lead.app)) return send(res, 400, { ok: false, message: 'Pick FaceTime, Zoom or Google Meet.' });
        if (!lead.slotStart) return send(res, 400, { ok: false, message: 'Please pick a time.' });
        const booked = SCHED.book({ type: 'preinstall', start: lead.slotStart, name: lead.name, email: lead.email, phone: lead.phone, address: order.address });
        if (!booked.ok) return send(res, 409, { ok: false, code: 'slot_taken', message: booked.message });
        updateLead(order.id, r => { r.preinstall = { ...(r.preinstall || {}), method: 'call', call: { app: lead.app, booking: booked.booking }, submittedAt: new Date().toISOString() }; });
        return send(res, 200, { ok: true, booking: booked.booking });
      }
      if (lead.type === 'consultation') {
        if (!CONFIG.APPOINTMENT[lead.option]) return send(res, 400, { ok: false, message: 'Pick a consultation type.' });
        if (!lead.slotStart) return send(res, 400, { ok: false, message: 'Please pick a time.' });
        // Recompute pricing server-side so the saved quote can't be edited in the browser.
        const geo = lead.address ? await geocode(lead.address).catch(() => null) : null;
        lead.quote = geo ? { ...quoteFor(geo), matchedAddress: geo.matchedAddress } : null;
        if (lead.option === 'in-home' && !lead.quote) return send(res, 400, { ok: false, message: "We couldn't find that address. In-home visits need a valid address." });
        lead.pricing = lead.option === 'virtual' ? { deposit: 0, travelFee: 0, total: 0 }
          : { deposit: CONFIG.IN_HOME_DEPOSIT, travelFee: lead.quote.travelFee, milesOver: lead.quote.milesOver, rate: CONFIG.MILEAGE_RATE_PER_MILE, total: lead.quote.inHomeDueTotal };
        const booked = SCHED.book({ type: lead.option, start: lead.slotStart, name: lead.name, email: lead.email, phone: lead.phone, address: lead.address });
        if (!booked.ok) return send(res, 409, { ok: false, code: 'slot_taken', message: booked.message });
        lead.booking = booked.booking;
      }
      const rec = saveLead(lead);
      return send(res, 200, { ok: true, id: rec.id, quote: lead.quote || null, pricing: lead.pricing || null, booking: lead.booking || null });
    }
    if (url.pathname === '/api/upload' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req, CONFIG.MAX_UPLOAD_MB * 1.4 * 1024 * 1024));
      const { name, email, phone, address, file } = body;
      if (!name || !email || !phone || !address) return send(res, 400, { ok: false, message: 'Please fill in name, email, phone and address.' });
      if (!file || !file.data) return send(res, 400, { ok: false, message: 'Please attach your lab report.' });
      const ext = ALLOWED_UPLOADS[file.type];
      if (!ext) return send(res, 400, { ok: false, message: 'Please upload a PDF or a photo (JPG, PNG, HEIC).' });
      const buf = Buffer.from(file.data, 'base64');
      if (buf.length > CONFIG.MAX_UPLOAD_MB * 1024 * 1024) return send(res, 413, { ok: false, message: `File is larger than ${CONFIG.MAX_UPLOAD_MB} MB.` });
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const safe = String(file.name || 'report').replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40) || 'report';
      const stored = `${new Date().toISOString().replace(/[:.]/g, '-')}_${safe}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, stored), buf);
      const rec = saveLead({ type: 'upload', name, email, phone, address, notes: body.notes || '', intake: body.intake ? INTAKE.clean(body.intake) : null, file: { original: file.name, stored: PATHS.rel(path.join(UPLOAD_DIR, stored)), type: file.type, bytes: buf.length }, aiSummary: null });
      return send(res, 200, { ok: true, id: rec.id });
    }
    // static files
    let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (p === '/' || p === '\\') p = '/index.html';
    const file = path.join(PUBLIC_DIR, p);
    if (!file.startsWith(PUBLIC_DIR + path.sep) || path.basename(file).startsWith('.') || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  } catch (e) {
    if (e.code === 413) return send(res, 413, { ok: false, message: 'That file is too large.' });
    if (e instanceof SyntaxError) return send(res, 400, { ok: false, message: 'Bad request.' });
    console.error(e);
    send(res, 502, { status: 'error', message: 'One of the public data services did not respond. Please try again in a minute.' });
  }
});
// Large pre-install videos over slow mobile connections can take a while; allow up to 60 minutes per request.
server.requestTimeout = 60 * 60 * 1000;
server.listen(PORT, HOST, () => console.log(`PA Water Solutions beta running at http://${HOST}:${PORT} (data: ${PATHS.DATA_DIR})`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 10000).unref(); });

module.exports = { lookup };
