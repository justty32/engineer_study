#!/usr/bin/env python3
"""驗證單一主線錯誤不會讓後續主線停止檢查。"""
import json
import tempfile
import unittest
from pathlib import Path

import validate_deck


def valid_lane():
    rows = []
    highlights = []
    for i in range(1, 5):
        arxiv_id = f'2401.0000{i}'
        rows.append({
            'arxiv_id': arxiv_id,
            'status': '⬜',
            'title_zh': f'測試論文 {i}',
            'cat': 'A',
            'summary_file': None,
            'translate_file': None,
        })
        highlights.append({
            'arxiv_id': arxiv_id,
            'title_zh': f'必讀 {i}',
            'title_en': f'Paper {i}',
            'year': '2024-01',
            'role': f'角色 {i}',
            'one_liner': '一句說明。',
            'plain': '白話說明。',
            'core': '核心說明。',
            'number': {'label': '標籤', 'value': '1', 'note': '作者自報'},
            'why': '必讀理由。',
            'links': {'arxiv': f'https://arxiv.org/abs/{arxiv_id}', 'summary': 'https://example.com/summary'},
        })
    return {
        'id': 'later-lane',
        'name': '後續主線',
        'minutes': 15,
        'paper_count': 4,
        'deep_doc': 'https://example.com/deep',
        'gist': {'summary': '摘要。', 'points': ['一。', '二。', '三。'], 'open': '待解問題。'},
        'highlights': highlights,
        'question': '如何驗證？',
        'hint': '先找可重複的證據。',
        'example_answer': '前提：可重複測試。示例回答：以獨立測試判斷。',
        'all_papers': rows,
    }


class ValidateDeckIsolationTest(unittest.TestCase):
    def test_bad_lane_does_not_skip_later_lane(self):
        broken = valid_lane()
        broken['id'] = 'broken-lane'
        del broken['question']
        later = valid_lane()
        deck = {
            'deck_id': 'isolation-test',
            'title': '局部錯誤測試',
            'subtitle': '測試。',
            'total_minutes': 30,
            'intro': '測試。',
            'lanes': [broken, later],
            'threads': [{'title': '跨線', 'text': '測試。', 'lane_ids': ['later-lane'], 'paper_ids': ['2401.00001']}],
            'outro': '測試。',
        }
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'deck.json'
            path.write_text(json.dumps(deck, ensure_ascii=False), encoding='utf-8')
            report = validate_deck.check_deck(path)

        self.assertEqual(report.errors, ['lane[0] 缺欄位 question'])
        self.assertEqual(report.summary, (2, 4, 4))


if __name__ == '__main__':
    unittest.main()
