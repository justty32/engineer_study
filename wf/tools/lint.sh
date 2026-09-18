#!/usr/bin/env bash
# lint.sh — project-owned 包裝，套用使用者對 lint 範圍的裁定。
# wf-lint.sh 是 kernel-owned（不改）；整庫 --strict 對學習筆記正文條列與名詞對照表會
# 誤報 800+ 條 BIGLIST，使用者已裁定視為誤報，正式驗收範圍收斂為本檔三段。
# 裁定紀錄見 wf/workflows/decisions.json（2026-09-18 二筆：「lint 範圍：wf/＋根入口
# strict，整庫只看 BROKEN；BIGLIST 於筆記正文與名詞對照表視為誤報」）。
#
# 用法：wf/tools/lint.sh [--quiet|-q] [-h|--help]
#   1) wf/                          bash wf-lint.sh --strict wf（連結／殘留／oversize／
#                                    biglist／querycmd 全算失敗）
#   2) 根入口 strict                AGENTS.md、CLAUDE.md、.claude/commands/*.md 跑
#                                    wf-lint.sh --strict（含連結存在與殘留）＋
#                                    grep 佔位符（{{、〔模板說明〕、〔導入判斷〕）為 0
#   3) 整庫 BROKEN-only              bash wf-lint.sh .，只取 ^BROKEN／^BROKEN-ANCHOR／
#                                    TOTAL 行；BIGLIST 等不印、不計入失敗
# 任一段失敗 exit 1；--quiet 只印最後一行總結。
set -u

quiet=0
for a in "$@"; do
  case "$a" in
    --quiet|-q) quiet=1 ;;
    -h|--help) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "lint.sh: 未知參數 $a" >&2; exit 2 ;;
  esac
done

repo=$(cd "$(dirname "$0")/../.." && pwd) || exit 2
cd "$repo" || exit 2
lint=wf/tools/wf-lint.sh

log() { [[ $quiet -eq 1 ]] || printf '%s\n' "$*"; }

fail=0

# 1) wf/ --strict
log "== 1/3 wf/ --strict"
out1=$(bash "$lint" --strict wf 2>&1)
rc1=$?
log "$out1"
[[ $rc1 -ne 0 ]] && fail=1

# 2) 根入口 strict：AGENTS.md、CLAUDE.md、.claude/commands/*.md
log "== 2/3 根入口 strict（AGENTS.md、CLAUDE.md、.claude/commands/*.md）"
root_files=(AGENTS.md CLAUDE.md)
shopt -s nullglob
root_files+=(.claude/commands/*.md)
shopt -u nullglob
out2=$(bash "$lint" --strict "${root_files[@]}" 2>&1)
rc2=$?
log "$out2"
[[ $rc2 -ne 0 ]] && fail=1

residue2=$(grep -n '{{\|〔模板說明〕\|〔導入判斷〕' "${root_files[@]}" 2>/dev/null)
if [[ -n $residue2 ]]; then
  log "PLACEHOLDER-RESIDUE（根入口）"
  log "$residue2"
  fail=1
  root_ok=0
else
  root_ok=1
fi
[[ $rc2 -ne 0 ]] && root_ok=0

# 3) 整庫：只看 BROKEN／BROKEN-ANCHOR／TOTAL，BIGLIST 不印、不計入失敗
log "== 3/3 整庫（只看 BROKEN，BIGLIST 視為誤報不印）"
out3=$(bash "$lint" . 2>&1)
rc3=$?
filtered3=$(printf '%s\n' "$out3" | grep -E '^(BROKEN|BROKEN-ANCHOR|TOTAL)')
log "$filtered3"
[[ $rc3 -ne 0 ]] && fail=1
broken3=$(printf '%s\n' "$out3" | grep '^TOTAL' | sed -E 's/.*broken=([0-9]+).*/\1/')
broken3=${broken3:-?}

s1=$([[ $rc1 -eq 0 ]] && echo PASS || echo FAIL)
s2=$([[ $root_ok -eq 1 ]] && echo PASS || echo FAIL)
overall=$([[ $fail -eq 0 ]] && echo PASS || echo FAIL)

echo "SUMMARY lint: wf/strict=$s1 root-entry-strict=$s2 whole-repo-broken=$broken3 -> $overall"

exit $fail
