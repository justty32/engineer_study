#!/usr/bin/env python3
"""deck.json 契約檢查（見 data/SCHEMA.md）。

用法：python3 data/validate_deck.py data/<deck_id>.json [...]
環境變數 PR_ROOT（預設 /home/lorkhan/repo/paper_readings）：存在時逐一檢查 summary_file／
translate_file／deep_doc／links 所指的檔案在本機 repo 內存在；不存在時只做結構檢查並提示。
結束碼 0＝無錯（警告不算錯）。
"""
import json
import os
import re
import sys
import urllib.parse

PR_ROOT = os.environ.get('PR_ROOT', '/home/lorkhan/repo/paper_readings')
GH_BASE = 'https://github.com/justty32/paper_readings/blob/main/'
ARXIV_BASE = 'https://arxiv.org/abs/'
LIMITS = {  # 字數上限（超過為警告，不是錯誤）
    'deck.title': 20, 'deck.intro': 160, 'deck.outro': 120,
    'lane.name': 16, 'gist.summary': 150, 'gist.point': 60, 'gist.open': 100,
    'glossary.term': 30, 'glossary.plain': 60, 'lane.question': 60,
    'hl.title_zh': 18, 'hl.role': 8, 'hl.one_liner': 50, 'hl.plain': 80, 'hl.core': 120,
    'hl.number.label': 12, 'hl.number.value': 16, 'hl.why': 60,
    'thread.title': 24, 'thread.text': 120,
}


class Report:
    def __init__(self, name):
        self.name, self.errors, self.warnings = name, [], []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)

    def length(self, key, text, where):
        if isinstance(text, str) and len(text) > LIMITS[key]:
            self.warn(f'{where}: {key} {len(text)} 字 > {LIMITS[key]}')


def gh_path_exists(url):
    """GitHub blob URL → 本機路徑是否存在（None＝不是本 repo 的 URL）。"""
    if not url.startswith(GH_BASE):
        return None
    rel = urllib.parse.unquote(url[len(GH_BASE):])
    return os.path.exists(os.path.join(PR_ROOT, rel))


def check_url(rep, url, where, allow_arxiv=False):
    if not isinstance(url, str) or not url.startswith('https://'):
        rep.err(f'{where}: 連結不是 https 絕對網址：{url!r}')
        return
    if allow_arxiv and url.startswith(ARXIV_BASE):
        return
    if os.path.isdir(PR_ROOT):
        ok = gh_path_exists(url)
        if ok is False:
            rep.err(f'{where}: 連結對應的本機檔不存在：{url}')
        elif ok is None:
            rep.warn(f'{where}: 非 paper_readings 連結，未檢查：{url}')


def check_deck(path):
    rep = Report(path)
    try:
        deck = json.load(open(path, encoding='utf-8'))
    except Exception as e:  # noqa: BLE001
        rep.err(f'JSON 解析失敗：{e}')
        return rep
    for k in ('deck_id', 'title', 'subtitle', 'total_minutes', 'intro', 'lanes', 'threads', 'outro'):
        if k not in deck:
            rep.err(f'deck 缺欄位 {k}')
    if rep.errors:
        return rep
    if not re.fullmatch(r'[a-z0-9-]+', str(deck['deck_id'])):
        rep.err('deck_id 只能 [a-z0-9-]')
    rep.length('deck.title', deck['title'], 'deck')
    rep.length('deck.intro', deck['intro'], 'deck')
    rep.length('deck.outro', deck['outro'], 'deck')
    if not isinstance(deck['lanes'], list) or not deck['lanes']:
        rep.err('lanes 必須是非空陣列')
        return rep

    lane_ids, all_ids, hl_ids = set(), set(), set()
    minutes = 0
    for li, lane in enumerate(deck['lanes']):
        w = f'lane[{li}]'
        for k in ('id', 'name', 'minutes', 'paper_count', 'deep_doc', 'gist', 'highlights', 'question', 'all_papers'):
            if k not in lane:
                rep.err(f'{w} 缺欄位 {k}')
        if rep.errors:
            continue
        w = f'lane[{lane["id"]}]'
        if not re.fullmatch(r'[a-z0-9-]+', str(lane['id'])):
            rep.err(f'{w}: id 只能 [a-z0-9-]')
        if lane['id'] in lane_ids:
            rep.err(f'{w}: lane id 重複')
        lane_ids.add(lane['id'])
        rep.length('lane.name', lane['name'], w)
        rep.length('lane.question', lane['question'], w)
        minutes += int(lane['minutes'])
        check_url(rep, lane['deep_doc'], f'{w}.deep_doc')

        g = lane['gist']
        for k in ('summary', 'points', 'open'):
            if k not in g:
                rep.err(f'{w}.gist 缺 {k}')
        if isinstance(g.get('open'), str) and g['open'].lstrip().startswith('還沒解決'):
            rep.err(f'{w}.gist.open 不可自帶「還沒解決」前綴')
        rep.length('gist.summary', g.get('summary', ''), w)
        rep.length('gist.open', g.get('open', ''), w)
        pts = g.get('points', [])
        if not isinstance(pts, list) or not 2 <= len(pts) <= 5:
            rep.warn(f'{w}.gist.points 建議 3～4 條，現有 {len(pts) if isinstance(pts, list) else "?"}')
        for p in pts if isinstance(pts, list) else []:
            rep.length('gist.point', p, w)

        gl = lane.get('glossary')
        if gl is not None:
            if not isinstance(gl, list) or not 4 <= len(gl) <= 8:
                rep.warn(f'{w}.glossary 建議 4～8 條，現有 {len(gl) if isinstance(gl, list) else "?"}')
            for gi, item in enumerate(gl or []):
                if not isinstance(item, dict) or not item.get('term') or not item.get('plain'):
                    rep.err(f'{w}.glossary[{gi}] 需要 term 與 plain')
                    continue
                rep.length('glossary.term', item['term'], f'{w}.glossary[{gi}]')
                rep.length('glossary.plain', item['plain'], f'{w}.glossary[{gi}]')

        rows = lane['all_papers']
        row_ids = set()
        if not isinstance(rows, list) or not rows:
            rep.err(f'{w}.all_papers 必須是非空陣列')
            rows = []
        for ri, row in enumerate(rows):
            rw = f'{w}.all_papers[{ri}]'
            for k in ('arxiv_id', 'status', 'title_zh', 'cat', 'summary_file', 'translate_file'):
                if k not in row:
                    rep.err(f'{rw} 缺欄位 {k}')
            rid = row.get('arxiv_id')
            if rid in row_ids:
                rep.err(f'{rw}: arxiv_id 重複 {rid}')
            row_ids.add(rid)
            if rid in all_ids:
                rep.err(f'{rw}: arxiv_id {rid} 已出現在別的 lane')
            all_ids.add(rid)
            if row.get('status') not in ('✅', '🔶', '⬜'):
                rep.err(f'{rw}: status 非法 {row.get("status")!r}')
            if os.path.isdir(PR_ROOT):
                sf, tf = row.get('summary_file'), row.get('translate_file')
                if sf and not os.path.exists(os.path.join(PR_ROOT, 'summarize', sf)):
                    rep.err(f'{rw}: summarize/{sf} 不存在')
                if tf and not os.path.exists(os.path.join(PR_ROOT, 'translate', tf)):
                    rep.err(f'{rw}: translate/{tf} 不存在')
                if sf and not sf.startswith(str(rid) + '_'):
                    rep.err(f'{rw}: summary_file 不是以 {rid}_ 開頭')
            if row.get('url'):
                check_url(rep, row['url'], f'{rw}.url')
            if not row.get('url') and not row.get('summary_file') and not re.fullmatch(r'\d{4}\.\d{4,5}', str(rid)):
                rep.err(f'{rw}: 既無 url 也無 summary_file，且 arxiv_id 非 arXiv 格式，連結會失效')
        if int(lane['paper_count']) != len(rows):
            rep.err(f'{w}: paper_count={lane["paper_count"]} 但 all_papers 有 {len(rows)} 列')

        hls = lane['highlights']
        if not isinstance(hls, list) or len(hls) != 4:
            rep.err(f'{w}: highlights 必須恰好 4 張（現有 {len(hls) if isinstance(hls, list) else "?"}）')
            hls = hls if isinstance(hls, list) else []
        roles = {}
        for hi, hl in enumerate(hls):
            hw = f'{w}.highlights[{hi}]'
            for k in ('arxiv_id', 'title_zh', 'title_en', 'year', 'role', 'one_liner', 'core', 'number', 'why', 'links'):
                if k not in hl:
                    rep.err(f'{hw} 缺欄位 {k}')
            if rep.errors and 'arxiv_id' not in hl:
                continue
            hid = hl['arxiv_id']
            if hid not in row_ids:
                rep.err(f'{hw}: {hid} 不在本 lane 的 all_papers')
            if hid in hl_ids:
                rep.err(f'{hw}: 必讀卡 {hid} 重複')
            hl_ids.add(hid)
            is_arxiv = bool(re.fullmatch(r'\d{4}\.\d{4,5}', str(hid)))
            if not re.fullmatch(r'\d{4}-\d{2}', str(hl.get('year', ''))):
                if is_arxiv or hl.get('year', '') != '':
                    rep.err(f'{hw}: year 需為 YYYY-MM（非 arXiv 條目無日期可留空字串）')
            elif re.fullmatch(r'\d{4}\.\d{4,5}', str(hid)):
                yymm = hid[:4]
                if hl['year'] != f'20{yymm[:2]}-{yymm[2:]}':
                    rep.err(f'{hw}: year {hl["year"]} 與 arxiv id {hid} 不符')
            if 'plain' not in hl:
                rep.warn(f'{hw}: 缺 plain（本專案要求每卡都給）')
            for key in ('title_zh', 'role', 'one_liner', 'plain', 'core', 'why'):
                if key in hl:
                    rep.length('hl.' + key, hl[key], hw)
            roles[hl.get('role')] = roles.get(hl.get('role'), 0) + 1
            num = hl.get('number') or {}
            for k in ('label', 'value', 'note'):
                if not num.get(k):
                    rep.err(f'{hw}.number 缺 {k}')
            if num.get('note') and num['note'] not in ('作者自報', '講者自述', '複現者自述'):
                rep.warn(f'{hw}.number.note 不是「作者自報」：{num["note"]!r}')
            rep.length('hl.number.label', num.get('label', ''), hw)
            rep.length('hl.number.value', num.get('value', ''), hw)
            links = hl.get('links') or {}
            if not isinstance(links, dict) or not links:
                rep.err(f'{hw}: links 為空')
            else:
                for k, v in links.items():
                    if k not in ('arxiv', 'summary', 'translate', 'transcript'):
                        rep.warn(f'{hw}.links 未知鍵 {k}（頁面會忽略）')
                    check_url(rep, v, f'{hw}.links.{k}', allow_arxiv=(k == 'arxiv'))
                if 'arxiv' in links and links['arxiv'] != ARXIV_BASE + str(hid):
                    rep.err(f'{hw}.links.arxiv 與 arxiv_id 不一致')
                if 'summary' not in links:
                    rep.err(f'{hw}.links 缺 summary')
        for r, n in roles.items():
            if n > 2:
                rep.warn(f'{w}: role「{r}」用了 {n} 次')

    if not 29 <= minutes <= 31:
        rep.warn(f'lane minutes 合計 {minutes}，建議 29～31')
    if int(deck['total_minutes']) != 30:
        rep.warn(f'total_minutes={deck["total_minutes"]}，慣例 30')

    threads = deck['threads']
    if not isinstance(threads, list):
        rep.err('threads 必須是陣列')
        threads = []
    for ti, t in enumerate(threads):
        tw = f'thread[{ti}]'
        for k in ('title', 'text', 'lane_ids', 'paper_ids'):
            if k not in t:
                rep.err(f'{tw} 缺 {k}')
        rep.length('thread.title', t.get('title', ''), tw)
        rep.length('thread.text', t.get('text', ''), tw)
        for lid in t.get('lane_ids', []):
            if lid not in lane_ids:
                rep.err(f'{tw}: lane_id {lid} 不存在')
        for pid in t.get('paper_ids', []):
            if pid not in hl_ids:
                rep.warn(f'{tw}: paper_id {pid} 不是本 deck 的必讀卡（頁面會略過、不渲染膠囊）')
    if not 2 <= len(threads) <= 4:
        rep.warn(f'threads 建議 2～3 條，現有 {len(threads)}')
    rep.summary = (len(deck['lanes']), len(hl_ids), len(all_ids))
    return rep


def main(paths):
    bad = 0
    for p in paths:
        rep = check_deck(p)
        s = getattr(rep, 'summary', None)
        head = f'{p}: ' + (f'lanes={s[0]} highlights={s[1]} all_papers={s[2]} ' if s else '')
        print(head + f'errors={len(rep.errors)} warnings={len(rep.warnings)}')
        for e in rep.errors:
            print('  ERROR', e)
        for w in rep.warnings:
            print('  warn ', w)
        bad += bool(rep.errors)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
