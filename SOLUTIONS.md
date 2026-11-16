# PA Water Solutions: solutions catalog

Updated 2026-11-15. Generated from `data/solutions.json` by `scripts/build-solutions-md.js`; edit the JSON, not this file.

> Costs are rough national ranges from the cited consumer cost guides and retailer listings (checked Nov 2026), not PA Water Solutions quotes. Ranges marked estimate:true without a source are our own rough estimates and need a local supplier quote before use. Suggested brands/models are research picks pending supplier pricing, not endorsements.

> Look for third-party certification: NSF/ANSI 42 (taste/odor, chlorine), 53 (health contaminants incl. lead, PFOA/PFOS), 58 (reverse osmosis), 55 (UV), 44 (softeners), 177 (shower filters, free chlorine only), 61/372 (material safety/lead-free only, not performance). Scale-reduction devices: IAPMO/ANSI Z601 or DVGW W512.

## Strategy (v0.6)

**Rule:** Sell each customer the best option within their price range. Drop products that are obsolete because something better exists at a similar price.

**What changed:** v0.5 led with salt-free (TAC) for every hard-water case and positioned softeners as the thing to sell against. That framing is retired. We now offer both: a high-efficiency metered softener where it is the best fit (very hard water, iron/manganese, spot-free/soft-feel goals, tankless heaters over the maker hardness limit) and TAC where it is (moderate hardness, no-salt/low-upkeep/sodium/brine priorities, clean water).

### Softener vs salt-free: decision guide

Offer both. Neither is obsolete: they solve different problems. A softener is the only one that actually removes hardness; TAC is the best low-upkeep, no-salt scale reducer for moderate hardness and clean water.

| Situation | Pick | Why |
|---|---|---|
| Hardness over about 10.5 gpg (180 mg/L) | Softener | Strongest scale evidence; spotting with TAC becomes obvious at this level. |
| Hardness over 30 gpg | Softener (twin) | Above typical TAC maker limits (Watts OneFlow 30 gpg). |
| Iron or manganese present (well) | Softener (or iron filter first) | TAC needs iron under 0.3 and manganese under 0.05 mg/L; softeners handle low levels; above ~3 mg/L iron use an iron filter first. |
| Wants spot-free glass/shower doors, rich lather, soft feel, less detergent | Softener | Only softening changes how water feels and stops spotting. TAC water feels the same. |
| Tankless water heater, hardness over 200 mg/L (11.7 gpg) | Softener | Rinnai lists 200 mg/L as its hardness limit and excludes scale damage from warranty; TAC is not a recognized substitute in the manuals we read. |
| Dry skin/eczema is the main reason | Either, honestly | The SWET randomized trial (NIHR-funded, 2011) found softeners did not improve children's eczema beyond usual care. Sell feel, not a skin cure. |
| Moderate hardness (3.5–10.5 gpg), clean water, wants low upkeep | TAC | No salt, no brine, no power, media every ~3 years; ASU measured >88% scale reduction. |
| Sodium-restricted diet | TAC, or softener on potassium (or softener + RO at the sink) | TAC adds no sodium; potassium avoids sodium at 3–5x regenerant cost; RO removes most sodium from drinking water. |
| Septic owner worried about brine, or local rules | TAC (or an efficient softener) | PA allows softeners with septic (25 Pa. Code § 73.31); WQRF-funded work found efficient softeners do not hurt septic performance. Check township/sewer authority rules. |
| Tight budget | Under 10.5 gpg: TAC or heater care. Over: basic metered softener | A basic metered softener and a TAC tank cost about the same installed; pick by hardness. |
| Renter | Neither (polyphosphate cartridge or shower filter) | No permanent install. |

Sources: [WQA / WQRF](https://wqa.org/resources/softened-water-benefits-studies/); [WateReuse Research Foundation project 08-06 (Arizona State Univ.)](https://watereuse.org/watereuse-research/08-06-evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Watts OneFlow OF948/OF1054 specification sheet (TAC feed-water limits, media life)](https://watts-oneflow.com/wp-content/uploads/2021/06/OneFlow-OF948-OF1054-TS-IT-W-UK-05-21-Rev7.pdf); [Rinnai SENSEI installation and operation manual (water quality](https://www.rinnai.us/download/download?filename=SENSEI+Installation+and+Operation+Manual+-+RSC+Models.pdf&path=%2Fs--qweVp3yO--%2Fz3qt1eatwadabriqlg7i.pdf); [Thomas et al. 2011, Softened Water Eczema Trial (NIHR HTA-funded), PLOS Medicine](https://journals.plos.org/plosmedicine/article?id=10.1371%2Fjournal.pmed.1000395); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [25 Pa. Code § 73.31](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/025/chapter73/s73.31.html); [WQRF](https://www.wqrf.org/softeners-septics.html)

### Hard-water tiers by hardness (PA)

gpg = grains per gallon; 1 gpg = 17.1 mg/L as CaCO3. PA examples: Penn State well data statewide median 85 mg/L (5.0 gpg) across 8,244 samples, with county medians from 22 mg/L (Clarion) to 235 mg/L (Washington); Montgomery 188 (11 gpg), Bucks 146 (8.5), Delaware 134 (7.8), Chester 82 (4.8), Berks 62 (3.6); individual wells up to 1,824 mg/L (107 gpg). Philadelphia Water 2025: Baxter 6 gpg, Belmont 9, Queen Lane 10 (max 16). PA American Water Phoenixville 2025 report: 151 mg/L (8.8 gpg) in the distribution system, range 120-220 (7.0-12.9 gpg); water leaving its Royersford plant 155 mg/L (9.1 gpg). The Phoenixville Borough 2025 report lists no hardness. Aqua PA: check the utility report (PLACEHOLDER).

| Hardness | PA examples | Good | Better | Best | Note |
|---|---|---|---|---|---|
| Soft: under 3.5 gpg (under 60 mg/L) | Many central/western PA wells (Clarion, Elk, Carbon county medians) | Nothing for hardness. Flush the water heater yearly. | — | — | Do not sell hardness treatment here. |
| Moderate: 3.5–7 gpg (60–120 mg/L) | Chester and Berks well medians; Philadelphia Baxter (6 gpg) | Heater flush + anode check ($150–$350 service) | TAC conditioner (from ~$800 installed) | High-efficiency metered softener, only if they want spot-free/soft feel | TAC is usually the best value; softener is a preference upgrade. |
| Hard: 7–10.5 gpg (120–180 mg/L) | Bucks and Delaware well medians; Philadelphia Belmont (9) and Queen Lane (10) | TAC conditioner | High-efficiency metered softener (spot-free, soft feel) | Softener + whole-house carbon (city water) or carbon + TAC combo if no salt | Genuine either/or: pick by goal (feel/spots vs no salt/low upkeep). |
| Very hard: 10.5–17.5 gpg (180–300 mg/L) | Montgomery (11) and Washington (14) well medians | High-efficiency metered softener (single tank) | NSF/ANSI 44 efficiency-rated upflow softener | Twin-tank metered softener | Softener is the default. TAC only if "no salt" is a firm requirement, with the spotting caveat. Tankless heaters above 200 mg/L (11.7 gpg): softener (Rinnai limit). |
| Extremely hard: over 17.5 gpg (over 300 mg/L) | Individual limestone-area wells (PSU county maxima 400–1,800 mg/L) | High-efficiency metered softener sized for the load | Twin-tank metered softener | Twin-tank + iron filter first if iron is over ~3 mg/L | Do not sell TAC above the maker limit (Watts OneFlow: 30 gpg). |

Sources: [Penn State well-water summaries (our data/reference/psu-well-summaries.json)](https://agsci.psu.edu/aasl/water-testing); [Philadelphia Water Department](https://water.phila.gov/drops/2025-drinking-water-quality-report/)

### Good / better / best lineup

| Concern | Good | Better | Best | Note |
|---|---|---|---|---|
| PFAS in drinking water | Certified carbon block under the sink: Aquasana AQ-5200 class (WQA NSF/ANSI 42/53/401; about $100–$200 retail) | RO certified for PFOA/PFOS: Waterdrop G3P600 (IAPMO NSF/ANSI 58 + 53 PFOA/PFOS; about $539 retail) | Certified RO + certified whole-house PFAS (Aquasana HealthShield WH-HS, $2,099–$4,198) where levels are high or showers/bathing matter to the customer | iSpring RO is not certified for PFAS; do not use it for a PFAS sale. [IAPMO R&T listing WC-13976](https://mirobase.iapmo.org/pld/file_info.asp?file_no=0013976); [Aquasana](https://www.aquasana.com/on/demandware.static/-/Sites-aquasana-Library/default/PDF/WH-HS_Performance_Data.pdf); [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring); [Professor Aqua](https://professoraqua.com/waterdrop-vs-apec-vs-ispring/) |
| Lead (home plumbing) | Certified carbon block with a lead claim (NSF/ANSI 53) | iSpring RCC7-BN/RCC7-BLK RO (NSF/ANSI 58 incl. lead; about $240 retail for the RCC7AK family) | Certified RO + replace lead service line/fixtures | Only the BLK/BN finish variants from the Nanjing plant carry the lead claim; plain RCC7 is certified for TDS only. [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring); [Professor Aqua](https://professoraqua.com/waterdrop-vs-apec-vs-ispring/) |
| Chlorine/chloramine taste and DBPs | Cartridge whole-house carbon (20" Big Blue: iSpring WGB32B or Pentair; change cartridges every 6–12 months) | Backwashing catalytic carbon tank: Clack WS1 + Calgon Centaur, 1.5 cu ft (equipment $895–$1,200 retail, plus labor) | Backwashing catalytic carbon sized for 3–4 min contact (2–2.5 cu ft) + RO at the sink | Chloramine needs catalytic carbon and more contact time. Shower filter only with RO and no whole-house carbon. [Glass Water Systems](https://www.glasswatersystems.com/clack-ws1--15-cu-ft-carbon-filter-sys115.html); [Clean Water Store](https://www.cleanwaterstore.com/centaur-carbon-12x40-1-cu-ft-box.html); [Calgon Carbon](https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf); [Affordable Water](https://affordablewater.us/pages/chlorine-chloramine-carbon-filters) |
| Hard water (moderate, 3.5–10.5 gpg) | Heater flush + anode check ($150–$350) | TAC conditioner (Watts OneFlow class; $800+ installed) | High-efficiency metered softener (if spot-free/soft feel wanted) or carbon + TAC combo (city water, no salt) | See decision guide. [HomeGuide](https://homeguide.com/costs/water-heater-repair-cost); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [HomeGuide](https://homeguide.com/costs/water-softener-cost) |
| Hard water (very hard, over 10.5 gpg) or tankless | Metered single-tank softener ($1,200–$3,800 installed) | NSF/ANSI 44 efficiency-rated upflow softener | Twin-tank metered softener (Kinetico or Clack twin) | TAC only if no-salt is non-negotiable and hardness is under 30 gpg. [HomeGuide](https://homeguide.com/costs/water-softener-cost); [PNNL Building America](https://basc.pnnl.gov/resource-guides/water-softeners); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening) |
| Iron/manganese/sulfur (well) | Softener for low ferrous iron (under ~3 mg/L) | Air-injection (AIO) iron filter, Clack WS1 | AIO iron filter + softener (+ catalytic carbon polish for sulfur) | Lab test first (Penn State WD02, $85). [Penn State Extension](https://extension.psu.edu/iron-and-manganese-in-private-water-systems); [Penn State Agricultural Analytical Services Lab](https://agsci.psu.edu/aasl/water-testing/drinking-water-testing) |
| Bacteria (well) | Shock chlorination + retest | UV, NSF/ANSI 55 Class A (VIQUA PRO series) after sediment | UV Class A + sediment + softener/iron filter ahead so the lamp stays clean | Retest after install. [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=VIQUA); [Penn State Extension](https://extension.psu.edu/coliform-bacteria) |
| Unknown / peace of mind | Free: read the utility report (public water) | Penn State WD02 aesthetics/corrosivity test ($85) or WD03 with lead ($125) | Penn State WD08 extensive ($220) + PFAS test from a PA DEP-accredited lab (price: get quote, PLACEHOLDER) | Lab tests sell the right system; lead with them on wells. [Penn State Agricultural Analytical Services Lab](https://agsci.psu.edu/aasl/water-testing/drinking-water-testing) |

### Dropped (obsolete or not best-in-range)

- **Electronic (wrap-around) descalers:** Controlled tests show 0–50% scale reduction and inconsistent results (ASU/WateReuse 2011, Virginia Tech 2021); TAC or a softener costs more upfront but has real evidence behind it.
- **Magnetic descalers:** No reliable evidence of scale reduction.
- **Electrolytic / zinc-galvanic units:** Partial (about 50% for EIP in ASU tests) or inconsistent; TAC beats them.
- **Citric-acid / chelation "salt-free softeners":** Independent result about half the maker's claim, recurring cartridge cost; TAC is the better salt-free choice.
- **Timer-based softeners:** Demand-initiated (metered) models use 26–60% less salt and 25–40% less water than time-clock models (Univ. of Minnesota). Only sell metered/demand-initiated.
- **Standalone KDF:** Only as a layer in a carbon system.
- **Shower filters on their own:** Only as an add-on with RO at the sink when there is no whole-house carbon, or for renters.
- **Uncertified PFAS claims (any brand):** For PFAS, sell only systems with a PFOA/PFOS listing (NSF/ANSI 53 or 58) from NSF, WQA or IAPMO.
- **Deionization (DI) for homes:** Exhausts fast on hard water and makes water corrosive; comparison only.

Kept, narrowly:

- **Polyphosphate cartridges:** Niche: cheapest point-of-use protection for one appliance (tankless inlet, coffee/ice machine) or renters; not a whole-house hardness fix.
- **Potassium chloride:** An option on any softener, not a separate product.
- **Pitchers/countertop filters:** Renters only.

### iSpring as a supplier

**Verdict:** Keep iSpring for value under-sink RO, but not as the only supplier. Its RCC7 RO family has genuine NSF/ANSI 58 system certification (not just components), support is US-based, and no CPSC recall turned up. But its certified list is short (14 NSF listings, all RO), nothing is certified for PFAS, the whole-house, softener, descaler and UV lines have no performance listings we could find, and the warranty is 1 year (extended plans sold separately). Use certified alternatives for PFAS sales, whole-house carbon tanks, softeners and UV.

**Certifications (checked in NSF listings):**

- NSF/ANSI 58 (system-level, NSF): RCC7, RCC7AK, RCC7AK-UV made in Taichung, Taiwan: TDS reduction only.
- NSF/ANSI 58 (system-level, NSF): RCC7-BLK, RCC7-BN, RCC7AK-BLK/-BN, RCC7AK-UVBLK/-UVBN, RCC7UV made in Nanjing, China: asbestos, barium, cadmium, chromium (III), copper, fluoride, lead, selenium, TDS. Also NSF/ANSI 372 lead-free.
- NSF/ANSI 58 (system-level, NSF): RO500 tankless (BN/ORB, AK variants): TDS reduction only.
- Replacement cartridges are certified only as components of those systems.
- No NSF/ANSI 42, 53, 55, 401 or P473 listings found at NSF; no PFAS certification (its PFAS models cite SGS lab tests, not certification). WQA/IAPMO directories not fully checked this pass.

**Strongest:** RCC7-BN / RCC7-BLK / RCC7AK-BLK tank RO (broadest certified claim set, lead + fluoride); Replacement parts availability and low cartridge prices

**Weakest:** Electronic descaler ED2000/EDV2 (obsolete technology); Whole-house cartridge systems (WGB/WCB lines): uncertified, small carbon volume, frequent changes; PFAS "-PF" models: tested, not certified; WCS45KG softener and whole-house UV: no NSF/ANSI 44 or 55 listing found; RO500 tankless: premium price but certified for TDS only

**Warranty/support:** 1-year limited warranty (repair/replace; only for purchases from authorized sellers; registration required), 1-year money-back on many items via its own store, lifetime phone support M–F from Cumming, GA; 3/5/10-year extended warranties sold separately.

**Reliability:** No Wirecutter or Consumer Reports test found. Owner reports are mixed-to-good: many 5–8 year installs, with recurring complaints about faucet, fitting and tank leaks (typical of push-fit RO).

**Recalls:** No CPSC recall or class action involving iSpring found (search Nov 2026).

**Dealer program:** Authorized dealer program: no franchise fee, no inventory requirement, co-op advertising, onboarding, exclusive territories; requires licensing, bonding and insurance. Dealer pricing and margins are not published: request from dealer@ispringfilter.com (PLACEHOLDER).

| Brand | Channel | Certifications | Warranty | Fit |
|---|---|---|---|---|
| iSpring | Online + dealers | NSF 58 system (RCC7 family, RO500); no PFAS | 1 yr (+ paid extended) | Value RO |
| Waterdrop | Online | IAPMO NSF 58 + 53 PFOA/PFOS (G3P600), NSF 42 | Check maker (PLACEHOLDER) | Certified tankless RO for PFAS |
| APEC | Online | WQA NSF 58 (ROES-50: TDS only) | Check maker (PLACEHOLDER) | Comparable to iSpring |
| Aquasana | Online (DTC) | WQA NSF 42/53/401 (AQ-5200); WQA NSF 53/401 PFAS whole-house (WH-HS) | Check maker (PLACEHOLDER) | Certified carbon block; certified whole-house PFAS |
| Express Water | Online | NSF 58 (2 listings) | Check maker (PLACEHOLDER) | Comparable to iSpring |
| Kinetico | Franchise dealers only | WQA NSF 58/53 PFOA/PFOS (K5); NSF 42 chloramine cartridges | Dealer (varies) | Premium; not available to independents |
| Culligan | Franchise dealers only | NSF 42/55 listings; PFAS whole-home claims (verify) | Dealer | Premium; competitor, not a supplier |

Sources: [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring); [iSpring](https://www.ispringfilter.com/pages/return-policy); [iSpring](https://www.ispringfilter.com/collections/extended-warranty/products/whole-house-extended-warranty_839_840_841_842_846_847); [iSpring Dealer Network (no franchise fee, no inventory requirement; pricing on request)](https://www.ispringwatersystems.com/)

### Whole-house carbon providers

**Cartridge vs tank:** Cartridge (20" Big Blue) systems are cheap and simple but hold little carbon (short contact time) and need changes every 6–12 months. Backwashing tanks (Clack/Fleck valve) hold 1–2.5 cu ft, backwash to prevent channeling and fouling, and last 3–5+ years on chlorine. Non-backwashing upflow tanks (SpringWell, Aquasana Rhino, Pelican) sit in between: no drain or power, media replaced every ~5–10 years per maker.

**PFAS:** GAC is one of EPA's best available technologies for PFAS (with ion exchange and RO), but contact time decides it: EPA-funded research found a typical 1 cu ft, 4 gpm home tank gives about 2 minutes empty-bed contact time versus ~10 minutes vendors recommend for PFAS, and at high PFAS levels even an 8 cu ft two-tank system needed new carbon in weeks. So: sell RO at the sink for PFAS drinking water, and only sell whole-house PFAS with a certified system (or an engineered, tested GAC/IX design with follow-up testing).

**Chloramine:** Chloramine needs catalytic carbon (e.g., Calgon Centaur) and about 3–4+ minutes contact (roughly 2.5 gpm per cu ft). Standard GAC removes chlorine easily but chloramine poorly.

**Dealer margins:** No supplier publishes dealer margins. Practical picture: dealer-built Clack/Fleck tanks with bulk media give the most control over price and service revenue; DTC brands (SpringWell, Aquasana, Pelican) sell retail online, which caps installer markup; Kinetico and Culligan are closed franchise networks. Ask distributors for price sheets (PLACEHOLDER).

| Provider | Type | Certifications | Price | Availability | Verdict |
|---|---|---|---|---|---|
| Dealer-built backwashing tank (Clack WS1 valve + Calgon Centaur/Filtrasorb) | Backwashing tank | Media complies with AWWA B604; no system listing | Equipment $895–$1,200 retail for 1.5 cu ft; Centaur $365–$405/cu ft | Any independent dealer via distributors | Top pick: best performance per dollar, serviceable for decades, best margin and recurring service [Glass Water Systems](https://www.glasswatersystems.com/clack-ws1--15-cu-ft-carbon-filter-sys115.html); [Clean Water Store](https://www.cleanwaterstore.com/centaur-carbon-12x40-1-cu-ft-box.html); [Calgon Carbon](https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf) |
| Aquasana HealthShield WH-HS | Whole-house POE system, PFAS | WQA NSF/ANSI 53 (PFOA/PFOS, PFHxS, PFNA, PFHpA) + 401; 165,000 gal; 5.7 gpm | $2,099 sale, $4,198 MSRP | DTC online; trade program unverified | Top pick when a customer wants certified PFAS reduction at every tap [Aquasana](https://www.aquasana.com/on/demandware.static/-/Sites-aquasana-Library/default/PDF/WH-HS_Performance_Data.pdf); [Aquasana](https://www.aquasana.com/water-filter-products/) |
| Aquasana Rhino EQ-1000 | Non-backwashing tank | Chlorine tested to NSF/ANSI 42 per maker; tank NSF/ANSI 61; no system performance listing found | $999 sale ($1,998 MSRP) | DTC online | Solid DTC chlorine option; weak for a dealer (retail price visible) [Aquasana](https://www.aquasana.com/water-filter-products/) |
| Hellenbrand / WaterGroup | Dealer-line tanks, softeners, carbon | Hellenbrand NSF 58 RO; WaterGroup NSF 42 media listings | Dealer price sheets (PLACEHOLDER) | Independent dealers | Top pick as a dealer line for softeners + carbon tanks with distributor support  |
| A. O. Smith HomeShield AOS-HS-1200 | POE PFAS | NSF/ANSI 53 PFAS per maker; 500,000 gal; 5.7 gpm | Installer channel (PLACEHOLDER) | Installers | Alternative certified PFAS option to check pricing on [A. O. Smith](https://www.aosmith.com/water-treatment/water-filtration/homeshield-whole-house-filter/HomeShield+AOS-HS-1200.html) |
| Pentair FloPlus Protect 20BB | Cartridge POE, PFAS | IAPMO NSF/ANSI 53 (5 PFAS); 40,000 gal at 5 gpm | About $325–$369 | Distributors/online | Budget certified PFAS; 40,000 gal is only months for a family [Pentair](https://www.pentair.com/content/dam/extranet/nam/filtration/pentair/spec-sheets/english/4006913-floplus-20bb-spec-sheet.pdf); [Mid Atlantic Water](https://midatlanticwater.net/products/whole-house-pfas-cartridge-filter) |
| Pentair Pelican PC600 | Non-backwashing tank | No system performance listing found at NSF (maker cites certified media) | About $974 (Home Depot) | Retail | Fine for chlorine; retail-priced [Home Depot](https://www.homedepot.com/p/PENTAIR-10-GPM-Whole-House-Carbon-Water-Filtration-System-PC600-P/205423701) |
| SpringWell CF1 | Non-backwashing tank (GAC + KDF) | No system listing found at NSF | About $1,160 (list $1,365) | DTC online | Popular DTC; little dealer room [Pure Whole House](https://purewholehouse.com/price-change-log/) |
| Kinetico / Culligan | Dealer systems | Kinetico NSF 42 chloramine cartridges; Culligan NSF 42/55 | Dealer-only, high | Closed franchise networks | Competitors, not suppliers [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=Kinetico) |
| iSpring whole-house (WGB/WCB) | Cartridge | None found at NSF | Low | Online + dealers | Good tier only (budget chlorine taste) [NSF listings](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring) |

## Catalog

### Point of use (sink)

#### Reverse osmosis (RO) at the kitchen sink, with remineralization

**Suggested:** Good: iSpring RCC7-BN/RCC7-BLK (NSF/ANSI 58 system-certified incl. lead, fluoride). For PFAS: Waterdrop G3P600 (IAPMO NSF/ANSI 58 + 53 PFOA/PFOS) or Kinetico K5 (WQA NSF/ANSI 58/53 PFOA/PFOS, dealer network). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | PFAS incl. PFOA/PFOS (look for NSF/ANSI 58 PFAS claim); lead; arsenic (arsenic V; arsenic III needs pre-oxidation); nitrate; fluoride; dissolved solids/salt; most chlorine taste (carbon pre-filter) |
| Does NOT treat | water at showers, laundry or other taps; scale in pipes and the water heater; bacteria by itself (it is not a disinfection device) |
| Install | Under the sink, with its own faucet and a small storage tank; needs a drain connection. Remineralization stage adds calcium/magnesium back for taste. |
| Installed cost | $300–$1,000 (estimate) |
| Annual upkeep | $60–$150 (pre/post filters $30–$60 every 6–12 months; membrane $50–$200 every 2–3 years) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost); [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost) |
| Maintenance | Change pre/post filters every 6–12 months and the membrane every 2–3 years; sanitize the tank yearly. |
| Pros | Broadest reduction for drinking and cooking water; Low cost per gallon; Certified options for PFAS, lead, arsenic, nitrate |
| Cons | Only one tap; Sends some water to drain; Slower flow; takes cabinet space |
| Best fit | Any home that wants the most reduction in drinking water: PFAS, lead, nitrate or arsenic concerns, families with babies. |
| Certifications | NSF/ANSI 58 (RO). Check the listing for each contaminant claim (e.g. PFOA/PFOS, lead, arsenic V, nitrate). |

#### Under-sink carbon block filter (certified)

**Suggested:** Aquasana AQ-5200 Claryum (WQA NSF/ANSI 42, 53, 401). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | chlorine/chloramine taste and odor (chloramine needs a catalytic/chloramine claim); lead (NSF/ANSI 53 lead claim); PFOA/PFOS (NSF/ANSI 53 PFAS claim); many VOCs and disinfection byproducts (per claim) |
| Does NOT treat | nitrate; most dissolved salts/TDS; hardness; bacteria |
| Install | Under the sink on the cold line, often with a separate faucet; no drain needed. |
| Installed cost | $180–$550 (estimate) |
| Annual upkeep | $20–$100 in cartridges |
| Cost source | [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost) |
| Maintenance | Replace the cartridge on schedule (typically 6–12 months or the rated gallons). An exhausted carbon filter stops working without warning. |
| Pros | Cheaper than RO; No wastewater; Good flow |
| Cons | Narrower than RO (no nitrate/arsenic/TDS); Performance depends entirely on the specific certification |
| Best fit | Public-water homes that want better taste and lead/PFAS reduction at the tap without RO. |
| Certifications | NSF/ANSI 42 (taste/chlorine) and 53 (lead, PFOA/PFOS, VOCs). |

#### Pitcher or countertop filter _(niche)_

| | |
|---|---|
| Treats | taste and chlorine; some models certified for lead or PFOA/PFOS |
| Does NOT treat | anything outside the pitcher; most models: nitrate, arsenic, bacteria |
| Install | None. Good for renters. |
| Installed cost | $20–$200 (estimate) |
| Annual upkeep | $40–$150 in filters |
| Cost source | Our rough estimate; get a supplier quote |
| Maintenance | Change filters often (frequently every 1–3 months). |
| Pros | Cheap, portable, no install |
| Cons | Small volume; Easy to forget filter changes; Certifications vary widely |
| Best fit | Renters or a stopgap until a permanent system is installed. |
| Certifications | NSF/ANSI 42/53 (and 401 for some emerging contaminants); check the exact claim. |

### Whole house

#### Whole-house sediment filter

**Suggested:** Spin-down plus 20" Big Blue cartridge housing (Pentair/Pentek, iSpring). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | sand, silt, rust particles, cloudiness from particles |
| Does NOT treat | dissolved iron, chemicals, bacteria, hardness |
| Install | Cartridge housing or backwashing tank at the main line; usually the first stage in front of other equipment. |
| Installed cost | $150–$500 (estimate) |
| Annual upkeep | $20–$120 (cartridges $5–$30 every 1–3 months) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Swap cartridges when pressure drops or on a schedule. |
| Pros | Cheap; Protects UV, carbon and conditioners downstream |
| Cons | Does not improve water chemistry on its own |
| Best fit | Every well system as a prefilter; any home with visible particles. |
| Certifications | NSF/ANSI 42 (particulate class) where claimed. |

#### Whole-house carbon / catalytic carbon

**Suggested:** Better/Best: dealer-built backwashing tank, Clack WS1 valve + Calgon Centaur catalytic carbon (chloramine) or Filtrasorb GAC (chlorine). Good: cartridge system (iSpring WGB32B, Pentair Big Blue). PLACEHOLDER until supplier pricing.

"Charcoal" filters are activated carbon. Catalytic carbon is a modified carbon that handles chloramine and hydrogen sulfide better.

| | |
|---|---|
| Treats | chlorine and (catalytic) chloramine taste/odor at every tap; many VOCs and pesticides; disinfection byproducts (per claim); mild hydrogen sulfide (catalytic); PFAS with PFAS-rated media sized for it |
| Does NOT treat | hardness/scale; nitrate, arsenic, salts; bacteria (and it can remove the chlorine that protects pipes from regrowth) |
| Install | Backwashing tank or large cartridge housings at the main line; tanks need a drain and outlet. |
| Installed cost | $600–$2,000 (estimate) |
| Annual upkeep | $40–$160 (media $150–$400 every 3–5 years, or cartridges $20–$80 every 6–12 months) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost); [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost) |
| Maintenance | Replace media/cartridges on schedule; PFAS use needs more frequent changes based on levels. |
| Pros | Better-smelling showers and baths; Removes chlorine/chloramine at every tap; Makes separate shower filters unnecessary |
| Cons | Does not soften; Media life depends on water use and chemical levels |
| Best fit | Public-water homes bothered by chlorine/chloramine, and households wanting chemical reduction for bathing as well as drinking. |
| Feed-water limits | Size by contact time: chlorine needs roughly 1–2 minutes EBCT at peak flow; chloramine needs catalytic carbon and about 3–4+ minutes (about 2.5 gpm per cu ft of Centaur); PFAS needs ~10 minutes (vendor guidance in EPA research), which a typical 1–1.5 cu ft home tank cannot give (about 2 minutes at 4 gpm). |
| Certifications | Few whole-house carbon tanks carry a system-level NSF/ANSI 42/53 listing; dealer-built tanks rely on certified media (e.g., Calgon carbons comply with AWWA B604; check NSF/ANSI 61 on the media data sheet). For PFAS claims use a system certified to NSF/ANSI 53 for PFOA/PFOS. |
| Sources | [Calgon Carbon](https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf); [Affordable Water](https://affordablewater.us/pages/chlorine-chloramine-carbon-filters); [Patterson et al. 2019, Effectiveness of POU/POE systems to remove PFAS (EPA ORD-funded), AWWA Water Science](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650157/); [Glass Water Systems](https://www.glasswatersystems.com/clack-ws1--15-cu-ft-carbon-filter-sys115.html); [Clean Water Store](https://www.cleanwaterstore.com/centaur-carbon-12x40-1-cu-ft-box.html) |

#### KDF (copper-zinc) media _(component)_

| | |
|---|---|
| Treats | free chlorine; some hydrogen sulfide; inhibits bacterial growth inside the filter; some dissolved metals (per claim) |
| Does NOT treat | chloramine (no reliable evidence); PFAS, VOCs (needs carbon); hardness; bacteria in the water supply |
| Install | Usually layered with carbon in a whole-house tank or in shower filters. |
| Installed cost | $600–$2,000 (usually sold combined with carbon) (estimate) |
| Annual upkeep | $40–$160 |
| Cost source | Our rough estimate; get a supplier quote |
| Maintenance | Backwash (tanks) and replace media per manufacturer. |
| Pros | Extends carbon life; Works well at hot temperatures (showers) |
| Cons | Rarely a stand-alone solution; Limited third-party performance data |
| Best fit | An add-on layer in a carbon system or shower filter, not a primary recommendation. Sold only as a layer inside a carbon system, not on its own. |
| Certifications | Look for NSF/ANSI 42 or 177 claims on the finished product. |

#### UV disinfection

**Suggested:** VIQUA PRO10/20/30 (NSF/ANSI 55 Class A) or Luminor Class A models, after sediment (and iron/hardness treatment if needed). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | bacteria incl. coliform and E. coli; viruses; Giardia and Cryptosporidium |
| Does NOT treat | chemicals, metals, nitrate, hardness; the source of contamination (well cap/casing problems still need fixing) |
| Install | Stainless chamber with a UV lamp on the main line after sediment (and iron/hardness) treatment; needs an outlet. Water must be clear for UV to work. |
| Installed cost | $700–$2,500 (estimate) |
| Annual upkeep | $50–$150 lamp each year, plus sleeve $30–$80 every 2–3 years |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Replace the lamp yearly, clean the quartz sleeve, keep prefilters fresh. Shock-chlorinate the plumbing after install and retest. |
| Pros | No chemicals, no taste change; Instant, continuous disinfection |
| Cons | Needs power and clear water; No residual protection in pipes; Does nothing for chemicals |
| Best fit | Wells with coliform or E. coli history, springs, shallow wells, or wells near septic systems or livestock. |
| Certifications | NSF/ANSI 55 Class A for disinfection of contaminated water. |

#### Air-injection oxidizing filter (iron, manganese, sulfur)

**Suggested:** Clack WS1 air-injection (AIO) filter, dealer-built. PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | iron (orange stains), including high levels; manganese (black stains) with correct media and pH; hydrogen sulfide (rotten-egg smell) |
| Does NOT treat | bacteria; hardness; PFAS, nitrate, arsenic (unless designed for it) |
| Install | Backwashing tank with an air pocket at the main line; needs a drain and outlet. |
| Installed cost | $1,000–$3,500 (estimate) |
| Annual upkeep | $20–$120 (media $200–$600 every 5–10 years) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Automatic backwash; periodic service and media replacement. |
| Pros | Chemical-free; Handles iron and sulfur together |
| Cons | Drain water from backwash; Sizing depends on lab results (iron, manganese, pH, H2S) |
| Best fit | Well homes with orange/black staining or rotten-egg smell confirmed by a lab test. |
| Certifications | Media/valves NSF/ANSI 61 for material safety; performance is site-specific. |

#### Greensand / manganese-oxide filter

| | |
|---|---|
| Treats | iron; manganese; hydrogen sulfide |
| Does NOT treat | bacteria; hardness; chemicals |
| Install | Backwashing tank; traditionally regenerated with potassium permanganate or used with chlorine feed. |
| Installed cost | $1,000–$3,500 (equipment $600–$1,800) (estimate) |
| Annual upkeep | $50–$200 (regenerant and service) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Regenerant handling (permanganate is a strong oxidizer) and backwash. |
| Pros | Effective on manganese |
| Cons | Chemical handling; More upkeep than air injection |
| Best fit | Manganese-heavy wells, or where air injection alone is not enough. |
| Certifications | Site-specific performance. |

#### Birm filter

| | |
|---|---|
| Treats | low-to-moderate iron (roughly under 3 ppm) when pH is about 6.8 or higher |
| Does NOT treat | manganese well at normal pH; hydrogen sulfide (can be fouled by it); low-pH water |
| Install | Backwashing tank; no chemicals. |
| Installed cost | $800–$2,000 (equipment $400–$1,200) (estimate) |
| Annual upkeep | $20–$80 |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Backwash; media every 5–10 years. |
| Pros | Inexpensive, chemical-free |
| Cons | Narrow operating window (pH, oxygen, no H2S) |
| Best fit | Moderate iron with neutral pH and no sulfur smell. |
| Certifications | Site-specific performance. |

#### Acid neutralizer (calcite / corosex)

**Suggested:** Clack WS1 backwashing calcite tank. PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | low pH / acidic, corrosive water; blue-green stains and pinhole leaks from corrosion; reduces lead/copper leaching from plumbing |
| Does NOT treat | bacteria; chemicals; lead already in the water from other sources |
| Install | Backwashing or upflow tank at the main line, before iron filters/softeners. |
| Installed cost | $800–$2,500 (estimate) |
| Annual upkeep | $50–$150 calcite top-off (estimate) |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Add calcite media as it dissolves (often yearly). Raises hardness slightly. |
| Pros | Protects copper plumbing and fixtures; Common, proven fix for PA wells |
| Cons | Adds some hardness; Needs top-offs |
| Best fit | Well homes with low pH, blue-green stains, metallic taste or lead/copper detected at the tap. |
| Certifications | Media NSF/ANSI 61. Penn State lists acid-neutralizing filters and soda-ash injection for corrosive water. |
| Sources | [Penn State Extension](https://extension.psu.edu/common-drinking-water-problems-and-solutions) |

#### Whole-house PFAS media (PFAS-rated carbon or anion exchange)

**Suggested:** Certified POE options: Aquasana HealthShield WH-HS (WQA NSF/ANSI 53 PFOA/PFOS + 3 more PFAS, 165,000 gal), A. O. Smith HomeShield AOS-HS-1200 (NSF/ANSI 53 PFAS, installer channel), Pentair FloPlus Protect 20BB (IAPMO NSF/ANSI 53, 40,000 gal at 5 gpm). Dealer-built: twin GAC tanks sized for ~10 min EBCT. PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | PFAS at every tap (when sized and verified for the measured levels); chlorine taste (carbon versions) |
| Does NOT treat | hardness; bacteria; nitrate (unless nitrate-selective resin) |
| Install | One or two large tanks at the main line, often in series with sediment prefiltration. |
| Installed cost | $500–$4,000+ (activated carbon or RO for PFAS); whole-house PFAS systems are at the top of this range or above (estimate) |
| Annual upkeep | $150–$400+ per media change; interval depends on PFAS levels and water use |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Media replacement based on testing; periodic PFAS testing after the system to confirm it is still working. |
| Pros | Reduces bathing and cooking exposure too |
| Cons | Higher cost than drinking-water-only RO; Certification standards for whole-house PFAS units are limited |
| Best fit | Homes with PFAS well above EPA limits that want treatment at every tap. |
| Certifications | EPA notes that current filter certifications (as of April 2024) do not yet show removal down to EPA's 4 ppt limits. |
| Sources | [U.S. EPA](https://www.epa.gov/water-research/identifying-drinking-water-filters-certified-reduce-pfas) |

#### Well chlorination (shock and continuous feed)

| | |
|---|---|
| Treats | bacteria (with contact time); iron/sulfur oxidation ahead of a filter; iron/sulfur bacteria |
| Does NOT treat | chemicals, nitrate, hardness; leaves chlorine taste unless followed by carbon |
| Install | Shock: one-time disinfection of the well and plumbing. Continuous: chemical feed pump plus contact tank, usually followed by carbon. |
| Installed cost | $500–$1,500 (chemical injector) (estimate) |
| Annual upkeep | $120–$360 (solution $10–$30/month) |
| Cost source | [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost); [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Refill solution, check feed rate and residual. |
| Pros | Residual disinfection throughout plumbing; Also handles iron/sulfur bacteria |
| Cons | Chemical handling; Taste unless carbon-filtered |
| Best fit | Wells with recurring bacteria or heavy iron/sulfur where UV alone is not enough. Shock chlorination after any well repair. |
| Certifications | NSF/ANSI 60 chemicals. |
| Sources | [Penn State Extension](https://extension.psu.edu/coliform-bacteria); [Penn State Extension](https://extension.psu.edu/hydrogen-sulfide-rotten-egg-odor-in-water-wells) |

#### Arsenic or nitrate treatment (usually RO at the tap)

| | |
|---|---|
| Treats | arsenic (RO or arsenic-specific adsorptive media; arsenic III must be oxidized first); nitrate (RO or nitrate-selective anion exchange) |
| Does NOT treat | bacteria; hardness |
| Install | Most cost-effective as point-of-use RO at the kitchen sink. Whole-house media or anion exchange when levels are high or the home needs it at every tap. |
| Installed cost | Arsenic: $1,000–$4,000 (media or RO); nitrate: $300–$5,000 (RO or anion exchange) (estimate) |
| Annual upkeep | $60–$300 depending on system |
| Cost source | [HomeGuide](https://homeguide.com/costs/well-water-filtration-system-cost) |
| Maintenance | Regular testing of treated water; media or membrane replacement. |
| Pros | Targets the two most common health chemicals in PA wells after bacteria |
| Cons | Needs lab confirmation of form and level |
| Best fit | Wells with arsenic or nitrate results near or above EPA limits; homes with infants (nitrate). |
| Certifications | NSF/ANSI 58 with arsenic/nitrate claims; NSF/ANSI 53 for arsenic media. |

### Hard water: salt-free

#### Salt-free conditioner (TAC / NAC)

**Suggested:** Watts OneFlow (TAC, maker limits up to 30 gpg), or dealer-built TAC tank. PLACEHOLDER until supplier pricing.

Template-assisted (TAC) or nucleation-assisted (NAC) crystallization, including NAC media such as Filtersorb SP3. Often sold as a "salt-free softener", but it does not soften.

**How it works:** Water flows through a bed of polymer beads that act as templates. Dissolved calcium and magnesium form microscopic crystals that stay suspended and wash through instead of sticking as hard scale.

| | |
|---|---|
| Treats | scale buildup in water heaters, pipes and fixtures (scale prevention) |
| Does NOT treat | the hardness itself (minerals stay in the water); spotting on glass and fixtures (water still dries with minerals); soap lather (it will not feel like soft water); iron, manganese, copper, hydrogen sulfide (they foul the media); bacteria, PFAS, lead, nitrate |
| Install | One tank at the main line, often with a sediment/carbon prefilter. Many models need no power and no drain. |
| Installed cost | $800–$4,000 (Angi); $1,500–$4,500 (HomeGuide) (estimate) |
| Annual upkeep | No salt, water or electricity. Media replacement about every 3 years on common models (e.g., Watts OneFlow) plus any prefilter; ASU's vendor quotes put annual O&M at $0–$80 (2012). Media price: get dealer quotes (PLACEHOLDER). |
| Cost source | [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [HomeGuide](https://homeguide.com/costs/water-softener-cost); [Watts OneFlow OF948/OF1054 specification sheet (TAC feed-water limits, media life)](https://watts-oneflow.com/wp-content/uploads/2021/06/OneFlow-OF948-OF1054-TS-IT-W-UK-05-21-Rev7.pdf); [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/) |
| Maintenance | Replace media on the maker's schedule (about every 3 years for OneFlow; Filtersorb SP3 claims 5–7 years); change any prefilter. |
| Pros | No salt to buy or carry; No brine discharge to septic or sewer; Usually no electricity or drain; Keeps calcium and magnesium in the water; No slippery feel |
| Cons | Does not remove hardness or stop spotting; Needs low iron/manganese/sulfide or pretreatment; Evidence comes mostly from lab scale tests, not long-term field studies |
| Best fit | Moderately hard to hard water (about 3.5–10.5 gpg) with low iron/manganese, where the goal is protecting the water heater and plumbing with no salt, no brine, no power and low upkeep, and the customer accepts some spotting. Also for sodium-restricted households and anyone who simply will not haul salt. |
| Feed-water limits | Typical maker limits (e.g., Watts OneFlow): hardness 30 gpg recommended max; install on cold water, 40–100°F; pH 6.5–8.5; iron under 0.3 mg/L, manganese under 0.05 mg/L, copper under 1.3 mg/L (passivate new copper for 4 weeks); no oil or hydrogen sulfide; free chlorine under 2 mg/L; phosphate under 3 mg/L. Above these, pretreat first. |
| Certifications | Ask for IAPMO/ANSI Z601 or DVGW W512 test reports. NSF/ANSI 44 does not apply (it is for softeners). |
| Evidence | Arizona State University / HDR study (2011, WateReuse Research Foundation with the U.S. Bureau of Reclamation, California agencies and the cities of Phoenix and Scottsdale; not industry-funded): one TAC product cut scale by more than 88% vs untreated water in 21-day DVGW-style water-heater tests on three Arizona waters at 60 and 80°C. Certification options: DVGW W512 (scale at most 20% of untreated, i.e. 80% reduction) or IAPMO/ANSI Z601 (70%). No study has measured water-heater efficiency or life with TAC. NSF/ANSI 61 covers material safety only. |
| Sources | [WateReuse Research Foundation project 08-06 (Arizona State Univ.)](https://watereuse.org/watereuse-research/08-06-evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [WC&P](https://wcponline.com/2014/10/14/new-standard-evaluation-scale-control-equipment/); [Working Pressure Magazine (IAPMO)](https://www.workingpressuremag.com/scale-reduction-product-standards/); [Watts OneFlow OF948/OF1054 specification sheet (TAC feed-water limits, media life)](https://watts-oneflow.com/wp-content/uploads/2021/06/OneFlow-OF948-OF1054-TS-IT-W-UK-05-21-Rev7.pdf); [Watch-Water](https://www.watchwater.de/wp-content/uploads/2025/04/Product-Specification-Filtersorb-SP3.pdf); [Univ. of Nebraska-Lincoln Extension G2275](https://extensionpubs.unl.edu/publication/g2275/2026/pdf/view/g2275-2026.pdf); [WaterWorld / WQA](https://www.waterworld.com/residential-commercial/article/14308129/water-quality-association-sorting-out-scale-prevention) |

#### Polyphosphate / sequestering cartridge _(niche)_

**Suggested:** Siliphos-type cartridge in a standard 10" housing (e.g., iSpring WGB-DS line or Pentair/Pentek). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | light scale at a single appliance or small system; keeps low iron in solution (fewer stains) |
| Does NOT treat | hardness removal; high iron; contaminants |
| Install | Small cartridge on the line to a water heater, ice maker or whole house. |
| Installed cost | Housing about $30–$50 plus a cartridge (retail); installed $50–$300 (our estimate) (estimate) |
| Annual upkeep | Cartridges about $25–$80 each, every 3–6 months: roughly $50–$300 a year (estimate from retail prices) |
| Cost source | [Retail polyphosphate scale-inhibitor cartridges (e.g., MyAquaFilter SCALE10)](https://myaquafilter.com/product/scale-corrosion-inhibitor-water-filter-cartridge-10%e2%80%b3-x-2-5%e2%80%b3-food-grade-polyphosphate-media-sku-scale10/) |
| Maintenance | Replace cartridges every few months. |
| Pros | Low cost |
| Cons | Adds phosphate to water; Limited capacity; less effective in hot water; Not compatible ahead of TAC media |
| Best fit | Low-budget, point-of-use scale protection in front of one appliance (tankless heater inlet, coffee/ice machine, boiler fill) on cold water, or renters. Not a whole-house hardness solution; weaker in hot water. |
| Certifications | NSF/ANSI 60 for the additive (and NSF/ANSI 42 for the cartridge where claimed). |
| Evidence | Battelle 1986 (ASHRAE Trans.): softened, softened plus polyphosphate, and hard water plus polyphosphate all reduced scale in water heaters. NACE 1985: phosphorus-based chemicals cut scale almost completely in a heat-exchanger test. Virginia Tech 2021: a phosphate sacrificial-media cartridge cut scale about 54% (standard water) and 80% (natural well water). Effectiveness drops at higher temperatures; check the maker's temperature rating. |
| Sources | [Talbert et al. (Battelle Columbus), ASHRAE Trans. 92](https://www.osti.gov/biblio/6457988); [NACE Corrosion 1985](https://doi.org/10.5006/c1985-85250); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [Retail polyphosphate scale-inhibitor cartridges (e.g., MyAquaFilter SCALE10)](https://myaquafilter.com/product/scale-corrosion-inhibitor-water-filter-cartridge-10%e2%80%b3-x-2-5%e2%80%b3-food-grade-polyphosphate-media-sku-scale10/) |

#### Combined whole-house carbon + salt-free conditioner

**Suggested:** Dealer-built: catalytic carbon tank (Clack valve, Calgon Centaur) followed by a TAC tank (Watts OneFlow class). Packaged DTC equivalents: SpringWell CF + FutureSoft, Aquasana Rhino with salt-free conditioner, Pelican PC600 + NaturSoft. PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | chlorine/chloramine taste and odor at every tap; scale buildup in heater and pipes (TAC) |
| Does NOT treat | hardness (minerals stay); spotting; bacteria; PFAS unless sized and certified for it |
| Install | Two tanks (or one combo unit) at the main line after a sediment filter. TAC tank after carbon; usually no drain or power unless the carbon tank backwashes. |
| Installed cost | Roughly carbon $600–$2,000 plus TAC $800–$4,000, less shared labor: about $1,500–$5,000 (estimate from our component ranges). Packaged DTC kits: SpringWell FutureSoft about $1,785–$2,100 alone (aggregator). (estimate) |
| Annual upkeep | Carbon media/cartridges plus TAC media every ~3 years: roughly $100–$250 a year (estimate) |
| Cost source | [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [Pure Whole House](https://purewholehouse.com/price-change-log/) |
| Maintenance | Sediment prefilter every 3–6 months; carbon media every 3–5 years (tank) or cartridges every 6–12 months; TAC media about every 3 years. |
| Pros | One install handles city-water taste and scale; No salt, no brine |
| Cons | Does not soften: spots remain; TAC needs low iron/manganese/sulfide; Two medias to replace |
| Best fit | Public-water homes with moderate hardness (about 3.5–10.5 gpg) that dislike chlorine taste and want low upkeep with no salt. |
| Certifications | Carbon: NSF/ANSI 42 (chlorine/chloramine) where available. TAC: ask for DVGW W512 or IAPMO Z601 test reports. |
| Sources | [WateReuse Research Foundation project 08-06 (Arizona State Univ.)](https://watereuse.org/watereuse-research/08-06-evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Calgon Carbon](https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf) |

### Hard water: softener

#### High-efficiency metered softener (salt or potassium)

**Suggested:** Clack WS1 or Fleck 5810/5812 metered valve with upflow/counter-current brining, NSF/ANSI 44 efficiency-rated where possible (dealer lines: Hellenbrand, WaterGroup). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | removes hardness (calcium, magnesium); prevents scale and spotting; low levels of iron/manganese |
| Does NOT treat | bacteria, PFAS, lead, nitrate, arsenic |
| Install | Resin tank plus brine tank at the main line; needs a drain and outlet. Bypass outdoor spigots. Set to demand-initiated (metered) regeneration with upflow brining where available. |
| Installed cost | $1,200–$3,800 (HomeGuide); national average about $1,500 (Angi) (estimate) |
| Annual upkeep | $50–$150 salt (HomeGuide), plus regeneration water and a little electricity (estimate) |
| Cost source | [HomeGuide](https://homeguide.com/costs/water-softener-cost); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm) |
| Maintenance | Add salt (or potassium chloride) about monthly; clean the brine tank every 5–10 years; resin 10–15+ years (longer with a carbon prefilter on chlorinated water). Check the water heater anode every 1–2 years or fit a powered anode. |
| Pros | Removes hardness: no spots, better lather, soft feel; Strongest evidence for keeping gas and tankless heaters at factory efficiency (Battelle 2009, WQRF-funded); Handles low iron/manganese that TAC cannot; High-efficiency metered models use 26–60% less salt than timer models (Univ. of Minnesota); Can run on potassium chloride for no added sodium |
| Cons | Salt to buy and carry; Brine (chloride) discharge to septic or sewer; Uses water to regenerate; Adds sodium; slippery feel; Uses up the water heater anode faster |
| Best fit | Very hard water (about 10.5+ gpg / 180+ mg/L), iron or manganese up to a few mg/L, customers who want spot-free glass, rich lather and soft-feeling water, and tankless heaters above the maker hardness limit (Rinnai: 200 mg/L). |
| Feed-water limits | Can take out low iron, but an iron filter is recommended above about 3 mg/L; chlorine above about 1 mg/L shortens resin life (Univ. of Minnesota). Needs a drain and an outlet; size to hardness and household use. Choose demand-initiated (metered) regeneration. |
| Certifications | NSF/ANSI 44 (structural and performance). Look for the NSF/ANSI 44 efficiency rating: demand-initiated regeneration, at least 3,350 grains per lb of salt and no more than 5 gallons per 1,000 grains (PNNL). |
| Evidence | Removes hardness (certified to NSF/ANSI 44). Battelle 2009 (funded by WQRF, WQA's research arm): gas and tankless heaters on softened water kept their starting efficiency through a 90-day accelerated test (about 1.25–2.25 years of use), while on 26 gpg hard water gas tank efficiency fell from 70.4% to 67.4% and tankless from 80% to 72% (tankless needed deliming at 1.6 years). Electric heaters showed no efficiency change either way. Virginia Tech 2021 (WQRF-funded): about 100% scale reduction. The '15-year' and 'up to 24%/48% efficiency loss' figures are projections, not measurements. Softened water consumed magnesium anodes much faster (Battelle 1987). |
| Sources | [WQA / WQRF](https://wqa.org/resources/softened-water-benefits-studies/); [WQRF/WQA](https://www.wqrf.org/uploads/8/3/5/5/83551838/040511%5Fexecsums%5Ffindings%5Ffinal.pdf); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [Talbert et al. (Battelle Columbus), 1987](https://www.osti.gov/biblio/6046331); [PNNL for U.S. DOE (Widder & Baechler, 2013)](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [U.S. EPA WaterSense](https://www.epa.gov/system/files/documents/2023-08/ws-homes-TRM-9-WaterSoftenersTechSheet.pdf); [PNNL Building America](https://basc.pnnl.gov/resource-guides/water-softeners); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [Rinnai SENSEI installation and operation manual (water quality](https://www.rinnai.us/download/download?filename=SENSEI+Installation+and+Operation+Manual+-+RSC+Models.pdf&path=%2Fs--qweVp3yO--%2Fz3qt1eatwadabriqlg7i.pdf) |

#### Potassium chloride option (for any softener) _(option)_

**Suggested:** Same softener as above, set for potassium chloride. Not a separate product.

| | |
|---|---|
| Treats | same as a salt softener |
| Does NOT treat | same as a salt softener |
| Install | Same equipment as a salt softener, filled with potassium chloride. |
| Installed cost | $1,200–$3,800 (HomeGuide) (estimate) |
| Annual upkeep | Potassium chloride $50–$70 per 40 lb bag vs $5–$10 for salt (Angi); 3–5 times the cost and 15–30% less efficient (Univ. of Minnesota), so roughly $300–$600 a year at typical hardness (our estimate) |
| Cost source | [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [HomeGuide](https://homeguide.com/costs/water-softener-cost) |
| Maintenance | Same as salt; may need more product for the same hardness. |
| Pros | No added sodium |
| Cons | Much more expensive to run; Still discharges brine (chloride) |
| Best fit | Customers on a sodium-restricted diet or who want no sodium added, and who accept 3–5 times the regenerant cost. Often a cheaper route to low-sodium drinking water is a salt softener plus RO at the kitchen sink. |
| Sources | [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm) |

#### Twin-tank metered softener

**Suggested:** Kinetico (non-electric twin, dealer network only) or Clack WS1 twin alternating (independent dealers). PLACEHOLDER until supplier pricing.

| | |
|---|---|
| Treats | removes hardness 24/7 (one tank always in service); prevents scale and spotting; low levels of iron/manganese |
| Does NOT treat | bacteria, PFAS, lead, nitrate, arsenic |
| Install | Two resin tanks and one brine tank at the main line; drain needed; some models need no outlet. |
| Installed cost | About 30% more than a single-tank softener (Univ. of Minnesota); single tanks are $1,200–$3,800 installed (HomeGuide), so roughly $1,600–$5,000 (estimate). Dealer-network brands run higher (Kinetico installed median about $5,500 per an aggregator). (estimate) |
| Annual upkeep | Up to 30% less salt than a single tank (Univ. of Minnesota): roughly $40–$110 salt a year (estimate) |
| Cost source | [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [HomeGuide](https://homeguide.com/costs/water-softener-cost); [TapWaterData](https://www.tapwaterdata.com/water-softener-cost/brands) |
| Maintenance | Same as a single softener: salt monthly, brine tank cleaning every 5–10 years. |
| Pros | Soft water around the clock, no reserve needed; Most salt- and water-efficient softener design; Best for very hard water and large households |
| Cons | Highest upfront cost; Still salt, brine discharge and a drain |
| Best fit | Very hard water (about 17+ gpg) or large families, especially well homes with iron/manganese up to a few mg/L. |
| Certifications | NSF/ANSI 44. |
| Sources | [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [PNNL Building America](https://basc.pnnl.gov/resource-guides/water-softeners) |

### Shower

#### Shower filter (vitamin C or KDF) _(niche)_

| | |
|---|---|
| Treats | free chlorine (vitamin C neutralizes it; KDF reduces it) |
| Does NOT treat | chloramine (not covered by NSF/ANSI 177; vitamin C claims are not certified); hardness/scale (despite some marketing); PFAS, lead, bacteria |
| Install | Screws onto the shower arm; DIY. |
| Installed cost | $30–$150 (estimate) |
| Annual upkeep | $30–$100 in cartridges |
| Cost source | Our rough estimate; get a supplier quote |
| Maintenance | Replace cartridge about every 6 months or per gallons. |
| Pros | Cheap, renter-friendly |
| Cons | Only one shower; Redundant if the home has whole-house carbon |
| Best fit | Only as an add-on to RO at the sink for homes with no whole-house carbon (chlorine odor in the shower), and for renters. |
| Certifications | NSF/ANSI 177 (free available chlorine only). |
| Sources | [NSF](https://www.nsf.org/water-systems/water-filtration/nsf-ansi-177-shower-filter-certification) |

### Service

#### Water heater anode rod swap

| | |
|---|---|
| Treats | rotten-egg smell in hot water only; tank corrosion protection (the main thing that ends a tank heater's life), especially with softened water |
| Does NOT treat | smell in cold water (that points to the well water itself) |
| Install | Replace the magnesium anode with an aluminum/zinc or powered anode. |
| Installed cost | $150–$350 by a plumber, $20–$50 for the part (HomeGuide); powered anode about $180 list (Corro-Protec) plus labor (estimate) |
| Annual upkeep | $0 (powered anode uses a little electricity) |
| Cost source | [HomeGuide](https://homeguide.com/costs/water-heater-repair-cost); [Corro-Protec powered anode rod, list price](https://www.corroprotec.com/product/water-heater-anode-rod/?sku=96382) |
| Maintenance | Inspect sacrificial anodes every 3–4 years (DOE), or every 1–2 years with softened water (PNNL); powered anodes are not consumed. |
| Pros | Cheap fix for hot-water-only odor |
| Cons | Removing the rod entirely can void the heater warranty |
| Best fit | Rotten-egg smell only from hot taps. |
| Sources | [Penn State Extension](https://extension.psu.edu/hydrogen-sulfide-rotten-egg-odor-in-water-wells); [Penn State Extension](https://extension.psu.edu/common-drinking-water-problems-and-solutions); [PNNL for U.S. DOE (Widder & Baechler, 2013)](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf); [U.S. DOE Energy Saver](https://web.archive.org/web/20210517180105/https://www.energy.gov/energysaver/water-heating/storage-water-heaters); [HomeGuide](https://homeguide.com/costs/water-heater-repair-cost) |

## Salt-free vs. softener (honest comparison)

> We sell both. Use these lines when TAC is the right pick for the home, not to talk someone out of a softener that fits better.

| | Salt-free (TAC/NAC) | Salt or potassium softener |
|---|---|---|
| Removes hardness minerals | No. Minerals stay in the water. | Yes. |
| Reduces scale in water heater and pipes | Yes in lab tests: more than 88% less scale than untreated water (ASU 2011, publicly funded; 21-day tests). Certifiable to DVGW W512 (80%+) or IAPMO Z601 (70%+). | Yes, essentially all of it (Virginia Tech 2021); gas and tankless heaters kept their efficiency (Battelle 2009, industry-funded). |
| Spots on glass and fixtures | Still happen (minerals dry on surfaces), though scale wipes off more easily. | Largely eliminated. |
| Soap lather / feel | Like your current water. No slippery feel. | Rich lather; slippery 'soft water' feel some people dislike. |
| Salt or potassium | None. | Salt $50–$150 a year (HomeGuide); potassium 3–5 times more (Univ. of Minnesota). |
| Brine discharge | None. | Yes: chloride-rich backwash to septic or sewer. |
| Power and drain | Many models need neither. | Needs both. |
| Added sodium | None. | Adds sodium (or potassium). |
| Keeps calcium and magnesium | Yes. | No. |
| Iron/manganese/sulfur tolerance | Low: needs pretreatment above ~0.3 mg/L iron, 0.05 mg/L manganese, any H2S. | Handles low iron/manganese. |
| Installed cost (national estimate) | $800–$4,000 (Angi); $1,500–$4,500 (HomeGuide) | $1,200–$3,800 (HomeGuide); average about $1,500 (Angi) |
| Water heater life claims | Not measured. Scale reduction is measured; heater life and efficiency are not. Say 'reduces scale buildup'. | Efficiency kept in an industry-funded accelerated test; heater life itself is projected, not measured, and softened water wears the anode faster. |
| Water heater anode | No change. | Wears faster; inspect every 1–2 years or fit a powered anode (PNNL 2013). |
| Regeneration water | None. | Yes; NSF/ANSI 44 efficiency rating allows up to 5 gallons per 1,000 grains removed (EPA WaterSense). |

**Sell lines we can stand behind**

- "Reduces scale buildup in your water heater and pipes, with no salt, no brine and no electricity." (ASU 2011 TAC result; use the model's own DVGW W512 or IAPMO Z601 certificate if it has one)
- "In an independent Arizona State University study funded by water agencies, this type of system cut scale in a water-heater test by more than 88% compared with untreated water." (say 'this type of system': ASU tested one TAC product)
- "Keeps calcium and magnesium in your water and adds no sodium." (true by design)
- "No wastewater and no brine going into your septic system or the sewer." (true by design)
- "Scale is what robs gas and tankless water heaters of efficiency; cutting scale helps protect it." (general link measured by Battelle; don't attach a percentage to TAC)
- "Low upkeep: no salt bags; replace the media every few years." (state the model's interval)
- Always say: "It doesn't remove hardness, so you may still see some spots on glass and shower doors. It isn't a softener."

**Claims to avoid**

- "Softens your water" or "salt-free softener" without saying it leaves the hardness in.
- "Extends/doubles your water heater's life" or "adds X years": no study has measured heater life for TAC (or for any treatment).
- Quoting Battelle's "15-year", "24%" or "48%" figures for TAC: Battelle tested softened water only, and those numbers are projections.
- "Saves X% on your energy bill."
- "Removes contaminants" or "healthier water" (TAC removes nothing).
- "Works on any water": TAC needs low iron, manganese, copper and no hydrogen sulfide, about 30 gpg or less, on the cold line.
- "Dissolves existing scale" (not measured in the independent tests).
- "DOE-endorsed" or citing the 1998 FEMP alert for electronic/magnetic descalers (FEMP called its evidence mainly anecdotal and covered commercial boilers and cooling towers).
- "Magnetic/electronic descalers work like softeners or TAC" (0–50% in controlled tests).
- Running down softeners as outdated or unhealthy: modern metered softeners are the best fit for very hard water and iron.

**Pennsylvania angle:** Pennsylvania on-lot septic design rules already include water-softener flow in septic tank sizing (25 Pa. Code § 73.31), so softeners are allowed with septic systems. We did not find a statewide Pennsylvania ban on softener discharge. A WQRF-funded Virginia Tech study found efficiently run softeners don't hurt septic tank performance, while inefficient ones (excess salt) can impair settling; chloride passes through septic systems to groundwater (Univ. of Minnesota). So 'no brine discharge' is a fair environmental point, but don't claim softeners damage septic systems. Check the local sewer authority or township before claiming any local restriction. Many PA wells have iron or manganese (Penn State), which salt-free media can't tolerate without pretreatment. ([25 Pa. Code § 73.31](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/025/chapter73/s73.31.html); [WQRF](https://www.wqrf.org/softeners-septics.html); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [Penn State Extension](https://extension.psu.edu/iron-and-manganese-in-private-water-systems))

## Hard water options in depth

| Option | Verdict | Scale reduction evidence | Installed (estimate) | Annual (estimate) | Sources |
|---|---|---|---|---|---|
| Salt softener, single tank, metered | Proven: removes hardness; the reference standard | ~100% (VT 2021); efficiency kept in gas/tankless heaters (Battelle 2009) | $1,200–$3,800 (HomeGuide); avg about $1,500 (Angi) | $50–$150 salt (HomeGuide) + regeneration water | [HomeGuide](https://homeguide.com/costs/water-softener-cost); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [WQRF/WQA](https://www.wqrf.org/uploads/8/3/5/5/83551838/040511%5Fexecsums%5Ffindings%5Ffinal.pdf); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/) |
| Twin-tank metered softener | Proven; continuous soft water, more efficient | Same as single tank | $1,700–$5,000 (HomeGuide); about 30% more than single tank (UMN) | Up to 30% less salt and 15% less water than single tank (UMN) | [HomeGuide](https://homeguide.com/costs/water-softener-cost); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening) |
| Potassium chloride softener | Proven; same performance, much higher running cost | Same as salt softener | Same as salt softener | KCl $50–$70/40 lb (Angi), 3–5x salt and 15–30% less efficient (UMN): roughly $300–$600/yr (estimate) | [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening) |
| TAC / NAC salt-free conditioner | Good lab evidence for scale reduction; no heater-life or efficiency data | >88% (ASU 2011, 21-day tests); certifiable DVGW W512 80% / IAPMO Z601 70% | $800–$4,000 (Angi); $1,500–$4,500 (HomeGuide) | No salt/water/power; media about every 3 years + prefilter; ASU vendor O&M $0–$80/yr (2012) | [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [WC&P](https://wcponline.com/2014/10/14/new-standard-evaluation-scale-control-equipment/); [Working Pressure Magazine (IAPMO)](https://www.workingpressuremag.com/scale-reduction-product-standards/); [Watts OneFlow OF948/OF1054 specification sheet (TAC feed-water limits, media life)](https://watts-oneflow.com/wp-content/uploads/2021/06/OneFlow-OF948-OF1054-TS-IT-W-UK-05-21-Rev7.pdf); [Angi](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm); [HomeGuide](https://homeguide.com/costs/water-softener-cost) |
| Filtersorb SP3 (NAC media) | Same category as TAC; evidence is maker-supplied DVGW W512 results | Maker reports DVGW W512 effectiveness factor above 0.98 (ask for the report) | Similar to TAC systems; dealer quote (PLACEHOLDER) | Media life 5–7 years (maker claim) | [Watch-Water](https://www.watchwater.de/wp-content/uploads/2025/04/Product-Specification-Filtersorb-SP3.pdf) |
| Citric-acid / chelation cartridge (e.g., NuvoH2O) | Moderate; independent result about half the maker's | 98% in maker-funded Battelle 2012 tankless test; 47% (standard water) / 73% (well water) in VT 2021 | $835–$1,220 list for whole-house units (NuvoH2O store, Nov 2026) | Cartridges $100–$120 about every 6 months: about $200–$240/yr (maker) | [NuvoH2O Efficacy and Consumer Benefits Study (Battelle 2012, funded by NuvoH2O)](https://images.thdstatic.com/catalog/pdfImages/a3/a363be6e-9cb8-4664-8c09-b3c881ef2c2d.pdf); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening); [NuvoH2O online store list prices (checked Nov 15, 2026)](https://nuvoh2o.com/) |
| Polyphosphate / Siliphos cartridge | Works for light duty; weaker in hot water | Reduced heater scale (Battelle 1986); 54% / 80% (VT 2021) | $50–$300 (our estimate; housing $30–$50 retail) | $50–$300 in cartridges (retail estimate) | [Talbert et al. (Battelle Columbus), ASHRAE Trans. 92](https://www.osti.gov/biblio/6457988); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [NACE Corrosion 1985](https://doi.org/10.5006/c1985-85250); [Retail polyphosphate scale-inhibitor cartridges (e.g., MyAquaFilter SCALE10)](https://myaquafilter.com/product/scale-corrosion-inhibitor-water-filter-cartridge-10%e2%80%b3-x-2-5%e2%80%b3-food-grade-polyphosphate-media-sku-scale10/) |
| Electronic wrap-around descaler | Weak and inconsistent: 0–50% in controlled tests | ~50% (ASU 2011); 4–16% (VT 2021); no clear benefit (CERL 2001, NACE 1985) | $200–$600 (Angi) | About $5–$15 electricity (estimate) | [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [U.S. Army ERDC/CERL TR-01-63 (2001)](https://www.ideals.illinois.edu/items/123531); [NACE Corrosion 1985](https://doi.org/10.5006/c1985-85250); [U.S. DOE FEMP Federal Technology Alert DOE/EE-0162 (1998)](https://www.enecon.com/pdfs/Federal_Technology_Report.pdf); [PNNL for U.S. DOE (Widder & Baechler, 2013)](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf) |
| Magnetic clamp-on | Not supported | None (LLNL 1996, CERL 2001); 5–28% (VT 2021); South African tests ranged from 70% less to 70% more scale | $200–$600 (Angi, "magnetic") | $0 | [Krauter et al., Lawrence Livermore National Laboratory (1996)](https://www.osti.gov/biblio/567404); [U.S. Army ERDC/CERL TR-01-63 (2001)](https://www.ideals.illinois.edu/items/123531); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [Water Research Commission (South Africa) report 836/1/02 (Coetzee et al.)](https://www.wrc.org.za/wp-content/uploads/mdocs/836-1-02.pdf); [Univ. of Nebraska-Lincoln Extension G2275](https://extensionpubs.unl.edu/publication/g2275/2026/pdf/view/g2275-2026.pdf) |
| Electrolytic (EIP) and zinc-galvanic units | Partial: about 50% for EIP; galvanic zinc inconsistent in real water | EIP ~50% (ASU 2011); zinc 77% in clean lab water, 19–80% in field tanks (WRC South Africa) | EIP $850–$4,150, avg $2,375 (ASU vendor quotes, 2012); galvanic: PLACEHOLDER | EIP avg $194/yr (ASU, 2012) | [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Water Research Commission (South Africa) report 836/1/02 (Coetzee et al.)](https://www.wrc.org.za/wp-content/uploads/mdocs/836-1-02.pdf); [Coetzee et al., Water SA 24(1), 1998](https://www.wrc.org.za/water-sa-article/scale-reduction-and-scale-modification-effects-induced-by-zinc-and-other-metal-species-in-physical-water-treatment/); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening) |
| RO / DI (comparison only) | Removes hardness at the treated tap; not a water-heater solution unless whole-house | Removes minerals | Sink RO $300–$1,000; whole-house RO $4,800–$10,000 (HomeGuide) | Sink RO $60–$150; whole-house RO wastes up to 4+ gal per gal (UMN) | [HomeGuide](https://homeguide.com/costs/water-softener-cost); [HomeGuide](https://homeguide.com/costs/water-filtration-system-cost); [Univ. of Minnesota Water Resources Center](https://wrc.umn.edu/residentialsoftening) |
| Water heater care: flushing, anode, powered anode | Proven, cheap; corrosion protection is what most directly protects tank life | Flushing limits sediment and efficiency loss (PNNL citing Battelle) | Pro flush $75–$250; anode $150–$350 (HomeGuide); powered anode about $180 + labor | DIY flush $0 | [U.S. DOE Energy Saver](https://web.archive.org/web/20210517180105/https://www.energy.gov/energysaver/water-heating/storage-water-heaters); [PNNL for U.S. DOE (Widder & Baechler, 2013)](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf); [HomeGuide](https://homeguide.com/costs/water-heater-repair-cost); [Corro-Protec powered anode rod, list price](https://www.corroprotec.com/product/water-heater-anode-rod/?sku=96382) |

**Does it extend water heater life?** Less scale keeps gas and tankless heaters more efficient and keeps tankless heaters from clogging. No study we found measured how many years any treatment adds to a water heater's life; life claims are projections. For tank heaters, corrosion (anode depletion) is what usually ends their life, and softened water speeds that up unless the anode is maintained.

Measured:

- Battelle 2009 (WQRF-funded, 30 heaters, 90-day accelerated test about 1.25–2.25 years of use, 26 gpg well water): gas tank efficiency 70.4% to 67.4% on hard water vs unchanged on softened; tankless 80% to 72%, delimed at 1.6 years; electric no change; scale 528 vs 7 g/yr (gas) and 907 vs 14 g/yr (electric).
- Battelle Columbus 1986–87 (ASHRAE Trans.): 60 lb scale (about 20 years equivalent) cut gas efficiency about 5% and made electric elements fail periodically; 130 lb (about 50 years) cut 12 points and cracked a weld; softened water consumed magnesium anodes much faster.
- ASU 2011 (publicly funded): TAC more than 88% less scale; electromagnetic and electrolytic about 50% (soft scale).
- Virginia Tech 2021 (WQRF + Spring Point): softener about 100%; phosphate and citric media about 50%; magnet 5% and electric-field generator 4% (28% and 16% in well water).
- CERL 2001, LLNL 1996, NACE 1985: magnetic/electronic devices showed no significant scale benefit.

Extrapolated:

- 'Maintained factory efficiency over a 15-year lifetime' and 'up to 24%' (30 gpg, 50 gal/day) or 'up to 48%' efficiency loss: equations fitted to about 2 years of accelerated data.
- 'Element life can be expected to shorten' (Battelle): expected, not measured.
- Any heater-life or energy-saving claim for TAC, citric, electronic or magnetic devices: only scale mass in short tests was measured.

By heater type: tankless: Hard water does the most harm here (PNNL: under 2 years in extremely hard water without deliming). Treat the water; softening has the best evidence; TAC within the maker's limits. Gas tank: Scale costs a few points of efficiency over years; flush yearly; treatment optional; if softening, maintain the anode. Electric tank: No efficiency loss measured; elements can fail; flush yearly, lower-watt-density elements; softening not required for the heater (PNNL). WQRF says it is repeating the Battelle study starting in 2026. ([WQRF/WQA](https://www.wqrf.org/uploads/8/3/5/5/83551838/040511%5Fexecsums%5Ffindings%5Ffinal.pdf); [Talbert et al. (Battelle Columbus), ASHRAE Trans. 92](https://www.osti.gov/biblio/6457988); [Talbert et al. (Battelle Columbus), 1987](https://www.osti.gov/biblio/6046331); [Fox et al., Arizona State Univ./HDR (2011)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/); [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/); [U.S. Army ERDC/CERL TR-01-63 (2001)](https://www.ideals.illinois.edu/items/123531); [Krauter et al., Lawrence Livermore National Laboratory (1996)](https://www.osti.gov/biblio/567404); [NACE Corrosion 1985](https://doi.org/10.5006/c1985-85250); [PNNL for U.S. DOE (Widder & Baechler, 2013)](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf); [WQRF](https://www.wqrf.org/hardness.html))

**Illustrative 10-year cost of ownership (estimates, undiscounted, today's prices)**

| Hardness (gpg) | Salt softener | Potassium softener | TAC | Electronic | Maintenance only |
|---|---|---|---|---|---|
| 8 | $3,500 | $6,009 | $4,100 | $480 | $1,750 |
| 12 | $3,850 | $7,614 | $4,100 | $480 | $1,750 |
| 20 | $4,550 | $10,823 | $4,100 | $480 | $1,750 |

Assumptions: householdGallonsPerDay = 250; hardnessGpg = 8, 12 or 20 (PLACEHOLDER: use the customer's test); saltPer40lb = 7.5; kclPer40lb = 50; softenerGrainsPerLbSalt = 4000; kclExtraProduct = 25%; regenGallonsPer1000Grains = 3.5; waterAndSewerPerGallon = 0.014; softenerElectricityPerYear = 5; softenerProServicePerYear = 100; softenerInstalled = 1500; extraAnodeFromSoftWater = 250; tacInstalled = 2000; tacMediaReplacement = 500 (PLACEHOLDER) x 3 (every 3 years); tacPrefilterPerYear = 60; electronicInstalled = 400; electronicElectricityPerYear = 8; maintenanceOnlyProFlushPerYear = 150. ASU's 2012-dollar 10-year life-cycle averages (vendor quotes, 300 gal/day, 3% discount): TAC $1,326, ion exchange $3,478, magnetic $855, electrically induced precipitation $4,151. Not included: water-heater energy savings (projected, not measured for TAC/electronic), yearly flushing (recommended for every option), plumbing changes, local rates. Electronic is cheapest but has the weakest evidence.

## Recommendation matrix (concern → solution)

| Concern | Report concern codes / finding IDs | Primary | Alternatives | Typical bundle |
|---|---|---|---|---|
| Hard water and scale | `hardness` (hardness, hardness-unknown, sym-hardness) | Salt-free conditioner (TAC / NAC) | High-efficiency metered softener (salt or potassium); Twin-tank metered softener; Combined whole-house carbon + salt-free conditioner; Polyphosphate / sequestering cartridge | Whole-house sediment filter + Salt-free conditioner (TAC / NAC) |
| PFAS and chemicals | `pfas` (pfas) | Reverse osmosis (RO) at the kitchen sink, with remineralization | Under-sink carbon block filter (certified); Whole-house PFAS media (PFAS-rated carbon or anion exchange); Whole-house carbon / catalytic carbon | Reverse osmosis (RO) at the kitchen sink, with remineralization + Whole-house carbon / catalytic carbon. Add a shower filter only if there is no whole-house carbon. |
| Chlorine taste and byproducts | `chlorine_dbp` (disinfectant, sym-chlorine) | Whole-house carbon / catalytic carbon | Under-sink carbon block filter (certified); Reverse osmosis (RO) at the kitchen sink, with remineralization; Shower filter (vitamin C or KDF) | Reverse osmosis (RO) at the kitchen sink, with remineralization + Whole-house carbon / catalytic carbon. Add a shower filter only if there is no whole-house carbon. |
| Bacteria in well water | `bacteria` (E.Coli, TotalColiform) | UV disinfection | Well chlorination (shock and continuous feed) | Whole-house sediment filter + UV disinfection |
| Iron, manganese and rotten-egg smell | `iron_manganese` (Iron, Manganese, sym-iron, sym-manganese)<br>`sulfur` (sym-sulfur) | Air-injection oxidizing filter (iron, manganese, sulfur) | Greensand / manganese-oxide filter; Birm filter; Well chlorination (shock and continuous feed); Whole-house carbon / catalytic carbon; Water heater anode rod swap | Air-injection oxidizing filter (iron, manganese, sulfur) |
| Acidic / corrosive water | `low_ph` (pH, CorrosivityIndex, Copper, sym-corrosion) | Acid neutralizer (calcite / corosex) | Well chlorination (shock and continuous feed) | Acid neutralizer (calcite / corosex) |
| Lead | `lead` (lead90, Lead-1stdraw, home-plumbing) | Reverse osmosis (RO) at the kitchen sink, with remineralization | Under-sink carbon block filter (certified); Pitcher or countertop filter; Acid neutralizer (calcite / corosex) | Reverse osmosis (RO) at the kitchen sink, with remineralization |
| Health-based violation on record | `health_violation` (hb-violation) | Reverse osmosis (RO) at the kitchen sink, with remineralization | Under-sink carbon block filter (certified); Whole-house carbon / catalytic carbon | Reverse osmosis (RO) at the kitchen sink, with remineralization |
| Nitrate, arsenic and dissolved salts | `nitrate` (Nitrate+NitriteN)<br>`arsenic` (Arsenic)<br>`tds_salt` (TotalDissolvedSolids, Chloride) | Reverse osmosis (RO) at the kitchen sink, with remineralization | Arsenic or nitrate treatment (usually RO at the tap) | Reverse osmosis (RO) at the kitchen sink, with remineralization |
| Cloudy water / sediment | `sediment` (sym-cloudy) | Whole-house sediment filter | Air-injection oxidizing filter (iron, manganese, sulfur) | Whole-house sediment filter |
| Peace of mind and better taste | `general` (none) | Under-sink carbon block filter (certified) | Reverse osmosis (RO) at the kitchen sink, with remineralization; Salt-free conditioner (TAC / NAC); Whole-house carbon / catalytic carbon | Under-sink carbon block filter (certified) |

Rules applied in `recommend.js`: bundles that share a primary product merge into one card ("also covers"); a shower filter is only suggested when there is no whole-house carbon; existing equipment (from intake) turns a pitch into a service check; renters get no-install options; septic + hard water adds the no-brine point; hard water is matched per home by `pickHardness()`: twin-tank softener over ~17.5 gpg typical hardness, softener over ~10.5 gpg, with iron/manganese symptoms, a tankless heater (unless hardness is known to be under 200 mg/L) or a skin/feel goal; otherwise salt-free (TAC); TAC is never offered over ~30 gpg; septic adds the brine note either way; dropped products are hidden from the catalog and rejected in orders.

## Intake questions (optional, after the initial report)

| Question | Options | Why we ask |
|---|---|---|
| Do you notice any of these? | Spots or white scale on fixtures or glass; White crust on showerheads or kettle; Rust/orange stains; Black or brown stains; Blue-green stains; Rotten-egg smell; Chlorine/pool taste or smell; Cloudy water; Metallic taste; Dry skin or hair; Water heater or appliances wearing out early; None of these | Symptoms point to problems federal data never covers (hardness, iron, sulfur, corrosion). |
| Is the rotten-egg smell only from hot water? (only if symptoms = egg) | Only hot water; Hot and cold; Not sure | Hot-water-only odor usually means the water heater anode rod, not the water (Penn State). |
| When was your home built? | Before 1950; 1950–1985; 1986 or later; Not sure | Lead solder was banned in 1986; the oldest homes are the most likely to have lead service lines. |
| Do you have a septic system? (only if source = well) | Yes; No, public sewer; Not sure | Septic systems near wells are a common source of bacteria and nitrate, and they affect softener choice (brine discharge). |
| Any water treatment already in place? | None; Water softener; Whole-house filter; Sink filter or pitcher; Reverse osmosis; UV light; Not sure | So we don't recommend what you already have, and can suggest service instead. |
| What kind of water heater do you have? | Tank (gas or electric); Tankless / on-demand; Boiler or indirect tank; Not sure | Tankless heaters have hardness limits in their warranties (Rinnai: 200 mg/L), which can make a softener the better pick than salt-free. |
| Is anyone at home possibly more sensitive to water quality? | A baby, or someone mixing formula; Someone who is pregnant; An older adult; Someone with a weakened immune system; Prefer not to say | EPA notes infants (nitrate), children and pregnancy (lead), and people with weakened immune systems (germs) can be more vulnerable. |
| What matters most to you? | Safer drinking water; Better taste and smell; Protect pipes and appliances; Skin and hair; All of these | Orders our recommendations around what you care about. |
| Do you own or rent? | Own; Rent | Renters get options that need no permanent install. |

Considered, not implemented:

- Number of people and bathrooms (needed for sizing, better asked at the consult)
- How long you've lived in the home / recent well work (useful, but rarely changes the first recommendation)
- Budget range (felt pushy before showing results)
- Whether you drink tap water or bottled (overlaps with the goal question)
- Water pressure problems (needs an on-site look)
- Recent flooding near the well (rare; covered at the consult for well homes)

## Sources

- [HomeGuide: How much does a home water filtration system cost? (2026)](https://homeguide.com/costs/water-filtration-system-cost)
- [HomeGuide: Well water filtration system cost (Apr 24, 2026)](https://homeguide.com/costs/well-water-filtration-system-cost)
- [Angi: Water softener installation cost (updated Oct 29, 2026)](https://www.angi.com/articles/how-much-does-water-softener-installation-cost.htm)
- [WateReuse Research Foundation project 08-06 (Arizona State Univ.): Evaluation of Alternatives to Domestic Ion Exchange Water Softeners](https://watereuse.org/watereuse-research/08-06-evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/)
- [WQA / WQRF: Softened Water Benefits Study (Battelle, industry-funded)](https://wqa.org/resources/softened-water-benefits-studies/)
- [Univ. of Nebraska-Lincoln Extension G2275: Salt-Free Water 'Softener' Options](https://extensionpubs.unl.edu/publication/g2275/2026/pdf/view/g2275-2026.pdf)
- [Working Pressure Magazine (IAPMO): Scale reduction product standards, IAPMO/ANSI Z601](https://www.workingpressuremag.com/scale-reduction-product-standards/)
- [WC&P: A new standard for evaluation of scale control equipment (DVGW W512 explained)](https://wcponline.com/2014/10/14/new-standard-evaluation-scale-control-equipment/)
- [WaterWorld / WQA: Sorting out scale prevention](https://www.waterworld.com/residential-commercial/article/14308129/water-quality-association-sorting-out-scale-prevention)
- [Penn State Extension: Common drinking water problems and solutions](https://extension.psu.edu/common-drinking-water-problems-and-solutions)
- [Penn State Extension: Hydrogen sulfide (rotten egg odor) in water wells](https://extension.psu.edu/hydrogen-sulfide-rotten-egg-odor-in-water-wells)
- [Penn State Extension: Coliform bacteria](https://extension.psu.edu/coliform-bacteria)
- [Penn State Extension: Iron and manganese in private water systems](https://extension.psu.edu/iron-and-manganese-in-private-water-systems)
- [U.S. EPA: Identifying drinking water filters certified to reduce PFAS](https://www.epa.gov/water-research/identifying-drinking-water-filters-certified-reduce-pfas)
- [U.S. EPA: Basic information about lead in drinking water](https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-lead-drinking-water)
- [NSF: NSF/ANSI 177 shower filter certification (free available chlorine)](https://www.nsf.org/water-systems/water-filtration/nsf-ansi-177-shower-filter-certification)
- [25 Pa. Code § 73.31: Standards for septic tanks (design flow includes water softeners)](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/025/chapter73/s73.31.html)
- [40 CFR 141.154: Required CCR statement on people who may be more vulnerable](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-141/subpart-O/section-141.154)
- [HomeGuide: How much does a water softener cost? (2026)](https://homeguide.com/costs/water-softener-cost)
- [HomeGuide: Water heater repair cost (anode rod, flush)](https://homeguide.com/costs/water-heater-repair-cost)
- [Univ. of Minnesota Water Resources Center: Residential softening (options, salt, septic)](https://wrc.umn.edu/residentialsoftening)
- [U.S. EPA WaterSense: Water softeners technical sheet (NSF/ANSI 44 efficiency rating)](https://www.epa.gov/system/files/documents/2023-08/ws-homes-TRM-9-WaterSoftenersTechSheet.pdf)
- [WQRF/WQA: Softened Water Benefits Study executive summaries (Battelle 2009, WQRF-funded)](https://www.wqrf.org/uploads/8/3/5/5/83551838/040511%5Fexecsums%5Ffindings%5Ffinal.pdf)
- [Talbert et al. (Battelle Columbus), ASHRAE Trans. 92:2B (1986): Effect of hard water scale buildup and water treatment on residential water heater performance](https://www.osti.gov/biblio/6457988)
- [Talbert et al. (Battelle Columbus), 1987: Effect of water quality on residential water-heater life-cycle efficiency, final report](https://www.osti.gov/biblio/6046331)
- [PNNL for U.S. DOE (Widder & Baechler, 2013): Impacts of water quality on residential water heating equipment](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-22921.pdf)
- [Fox et al., Arizona State Univ./HDR (2011): Evaluation of Alternatives to Domestic Ion Exchange Water Softeners, full report (WateReuse 08-06)](https://watereuse.org/download/evaluation-of-alternatives-to-domestic-ion-exchange-water-softeners/)
- [Devine, Wang & Edwards (Virginia Tech), Environ. Eng. Sci. 2021: A standardized test protocol for evaluation of scale reduction technologies (WQRF + Spring Point Partners funded)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8713702/)
- [U.S. Army ERDC/CERL TR-01-63 (2001): Demonstration and evaluation of magnetic descalers](https://www.ideals.illinois.edu/items/123531)
- [Krauter et al., Lawrence Livermore National Laboratory (1996): Test of a magnetic device for the amelioration of scale formation](https://www.osti.gov/biblio/567404)
- [NACE Corrosion 1985: Tests of non-chemical scale control devices in a once-through system](https://doi.org/10.5006/c1985-85250)
- [U.S. DOE FEMP Federal Technology Alert DOE/EE-0162 (1998): Non-chemical technologies for scale and hardness control](https://www.enecon.com/pdfs/Federal_Technology_Report.pdf)
- [Water Research Commission (South Africa) report 836/1/02 (Coetzee et al.): Evaluation and development of physical water treatment for the reduction of CaCO3 scale](https://www.wrc.org.za/wp-content/uploads/mdocs/836-1-02.pdf)
- [Coetzee et al., Water SA 24(1), 1998: Scale reduction and modification effects induced by zinc in physical water treatment](https://www.wrc.org.za/water-sa-article/scale-reduction-and-scale-modification-effects-induced-by-zinc-and-other-metal-species-in-physical-water-treatment/)
- [U.S. DOE Energy Saver: Storage water heaters, maintenance (archived May 2021)](https://web.archive.org/web/20210517180105/https://www.energy.gov/energysaver/water-heating/storage-water-heaters)
- [WQRF: Water softeners and septic systems (Virginia Tech study)](https://www.wqrf.org/softeners-septics.html)
- [WQRF: Water hardness (notes the Battelle study is being repeated starting 2026)](https://www.wqrf.org/hardness.html)
- [Watts OneFlow OF948/OF1054 specification sheet (TAC feed-water limits, media life)](https://watts-oneflow.com/wp-content/uploads/2021/06/OneFlow-OF948-OF1054-TS-IT-W-UK-05-21-Rev7.pdf)
- [Watch-Water: Filtersorb SP3 product specification](https://www.watchwater.de/wp-content/uploads/2025/04/Product-Specification-Filtersorb-SP3.pdf)
- [NuvoH2O Efficacy and Consumer Benefits Study (Battelle 2012, funded by NuvoH2O)](https://images.thdstatic.com/catalog/pdfImages/a3/a363be6e-9cb8-4664-8c09-b3c881ef2c2d.pdf)
- [NuvoH2O online store list prices (checked Nov 15, 2026)](https://nuvoh2o.com/)
- [Corro-Protec powered anode rod, list price](https://www.corroprotec.com/product/water-heater-anode-rod/?sku=96382)
- [Retail polyphosphate scale-inhibitor cartridges (e.g., MyAquaFilter SCALE10)](https://myaquafilter.com/product/scale-corrosion-inhibitor-water-filter-cartridge-10%e2%80%b3-x-2-5%e2%80%b3-food-grade-polyphosphate-media-sku-scale10/)
- [NSF listings: iSpring Water Systems (NSF/ANSI 58 and 372), checked Nov 15 2026](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=iSpring)
- [iSpring: Return policy and 1-year limited warranty](https://www.ispringfilter.com/pages/return-policy)
- [iSpring: 10-year extended warranty (whole-house models)](https://www.ispringfilter.com/collections/extended-warranty/products/whole-house-extended-warranty_839_840_841_842_846_847)
- [iSpring Dealer Network (no franchise fee, no inventory requirement; pricing on request)](https://www.ispringwatersystems.com/)
- [IAPMO R&T listing WC-13976: Waterdrop G3 series RO (NSF/ANSI 58)](https://mirobase.iapmo.org/pld/file_info.asp?file_no=0013976)
- [WQA Gold Seal listing: APEC ROES-50](https://find.wqa.org/find-products/ctl/detail/mid/1054/cid/apec_water_systems/sid/5/keyword/roes-50)
- [Kinetico: K5 Drinking Water Station PFAS data sheet](https://www.kinetico.com/media/ckaht5zr/k5-forever-pure.pdf)
- [Aquasana: HealthShield WH-HS performance data sheet (WQA, NSF/ANSI 53 and 401)](https://www.aquasana.com/on/demandware.static/-/Sites-aquasana-Library/default/PDF/WH-HS_Performance_Data.pdf)
- [Aquasana: product prices (Rhino EQ-1000, HealthShield)](https://www.aquasana.com/water-filter-products/)
- [Pentair: FloPlus Protect 20BB spec sheet (IAPMO, NSF/ANSI 53 PFAS; 40,000 gal at 5 gpm)](https://www.pentair.com/content/dam/extranet/nam/filtration/pentair/spec-sheets/english/4006913-floplus-20bb-spec-sheet.pdf)
- [Mid Atlantic Water: FloPlus Protect 20BB listing ($349)](https://midatlanticwater.net/products/whole-house-pfas-cartridge-filter)
- [Home Depot: Pentair Pelican PC600 listing](https://www.homedepot.com/p/PENTAIR-10-GPM-Whole-House-Carbon-Water-Filtration-System-PC600-P/205423701)
- [Pure Whole House: price change log (SpringWell CF1)](https://purewholehouse.com/price-change-log/)
- [A. O. Smith: HomeShield AOS-HS-1200 whole-house PFAS filter](https://www.aosmith.com/water-treatment/water-filtration/homeshield-whole-house-filter/HomeShield+AOS-HS-1200.html)
- [Patterson et al. 2019, Effectiveness of POU/POE systems to remove PFAS (EPA ORD-funded), AWWA Water Science](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650157/)
- [EPA 2024: Technologies and costs for removing PFAS from drinking water (GAC, IX, RO as BAT)](https://www.epa.gov/system/files/documents/2024-04/2024-pfas-tech-cost_final-508.pdf)
- [Calgon Carbon: CENTAUR 12x40 catalytic carbon data sheet (chloramine, H2S; AWWA B604)](https://www.calgoncarbon.com/app/uploads/DS-CENT12x4015-EIN-E1-1.pdf)
- [Clean Water Store: Centaur 12x40, 1 cu ft ($364.50–$405)](https://www.cleanwaterstore.com/centaur-carbon-12x40-1-cu-ft-box.html)
- [Glass Water Systems: Clack WS1 1.5 cu ft backwashing carbon system ($895–$1,200)](https://www.glasswatersystems.com/clack-ws1--15-cu-ft-carbon-filter-sys115.html)
- [Affordable Water: sizing whole-house carbon for chlorine vs chloramine](https://affordablewater.us/pages/chlorine-chloramine-carbon-filters)
- [NSF listings: VIQUA UV (NSF/ANSI 55 Class A: PRO10/20/30)](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=VIQUA)
- [NSF listings: Kinetico (NSF/ANSI 42 chloramine claims on KPMF cartridges)](https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=Kinetico)
- [PNNL Building America: Water softeners (NSF/ANSI 44 efficiency rating: demand-initiated, ≥3,350 grains/lb salt, ≤5 gal/1,000 grains)](https://basc.pnnl.gov/resource-guides/water-softeners)
- [Univ. of Minnesota Water Resources Center: Residential softening (DIR 26–60% less salt; twin tank up to 30% less)](https://wrc.umn.edu/residentialsoftening)
- [Thomas et al. 2011, Softened Water Eczema Trial (NIHR HTA-funded), PLOS Medicine](https://journals.plos.org/plosmedicine/article?id=10.1371%2Fjournal.pmed.1000395)
- [Rinnai SENSEI installation and operation manual (water quality: hardness up to 200 mg/L)](https://www.rinnai.us/download/download?filename=SENSEI+Installation+and+Operation+Manual+-+RSC+Models.pdf&path=%2Fs--qweVp3yO--%2Fz3qt1eatwadabriqlg7i.pdf)
- [Rinnai SENSEI residential warranty (scale/lime damage excluded)](https://media.rinnai.us/salsify_asset/s-bbf32762-e977-4b7f-a75d-ab8e0be04c5f/100000655_Warranty_SENSEI%20Residential.pdf)
- [Penn State Agricultural Analytical Services Lab: drinking water test packages and fees](https://agsci.psu.edu/aasl/water-testing/drinking-water-testing)
- [Philadelphia Water Department: 2025 Drinking Water Quality Report (hardness by plant)](https://water.phila.gov/drops/2025-drinking-water-quality-report/)
- [Penn State well-water summaries (our data/reference/psu-well-summaries.json)](https://agsci.psu.edu/aasl/water-testing)
- [TapWaterData: softener brand prices (Kinetico, Culligan installed medians; aggregator)](https://www.tapwaterdata.com/water-softener-cost/brands)
- [Professor Aqua: Waterdrop vs APEC vs iSpring prices (Nov 2026)](https://professoraqua.com/waterdrop-vs-apec-vs-ispring/)
