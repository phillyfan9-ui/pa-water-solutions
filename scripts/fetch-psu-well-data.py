#!/usr/bin/env python3
"""Builds data/reference/psu-well-summaries.json from Penn State AASL
"Drinking Water Test Summaries by County" pages (public web pages).
Usage: python3 scripts/fetch-psu-well-data.py"""
import re, html, json, time, urllib.request, datetime, os
BASE = 'https://agsci.psu.edu/aasl/water-testing/drinking-water-testing/drinking-water-test-summaries'
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'reference', 'psu-well-summaries.json')
UA = {'User-Agent': 'Mozilla/5.0 (PA Water Solutions beta data refresh)'}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read().decode('utf-8', 'replace')

def num(x):
    x = x.strip()
    if x in ('-', ''): return None
    try: return float(x)
    except ValueError: return x

index = get(BASE)
slugs = sorted(set(re.findall(re.escape(BASE) + r'/([a-z\-]+)"', index)))
out = {'source': {
    'name': 'Penn State Agricultural Analytical Services Laboratory (AASL): Drinking Water Test Summaries by County',
    'url': BASE,
    'description': 'Summary of drinking water samples (mostly private wells and springs) submitted by homeowners to the Penn State AASL. Samples are self-selected, not a random survey.',
    'retrieved': datetime.date.today().isoformat()},
    'counties': {}, 'missing': []}
for slug in slugs:
    url = f'{BASE}/{slug}'
    try:
        s = get(url)
    except Exception as e:
        out['missing'].append({'slug': slug, 'error': str(e)}); continue
    head = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))
    m = re.search(r'Tested by the Penn State Agricultural Analytical Services Laboratory\s+(.+?)\s+(\d{1,2}/\d{1,2}/\d{4})\s*-\s*(\d{1,2}/\d{1,2}/\d{4}),\s*([\d,]+)\s+Samples', head)
    tbl = re.search(r'<table.*?</table>', s, re.S)
    if not tbl:
        out['missing'].append({'slug': slug, 'error': 'no table'}); continue
    rows = []
    for tr in re.findall(r'<tr.*?</tr>', tbl.group(0), re.S):
        cells = [html.unescape(re.sub(r'<[^>]+>', '', c)).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)]
        if cells and cells[0] != 'Test Parameter' and len(cells) >= 9: rows.append(cells)
    params = {}
    for c in rows:
        params[c[0].rstrip('*')] = {'units': c[1], 'samples': num(c[2]), 'median': num(c[3]), 'min': num(c[4]), 'max': num(c[5]),
                                    'failing': num(c[6]), 'pctFailing': num(c[7]), 'epaStandard': c[8]}
    name = (m.group(1) if m else slug.title()).replace(' County', '').strip()
    key = 'Pennsylvania (statewide)' if slug == 'pennsylvania' else name
    out['counties'][key] = {'url': url, 'periodStart': m.group(2) if m else None, 'periodEnd': m.group(3) if m else None,
                            'totalSamples': int(m.group(4).replace(',', '')) if m else None, 'parameters': params}
    print(key, out['counties'][key]['periodEnd'], out['counties'][key]['totalSamples'], len(params))
    time.sleep(0.7)
json.dump(out, open(OUT, 'w'), indent=1)
print('saved', len(out['counties']), 'missing', out['missing'])
