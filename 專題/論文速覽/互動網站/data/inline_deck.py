#!/usr/bin/env python3
"""把 deck.json 灌進閱讀頁的 <script id="deck-data">；也可反向抽出。

用法：
  python3 data/inline_deck.py <deck.json> [<deck.html>]        灌入（html 省略＝data/../<deck_id>.html）
  python3 data/inline_deck.py --extract <deck.html> <out.json>   從頁面抽回 JSON（縮排 2、UTF-8）

灌入時：JSON 以 ensure_ascii=False、無多餘空白序列化，並把 "</" 跳脫成 "<\\/"，
避免提早關閉 script；可重複執行（整段 <script id="deck-data">…</script> 內容被替換）。
結束時印出 lanes／highlights／all_papers 數量，並重新解析頁面內嵌 JSON 與來源逐位比對。
"""
import json
import re
import sys
from pathlib import Path

TAG_RE = re.compile(
    r'(<script id="deck-data" type="application/json">)(.*?)(</script>)',
    re.S,
)


def load_page_json(html_text):
    m = TAG_RE.search(html_text)
    if not m:
        raise SystemExit('找不到 <script id="deck-data" type="application/json">')
    raw = m.group(2).strip().replace('<\\/', '</')
    return json.loads(raw) if raw else {}


def counts(deck):
    lanes = deck.get('lanes', [])
    return (
        len(lanes),
        sum(len(l.get('highlights', [])) for l in lanes),
        sum(len(l.get('all_papers', [])) for l in lanes),
    )


def inline(json_path, html_path):
    deck = json.loads(Path(json_path).read_text(encoding='utf-8'))
    html_text = Path(html_path).read_text(encoding='utf-8')
    if not TAG_RE.search(html_text):
        raise SystemExit('找不到 <script id="deck-data" type="application/json">')
    payload = json.dumps(deck, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    new_text = TAG_RE.sub(lambda m: m.group(1) + '\n' + payload + '\n' + m.group(3), html_text, count=1)
    Path(html_path).write_text(new_text, encoding='utf-8')
    back = load_page_json(Path(html_path).read_text(encoding='utf-8'))
    if back != deck:
        raise SystemExit('回讀不相等：灌入失敗')
    n_l, n_h, n_a = counts(deck)
    print(f'{html_path}: lanes={n_l} highlights={n_h} all_papers={n_a} (round-trip OK)')


def extract(html_path, out_path):
    deck = load_page_json(Path(html_path).read_text(encoding='utf-8'))
    Path(out_path).write_text(json.dumps(deck, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    n_l, n_h, n_a = counts(deck)
    print(f'{out_path}: lanes={n_l} highlights={n_h} all_papers={n_a}')


def main(argv):
    if len(argv) >= 2 and argv[1] == '--extract':
        if len(argv) != 4:
            raise SystemExit(__doc__)
        extract(argv[2], argv[3])
        return
    if len(argv) not in (2, 3):
        raise SystemExit(__doc__)
    json_path = Path(argv[1])
    if len(argv) == 3:
        html_path = Path(argv[2])
    else:
        deck_id = json.loads(json_path.read_text(encoding='utf-8')).get('deck_id')
        if not deck_id:
            raise SystemExit('deck.json 缺 deck_id，請明確指定 html 路徑')
        html_path = Path(__file__).resolve().parent.parent / f'{deck_id}.html'
    inline(json_path, html_path)


if __name__ == '__main__':
    main(sys.argv)
