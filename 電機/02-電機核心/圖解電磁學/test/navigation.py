#!/usr/bin/env python3
"""首頁可達性、逐章 pager 對称、表單控制契約逐列比對。"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import sys
from evidence import load,save,digest
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
class Doc(HTMLParser):
 def __init__(self,text):
  super().__init__();self.links=[];self.pager=[];self.controls={};self.in_pager=0;self.page='';self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='body':self.page=a.get('data-page','')
  if tag=='footer' and 'pager' in a.get('class','').split():self.in_pager+=1
  if tag=='a' and 'href'in a:
   self.links.append(a['href'])
   if self.in_pager:self.pager.append(a['href'])
  if 'id'in a:self.controls[a['id']]=(tag,a)
 def handle_endtag(self,tag):
  if tag=='footer' and self.in_pager:self.in_pager-=1

rows=[];errors=[];docs={p.name:Doc(p.read_text()) for p in DIST.glob('*.html')}
specs=load(str(ROOT/'章節規格.json')).rows
for r in specs:
 f=r['slug']+'.html';e=[];d=docs.get(f)
 if d is None:e.append('missing page')
 else:
  if d.page!=r['slug']:e.append('body data-page mismatch')
  if d.controls.get('experiment',('',{}))[1].get('data-lab')!=r['id']:e.append('data-lab mismatch')
  for key in ('previous','next'):
   if r[key] and r[key] not in d.pager:e.append('pager missing '+r[key])
  tag,a=d.controls.get('lab-input',('',{}));c=r['control']
  if tag!='input' or a.get('type')!='range':e.append('input type')
  for key,attr in [('min','min'),('max','max'),('step','step'),('default','value')]:
   try:
    if abs(float(a.get(attr,''))-c[key])>1e-12:e.append('control '+attr)
   except ValueError:e.append('control missing '+attr)
  if d.controls.get('lab-reset',('',{}))[1].get('type')!='button':e.append('reset button type')
  if d.controls.get('lab-results',('',{}))[1].get('aria-live')!='polite':e.append('results aria-live')
 errors.extend(f+': '+x for x in e);rows.append({'file':f,'status':'FAIL' if e else 'PASS','errors':e})
visited=set();pending=['index.html']
while pending:
 f=pending.pop()
 if f in visited or f not in docs:continue
 visited.add(f)
 for link in docs[f].links:
  u=urlparse(link)
  if u.scheme or link.startswith('//'):continue
  name=unquote(u.path) or f
  if name in docs and name not in visited:pending.append(name)
orphan=sorted(set(docs)-visited)
if orphan:errors.append('orphan '+','.join(orphan))
rows.append({'file':'summary','status':'FAIL' if errors else 'PASS','errors':errors,'pages':len(docs),'reachable':len(visited),'orphans':orphan})
_,total=digest(DIST)
save('/tmp/electromagnetics-technical-qa/navigation.json',rows,{'dist_digest':total})
print({'chapters':len(specs),'pages':len(docs),'reachable':len(visited),'errors':errors})
sys.exit(bool(errors))
