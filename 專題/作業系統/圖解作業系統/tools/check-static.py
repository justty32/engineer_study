#!/usr/bin/env python3
"""圖解作業系統獨立靜態閘門；只讀產品，證據寫入指定暫存檔。"""
import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parents[2]
sys.path.insert(0, str(ROOT / 'wf/tools'))
from tabledb import load


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.labels, self.controls = [], [], [], []
        self.svgs, self.runtime = [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'label' and a.get('for'):
            self.labels.append(a['for'])
        if tag in ('input', 'select', 'textarea'):
            self.controls.append(a)
        if tag == 'svg':
            self.svgs.append(a)
        for attr in ('href', 'src', 'poster', 'data'):
            if a.get(attr):
                self.refs.append((tag, attr, a[attr]))
                if tag != 'a' and re.match(r'^(https?:)?//', a[attr]):
                    self.runtime.append(a[attr])


def inspect():
    dist = SITE / 'dist'
    files = sorted(p for p in dist.rglob('*') if p.is_file()) if dist.exists() else []
    html = [p for p in files if p.suffix == '.html']
    text_files = [p for p in files if p.suffix in ('.html', '.js', '.css')]
    issues, details, docs, texts = [], [], {}, {}

    def issue(check, target, detail):
        issues.append({'check': check, 'target': str(target), 'detail': detail})

    if len(html) != 22:
        issue('page-count', 'dist', f'expected 22 HTML, observed {len(html)}')
    for p in text_files:
        raw = p.read_bytes()
        try:
            content = raw.decode('utf-8', errors='strict')
        except UnicodeDecodeError as e:
            issue('utf8', p.name, str(e))
            continue
        texts[p] = content
        if raw.startswith(b'\xef\xbb\xbf'):
            issue('bom', p.name, 'UTF-8 BOM')
        invalid = sorted({f'U+{ord(c):04X}' for c in content if c == '\ufffd' or ord(c) < 32 and c not in '\n\r\t' or 0x7F <= ord(c) <= 0x9F or 0xE000 <= ord(c) <= 0xF8FF})
        if invalid:
            issue('invalid-characters', p.name, ', '.join(invalid))
        if p.suffix == '.html':
            docs[p] = Document(content)
            if re.search(r'\\[()[\]]|\$\$', content):
                issue('latex', p.name, 'LaTeX delimiter remains')
        if p.suffix == '.css' and re.search(r'@import|url\(\s*[\"\x27]?(?:https?:)?//', content):
            issue('external-runtime', p.name, 'CSS import or external URL')
        if p.suffix == '.js' and re.search(r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|importScripts)\s*\(', content):
            issue('external-runtime', p.name, 'network API requires review')
    all_ids = set(x for d in docs.values() for x in d.ids)
    for p, doc in docs.items():
        for identity, count in Counter(doc.ids).items():
            if count > 1:
                issue('duplicate-id', p.name, identity)
        for runtime in doc.runtime:
            issue('external-runtime', p.name, runtime)
        for tag, attr, target in doc.refs:
            url = urlsplit(target)
            if url.scheme or url.netloc:
                continue
            if url.path.startswith('/'):
                issue('root-relative', p.name, target)
                continue
            destination = (p.parent / unquote(url.path)).resolve() if url.path else p
            if not destination.is_relative_to(dist):
                issue('outside-public-scope', p.name, target)
            if not destination.exists():
                issue('relative-link', p.name, target)
            elif destination.suffix == '.md':
                issue('public-markdown-link', p.name, target)
            elif url.fragment and destination.suffix == '.html' and destination in docs:
                if unquote(url.fragment) not in docs[destination].ids:
                    issue('anchor', p.name, target)
        for svg in doc.svgs:
            named = svg.get('aria-labelledby', '').split()
            if svg.get('role') != 'img' or not named or any(x not in doc.ids for x in named):
                issue('svg-name', p.name, str(svg))
        for label in doc.labels:
            if label not in doc.ids:
                issue('label-target', p.name, label)
        if re.match(r'^\d\d-', p.name):
            for identity in ('main', 'worked-example', 'practice'):
                if identity not in doc.ids:
                    issue('lesson-contract', p.name, f'missing {identity}')
            if len(doc.svgs) < 2:
                issue('lesson-contract', p.name, f'expected >=2 SVG, observed {len(doc.svgs)}')
        details.append({'file': p.name, 'svg': len(doc.svgs), 'id_count': len(doc.ids), 'bytes': p.stat().st_size})
    for p, content in texts.items():
        if p.suffix == '.js':
            for identity in re.findall(r'(?:getElementById|byId)\(\s*[\"\x27]([^\"\x27]+)', content):
                # Shared scripts may create a control before querying its ID.
                if identity not in all_ids and not re.search(r'id=[\"\x27]' + re.escape(identity) + r'[\"\x27]', content):
                    issue('js-missing-id', p.name, identity)
    baselines = []
    for name in ('old-os-all-files.json', 'styles18-plus-canonical.json'):
        source = Path('/tmp/operating-systems-visual-publication') / name
        if not source.exists():
            issue('baseline-missing', name, str(source))
            continue
        table = load(str(source))
        changed = []
        for row in table.rows:
            p = ROOT / row['path']
            raw = p.read_bytes() if p.is_file() else b''
            if len(raw) != int(row['bytes']) or hashlib.sha256(raw).hexdigest() != row['sha256']:
                changed.append(row['path'])
        baselines.append({'baseline': name, 'count': len(table.rows), 'changed': changed})
        for target in changed:
            issue('baseline-changed', target, name)
    digest_lines = [f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(dist).as_posix()}' for p in files]
    return {'html_count': len(html), 'asset_count': len(files), 'site_digest': hashlib.sha256(('\n'.join(digest_lines)+'\n').encode()).hexdigest(), 'files': details, 'baselines': baselines, 'issues': issues}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='/tmp/os-visual-qa/static.json')
    args = parser.parse_args()
    result = inspect()
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result['issues']))
