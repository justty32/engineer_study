#!/usr/bin/env python3
"""互動課程 styles.css 正本同步與閘門工具。

背景見 ../SHARED-ASSETS-EVAL.md：本 repo 的 styles.css 分成三個模板家族，
其中「A 家族（課綱課）」的成員彼此位元組相同，且都是從同一份 cp 出來的。
本工具把這個原本靠口頭慣例維持的關係，變成有正本、有腳本、有閘門的流程。

用法（在 repo 任一位置都可執行）：

    python wf/workflows/interactive-study-site/tools/sync-styles.py --check
    python wf/workflows/interactive-study-site/tools/sync-styles.py --sync

  --check  只比對不寫入。全部相同 → exit 0；有漂移或檔案缺失 → exit 1。
           這是驗收固定項，也適合掛進 CI。
  --sync   把正本位元組覆寫到所有下游課程。改樣式的正規流程是：
           先改正本 → 跑 --sync → 一個 commit 掃過全家族 → 抽課做視覺回歸。

設計約束（改動本檔前務必讀）：
  * 只用標準函式庫，不新增任何套件（QUALITY-GATES 第 4 節：不新增套件鎖檔）。
  * 一律以二進位模式讀寫，**不得做 CRLF 正規化**。styles.css 的驗收方式是
    「位元組相同」，BUILD-WITH-CODEX 已把這類檔明文列為換行正規化的例外，
    轉了反而違規。
  * 本工具只管 A 家族。B 家族（深色模式：逆向工程、網路協定）與
    C 家族（IoT 知識群、電力系統）各自客製，刻意不納入管轄。

如何登記新課程：
  在下方 FAMILY 清單加一行相對路徑（課程目錄，不含 /styles.css）即可。
  新課的 styles.css 應該直接從正本 cp，因此登記後第一次 --check 就該通過。
  建置中的課程請等交付後再登記，以免把仍在變動的目錄鎖進閘門。
"""

import argparse
import hashlib
import shutil
import sys
from pathlib import Path

# 正本
# A 家族的血緣起點（2026-08-14 commit 2f3787a）。此後新增的課綱課皆 cp 自它。
CANONICAL = "專題/機器人運動學/互動課程/styles.css"

# A 家族成員（受正本管轄的課程目錄）
# 順序不影響行為，僅為可讀性依登記時間排列。
FAMILY = [
    "專題/機器人運動學/互動課程",      # 正本所在，恆為自身
    "專題/機器人數學基礎/互動課程",
    "專題/作業系統/互動課程",
    "專題/Linux/互動課程",
    "共通基礎/數學/互動課程",
    "共通基礎/物理/互動課程",
    "電機/02-電機核心/電路學-互動課程",
    "電機/02-電機核心/電磁學-互動課程",
    "電機/02-電機核心/電子學-互動課程",
]

# 刻意不納管的家族（僅作紀錄，避免將來有人誤加）
# B 家族（深色模式，自成一格）：專題/逆向工程/互動課程、專題/網路協定/互動課程
# C 家族（各自客製）：專題/IoT聯網裝置/ 全部、電機/04-電力特化/P1-電力系統-互動網站
# 主站：互動學習網站/（版面責任不同，不套課程樣式）

REPO_ROOT = Path(__file__).resolve().parents[4]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve_targets():
    """回傳 [(課程目錄相對路徑, styles.css 絕對路徑)]，正本自身排除在外。"""
    canonical_dir = str(Path(CANONICAL).parent).replace("\\", "/")
    targets = []
    for rel in FAMILY:
        rel = rel.replace("\\", "/")
        if rel == canonical_dir:
            continue
        targets.append((rel, REPO_ROOT / rel / "styles.css"))
    return targets


def main() -> int:
    parser = argparse.ArgumentParser(
        description="互動課程 styles.css 正本同步與閘門工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--check",
        action="store_true",
        help="只比對不寫入；有漂移或缺檔則 exit 1（預設行為）",
    )
    mode.add_argument(
        "--sync",
        action="store_true",
        help="把正本位元組覆寫到所有下游課程",
    )
    args = parser.parse_args()
    do_sync = args.sync

    canonical_path = REPO_ROOT / CANONICAL
    if not canonical_path.is_file():
        print(f"[錯誤] 找不到正本：{CANONICAL}", file=sys.stderr)
        return 2

    canonical_bytes = canonical_path.read_bytes()
    canonical_hash = hashlib.sha256(canonical_bytes).hexdigest()

    print(f"正本　　：{CANONICAL}")
    print(f"sha256　：{canonical_hash}")
    print(f"位元組數：{len(canonical_bytes)}")
    print(f"模式　　：{'--sync 覆寫' if do_sync else '--check 只比對'}")
    print("-" * 72)

    targets = resolve_targets()
    drifted, missing, synced, same = [], [], [], []

    for rel, path in targets:
        if not path.is_file():
            missing.append(rel)
            print(f"[缺檔] {rel}/styles.css")
            continue
        current = sha256(path)
        if current == canonical_hash:
            same.append(rel)
            print(f"[相同] {rel}")
        elif do_sync:
            # 位元組模式覆寫，不經過文字層，確保不動到換行。
            shutil.copyfile(canonical_path, path)
            synced.append(rel)
            print(f"[已同步] {rel}（原 {current[:16]} → {canonical_hash[:16]}）")
        else:
            drifted.append(rel)
            print(f"[漂移] {rel}（{current[:16]}，應為 {canonical_hash[:16]}）")

    print("-" * 72)
    total = len(targets)
    if do_sync:
        print(f"共 {total} 門下游課程：{len(same)} 門原已相同，{len(synced)} 門已同步，"
              f"{len(missing)} 門缺檔")
        if missing:
            print("[失敗] 有缺檔，請確認 FAMILY 清單與課程目錄是否一致。", file=sys.stderr)
            return 1
        return 0

    print(f"共 {total} 門下游課程：{len(same)} 門相同，{len(drifted)} 門漂移，"
          f"{len(missing)} 門缺檔")
    if drifted or missing:
        print(
            "[失敗] 與正本不一致。若正本才是對的，跑 --sync；"
            "若下游的改動才是對的，請先把改動搬回正本再 --sync。",
            file=sys.stderr,
        )
        return 1
    print("[通過] 全家族與正本位元組相同。")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
