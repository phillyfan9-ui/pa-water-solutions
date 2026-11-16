# PA Water Solutions: beta

Bare-bones site: address lookup → public water system report **or** "likely private well" → lead form.

## Run
    node server.js            # Node 18+, no npm install needed
    open http://localhost:8080   (PORT env var to change)

## Structure
- `public/index.html`: all screens as <template>s (landing, home/about, public result, well result, not found, lead form)
- `public/app.js`: hash router (`#/`, `#/home`, `#/result?address=...`) and rendering
- `public/styles.css`: blue/teal theme, mobile-first
- `server.js`: static server plus `GET /api/lookup?address=` and `POST /api/lead`
- `data/leads.json`: leads saved here (beta only; not suitable for serverless hosting)

## Flow (v0.2)
Lookup (`#/`) → result (public or well) → "Get a thorough test" (customer orders from a PA DEP-accredited lab) → Upload (`#/upload`) → Book (`#/book`) → Confirmation (`#/booked`).

## Business settings: `config.js`
Base location (Census geocode of 351 Bridge St, Phoenixville, PA 19460), service radius (25 mi), in-home fee ($100),
mileage rate (IRS business rate, $0.76/mi over radius for Jul-Dec 2026), credit window (PLACEHOLDER 60 days), max upload size.
Distance is straight-line (haversine), labeled "approx." Pricing is recomputed on the server when a booking is saved.

## Extra endpoints
- `GET /api/config`, `GET /api/quote?address=`: distance + in-home price
- `POST /api/upload`: JSON with base64 file; saved to `data/uploads/`, lead record added to `data/leads.json`

## Data sources (all free, no API keys)
1. US Census Geocoder: `geocoding.geo.census.gov/geocoder/locations/onelineaddress` (no CORS, so the backend proxies it)
2. EPA Community Water System Service Area Boundaries (ArcGIS, owner EPA):
   `services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Water_System_Boundaries/FeatureServer/0/query` (point-in-polygon)
3. EPA Envirofacts SDWIS: `data.epa.gov/efservice/sdwis.water_system/pwsid/equals/{PWSID}/JSON` (system type CWS, source, population)
4. EPA ECHO: `echodata.epa.gov/echo/dfr_rest_services.get_sdwis_compliance?p_id={PWSID}&output=JSON` (3-year violations by rule)
5. CCR links: Google search for the system name, plus EPA's finder `sdwis.epa.gov/fylccr`

Placeholder copy is marked with a yellow PLACEHOLDER tag in the UI.

## v0.3 additions
- **Instant water report** (`GET /api/report?address=&source=well|public`): `report.js` ranks findings with rules (no LLM).
  LLM hook: set `LLM_PROVIDER` and implement `llmSummarize()` in `report.js`. Facts always come from the rules.
- **Well data**: `data/reference/psu-well-summaries.json`, all 67 PA counties + statewide, from Penn State AASL
  "Drinking Water Test Summaries by County". Refresh: `python3 scripts/fetch-psu-well-data.py`.
- **Public data**: EPA ECHO violations + Envirofacts `sdwis.lcr_sample_result` (lead 90th percentile, PB90).
- **Well/public toggle** on the report lets the user correct EPA's detection.
- **Pricing**: $100 deposit (credited) + travel fee = whole miles over 25 (straight-line) × IRS rate (`config.js`).
- **Scheduler** (`scheduler.js`, `GET /api/slots?type=`, booking via `POST /api/lead`): availability, slot lengths,
  buffers and blackout dates are in `config.js` (PLACEHOLDER). Bookings in `data/bookings.json`; overlaps rejected (409).

## v0.4 — PFAS, 0–100 water score, layered report

**Report order:** 0–100 score dial (top) → "How the score works" → well/public toggle → "What to watch for in your area" (2–4 ranked concerns, each with what it is / why it matters / how it's fixed + CTAs) → "Your water at a glance" gauges → consult CTA, solutions, test-your-home → "Complete data" (collapsible) → disclaimer & sources.

**PFAS (public water):** `data/reference/ucmr5-pa-pfas.json`, built by `scripts/build-ucmr5-pa.py` from EPA UCMR 5 occurrence data (`ucmr5-occurrence-data.zip`, final dataset, samples Jan 2023–Dec 2025). PA subset: 390 systems, 176 with any PFAS detected. Per system: highest sampling-point average (non-detects counted as 0), max, MRL, plus Hazard Index (PFHxS/10 + PFNA/10 + HFPO-DA/10 + PFBS/2000). Systems not in UCMR 5 show "Not sampled". Rebuild: `python3 scripts/build-ucmr5-pa.py`.
EPA MCLs (April 2024 rule, compliance 2029): PFOA 4 ppt, PFOS 4 ppt; PFHxS, PFNA, HFPO-DA 10 ppt; HI 1. EPA's May 2026 proposals to rescind the PFHxS/PFNA/GenX/HI limits and extend PFOA/PFOS compliance are not final.

**Score:** all rules in `score.js` (`RULES.public`, `RULES.well`). Starts at 100 and subtracts listed points; every deduction is shown in the "How the score works" section. Public: health-based violations (5 yrs), unresolved violations, lead 90th percentile >10/>15 ppb, PFOA/PFOS over 4 ppt, other PFAS over limits, repeated monitoring violations. Wells: county-typical score from Penn State exceedance rates ("typical for wells in X County"). It is not a safety rating, not medical advice and not a test of the home.

## v0.5: source confirmation, optional intake, solutions catalog, recommendations

**Flow:** address → report immediately (no gate). Report order: score dial → source line → "What to watch for" → **Recommended for your home** → gauges → **Get a more detailed analysis** → consult CTA → complete data. Desktop: sticky "Top pick" side card. Mobile (≤1100 px): sticky bottom bar.

**Source line + confidence** (`server.js` `detectionFor`, settings in `config.js`): "Showing results for public water (X). On a well? Switch". *Confident* only when the home is inside a utility/state-mapped (not EPA-modeled) service area, more than `BOUNDARY_NEAR_METERS` (300 m) from its edge, in a Census Urban Area, with an exact house-number match, and only one system covers it. Otherwise a non-blocking prompt lists the reasons, preselects the best guess and has a "how to tell" helper. Answers are saved by address in `data/source-confirmations.json` (address, coordinates, answer, detection; no names) for a future well map.

**Optional intake** (`intake.js`): symptoms (+ hot-water-only follow-up for rotten egg), year built, septic (wells), existing treatment, sensitive household (optional), main goal, own/rent. `report.applyIntake` adds symptom concerns worded "your symptoms suggest", merges matches with county data, and adds EPA-language notes. **Answers never change the score.** Answers are attached to leads, bookings and uploads (`intake` field).

**Solutions:** `data/solutions.json` (catalog, concern codes, bundles, salt-free vs softener) → `recommend.js` builds the panel. `SOLUTIONS.md` is generated: `node scripts/build-solutions-md.js`.

## v0.5c: Solutions page, order request, pre-install check

- **Skip to solutions**: there's a fixed pill on the report on desktop, and a "Solutions →" button in the mobile sticky bar. Both go to `#/solutions`.
- **Solutions page** (`#/solutions`): shows "Recommended for your home" from the last report (top pick plus each card's typical setup), followed by the full catalog grouped by category (`GET /api/solutions` serves `data/solutions.json`). Each item has two buttons: "Buy / request this", which adds it to the request, and "Book a free virtual or $100 in-home consult" (`#/book`).
- **Request order** (`#/order`): this is a placeholder checkout and takes no payment. It POSTs `/api/lead` with `type: 'order'` and the products, which the server checks against catalog ids and stores with their estimate ranges, plus `payment.status = 'not_collected'` and the intake. Stripe will be added later.
- **Pre-install check** (`#/preinstall`, right after ordering):
  - (a) **Video/photos (default, recommended)**: the shot checklist depends on what was ordered. RO and other sink systems get the under-sink list (with a tape measure), faucet/countertop and outlet. Whole-house and hard-water systems get main line/shutoff, water heater area, drain and outlet. Pitchers, shower filters and descalers skip the check.
  - Each file is POSTed as a raw body to `/api/preinstall/upload?lead=&name=` and **streamed to disk**, never buffered or base64'd. Allowed types are MP4, MOV, JPG, PNG and HEIC/HEIF. The per-file limit is `PREINSTALL_MAX_MB` (default 500, env override); it's checked against Content-Length and again while bytes stream in, and a partial file is deleted if it goes over.
  - Files go to `data/uploads/preinstall/<orderId>/` and are recorded on the order lead. `POST /api/preinstall/done` adds the optional note.
  - (b) **Live call**: a 15-minute `preinstall` appointment type (`CONFIG.APPOINTMENT.preinstall`) on the built-in calendar, with FaceTime, Zoom or Google Meet (`CONFIG.PREINSTALL_APPS`). It's booked via `/api/lead` with `type: 'preinstall-call'`, returns 409 if the slot is taken, and is saved on the order lead.
- The confirmation (`#/preinstall-done`) says: "We'll review and reach out to schedule your install; we may ask for one more photo."
- Limitations: the pre-install page reads the order from the browser session. There's no emailed "finish your pre-install" link yet, and no notification email is sent to the business.

## Deploy (Fly.io)

All writable data (leads.json, bookings.json, source-confirmations.json, uploads/, uploads/preinstall/) lives under
`DATA_DIR` (default `./data` locally, `/data` on Fly = the `pawater_data` volume). Empty files are seeded on first boot.
Read-only reference data (`data/reference/`, `data/solutions.json`) ships in the image. Health check: `GET /healthz`.

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl auth login
flyctl launch --no-deploy --copy-config --name pa-water-solutions --region iad   # pick another name if taken (and update fly.toml)
flyctl volumes create pawater_data --region iad --size 3                          # one volume = one machine
flyctl deploy --remote-only
flyctl certs add pawatersolutions.com
flyctl certs add www.pawatersolutions.com
flyctl ips list            # A (IPv4) + AAAA (IPv6) for the apex in Squarespace DNS
flyctl certs show pawatersolutions.com   # shows the exact DNS records to add
```

Local check with a separate data dir: `DATA_DIR=/tmp/pawtest PORT=8099 node server.js`.
