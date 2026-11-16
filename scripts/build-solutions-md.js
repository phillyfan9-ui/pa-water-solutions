// Generates SOLUTIONS.md from data/solutions.json (single source of truth). Run: node scripts/build-solutions-md.js
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..');
const C = JSON.parse(fs.readFileSync(path.join(root, 'data', 'solutions.json'), 'utf8'));
const INTAKE = require(path.join(root, 'intake.js'));
const S = Object.fromEntries(C.solutions.map(s => [s.id, s]));
const src = ids => (ids || []).map(id => C.meta.sources[id] ? `[${C.meta.sources[id].name.split(':')[0]}](${C.meta.sources[id].url})` : id).join('; ');
const esc = t => String(t || '').replace(/\|/g, '/');
let md = `# ${C.meta.title}\n\nUpdated ${C.meta.updated}. Generated from \`data/solutions.json\` by \`scripts/build-solutions-md.js\`; edit the JSON, not this file.\n\n> ${C.meta.costNote}\n\n> ${C.meta.certNote}\n\n`;
const LIVE = C.solutions.filter(s => s.status !== 'dropped');
const cats = [...new Set(LIVE.map(s => s.category))];
if (C.strategy) {
  md += `## Strategy (v${C.meta.version})\n\n**Rule:** ${C.strategy.rule}\n\n**What changed:** ${C.strategy.change}\n\n`;
  const D = C.softenerVsTac;
  md += `### Softener vs salt-free: decision guide\n\n${D.answer}\n\n| Situation | Pick | Why |\n|---|---|---|\n` + D.rows.map(r => `| ${esc(r.situation)} | ${esc(r.pick)} | ${esc(r.why)} |`).join('\n') + `\n\nSources: ${src(D.sources)}\n\n`;
  const H = C.hardnessTiers;
  md += `### Hard-water tiers by hardness (PA)\n\n${H.note}\n\n| Hardness | PA examples | Good | Better | Best | Note |\n|---|---|---|---|---|---|\n` + H.bands.map(b => `| ${esc(b.band)} | ${esc(b.examples)} | ${esc(b.good)} | ${esc(b.better)} | ${esc(b.best)} | ${esc(b.note)} |`).join('\n') + `\n\nSources: ${src(H.sources)}\n\n`;
  md += `### Good / better / best lineup\n\n| Concern | Good | Better | Best | Note |\n|---|---|---|---|---|\n` + C.lineup.map(l => `| ${esc(l.concern)} | ${esc(l.good)} | ${esc(l.better)} | ${esc(l.best)} | ${esc(l.note)} ${src(l.sources)} |`).join('\n') + '\n\n';
  md += `### Dropped (obsolete or not best-in-range)\n\n` + C.dropped.map(d => `- **${d.item}:** ${d.why}`).join('\n') + `\n\nKept, narrowly:\n\n` + C.kept.map(d => `- **${d.item}:** ${d.why}`).join('\n') + '\n\n';
  const I = C.supplierReview.ispring;
  md += `### iSpring as a supplier\n\n**Verdict:** ${I.verdict}\n\n**Certifications (checked in NSF listings):**\n\n${I.certifications.map(x => '- ' + x).join('\n')}\n\n**Strongest:** ${I.strongest.join('; ')}\n\n**Weakest:** ${I.weakest.join('; ')}\n\n**Warranty/support:** ${I.warranty}\n\n**Reliability:** ${I.reliability}\n\n**Recalls:** ${I.recalls}\n\n**Dealer program:** ${I.dealer}\n\n| Brand | Channel | Certifications | Warranty | Fit |\n|---|---|---|---|---|\n` + I.compare.map(r => `| ${r.brand} | ${esc(r.channel)} | ${esc(r.certs)} | ${esc(r.warranty)} | ${esc(r.fit)} |`).join('\n') + `\n\nSources: ${src(I.sources)}\n\n`;
  const W = C.wholeHouseProviders;
  md += `### Whole-house carbon providers\n\n**Cartridge vs tank:** ${W.cartridgeVsTank}\n\n**PFAS:** ${W.pfas}\n\n**Chloramine:** ${W.chloramine}\n\n**Dealer margins:** ${W.margins}\n\n| Provider | Type | Certifications | Price | Availability | Verdict |\n|---|---|---|---|---|---|\n` + W.rows.map(r => `| ${esc(r.provider)} | ${esc(r.type)} | ${esc(r.certs)} | ${esc(r.price)} | ${esc(r.availability)} | ${esc(r.verdict)} ${src(r.sources)} |`).join('\n') + '\n\n';
}
md += '## Catalog\n\n';
for (const cat of cats) {
  md += `### ${cat}\n\n`;
  for (const s of LIVE.filter(x => x.category === cat)) {
    md += `#### ${s.name}${s.status && s.status !== 'active' ? ' _(' + s.status + ')_' : ''}\n\n`;
    if (s.suggested) md += `**Suggested:** ${s.suggested}\n\n`;
    if (s.aka) md += `${s.aka}\n\n`;
    if (s.how) md += `**How it works:** ${s.how}\n\n`;
    md += `| | |\n|---|---|\n| Treats | ${esc(s.treats.join('; '))} |\n| Does NOT treat | ${esc(s.doesNotTreat.join('; '))} |\n| Install | ${esc(s.install)} |\n| Installed cost | ${esc(s.cost.installed)}${s.cost.estimate ? ' (estimate)' : ''} |\n| Annual upkeep | ${esc(s.cost.annual)} |\n| Cost source | ${s.cost.sources?.length ? src(s.cost.sources) : 'Our rough estimate; get a supplier quote'} |\n| Maintenance | ${esc(s.maintenance)} |\n| Pros | ${esc((s.pros || []).join('; '))} |\n| Cons | ${esc((s.cons || []).join('; '))} |\n| Best fit | ${esc(s.bestFit)} |\n`;
    if (s.limits) md += `| Feed-water limits | ${esc(s.limits)} |\n`;
    if (s.certifications) md += `| Certifications | ${esc(s.certifications)} |\n`;
    if (s.evidence) md += `| Evidence | ${esc(s.evidence)} |\n`;
    if (s.sources) md += `| Sources | ${src(s.sources)} |\n`;
    md += '\n';
  }
}
md += '## Salt-free vs. softener (honest comparison)\n\n' + (C.saltFreeVsSoftener.framingNote ? '> ' + C.saltFreeVsSoftener.framingNote + '\n\n' : '') + '| | Salt-free (TAC/NAC) | Salt or potassium softener |\n|---|---|---|\n';
for (const r of C.saltFreeVsSoftener.rows) md += `| ${esc(r.topic)} | ${esc(r.saltFree)} | ${esc(r.softener)} |\n`;
md += '\n**Sell lines we can stand behind**\n\n' + C.saltFreeVsSoftener.honestSellLines.map(x => `- ${x}`).join('\n');
md += '\n\n**Claims to avoid**\n\n' + C.saltFreeVsSoftener.avoidClaims.map(x => `- ${x}`).join('\n');
md += `\n\n**Pennsylvania angle:** ${C.saltFreeVsSoftener.paAngle} (${src(C.saltFreeVsSoftener.paSources)})\n\n`;
if (C.hardWaterInDepth) {
  const H = C.hardWaterInDepth;
  md += '## Hard water options in depth\n\n| Option | Verdict | Scale reduction evidence | Installed (estimate) | Annual (estimate) | Sources |\n|---|---|---|---|---|---|\n';
  for (const o of H.options) md += `| ${o.name} | ${esc(o.verdict)} | ${esc(o.scale)} | ${esc(o.installed)} | ${esc(o.annual)} | ${src(o.sources)} |\n`;
  const W = H.waterHeaterLife;
  md += `\n**Does it extend water heater life?** ${W.answer}\n\nMeasured:\n\n${W.proven.map(x => '- ' + x).join('\n')}\n\nExtrapolated:\n\n${W.extrapolated.map(x => '- ' + x).join('\n')}\n\nBy heater type: tankless: ${W.byHeater.tankless} Gas tank: ${W.byHeater.gasTank} Electric tank: ${W.byHeater.electricTank} ${W.note} (${src(W.sources)})\n\n`;
  const T = H.tenYearCost;
  md += `**${T.label}**\n\n| Hardness (gpg) | Salt softener | Potassium softener | TAC | Electronic | Maintenance only |\n|---|---|---|---|---|---|\n`;
  for (const [h, r] of Object.entries(T.results)) md += `| ${h} | $${r.softener.toLocaleString()} | $${r.potassium.toLocaleString()} | $${r.tac.toLocaleString()} | $${r.electronic.toLocaleString()} | $${r.maintenanceOnly.toLocaleString()} |\n`;
  md += `\nAssumptions: ${Object.entries(T.assumptions).map(([k, v]) => k + ' = ' + v).join('; ')}. ${T.asuComparison} ${T.notes}\n\n`;
}
md += '## Recommendation matrix (concern → solution)\n\n| Concern | Report concern codes / finding IDs | Primary | Alternatives | Typical bundle |\n|---|---|---|---|---|\n';
for (const b of C.bundles) md += `| ${b.title} | ${b.concerns.map(c => '`' + c + '` (' + (C.concerns[c].findingIds.join(', ') || 'none') + ')').join('<br>')} | ${S[b.primary].name} | ${b.alternatives.map(a => S[a].name).join('; ')} | ${b.typicalBundle.map(a => S[a].name).join(' + ')}${b.showerRule ? '. ' + b.showerRule : ''} |\n`;
md += '\nRules applied in `recommend.js`: bundles that share a primary product merge into one card ("also covers"); a shower filter is only suggested when there is no whole-house carbon; existing equipment (from intake) turns a pitch into a service check; renters get no-install options; septic + hard water adds the no-brine point; hard water is matched per home by `pickHardness()`: twin-tank softener over ~17.5 gpg typical hardness, softener over ~10.5 gpg, with iron/manganese symptoms, a tankless heater (unless hardness is known to be under 200 mg/L) or a skin/feel goal; otherwise salt-free (TAC); TAC is never offered over ~30 gpg; septic adds the brine note either way; dropped products are hidden from the catalog and rejected in orders.\n\n';
md += '## Intake questions (optional, after the initial report)\n\n| Question | Options | Why we ask |\n|---|---|---|\n';
for (const q of INTAKE.QUESTIONS) md += `| ${q.label}${q.showIf ? ' (only if ' + Object.entries(q.showIf).map(([k, v]) => `${k} = ${v}`).join(', ') + ')' : ''} | ${q.options.map(o => o[1]).join('; ')} | ${esc(q.why)} |\n`;
md += '\nConsidered, not implemented:\n\n' + INTAKE.CONSIDERED.map(x => `- ${x}`).join('\n') + '\n\n## Sources\n\n' + Object.values(C.meta.sources).map(s => `- [${s.name}](${s.url})`).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'SOLUTIONS.md'), md);
console.log('wrote SOLUTIONS.md', md.length, 'chars');
