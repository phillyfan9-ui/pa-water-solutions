#!/usr/bin/env python3
"""Builds data/reference/ucmr5-pa-pfas.json from EPA's UCMR 5 occurrence data (UCMR5_All.txt).
Download: https://www.epa.gov/system/files/other-files/2023-08/ucmr5-occurrence-data.zip
Usage: python3 scripts/build-ucmr5-pa.py /path/to/UCMR5_All.txt
Method: values converted µg/L -> ppt (ng/L). For each sample point, average = mean of all results with
non-detects (< MRL) counted as 0. 'highestAvg' = the highest sample-point average in the system."""
import csv, sys, json, os, datetime, collections
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ucmr/UCMR5_All.txt'
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'reference', 'ucmr5-pa-pfas.json')
systems = {}
per_point = collections.defaultdict(list)   # (pwsid, contaminant, samplepoint) -> [ppt]
with open(SRC, encoding='latin-1', newline='') as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        if row['State'] != 'PA': continue
        c = row['Contaminant']
        if c == 'lithium': continue
        pid = row['PWSID']
        s = systems.setdefault(pid, {'name': row['PWSName'], 'size': row['Size'], 'dates': set(), 'points': set(), 'samples': set(), 'contaminants': {}})
        s['dates'].add(row['CollectionDate']); s['points'].add(row['FacilityID'] + '/' + row['SamplePointID']); s['samples'].add(row['SampleID'])
        detected = row['AnalyticalResultsSign'] == '='
        val = float(row['AnalyticalResultValue']) * 1000 if detected and row['AnalyticalResultValue'] else 0.0
        cc = s['contaminants'].setdefault(c, {'results': 0, 'detections': 0, 'max': 0.0, 'mrl': float(row['MRL']) * 1000 if row['MRL'] else None})
        cc['results'] += 1
        if detected: cc['detections'] += 1; cc['max'] = max(cc['max'], val)
        per_point[(pid, c, row['FacilityID'] + '/' + row['SamplePointID'])].append(val)
for (pid, c, pt), vals in per_point.items():
    cc = systems[pid]['contaminants'][c]
    avg = sum(vals) / len(vals)
    cc['highestAvg'] = max(cc.get('highestAvg', 0.0), avg)
def d(x): return datetime.datetime.strptime(x, '%m/%d/%Y').date()
out = {'source': {'name': 'U.S. EPA Fifth Unregulated Contaminant Monitoring Rule (UCMR 5) occurrence data, UCMR5_All.txt',
                  'url': 'https://www.epa.gov/dwucmr/occurrence-data-unregulated-contaminant-monitoring-rule',
                  'download': 'https://www.epa.gov/system/files/other-files/2023-08/ucmr5-occurrence-data.zip',
                  'datasetNote': 'Final UCMR 5 dataset (samples collected Jan 2023 – Dec 2025), file dated Oct 2026',
                  'retrieved': datetime.date.today().isoformat(),
                  'method': 'ppt = ng/L. Per sample point average of all results, non-detects counted as 0; highestAvg = highest sample-point average. max = highest single detected result.'},
       'systems': {}}
for pid, s in systems.items():
    ds = sorted(d(x) for x in s['dates'])
    out['systems'][pid] = {'name': s['name'], 'size': s['size'], 'firstSample': ds[0].isoformat(), 'lastSample': ds[-1].isoformat(),
        'samplePoints': len(s['points']), 'sampleEvents': len(s['samples']),
        'contaminants': {c: {k: (round(v, 2) if isinstance(v, float) else v) for k, v in cc.items()} for c, cc in sorted(s['contaminants'].items())}}
json.dump(out, open(OUT, 'w'), indent=1)
det = sum(1 for s in out['systems'].values() if any(c['detections'] for c in s['contaminants'].values()))
print('PA systems:', len(out['systems']), 'with any PFAS detected:', det)
