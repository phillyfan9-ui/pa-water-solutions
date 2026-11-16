// "Tell us about your home" intake: question definitions + validation.
// Every question except water source is optional. Answers change which concerns we raise and how we
// word recommendations; they never change the 0–100 score (that comes only from public data).
const QUESTIONS = [
  { id: 'symptoms', type: 'multi', label: 'Do you notice any of these?', hint: 'Tap all that apply.', options: [
    ['scale', 'Spots or white scale on fixtures or glass'], ['crust', 'White crust on showerheads or kettle'],
    ['orange', 'Rust/orange stains'], ['black', 'Black or brown stains'], ['bluegreen', 'Blue-green stains'],
    ['egg', 'Rotten-egg smell'], ['chlorine', 'Chlorine/pool taste or smell'], ['cloudy', 'Cloudy water'],
    ['metallic', 'Metallic taste'], ['skin', 'Dry skin or hair'], ['appliances', 'Water heater or appliances wearing out early'],
    ['none', 'None of these']] , why: 'Symptoms point to problems federal data never covers (hardness, iron, sulfur, corrosion).' },
  { id: 'eggHotOnly', type: 'single', showIf: { symptoms: 'egg' }, label: 'Is the rotten-egg smell only from hot water?', options: [['hot', 'Only hot water'], ['both', 'Hot and cold'], ['unsure', 'Not sure']],
    why: 'Hot-water-only odor usually means the water heater anode rod, not the water (Penn State).' },
  { id: 'built', type: 'single', label: 'When was your home built?', options: [['pre1950', 'Before 1950'], ['1950-1985', '1950–1985'], ['1986+', '1986 or later'], ['unsure', 'Not sure']],
    why: 'Lead solder was banned in 1986; the oldest homes are the most likely to have lead service lines.' },
  { id: 'septic', type: 'single', showIf: { source: 'well' }, label: 'Do you have a septic system?', options: [['yes', 'Yes'], ['no', 'No, public sewer'], ['unsure', 'Not sure']],
    why: 'Septic systems near wells are a common source of bacteria and nitrate, and they affect softener choice (brine discharge).' },
  { id: 'treatment', type: 'multi', label: 'Any water treatment already in place?', options: [['none', 'None'], ['softener', 'Water softener'], ['whole', 'Whole-house filter'], ['sink', 'Sink filter or pitcher'], ['ro', 'Reverse osmosis'], ['uv', 'UV light'], ['unsure', 'Not sure']],
    why: "So we don't recommend what you already have, and can suggest service instead." },
  { id: 'heater', type: 'single', optional: true, label: 'What kind of water heater do you have?', options: [['tank', 'Tank (gas or electric)'], ['tankless', 'Tankless / on-demand'], ['boiler', 'Boiler or indirect tank'], ['unsure', 'Not sure']],
    why: 'Tankless heaters have hardness limits in their warranties (Rinnai: 200 mg/L), which can make a softener the better pick than salt-free.' },
  { id: 'household', type: 'multi', optional: true, label: 'Is anyone at home possibly more sensitive to water quality?', hint: "Optional. It only changes which notes we show you, and you can skip it.", options: [
    ['infant', 'A baby, or someone mixing formula'], ['pregnant', 'Someone who is pregnant'], ['older', 'An older adult'], ['immune', 'Someone with a weakened immune system'], ['skip', 'Prefer not to say']],
    why: 'EPA notes infants (nitrate), children and pregnancy (lead), and people with weakened immune systems (germs) can be more vulnerable.' },
  { id: 'goal', type: 'single', label: 'What matters most to you?', options: [['safety', 'Safer drinking water'], ['taste', 'Better taste and smell'], ['protect', 'Protect pipes and appliances'], ['skin', 'Skin and hair'], ['all', 'All of these']],
    why: 'Orders our recommendations around what you care about.' },
  { id: 'tenure', type: 'single', label: 'Do you own or rent?', options: [['own', 'Own'], ['rent', 'Rent']],
    why: 'Renters get options that need no permanent install.' },
];

const CONSIDERED = [
  'Number of people and bathrooms (needed for sizing, better asked at the consult)',
  'How long you\'ve lived in the home / recent well work (useful, but rarely changes the first recommendation)',
  'Budget range (felt pushy before showing results)',
  'Whether you drink tap water or bottled (overlaps with the goal question)',
  'Water pressure problems (needs an on-site look)',
  'Recent flooding near the well (rare; covered at the consult for well homes)',
];

function clean(raw) {
  const out = {};
  let src = {};
  try { src = typeof raw === 'string' ? JSON.parse(raw) : (raw || {}); } catch { return {}; }
  if (['public', 'well', 'unsure'].includes(src.source)) out.source = src.source;
  for (const q of QUESTIONS) {
    const allowed = new Set(q.options.map(o => o[0]));
    const v = src[q.id];
    if (q.type === 'multi' && Array.isArray(v)) { const a = v.filter(x => allowed.has(x)); if (a.length) out[q.id] = [...new Set(a)]; }
    if (q.type === 'single' && allowed.has(v)) out[q.id] = v;
  }
  if (out.symptoms?.includes('none')) out.symptoms = ['none'];
  if (out.household?.includes('skip')) delete out.household;
  return out;
}

module.exports = { QUESTIONS, CONSIDERED, clean };
