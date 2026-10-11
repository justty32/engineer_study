#!/usr/bin/env python3
"""唯讀成品：UTF-8、HTML、ID、連結與資產；不藉修改產品取得通過。"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlparse,unquote
import hashlib,re,sys,subprocess
from evidence import save,load,digest
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
VOID=set('area base br col embed hr img input link meta param source track wbr'.split())
class Doc(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.ids=[];self.refs=[];self.resources=[];self.tags=[];self.stack=[];self.errors=[];self.feed(text)
  if self.stack:self.errors.append('unclosed '+','.join(self.stack))
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if tag not in VOID:self.stack.append(tag)
  if 'id'in a:self.ids.append(a['id'])
  for attr in ('href','src','poster','action'):
   if attr in a:self.refs.append((tag,attr,a[attr]))
  for attr in ('src','poster'):
   if attr in a:self.resources.append(a[attr])
  if tag=='object' and 'data'in a:self.resources.append(a['data'])
  if 'srcset'in a:self.resources.extend(x.strip().split()[0] for x in a['srcset'].split(',') if x.strip())
  if 'style'in a and re.search(r'url\(\s*[\'\"]?(?:https?:|//)',a['style'],re.I):self.errors.append('remote inline CSS resource')
  if tag=='link' and any(x in a.get('rel','').split() for x in ('stylesheet','icon','preload','modulepreload')):self.resources.append(a.get('href',''))
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in VOID:self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if tag in VOID:return
  if not self.stack or self.stack[-1]!=tag:self.errors.append('mismatched </'+tag+'> stack='+','.join(self.stack[-4:]));return
  self.stack.pop()

errors=[];rows=[];docs={};texts={}
if not DIST.exists() or not any(DIST.glob('*.html')):errors.append('dist 沒有 HTML，不可標為通過')
for p in sorted(DIST.rglob('*')):
 if not p.is_file():continue
 name=str(p.relative_to(DIST))
 try:s=p.read_bytes().decode('utf-8','strict')
 except UnicodeError:errors.append(f'{name}: invalid UTF-8');continue
 texts[p]=s
 bad=re.search('[\ufeff\ufffd\x00-\x08\x0b\x0c\x0e-\x1f\u007f-\u009f\ue000-\uf8ff\U000f0000-\U000ffffd\U00100000-\U0010fffd]',s)
 if bad:errors.append(f'{name}: prohibited U+{ord(bad.group()):04X}')
 if p.suffix=='.html':docs[p]=Doc(s)
 if p.suffix=='.js':
  out=subprocess.run(['node','--check',str(p)],text=True,capture_output=True)
  if out.returncode:errors.append(f'{name}: JS syntax '+out.stderr)
 if p.suffix=='.css' and re.search(r'(?:url\(\s*[\'"]?|@import\s+[\'"])(?:https?:|//)',s,re.I):errors.append(f'{name}: remote CSS resource')
for p,doc in docs.items():
 name=p.name;own=[];s=texts[p]
 own.extend(doc.errors)
 for key,n in Counter(doc.ids).items():
  if n>1:own.append('duplicate id '+key)
 if not re.search(r'<html\b[^>]*lang=[\'"]zh-Hant[\'"]',s,re.I):own.append('missing zh-Hant')
 head=re.search(r'<head\b[^>]*>(.*?)</head>',s,re.I|re.S)
 if not head or len(re.findall(r'<title\b',head.group(1),re.I))!=1:own.append('expected exactly one document head title')
 if not re.match(r'\s*<!doctype html>',s,re.I):own.append('missing HTML5 doctype')
 for tag in ('main','h1'):
  if sum(t==tag for t,a in doc.tags)!=1:own.append(f'expected exactly one {tag}')
 if not any(t=='meta' and a.get('charset','').lower()=='utf-8' for t,a in doc.tags):own.append('missing charset')
 if not any(t=='meta' and a.get('name')=='viewport' for t,a in doc.tags):own.append('missing viewport')
 if re.search(r'\\[()[\]]|\$\$',unescape(s)):own.append('raw LaTeX delimiters')
 for resource in doc.resources:
  if urlparse(resource).scheme in ('http','https') or resource.startswith('//'):own.append('remote resource '+resource)
 for tag,attr,ref in doc.refs:
  u=urlparse(ref)
  if u.scheme or ref.startswith('//'):continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p.resolve()
  if target.suffix=='.md':own.append('Markdown href '+ref)
  if not target.exists():own.append('missing '+ref);continue
  if u.fragment and target.suffix=='.html':
   targetdoc=docs.get(target) or Doc(target.read_text(encoding='utf-8'))
   if unquote(u.fragment) not in targetdoc.ids:own.append('missing fragment '+ref)
 if re.match(r'\d\d-',name):
  for key in ['main-content','understand','calculate','practice','experiment','lab-input','lab-value','lab-reset','lab-results','lab-why','lab-plot','lab-description']:
   if key not in doc.ids:own.append('missing contract id '+key)
  if sum(t=='details' for t,a in doc.tags)<3:own.append('fewer than two hints plus solution')
 for tag,a in doc.tags:
  for attr in ('aria-labelledby','aria-describedby'):
   for key in a.get(attr,'').split():
    if key not in doc.ids:own.append(attr+' missing '+key)
  if tag in ('input','select','textarea') and a.get('type') not in ('hidden','submit','button'):
   if not a.get('aria-label') and not a.get('aria-labelledby') and not any(t=='label' and x.get('for')==a.get('id') for t,x in doc.tags):own.append('unlabelled '+a.get('id',tag))
  if tag=='svg' and a.get('role')=='img' and not (a.get('aria-labelledby') or a.get('aria-label')):own.append('unnamed SVG')
 errors.extend(name+': '+e for e in own)
 rows.append({'kind':'page','file':name,'status':'FAIL' if own else 'PASS','bytes':p.stat().st_size,'ids':len(doc.ids),'details':sum(t=='details' for t,a in doc.tags),'errors':own,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
base=load(str(ROOT/'保護baseline.json'))
for row in base.rows:
 p=ROOT.parent/row['file']
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:errors.append('old site changed '+row['file'])
if len(list((ROOT.parent/'電磁學-互動課程').rglob('*')))==0:errors.append('missing old site')
actual={str(p.relative_to(ROOT.parent)) for p in (ROOT.parent/'電磁學-互動課程').rglob('*') if p.is_file()}
if actual!={r['file'] for r in base.rows}:errors.append('old site file set changed')
assets,total=digest(DIST)
rows.append({'kind':'summary','file':'dist','status':'FAIL' if errors else 'PASS','errors':errors,'asset_count':len(assets),'page_count':len(docs),'digest':total,'old_site_files':len(base.rows)})
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/electromagnetics-technical-qa/static.json')
save(out,rows,{'dist_digest':total})
print({'pages':len(docs),'assets':len(assets),'errors':len(errors),'evidence':str(out)})
for e in errors:print('ERROR',e)
sys.exit(bool(errors))
