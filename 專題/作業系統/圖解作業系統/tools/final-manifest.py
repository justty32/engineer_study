#!/usr/bin/env python3
"""建立或核對公開成品清單；只封裝 dist，不含審核與截圖。"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parents[2]
sys.path.insert(0, str(ROOT / 'wf/tools'))
from tabledb import Table, load


def assets():
    files = sorted(p for p in (SITE / 'dist').rglob('*') if p.is_file())
    if len(files) != 24 or sum(p.suffix == '.html' for p in files) != 22 or {p.suffix for p in files} != {'.html', '.js', '.css'}:
        raise SystemExit('拒絕封版：公開範圍必須為 22 HTML、app.js、lab.css 共 24 檔。')
    rows = []
    lines = []
    for p in files:
        data = p.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        rel = p.relative_to(SITE / 'dist').as_posix()
        lines.append(f'{digest}  {rel}')
        rows.append({'path': 'dist/' + rel, 'bytes': len(data), 'sha256': digest})
    digest = hashlib.sha256(('\n'.join(lines) + '\n').encode('utf-8')).hexdigest()
    return rows, digest


def check_reviews():
    for name in ('mechanism-review.json', 'teaching-review.json'):
        review = load(str(SITE / 'evidence' / name))
        if len(review.rows) < 20:
            raise SystemExit(f'拒絕封版：{name} 尚未滿 20 課。')
        for row in review.rows:
            status = row.get('status', '')
            if '通過' not in status or any(token in status for token in ('待', '失敗', '未通過')):
                raise SystemExit(f'拒絕封版：{name} {row.get("id")} 狀態 {status}。')
            page = row.get('page_path')
            expected = row.get('reviewed_sha256') or row.get('digest', {}).get('page_sha256')
            if page and expected:
                current = hashlib.sha256((SITE / 'evidence' / page).resolve().read_bytes()).hexdigest()
                if expected != current:
                    raise SystemExit(f'拒絕封版：{name} {row.get("id")} 審核雜湊過期。')
    for name in ('mechanism-findings.json', 'teaching-findings.json', 'technical-findings.json'):
        for row in load(str(SITE / 'evidence' / name)).rows:
            if row.get('status') not in ('closed', '已修正並複核', '已釐清', '通過'):
                raise SystemExit(f'拒絕封版：{name} 尚有未結案項 {row.get("id")}。')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--freeze', action='store_true', help='僅於所有作者停筆且隊長明確通知後使用')
    args = parser.parse_args()
    rows, digest = assets()
    target = SITE / '公開資產manifest.json'
    if args.freeze:
        check_reviews()
        table = Table(str(target), ['path', 'bytes', 'sha256'], rows, {'contract':'wf-table/1','source':'驗收紀錄.md','extracted':'2026-10-11','link_columns':['path'],'final_digest':digest,'digest_algorithm':'SHA256 of sorted lines: <file SHA256><two spaces><path relative to dist><LF>','publication_slug':'operating-systems-little-lab'})
        table.save()
    elif target.exists():
        table = load(str(target))
        if table.rows != rows or table.meta.get('final_digest') != digest:
            raise SystemExit('清單與目前公開檔案不一致。')
    else:
        raise SystemExit('尚未封版；缺少公開資產manifest.json。')
    print(json.dumps({'assets':len(rows),'final_digest':digest,'status':'通過'},ensure_ascii=False))
