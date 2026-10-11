#!/usr/bin/env python3
"""只讀成品：編碼、靜態連結/ID、來源與主文契約。"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlparse,unquote
import re,sys
root=Path(__file__).resolve().parents[1]/'dist'
class Doc(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.resources=[];self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id'in a:self.ids.append(a['id'])
  if tag=='a' and 'href'in a:self.links.append(a['href'])
  if 'src'in a:self.resources.append(a['src'])
  if tag=='link' and 'stylesheet'in a.get('rel',''):self.resources.append(a.get('href',''))
errors=[];stats=[]
for f in sorted(root.glob('*')):
 if not f.is_file():continue
 try:s=f.read_bytes().decode('utf-8',errors='strict')
 except UnicodeError:errors.append(f'{f.name}: UTF-8');continue
 if s.startswith('\ufeff') or re.search('[\ufffd\u0080-\u009f\ue000-\uf8ff]',s):errors.append(f'{f.name}: prohibited character')
 if f.suffix!='.html':continue
 text=unescape(s);doc=Doc(text)
 if '<html lang="zh-Hant"'not in s:errors.append(f'{f.name}: lang')
 if len(doc.ids)!=len(set(doc.ids)):errors.append(f'{f.name}: duplicate ID')
 if re.search(r'\\[()[\]]|\$\$',text):errors.append(f'{f.name}: raw LaTeX')
 for r in doc.resources:
  if r.startswith(('http:','https:','//')):errors.append(f'{f.name}: remote resource {r}')
 for r in doc.links+doc.resources:
  u=urlparse(r)
  if u.scheme or r.startswith('//'):continue
  target=(f.parent/unquote(u.path)) if u.path else f
  if not target.exists():errors.append(f'{f.name}: missing {r}');continue
  if u.fragment and target.suffix=='.html' and u.fragment not in Doc(target.read_text()).ids:errors.append(f'{f.name}: missing anchor {r}')
  if target.suffix=='.md':errors.append(f'{f.name}: Markdown link')
 if re.match(r'\d\d-',f.name):
  for i in ['main-content','understand','calculate','practice','experiment','lab-input','lab-value','lab-reset','lab-results','lab-why','lab-plot','lab-description']:
   if i not in doc.ids:errors.append(f'{f.name}: missing {i}')
  if sum(tag=='details' for tag,a in doc.tags)<3:errors.append(f'{f.name}: fewer than 2 hints + solution')
  for tag,a in doc.tags:
   if tag=='svg' and (a.get('role')!='img' or not a.get('aria-labelledby')):errors.append(f'{f.name}: SVG accessible name')
 stats.append({'page':f.name,'bytes':f.stat().st_size,'han':len(re.findall('[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]',re.sub('<[^>]+>','',text)))})
print('pages',len(stats),'lessons',sum(x['page'][:2].isdigit() for x in stats),'errors',len(errors))
for s in stats:print(s['page'],s['bytes'],s['han'])
for e in errors:print('ERROR',e)
sys.exit(bool(errors))
