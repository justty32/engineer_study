#!/usr/bin/env python3
"""測試證據使用既有 wf-table/1 寫入；JSON stdin 不經 shell 插值。"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import hashlib,json,sys
REPO=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(REPO/'wf/tools'))
from tabledb import Table,load

def save(path,rows,meta=None):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 columns=list(dict.fromkeys(k for row in rows for k in row))
 Table(str(path),columns,rows,{'contract':'wf-table/1','source':'技術驗收.md','extracted':'2026-10-11',**(meta or {})}).save()

def digest(root):
 rows=[{'file':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(root.rglob('*')) if p.is_file()]
 return rows,hashlib.sha256(''.join(r['file']+'\0'+r['sha256']+'\n' for r in rows).encode()).hexdigest()

if __name__=='__main__':
 data=json.load(sys.stdin);save(sys.argv[1],data['rows'],data.get('meta'))
