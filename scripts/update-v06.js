// v0.6: "best option within the customer's price range". Offer softeners where they are the best fit,
// drop obsolete products, add good/better/best lineup, softener-vs-TAC guide, iSpring review, whole-house providers.
const fs = require('fs'); const path = require('path');
const F = path.join(__dirname, '..', 'data', 'solutions.json');
const C = JSON.parse(fs.readFileSync(F, 'utf8'));
const S = id => C.solutions.find(s => s.id === id);
C.meta.version = '0.6'; C.meta.updated = '2026-11-15';
C.meta.costNote = 'Costs are rough national ranges from the cited consumer cost guides and retailer listings (checked Nov 2026), not PA Water Solutions quotes. Ranges marked estimate:true without a source are our own rough estimates and need a local supplier quote before use. Suggested brands/models are research picks pending supplier pricing, not endorsements.';
Object.assign(C.meta.sources, {
  'nsf-ispring': { name: 'NSF listings: iSpring Water Systems (NSF/ANSI 58 and 372), checked Nov 15 2026', url: 'https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring' },
  'ispring-warranty': { name: 'iSpring: Return policy and 1-year limited warranty', url: 'https://www.ispringfilter.com/pages/return-policy' },
  'ispring-ext': { name: 'iSpring: 10-year extended warranty (whole-house models)', url: 'https://www.ispringfilter.com/collections/extended-warranty/products/whole-house-extended-warranty_839_840_841_842_846_847' },
  'ispring-dealer': { name: 'iSpring Dealer Network (no franchise fee, no inventory requirement; pricing on request)', url: 'https://www.ispringwatersystems.com/' },
  'iapmo-waterdrop': { name: 'IAPMO R&T listing WC-13976: Waterdrop G3 series RO (NSF/ANSI 58)', url: 'https://mirobase.iapmo.org/pld/file_info.asp?file_no=0013976' },
  'wqa-apec': { name: 'WQA Gold Seal listing: APEC ROES-50', url: 'https://find.wqa.org/find-products/ctl/detail/mid/1054/cid/apec_water_systems/sid/5/keyword/roes-50' },
  'kinetico-k5': { name: 'Kinetico: K5 Drinking Water Station PFAS data sheet', url: 'https://www.kinetico.com/media/ckaht5zr/k5-forever-pure.pdf' },
  'aquasana-whhs': { name: 'Aquasana: HealthShield WH-HS performance data sheet (WQA, NSF/ANSI 53 and 401)', url: 'https://www.aquasana.com/on/demandware.static/-/Sites-aquasana-Library/default/PDF/WH-HS_Performance_Data.pdf' },
  'aquasana-products': { name: 'Aquasana: product prices (Rhino EQ-1000, HealthShield)', url: 'https://www.aquasana.com/water-filter-products/' },
  'pentair-floplus': { name: 'Pentair: FloPlus Protect 20BB spec sheet (IAPMO, NSF/ANSI 53 PFAS; 40,000 gal at 5 gpm)', url: 'https://www.pentair.com/content/dam/extranet/nam/filtration/pentair/spec-sheets/english/4006913-floplus-20bb-spec-sheet.pdf' },
  'floplus-price': { name: 'Mid Atlantic Water: FloPlus Protect 20BB listing ($349)', url: 'https://midatlanticwater.net/products/whole-house-pfas-cartridge-filter' },
  'hd-pc600': { name: 'Home Depot: Pentair Pelican PC600 listing', url: 'https://www.homedepot.com/p/PENTAIR-10-GPM-Whole-House-Carbon-Water-Filtration-System-PC600-P/205423701' },
  'springwell-price': { name: 'Pure Whole House: price change log (SpringWell CF1)', url: 'https://purewholehouse.com/price-change-log/' },
  'aos-homeshield': { name: 'A. O. Smith: HomeShield AOS-HS-1200 whole-house PFAS filter', url: 'https://www.aosmith.com/water-treatment/water-filtration/homeshield-whole-house-filter/HomeShield+AOS-HS-1200.html' },
  'epa-poe-pfas': { name: 'Patterson et al. 2019, Effectiveness of POU/POE systems to remove PFAS (EPA ORD-funded), AWWA Water Science', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6650157/' },
  'epa-pfas-techcost': { name: 'EPA 2024: Technologies and costs for removing PFAS from drinking water (GAC, IX, RO as BAT)', url: 'https://www.epa.gov/system/files/documents/2024-04/2024-pfas-tech-cost_final-508.pdf' },
  'calgon-centaur': { name: 'Calgon Carbon: CENTAUR 12x40 catalytic carbon data sheet (chloramine, H2S; AWWA B604)', url: 'https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf' },
  'centaur-price': { name: 'Clean Water Store: Centaur 12x40, 1 cu ft ($364.50–$405)', url: 'https://www.cleanwaterstore.com/centaur-carbon-12x40-1-cu-ft-box.html' },
  'clack-carbon-price': { name: 'Glass Water Systems: Clack WS1 1.5 cu ft backwashing carbon system ($895–$1,200)', url: 'https://www.glasswatersystems.com/clack-ws1--15-cu-ft-carbon-filter-sys115.html' },
  'ebct-chloramine': { name: 'Affordable Water: sizing whole-house carbon for chlorine vs chloramine', url: 'https://affordablewater.us/pages/chlorine-chloramine-carbon-filters' },
  'nsf-viqua': { name: 'NSF listings: VIQUA UV (NSF/ANSI 55 Class A: PRO10/20/30)', url: 'https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=VIQUA' },
  'nsf-kinetico': { name: 'NSF listings: Kinetico (NSF/ANSI 42 chloramine claims on KPMF cartridges)', url: 'https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=Kinetico' },
  'pnnl-softeners': { name: 'PNNL Building America: Water softeners (NSF/ANSI 44 efficiency rating: demand-initiated, ≥3,350 grains/lb salt, ≤5 gal/1,000 grains)', url: 'https://basc.pnnl.gov/resource-guides/water-softeners' },
  'umn-wrc': { name: 'Univ. of Minnesota Water Resources Center: Residential softening (DIR 26–60% less salt; twin tank up to 30% less)', url: 'https://wrc.umn.edu/residentialsoftening' },
  'swet': { name: 'Thomas et al. 2011, Softened Water Eczema Trial (NIHR HTA-funded), PLOS Medicine', url: 'https://journals.plos.org/plosmedicine/article?id=10.1371%2Fjournal.pmed.1000395' },
  'rinnai-manual': { name: 'Rinnai SENSEI installation and operation manual (water quality: hardness up to 200 mg/L)', url: 'https://www.rinnai.us/download/download?filename=SENSEI+Installation+and+Operation+Manual+-+RSC+Models.pdf&path=%2Fs--qweVp3yO--%2Fz3qt1eatwadabriqlg7i.pdf' },
  'rinnai-warranty': { name: 'Rinnai SENSEI residential warranty (scale/lime damage excluded)', url: 'https://media.rinnai.us/salsify_asset/s-bbf32762-e977-4b7f-a75d-ab8e0be04c5f/100000655_Warranty_SENSEI%20Residential.pdf' },
  'psu-aasl': { name: 'Penn State Agricultural Analytical Services Lab: drinking water test packages and fees', url: 'https://agsci.psu.edu/aasl/water-testing/drinking-water-testing' },
  'pwd-ccr-2025': { name: 'Philadelphia Water Department: 2025 Drinking Water Quality Report (hardness by plant)', url: 'https://water.phila.gov/drops/2025-drinking-water-quality-report/' },
  'psu-wells': { name: 'Penn State well-water summaries (our data/reference/psu-well-summaries.json)', url: 'https://agsci.psu.edu/aasl/water-testing' },
  'dealer-softener-prices': { name: 'TapWaterData: softener brand prices (Kinetico, Culligan installed medians; aggregator)', url: 'https://www.tapwaterdata.com/water-softener-cost/brands' },
  'retail-ro-prices': { name: 'Professor Aqua: Waterdrop vs APEC vs iSpring prices (Nov 2026)', url: 'https://professoraqua.com/waterdrop-vs-apec-vs-ispring/' },
});

// ---- Strategy change ----
C.strategy = {
  rule: 'Sell each customer the best option within their price range. Drop products that are obsolete because something better exists at a similar price.',
  change: 'v0.5 led with salt-free (TAC) for every hard-water case and positioned softeners as the thing to sell against. That framing is retired. We now offer both: a high-efficiency metered softener where it is the best fit (very hard water, iron/manganese, spot-free/soft-feel goals, tankless heaters over the maker hardness limit) and TAC where it is (moderate hardness, no-salt/low-upkeep/sodium/brine priorities, clean water).',
  offerBoth: true,
};

// ---- Catalog changes ----
const soft = S('softener_salt');
Object.assign(soft, {
  name: 'High-efficiency metered softener (salt or potassium)',
  category: 'Hard water: softener',
  status: 'active',
  suggested: 'Clack WS1 or Fleck 5810/5812 metered valve with upflow/counter-current brining, NSF/ANSI 44 efficiency-rated where possible (dealer lines: Hellenbrand, WaterGroup). PLACEHOLDER until supplier pricing.',
  bestFit: 'Very hard water (about 10.5+ gpg / 180+ mg/L), iron or manganese up to a few mg/L, customers who want spot-free glass, rich lather and soft-feeling water, and tankless heaters above the maker hardness limit (Rinnai: 200 mg/L).',
  install: 'Resin tank plus brine tank at the main line; needs a drain and outlet. Bypass outdoor spigots. Set to demand-initiated (metered) regeneration with upflow brining where available.',
  maintenance: 'Add salt (or potassium chloride) about monthly; clean the brine tank every 5–10 years; resin 10–15+ years (longer with a carbon prefilter on chlorinated water). Check the water heater anode every 1–2 years or fit a powered anode.',
  pros: ['Removes hardness: no spots, better lather, soft feel', 'Strongest evidence for keeping gas and tankless heaters at factory efficiency (Battelle 2009, WQRF-funded)', 'Handles low iron/manganese that TAC cannot', 'High-efficiency metered models use 26–60% less salt than timer models (Univ. of Minnesota)', 'Can run on potassium chloride for no added sodium'],
  certifications: 'NSF/ANSI 44 (structural and performance). Look for the NSF/ANSI 44 efficiency rating: demand-initiated regeneration, at least 3,350 grains per lb of salt and no more than 5 gallons per 1,000 grains (PNNL).',
});
soft.sources = [...new Set([...(soft.sources || []), 'pnnl-softeners', 'umn-wrc', 'rinnai-manual'])];
const kcl = S('softener_potassium');
Object.assign(kcl, { name: 'Potassium chloride option (for any softener)', category: 'Hard water: softener', status: 'option',
  bestFit: 'Customers on a sodium-restricted diet or who want no sodium added, and who accept 3–5 times the regenerant cost. Often a cheaper route to low-sodium drinking water is a salt softener plus RO at the kitchen sink.',
  suggested: 'Same softener as above, set for potassium chloride. Not a separate product.' });
C.solutions.push({
  id: 'softener_twin', name: 'Twin-tank metered softener', category: 'Hard water: softener', status: 'active',
  suggested: 'Kinetico (non-electric twin, dealer network only) or Clack WS1 twin alternating (independent dealers). PLACEHOLDER until supplier pricing.',
  treats: ['removes hardness 24/7 (one tank always in service)', 'prevents scale and spotting', 'low levels of iron/manganese'],
  doesNotTreat: ['bacteria, PFAS, lead, nitrate, arsenic'],
  install: 'Two resin tanks and one brine tank at the main line; drain needed; some models need no outlet.',
  cost: { installed: 'About 30% more than a single-tank softener (Univ. of Minnesota); single tanks are $1,200–$3,800 installed (HomeGuide), so roughly $1,600–$5,000 (estimate). Dealer-network brands run higher (Kinetico installed median about $5,500 per an aggregator).', annual: 'Up to 30% less salt than a single tank (Univ. of Minnesota): roughly $40–$110 salt a year (estimate)', estimate: true, sources: ['umn-wrc', 'hg-softener', 'dealer-softener-prices'], startingAt: 1600 },
  maintenance: 'Same as a single softener: salt monthly, brine tank cleaning every 5–10 years.',
  pros: ['Soft water around the clock, no reserve needed', 'Most salt- and water-efficient softener design', 'Best for very hard water and large households'],
  cons: ['Highest upfront cost', 'Still salt, brine discharge and a drain'],
  bestFit: 'Very hard water (about 17+ gpg) or large families, especially well homes with iron/manganese up to a few mg/L.',
  certifications: 'NSF/ANSI 44.', sources: ['umn-wrc', 'pnnl-softeners'],
});
C.solutions.push({
  id: 'combo_carbon_tac', name: 'Combined whole-house carbon + salt-free conditioner', category: 'Hard water: salt-free', status: 'active',
  suggested: 'Dealer-built: catalytic carbon tank (Clack valve, Calgon Centaur) followed by a TAC tank (Watts OneFlow class). Packaged DTC equivalents: SpringWell CF + FutureSoft, Aquasana Rhino with salt-free conditioner, Pelican PC600 + NaturSoft. PLACEHOLDER until supplier pricing.',
  treats: ['chlorine/chloramine taste and odor at every tap', 'scale buildup in heater and pipes (TAC)'],
  doesNotTreat: ['hardness (minerals stay)', 'spotting', 'bacteria', 'PFAS unless sized and certified for it'],
  install: 'Two tanks (or one combo unit) at the main line after a sediment filter. TAC tank after carbon; usually no drain or power unless the carbon tank backwashes.',
  cost: { installed: 'Roughly carbon $600–$2,000 plus TAC $800–$4,000, less shared labor: about $1,500–$5,000 (estimate from our component ranges). Packaged DTC kits: SpringWell FutureSoft about $1,785–$2,100 alone (aggregator).', annual: 'Carbon media/cartridges plus TAC media every ~3 years: roughly $100–$250 a year (estimate)', estimate: true, sources: ['hg-filtration', 'angi-softener', 'springwell-price'], startingAt: 1500 },
  maintenance: 'Sediment prefilter every 3–6 months; carbon media every 3–5 years (tank) or cartridges every 6–12 months; TAC media about every 3 years.',
  pros: ['One install handles city-water taste and scale', 'No salt, no brine'],
  cons: ['Does not soften: spots remain', 'TAC needs low iron/manganese/sulfide', 'Two medias to replace'],
  bestFit: 'Public-water homes with moderate hardness (about 3.5–10.5 gpg) that dislike chlorine taste and want low upkeep with no salt.',
  certifications: 'Carbon: NSF/ANSI 42 (chlorine/chloramine) where available. TAC: ask for DVGW W512 or IAPMO Z601 test reports.', sources: ['asu-wrrf', 'calgon-centaur'],
});
const tac = S('tac_nac');
Object.assign(tac, { status: 'active', suggested: 'Watts OneFlow (TAC, maker limits up to 30 gpg), or dealer-built TAC tank. PLACEHOLDER until supplier pricing.',
  bestFit: 'Moderately hard to hard water (about 3.5–10.5 gpg) with low iron/manganese, where the goal is protecting the water heater and plumbing with no salt, no brine, no power and low upkeep, and the customer accepts some spotting. Also for sodium-restricted households and anyone who simply will not haul salt.' });
const ed = S('electronic_descaler');
Object.assign(ed, { status: 'dropped', droppedReason: 'Obsolete for our lineup: 0–50% scale reduction in controlled tests (WRF/ASU 2011, Battelle, WQRF) and no reliable effect on water-heater scale. TAC costs more upfront but has far stronger evidence; for a low budget, heater flushing plus an anode check or a polyphosphate cartridge in front of an appliance is more honest.' });
const pp = S('polyphosphate');
Object.assign(pp, { status: 'niche', category: 'Hard water: salt-free', bestFit: 'Low-budget, point-of-use scale protection in front of one appliance (tankless heater inlet, coffee/ice machine, boiler fill) on cold water, or renters. Not a whole-house hardness solution; weaker in hot water.',
  suggested: 'Siliphos-type cartridge in a standard 10" housing (e.g., iSpring WGB-DS line or Pentair/Pentek). PLACEHOLDER until supplier pricing.' });
const di = S('di'); if (di) Object.assign(di, { status: 'dropped', droppedReason: 'Never a whole-home product: comparison only.' });
const kdf = S('kdf'); if (kdf) Object.assign(kdf, { status: 'component', bestFit: (kdf.bestFit || '') + ' Sold only as a layer inside a carbon system, not on its own.' });
S('pitcher_countertop').status = 'niche';
S('shower_filter').status = 'niche';
S('shower_filter').bestFit = 'Only as an add-on to RO at the sink for homes with no whole-house carbon (chlorine odor in the shower), and for renters.';
for (const s of C.solutions) s.status ||= 'active';
const sug = {
  ro_pou: 'Good: iSpring RCC7-BN/RCC7-BLK (NSF/ANSI 58 system-certified incl. lead, fluoride). For PFAS: Waterdrop G3P600 (IAPMO NSF/ANSI 58 + 53 PFOA/PFOS) or Kinetico K5 (WQA NSF/ANSI 58/53 PFOA/PFOS, dealer network). PLACEHOLDER until supplier pricing.',
  carbon_block_pou: 'Aquasana AQ-5200 Claryum (WQA NSF/ANSI 42, 53, 401). PLACEHOLDER until supplier pricing.',
  carbon_whole: 'Better/Best: dealer-built backwashing tank, Clack WS1 valve + Calgon Centaur catalytic carbon (chloramine) or Filtrasorb GAC (chlorine). Good: cartridge system (iSpring WGB32B, Pentair Big Blue). PLACEHOLDER until supplier pricing.',
  uv: 'VIQUA PRO10/20/30 (NSF/ANSI 55 Class A) or Luminor Class A models, after sediment (and iron/hardness treatment if needed). PLACEHOLDER until supplier pricing.',
  anion_pfas: 'Certified POE options: Aquasana HealthShield WH-HS (WQA NSF/ANSI 53 PFOA/PFOS + 3 more PFAS, 165,000 gal), A. O. Smith HomeShield AOS-HS-1200 (NSF/ANSI 53 PFAS, installer channel), Pentair FloPlus Protect 20BB (IAPMO NSF/ANSI 53, 40,000 gal at 5 gpm). Dealer-built: twin GAC tanks sized for ~10 min EBCT. PLACEHOLDER until supplier pricing.',
  sediment: 'Spin-down plus 20" Big Blue cartridge housing (Pentair/Pentek, iSpring). PLACEHOLDER until supplier pricing.',
  iron_air: 'Clack WS1 air-injection (AIO) filter, dealer-built. PLACEHOLDER until supplier pricing.',
  neutralizer: 'Clack WS1 backwashing calcite tank. PLACEHOLDER until supplier pricing.',
};
for (const [id, t] of Object.entries(sug)) if (S(id)) S(id).suggested = t;
const cw = S('carbon_whole');
cw.certifications = 'Few whole-house carbon tanks carry a system-level NSF/ANSI 42/53 listing; dealer-built tanks rely on certified media (e.g., Calgon carbons comply with AWWA B604; check NSF/ANSI 61 on the media data sheet). For PFAS claims use a system certified to NSF/ANSI 53 for PFOA/PFOS.';
cw.limits = 'Size by contact time: chlorine needs roughly 1–2 minutes EBCT at peak flow; chloramine needs catalytic carbon and about 3–4+ minutes (about 2.5 gpm per cu ft of Centaur); PFAS needs ~10 minutes (vendor guidance in EPA research), which a typical 1–1.5 cu ft home tank cannot give (about 2 minutes at 4 gpm).';
cw.sources = [...new Set([...(cw.sources || []), 'calgon-centaur', 'ebct-chloramine', 'epa-poe-pfas', 'clack-carbon-price', 'centaur-price'])];

// ---- Hardness bundle: neutral, picked per home ----
const hb = C.bundles.find(b => b.id === 'hardness');
Object.assign(hb, {
  primary: 'tac_nac',
  alternatives: ['softener_salt', 'softener_twin', 'combo_carbon_tac', 'polyphosphate'],
  typicalBundle: ['sediment', 'tac_nac'],
  headline: 'Protect your water heater, pipes and fixtures from scale',
  pitch: 'We match the fix to your water: a salt-free conditioner for moderate hardness and low upkeep, or a high-efficiency softener for very hard water, iron, or truly soft water.',
  claimNote: 'Softening removes hardness and has the strongest evidence for keeping water heaters at factory efficiency (Battelle 2009, industry-funded). TAC reduced scale by more than 88% in a publicly funded ASU test but does not remove hardness, so some spotting remains.',
  claimSources: ['battelle', 'asu-wrrf'],
  requires: 'TAC needs low iron, manganese, copper and sulfide. Softeners handle low iron/manganese; above about 3 mg/L iron, an iron filter goes first.',
});
C.hardnessPicks = {
  tac: { primary: 'tac_nac', bundle: ['sediment', 'tac_nac'], headline: 'Protect your water heater and fixtures from scale, with no salt', pitch: 'A salt-free conditioner reduces scale buildup with no salt to carry, no brine and usually no power or drain. It does not remove hardness, so some spotting remains.', claimNote: 'TAC reduced scale formation by more than 88% in a university water-heater test (ASU / WateReuse, publicly funded). It does not remove hardness.', claimSources: ['asu-wrrf'] },
  softener: { primary: 'softener_salt', bundle: ['sediment', 'softener_salt'], headline: 'Soft water: no scale, no spots, better lather', pitch: 'At your hardness, a high-efficiency metered softener is the most effective fix: it removes the minerals that scale water heaters and spot glass. Modern metered, upflow models use far less salt than old timer units.', claimNote: 'Softened water kept gas and tankless heaters at their starting efficiency in an accelerated test (Battelle 2009, industry-funded). Demand-initiated softeners use 26–60% less salt than timer models (Univ. of Minnesota).', claimSources: ['battelle', 'umn-wrc'] },
  twin: { primary: 'softener_twin', bundle: ['sediment', 'softener_twin'], headline: 'Very hard water needs real softening, around the clock', pitch: 'At this hardness a twin-tank metered softener keeps soft water flowing 24/7 and uses the least salt per gallon. Salt-free conditioners are not rated for water this hard.', claimNote: 'Twin-tank systems use up to 30% less salt than single tanks (Univ. of Minnesota). TAC makers cap hardness around 30 gpg.', claimSources: ['umn-wrc', 'oneflow-spec'] },
};

// ---- Hardness tiers by level (PA data) ----
C.hardnessTiers = {
  note: 'gpg = grains per gallon; 1 gpg = 17.1 mg/L as CaCO3. PA examples: Penn State well data statewide median 85 mg/L (5.0 gpg) across 8,244 samples, with county medians from 22 mg/L (Clarion) to 235 mg/L (Washington); Montgomery 188 (11 gpg), Bucks 146 (8.5), Delaware 134 (7.8), Chester 82 (4.8), Berks 62 (3.6); individual wells up to 1,824 mg/L (107 gpg). Philadelphia Water 2025: Baxter 6 gpg, Belmont 9, Queen Lane 10 (max 16). PA American Water Phoenixville 2025 report: 151 mg/L (8.8 gpg) in the distribution system, range 120-220 (7.0-12.9 gpg); water leaving its Royersford plant 155 mg/L (9.1 gpg). The Phoenixville Borough 2025 report lists no hardness. Aqua PA: check the utility report (PLACEHOLDER).',
  sources: ['psu-wells', 'pwd-ccr-2025'],
  bands: [
    { band: 'Soft: under 3.5 gpg (under 60 mg/L)', examples: 'Many central/western PA wells (Clarion, Elk, Carbon county medians)', good: 'Nothing for hardness. Flush the water heater yearly.', better: '—', best: '—', note: 'Do not sell hardness treatment here.' },
    { band: 'Moderate: 3.5–7 gpg (60–120 mg/L)', examples: 'Chester and Berks well medians; Philadelphia Baxter (6 gpg)', good: 'Heater flush + anode check ($150–$350 service)', better: 'TAC conditioner (from ~$800 installed)', best: 'High-efficiency metered softener, only if they want spot-free/soft feel', note: 'TAC is usually the best value; softener is a preference upgrade.' },
    { band: 'Hard: 7–10.5 gpg (120–180 mg/L)', examples: 'Bucks and Delaware well medians; Philadelphia Belmont (9) and Queen Lane (10)', good: 'TAC conditioner', better: 'High-efficiency metered softener (spot-free, soft feel)', best: 'Softener + whole-house carbon (city water) or carbon + TAC combo if no salt', note: 'Genuine either/or: pick by goal (feel/spots vs no salt/low upkeep).' },
    { band: 'Very hard: 10.5–17.5 gpg (180–300 mg/L)', examples: 'Montgomery (11) and Washington (14) well medians', good: 'High-efficiency metered softener (single tank)', better: 'NSF/ANSI 44 efficiency-rated upflow softener', best: 'Twin-tank metered softener', note: 'Softener is the default. TAC only if "no salt" is a firm requirement, with the spotting caveat. Tankless heaters above 200 mg/L (11.7 gpg): softener (Rinnai limit).' },
    { band: 'Extremely hard: over 17.5 gpg (over 300 mg/L)', examples: 'Individual limestone-area wells (PSU county maxima 400–1,800 mg/L)', good: 'High-efficiency metered softener sized for the load', better: 'Twin-tank metered softener', best: 'Twin-tank + iron filter first if iron is over ~3 mg/L', note: 'Do not sell TAC above the maker limit (Watts OneFlow: 30 gpg).' },
  ],
};

// ---- Softener vs TAC decision guide ----
C.softenerVsTac = {
  answer: 'Offer both. Neither is obsolete: they solve different problems. A softener is the only one that actually removes hardness; TAC is the best low-upkeep, no-salt scale reducer for moderate hardness and clean water.',
  rows: [
    { situation: 'Hardness over about 10.5 gpg (180 mg/L)', pick: 'Softener', why: 'Strongest scale evidence; spotting with TAC becomes obvious at this level.' },
    { situation: 'Hardness over 30 gpg', pick: 'Softener (twin)', why: 'Above typical TAC maker limits (Watts OneFlow 30 gpg).' },
    { situation: 'Iron or manganese present (well)', pick: 'Softener (or iron filter first)', why: 'TAC needs iron under 0.3 and manganese under 0.05 mg/L; softeners handle low levels; above ~3 mg/L iron use an iron filter first.' },
    { situation: 'Wants spot-free glass/shower doors, rich lather, soft feel, less detergent', pick: 'Softener', why: 'Only softening changes how water feels and stops spotting. TAC water feels the same.' },
    { situation: 'Tankless water heater, hardness over 200 mg/L (11.7 gpg)', pick: 'Softener', why: 'Rinnai lists 200 mg/L as its hardness limit and excludes scale damage from warranty; TAC is not a recognized substitute in the manuals we read.' },
    { situation: 'Dry skin/eczema is the main reason', pick: 'Either, honestly', why: 'The SWET randomized trial (NIHR-funded, 2011) found softeners did not improve children\'s eczema beyond usual care. Sell feel, not a skin cure.' },
    { situation: 'Moderate hardness (3.5–10.5 gpg), clean water, wants low upkeep', pick: 'TAC', why: 'No salt, no brine, no power, media every ~3 years; ASU measured >88% scale reduction.' },
    { situation: 'Sodium-restricted diet', pick: 'TAC, or softener on potassium (or softener + RO at the sink)', why: 'TAC adds no sodium; potassium avoids sodium at 3–5x regenerant cost; RO removes most sodium from drinking water.' },
    { situation: 'Septic owner worried about brine, or local rules', pick: 'TAC (or an efficient softener)', why: 'PA allows softeners with septic (25 Pa. Code § 73.31); WQRF-funded work found efficient softeners do not hurt septic performance. Check township/sewer authority rules.' },
    { situation: 'Tight budget', pick: 'Under 10.5 gpg: TAC or heater care. Over: basic metered softener', why: 'A basic metered softener and a TAC tank cost about the same installed; pick by hardness.' },
    { situation: 'Renter', pick: 'Neither (polyphosphate cartridge or shower filter)', why: 'No permanent install.' },
  ],
  sources: ['battelle', 'asu-wrrf', 'oneflow-spec', 'rinnai-manual', 'swet', 'umn-wrc', 'pa-73-31', 'wqrf-septic'],
};

// ---- Dropped / obsolete ----
C.dropped = [
  { item: 'Electronic (wrap-around) descalers', why: 'Controlled tests show 0–50% scale reduction and inconsistent results (ASU/WateReuse 2011, Virginia Tech 2021); TAC or a softener costs more upfront but has real evidence behind it.' },
  { item: 'Magnetic descalers', why: 'No reliable evidence of scale reduction.' },
  { item: 'Electrolytic / zinc-galvanic units', why: 'Partial (about 50% for EIP in ASU tests) or inconsistent; TAC beats them.' },
  { item: 'Citric-acid / chelation "salt-free softeners"', why: 'Independent result about half the maker\'s claim, recurring cartridge cost; TAC is the better salt-free choice.' },
  { item: 'Timer-based softeners', why: 'Demand-initiated (metered) models use 26–60% less salt and 25–40% less water than time-clock models (Univ. of Minnesota). Only sell metered/demand-initiated.' },
  { item: 'Standalone KDF', why: 'Only as a layer in a carbon system.' },
  { item: 'Shower filters on their own', why: 'Only as an add-on with RO at the sink when there is no whole-house carbon, or for renters.' },
  { item: 'Deionization (DI) for homes', why: 'Exhausts fast on hard water and makes water corrosive; comparison only.' },
  { item: 'Uncertified PFAS claims (any brand)', why: 'For PFAS, sell only systems with a PFOA/PFOS listing (NSF/ANSI 53 or 58) from NSF, WQA or IAPMO.' },
];
C.kept = [
  { item: 'Polyphosphate cartridges', why: 'Niche: cheapest point-of-use protection for one appliance (tankless inlet, coffee/ice machine) or renters; not a whole-house hardness fix.' },
  { item: 'Potassium chloride', why: 'An option on any softener, not a separate product.' },
  { item: 'Pitchers/countertop filters', why: 'Renters only.' },
];

// ---- Good / better / best lineup ----
C.lineup = [
  { concern: 'PFAS in drinking water', good: 'Certified carbon block under the sink: Aquasana AQ-5200 class (WQA NSF/ANSI 42/53/401; about $100–$200 retail)', better: 'RO certified for PFOA/PFOS: Waterdrop G3P600 (IAPMO NSF/ANSI 58 + 53 PFOA/PFOS; about $539 retail)', best: 'Certified RO + certified whole-house PFAS (Aquasana HealthShield WH-HS, $2,099–$4,198) where levels are high or showers/bathing matter to the customer', note: 'iSpring RO is not certified for PFAS; do not use it for a PFAS sale.', sources: ['iapmo-waterdrop', 'aquasana-whhs', 'nsf-ispring', 'retail-ro-prices'] },
  { concern: 'Lead (home plumbing)', good: 'Certified carbon block with a lead claim (NSF/ANSI 53)', better: 'iSpring RCC7-BN/RCC7-BLK RO (NSF/ANSI 58 incl. lead; about $240 retail for the RCC7AK family)', best: 'Certified RO + replace lead service line/fixtures', note: 'Only the BLK/BN finish variants from the Nanjing plant carry the lead claim; plain RCC7 is certified for TDS only.', sources: ['nsf-ispring', 'retail-ro-prices'] },
  { concern: 'Chlorine/chloramine taste and DBPs', good: 'Cartridge whole-house carbon (20" Big Blue: iSpring WGB32B or Pentair; change cartridges every 6–12 months)', better: 'Backwashing catalytic carbon tank: Clack WS1 + Calgon Centaur, 1.5 cu ft (equipment $895–$1,200 retail, plus labor)', best: 'Backwashing catalytic carbon sized for 3–4 min contact (2–2.5 cu ft) + RO at the sink', note: 'Chloramine needs catalytic carbon and more contact time. Shower filter only with RO and no whole-house carbon.', sources: ['clack-carbon-price', 'centaur-price', 'calgon-centaur', 'ebct-chloramine'] },
  { concern: 'Hard water (moderate, 3.5–10.5 gpg)', good: 'Heater flush + anode check ($150–$350)', better: 'TAC conditioner (Watts OneFlow class; $800+ installed)', best: 'High-efficiency metered softener (if spot-free/soft feel wanted) or carbon + TAC combo (city water, no salt)', note: 'See decision guide.', sources: ['hg-wh-repair', 'angi-softener', 'hg-softener'] },
  { concern: 'Hard water (very hard, over 10.5 gpg) or tankless', good: 'Metered single-tank softener ($1,200–$3,800 installed)', better: 'NSF/ANSI 44 efficiency-rated upflow softener', best: 'Twin-tank metered softener (Kinetico or Clack twin)', note: 'TAC only if no-salt is non-negotiable and hardness is under 30 gpg.', sources: ['hg-softener', 'pnnl-softeners', 'umn-wrc'] },
  { concern: 'Iron/manganese/sulfur (well)', good: 'Softener for low ferrous iron (under ~3 mg/L)', better: 'Air-injection (AIO) iron filter, Clack WS1', best: 'AIO iron filter + softener (+ catalytic carbon polish for sulfur)', note: 'Lab test first (Penn State WD02, $85).', sources: ['psu-fe', 'psu-aasl'] },
  { concern: 'Bacteria (well)', good: 'Shock chlorination + retest', better: 'UV, NSF/ANSI 55 Class A (VIQUA PRO series) after sediment', best: 'UV Class A + sediment + softener/iron filter ahead so the lamp stays clean', note: 'Retest after install.', sources: ['nsf-viqua', 'psu-coliform'] },
  { concern: 'Unknown / peace of mind', good: 'Free: read the utility report (public water)', better: 'Penn State WD02 aesthetics/corrosivity test ($85) or WD03 with lead ($125)', best: 'Penn State WD08 extensive ($220) + PFAS test from a PA DEP-accredited lab (price: get quote, PLACEHOLDER)', note: 'Lab tests sell the right system; lead with them on wells.', sources: ['psu-aasl'] },
];

// ---- iSpring review ----
C.supplierReview = {
  ispring: {
    verdict: 'Keep iSpring for value under-sink RO, but not as the only supplier. Its RCC7 RO family has genuine NSF/ANSI 58 system certification (not just components), support is US-based, and no CPSC recall turned up. But its certified list is short (14 NSF listings, all RO), nothing is certified for PFAS, the whole-house, softener, descaler and UV lines have no performance listings we could find, and the warranty is 1 year (extended plans sold separately). Use certified alternatives for PFAS sales, whole-house carbon tanks, softeners and UV.',
    certifications: [
      'NSF/ANSI 58 (system-level, NSF): RCC7, RCC7AK, RCC7AK-UV made in Taichung, Taiwan: TDS reduction only.',
      'NSF/ANSI 58 (system-level, NSF): RCC7-BLK, RCC7-BN, RCC7AK-BLK/-BN, RCC7AK-UVBLK/-UVBN, RCC7UV made in Nanjing, China: asbestos, barium, cadmium, chromium (III), copper, fluoride, lead, selenium, TDS. Also NSF/ANSI 372 lead-free.',
      'NSF/ANSI 58 (system-level, NSF): RO500 tankless (BN/ORB, AK variants): TDS reduction only.',
      'Replacement cartridges are certified only as components of those systems.',
      'No NSF/ANSI 42, 53, 55, 401 or P473 listings found at NSF; no PFAS certification (its PFAS models cite SGS lab tests, not certification). WQA/IAPMO directories not fully checked this pass.',
    ],
    strongest: ['RCC7-BN / RCC7-BLK / RCC7AK-BLK tank RO (broadest certified claim set, lead + fluoride)', 'Replacement parts availability and low cartridge prices'],
    weakest: ['Electronic descaler ED2000/EDV2 (obsolete technology)', 'Whole-house cartridge systems (WGB/WCB lines): uncertified, small carbon volume, frequent changes', 'PFAS "-PF" models: tested, not certified', 'WCS45KG softener and whole-house UV: no NSF/ANSI 44 or 55 listing found', 'RO500 tankless: premium price but certified for TDS only'],
    warranty: '1-year limited warranty (repair/replace; only for purchases from authorized sellers; registration required), 1-year money-back on many items via its own store, lifetime phone support M–F from Cumming, GA; 3/5/10-year extended warranties sold separately.',
    reliability: 'No Wirecutter or Consumer Reports test found. Owner reports are mixed-to-good: many 5–8 year installs, with recurring complaints about faucet, fitting and tank leaks (typical of push-fit RO).',
    recalls: 'No CPSC recall or class action involving iSpring found (search Nov 2026).',
    dealer: 'Authorized dealer program: no franchise fee, no inventory requirement, co-op advertising, onboarding, exclusive territories; requires licensing, bonding and insurance. Dealer pricing and margins are not published: request from dealer@ispringfilter.com (PLACEHOLDER).',
    sources: ['nsf-ispring', 'ispring-warranty', 'ispring-ext', 'ispring-dealer'],
    compare: [
      { brand: 'iSpring', channel: 'Online + dealers', certs: 'NSF 58 system (RCC7 family, RO500); no PFAS', warranty: '1 yr (+ paid extended)', fit: 'Value RO' },
      { brand: 'Waterdrop', channel: 'Online', certs: 'IAPMO NSF 58 + 53 PFOA/PFOS (G3P600), NSF 42', warranty: 'Check maker (PLACEHOLDER)', fit: 'Certified tankless RO for PFAS' },
      { brand: 'APEC', channel: 'Online', certs: 'WQA NSF 58 (ROES-50: TDS only)', warranty: 'Check maker (PLACEHOLDER)', fit: 'Comparable to iSpring' },
      { brand: 'Aquasana', channel: 'Online (DTC)', certs: 'WQA NSF 42/53/401 (AQ-5200); WQA NSF 53/401 PFAS whole-house (WH-HS)', warranty: 'Check maker (PLACEHOLDER)', fit: 'Certified carbon block; certified whole-house PFAS' },
      { brand: 'Express Water', channel: 'Online', certs: 'NSF 58 (2 listings)', warranty: 'Check maker (PLACEHOLDER)', fit: 'Comparable to iSpring' },
      { brand: 'Kinetico', channel: 'Franchise dealers only', certs: 'WQA NSF 58/53 PFOA/PFOS (K5); NSF 42 chloramine cartridges', warranty: 'Dealer (varies)', fit: 'Premium; not available to independents' },
      { brand: 'Culligan', channel: 'Franchise dealers only', certs: 'NSF 42/55 listings; PFAS whole-home claims (verify)', warranty: 'Dealer', fit: 'Premium; competitor, not a supplier' },
    ],
  },
};

// ---- Whole-house carbon providers ----
C.wholeHouseProviders = {
  cartridgeVsTank: 'Cartridge (20" Big Blue) systems are cheap and simple but hold little carbon (short contact time) and need changes every 6–12 months. Backwashing tanks (Clack/Fleck valve) hold 1–2.5 cu ft, backwash to prevent channeling and fouling, and last 3–5+ years on chlorine. Non-backwashing upflow tanks (SpringWell, Aquasana Rhino, Pelican) sit in between: no drain or power, media replaced every ~5–10 years per maker.',
  pfas: 'GAC is one of EPA\'s best available technologies for PFAS (with ion exchange and RO), but contact time decides it: EPA-funded research found a typical 1 cu ft, 4 gpm home tank gives about 2 minutes empty-bed contact time versus ~10 minutes vendors recommend for PFAS, and at high PFAS levels even an 8 cu ft two-tank system needed new carbon in weeks. So: sell RO at the sink for PFAS drinking water, and only sell whole-house PFAS with a certified system (or an engineered, tested GAC/IX design with follow-up testing).',
  chloramine: 'Chloramine needs catalytic carbon (e.g., Calgon Centaur) and about 3–4+ minutes contact (roughly 2.5 gpm per cu ft). Standard GAC removes chlorine easily but chloramine poorly.',
  margins: 'No supplier publishes dealer margins. Practical picture: dealer-built Clack/Fleck tanks with bulk media give the most control over price and service revenue; DTC brands (SpringWell, Aquasana, Pelican) sell retail online, which caps installer markup; Kinetico and Culligan are closed franchise networks. Ask distributors for price sheets (PLACEHOLDER).',
  rows: [
    { provider: 'Dealer-built backwashing tank (Clack WS1 valve + Calgon Centaur/Filtrasorb)', type: 'Backwashing tank', certs: 'Media complies with AWWA B604; no system listing', price: 'Equipment $895–$1,200 retail for 1.5 cu ft; Centaur $365–$405/cu ft', availability: 'Any independent dealer via distributors', verdict: 'Top pick: best performance per dollar, serviceable for decades, best margin and recurring service', sources: ['clack-carbon-price', 'centaur-price', 'calgon-centaur'] },
    { provider: 'Aquasana HealthShield WH-HS', type: 'Cartridge-style POE, PFAS', certs: 'WQA NSF/ANSI 53 (PFOA/PFOS, PFHxS, PFNA, PFHpA) + 401; 165,000 gal; 5.7 gpm', price: '$2,099 sale, $4,198 MSRP', availability: 'DTC online; trade program unverified', verdict: 'Top pick when a customer wants certified PFAS reduction at every tap', sources: ['aquasana-whhs', 'aquasana-products'] },
    { provider: 'Aquasana Rhino EQ-1000', type: 'Non-backwashing tank', certs: 'Chlorine tested to NSF/ANSI 42 per maker; tank NSF/ANSI 61; no system performance listing found', price: '$999 sale ($1,998 MSRP)', availability: 'DTC online', verdict: 'Solid DTC chlorine option; weak for a dealer (retail price visible)', sources: ['aquasana-products'] },
    { provider: 'Hellenbrand / WaterGroup', type: 'Dealer-line tanks, softeners, carbon', certs: 'Hellenbrand NSF 58 RO; WaterGroup NSF 42 media listings', price: 'Dealer price sheets (PLACEHOLDER)', availability: 'Independent dealers', verdict: 'Top pick as a dealer line for softeners + carbon tanks with distributor support', sources: [] },
    { provider: 'A. O. Smith HomeShield AOS-HS-1200', type: 'POE PFAS', certs: 'NSF/ANSI 53 PFAS per maker; 500,000 gal; 5.7 gpm', price: 'Installer channel (PLACEHOLDER)', availability: 'Installers', verdict: 'Alternative certified PFAS option to check pricing on', sources: ['aos-homeshield'] },
    { provider: 'Pentair FloPlus Protect 20BB', type: 'Cartridge POE, PFAS', certs: 'IAPMO NSF/ANSI 53 (5 PFAS); 40,000 gal at 5 gpm', price: 'About $325–$369', availability: 'Distributors/online', verdict: 'Budget certified PFAS; 40,000 gal is only months for a family', sources: ['pentair-floplus', 'floplus-price'] },
    { provider: 'Pentair Pelican PC600', type: 'Non-backwashing tank', certs: 'No system performance listing found at NSF (maker cites certified media)', price: 'About $974 (Home Depot)', availability: 'Retail', verdict: 'Fine for chlorine; retail-priced', sources: ['hd-pc600'] },
    { provider: 'SpringWell CF1', type: 'Non-backwashing tank (GAC + KDF)', certs: 'No system listing found at NSF', price: 'About $1,160 (list $1,365)', availability: 'DTC online', verdict: 'Popular DTC; little dealer room', sources: ['springwell-price'] },
    { provider: 'Kinetico / Culligan', type: 'Dealer systems', certs: 'Kinetico NSF 42 chloramine cartridges; Culligan NSF 42/55', price: 'Dealer-only, high', availability: 'Closed franchise networks', verdict: 'Competitors, not suppliers', sources: ['nsf-kinetico'] },
    { provider: 'iSpring whole-house (WGB/WCB)', type: 'Cartridge', certs: 'None found at NSF', price: 'Low', availability: 'Online + dealers', verdict: 'Good tier only (budget chlorine taste)', sources: ['nsf-ispring'] },
  ],
};

// Remove "sell against softeners" framing in honest lines
const S2 = C.saltFreeVsSoftener;
S2.framingNote = 'We sell both. Use these lines when TAC is the right pick for the home, not to talk someone out of a softener that fits better.';
S2.avoidClaims = [...new Set([...S2.avoidClaims, 'Running down softeners as outdated or unhealthy: modern metered softeners are the best fit for very hard water and iron.'])];
fs.writeFileSync(F, JSON.stringify(C, null, 2));
console.log('ok', C.solutions.length, 'solutions');
