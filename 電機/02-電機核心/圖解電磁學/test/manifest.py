#!/usr/bin/env python3
"""凍結公開資產的精確 SHA；只有 --freeze 才建立／更新 manifest。"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import sys
from evidence import digest,save,load
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';MANIFEST=ROOT/'公開資產manifest.json'
rows,total=digest(DIST)
if '--freeze' in sys.argv:
 if not rows:raise SystemExit('empty dist')
 save(MANIFEST,rows,{'source':'驗收紀錄.md','scope':'dist/ 全部檔案；file 相對 dist/','digest_algorithm':'SHA256(按 file 字典序串接 UTF8(file + NUL + sha256 + LF))','digest':total,'asset_count':len(rows)})
 print({'manifest':str(MANIFEST),'assets':len(rows),'digest':total})
else:
 old=load(str(MANIFEST));expected={r['file']:r['sha256'] for r in old.rows};actual={r['file']:r['sha256'] for r in rows}
 changed=sorted(k for k in expected.keys()|actual.keys() if expected.get(k)!=actual.get(k))
 print({'assets':len(rows),'digest':total,'matches':not changed and total==old.meta['digest'],'changed':changed})
 sys.exit(bool(changed or total!=old.meta['digest']))
