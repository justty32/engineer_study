#!/usr/bin/env python3
"""從 symbolic-arc-automata.html 複製出新的 deck 閱讀頁並灌資料。

用法：python3 data/make_page.py data/<deck_id>.json
產生 <deck_id>.html（<title>、<meta name="description"> 依 JSON 改寫），再呼叫 inline_deck 灌入。
既有的 <deck_id>.html 會被覆寫（骨架以 symbolic-arc-automata.html 為準，app.js／styles.css 共用）。
"""
import json
import re
import sys
from pathlib import Path

import inline_deck

SITE = Path(__file__).resolve().parent.parent
TEMPLATE = SITE / 'symbolic-arc-automata.html'


def main(json_path):
    deck = json.loads(Path(json_path).read_text(encoding='utf-8'))
    deck_id, title = deck['deck_id'], deck['title']
    html = TEMPLATE.read_text(encoding='utf-8')
    html = inline_deck.TAG_RE.sub(lambda m: m.group(1) + '{}' + m.group(3), html, count=1)
    html, n1 = re.subn(r'<title>.*?</title>', f'<title>{title}｜論文速覽</title>', html, count=1)
    lane_n = len(deck['lanes'])
    desc = f'{title}：{lane_n} 條主線的全景與必讀卡，手機單手可讀。'
    html, n2 = re.subn(r'(<meta name="description" content=")[^"]*(">)', lambda m: m.group(1) + desc + m.group(2), html, count=1)
    if n1 != 1 or n2 != 1:
        raise SystemExit('模板缺 <title> 或 <meta name="description">')
    out = SITE / f'{deck_id}.html'
    out.write_text(html, encoding='utf-8')
    inline_deck.inline(json_path, out)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
