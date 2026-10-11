# 圖解作業系統

[GitHub Pages 公開版](https://justty32.github.io/engineer_study/operating-systems-little-lab/)｜[驗收與部署證據](驗收紀錄.md)

從「程式如何輪流使用硬體」開始，沿著行程、排程、同步、虛擬記憶體、檔案與 I/O，追到一次系統呼叫如何完成。20 課均以原創圖、完整計算或狀態演進、回代檢查與遷移練習建立機制；會寫程式即可開始，不要求先懂作業系統。

- [本機課程首頁](dist/index.html)
- [零基礎起點](dist/00-role.html)
- [時間片輪轉：佇列與三種時間指標](dist/04-round-robin.html)
- [虛擬位址、TLB 與頁表](dist/12-translation.html)
- [名詞字典](dist/glossary.html)

公開目錄只包含 `dist/`，部署 slug 為 `operating-systems-little-lab`。開啟首頁即可離線學習；停用 JavaScript 仍可讀完整正文、例題與練習詳解。外部教材連結供查證，課程執行不會連線取用外部字型、圖片或程式。

舊版 [11 課互動課程](../互動課程/index.html) 與其程式、樣式、封存資料保持原樣。新站補充必要的大學核心機制；原有敘述的修正理由和查證證據記在 [來源與勘誤說明](SOURCE-NOTES.md)，不把教學簡化當作真實系統的普遍保證。

## 建置與驗收

[立案](PROJECT-BRIEF.md)｜[建置契約](BUILD-SPEC.md)｜[派工](派工計畫.md)｜[整體驗收](驗收紀錄.md)

[機制與演算審核](MECHANISM-REVIEW.md)｜[教學審核](TEACHING-REVIEW.md)｜[技術審核](TECHNICAL-REVIEW.md)｜[公開資產清單](公開資產manifest.json)

公開資產的精確檔案與雜湊由最終 manifest 記錄，獨立驗收文件綁定同一份成品摘要。模型、來源、覆蓋、勘誤與審核資料留在本目錄，發布時只複製課程成品。
