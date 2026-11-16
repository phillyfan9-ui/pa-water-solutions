// Where the server writes. Everything writable lives under DATA_DIR (default ./data locally; /data on Fly,
// a mounted volume). Read-only reference data (data/reference, data/solutions.json) ships in the image
// and is always read from the app directory, never from DATA_DIR.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const P = {
  DATA_DIR,
  LEADS_FILE: path.join(DATA_DIR, 'leads.json'),
  BOOKINGS_FILE: path.join(DATA_DIR, 'bookings.json'),
  CONFIRM_FILE: path.join(DATA_DIR, 'source-confirmations.json'),
  UPLOAD_DIR: path.join(DATA_DIR, 'uploads'),
  PREINSTALL_DIR: path.join(DATA_DIR, 'uploads', 'preinstall'),
  REF_DIR: path.join(__dirname, 'data', 'reference'),
  SOLUTIONS_FILE: path.join(__dirname, 'data', 'solutions.json'),
};

// Path relative to DATA_DIR, for storing in lead records (portable between local and Fly).
P.rel = abs => path.relative(DATA_DIR, abs).split(path.sep).join('/');

// Atomic JSON write: write a temp file in the same directory, then rename over the target.
P.writeJSON = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
};

// First boot: create the directories and empty data files the server expects.
P.seed = () => {
  for (const d of [DATA_DIR, P.UPLOAD_DIR, P.PREINSTALL_DIR]) fs.mkdirSync(d, { recursive: true });
  for (const [f, empty] of [[P.LEADS_FILE, []], [P.BOOKINGS_FILE, []], [P.CONFIRM_FILE, {}]]) if (!fs.existsSync(f)) P.writeJSON(f, empty);
  // Clean up temp files left by a crash mid-write.
  for (const f of fs.readdirSync(DATA_DIR)) if (f.endsWith('.tmp')) fs.rmSync(path.join(DATA_DIR, f), { force: true });
};

module.exports = P;
