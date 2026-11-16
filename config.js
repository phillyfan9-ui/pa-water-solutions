// Business settings — change these in one place.
module.exports = {
  BUSINESS_NAME: 'PA Water Solutions',
  TIMEZONE: 'America/New_York',
  // Base location: Census geocode of 351 Bridge St, Phoenixville, PA 19460 (downtown Phoenixville),
  // looked up 2026-11-13 via geocoding.geo.census.gov (Public_AR_Current).
  BASE: { label: 'Phoenixville, PA', address: '351 Bridge St, Phoenixville, PA 19460', lat: 40.13353057893, lon: -75.520062716799 },
  SERVICE_RADIUS_MILES: 25,         // free travel & installs within this straight-line radius
  IN_HOME_DEPOSIT: 100,             // USD deposit, credited toward any system bought within CREDIT_WINDOW_DAYS
  // IRS standard business mileage rate: 76 cents/mile for July 1 – Dec 31, 2026 (IR-2026-29,
  // https://www.irs.gov/tax-professionals/standard-mileage-rates). Jan 1 – Jun 30, 2026 was 72.5 cents. Update each period.
  MILEAGE_RATE_PER_MILE: 0.76,
  MILEAGE_RATE_SOURCE: 'IRS standard business mileage rate, July 1 – Dec. 31, 2026 (IR-2026-29)',
  CREDIT_WINDOW_DAYS: 60,           // PLACEHOLDER
  VIRTUAL_MINUTES: '20–30',
  MAX_UPLOAD_MB: 15,
  PREINSTALL_MAX_MB: Number(process.env.PREINSTALL_MAX_MB) || 500,           // per-file limit for pre-install videos/photos (streamed to disk, never buffered)
  PREINSTALL_APPS: ['FaceTime', 'Zoom', 'Google Meet'],

  // ---- Scheduler (PLACEHOLDER availability; one calendar = Jared) ----
  BOOKING_DAYS_AHEAD: 21,
  MIN_NOTICE_HOURS: 12,             // no slots sooner than this
  SLOT_STEP_MINUTES: 30,
  APPOINTMENT: {
    virtual:   { minutes: 30, bufferBefore: 0,  bufferAfter: 0 },
    'in-home': { minutes: 90, bufferBefore: 30, bufferAfter: 30 },   // buffers = travel time
    preinstall: { minutes: 15, bufferBefore: 0, bufferAfter: 0 },     // virtual pre-install check (FaceTime/Zoom/Meet)
  },
  // 0=Sun … 6=Sat, local times "HH:MM" in TIMEZONE. Appointments must fit inside a window; travel buffers may extend past it.
  AVAILABILITY: {
    1: [['17:00', '20:00']], 2: [['17:00', '20:00']], 3: [['17:00', '20:00']], 4: [['17:00', '20:00']], 5: [['17:00', '20:00']],
    6: [['09:00', '15:00']],
  },
  BLACKOUT_DATES: [],

  // ---- Water-source detection confidence (intake step) ----
  BOUNDARY_NEAR_METERS: 300,        // within this distance of a service-area edge (or of a mapped system, for wells) => "not sure"
  RURAL_IS_UNSURE: true,            // Census point outside an Urban Area => treat geocode as approximate => "not sure"
  SOURCE_CACHE_MINUTES: 15,         // in-memory lookup cache so intake + report don't hit EPA twice               // e.g. ['2026-11-26'] (YYYY-MM-DD)
};
