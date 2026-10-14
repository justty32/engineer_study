# 聽課製作團隊歷史（2026-10-14）

[現役名冊](ROSTER.md)

### `audio-course-lead`
- **狀態**：已收線（2026-10-14；完整音檔待使用者說開始生成）
- **我是誰**：本輪相位與複數聽課隊長；現行 Codex 模型。
- **團隊**：audio-course（內建 agent 通道）
- **上游**：root（使用者溝通）
- **領地**：新課規格、交接書與 wf 活狀態；子線依明列檔案互斥。
- **答得出什麼**：課程範圍、整合與驗收。
- **答不出什麼**：使用者實機音色、對外發布。
- **怎麼找我**：內建 agent `/root/audio_course_lead`。
- **訂閱主題**：無。

### `audio-course-script`
- **狀態**：已收線（2026-10-14）
- **我是誰**：本輪 script 子線；現行 Codex 模型。
- **團隊**：audio-course（內建 agent 通道）
- **上游**：audio-course-lead
- **領地**：電路學-互動課程/聽課-相位與複數/lesson-data.js、完整口語稿.md
- **答得出什麼**：口語講稿、內容與字數。
- **答不出什麼**：範圍外課程、對外發布。
- **怎麼找我**：內建 agent `/root/audio_course_lead/script`。
- **訂閱主題**：無。

### `audio-course-builder`
- **狀態**：已收線（2026-10-14）
- **我是誰**：本輪 builder 子線；現行 Codex 模型。
- **團隊**：audio-course（內建 agent 通道）
- **上游**：audio-course-lead
- **領地**：電路學-互動課程/聽課-相位與複數/index.html、audio-course.css、audio-course.js、audio-manifest.js、audio/sample.mp3、preview_server.py
- **答得出什麼**：圖解與播放狀態。
- **答不出什麼**：範圍外課程、對外發布。
- **怎麼找我**：內建 agent `/root/audio_course_lead/builder`。
- **訂閱主題**：無。

### `audio-course-qa`
- **狀態**：已收線（2026-10-14）
- **我是誰**：本輪 qa 子線；現行 Codex 模型。
- **團隊**：audio-course（內建 agent 通道）
- **上游**：audio-course-lead
- **領地**：電路學-互動課程/聽課-相位與複數/驗收紀錄.md
- **答得出什麼**：獨立數學與瀏覽器驗收。
- **答不出什麼**：範圍外課程、對外發布。
- **怎麼找我**：內建 agent `/root/audio_course_lead/qa`。
- **訂閱主題**：無。

### `next-circuit-course-lead`
- **狀態**：已收線（2026-10-14）
- **我是誰**：阻抗聽課續篇隊長，現行模型；帶 script／builder／qa 子線。
- **團隊**：impedance-audio（內建通道）
- **上游**：root
- **領地**：新課規格、wf行政與原課最小導航；子線依BUILD-SPEC互斥。
- **答得出什麼**：續篇範圍、進度與驗收。
- **答不出什麼**：使用者聽感、音色與對外發布。
- **怎麼找我**：內建 agent /root/next_circuit_course_lead。
- **訂閱主題**：無。

### `impedance-audio-script`
- **狀態**：已收線（2026-10-14）
- **我是誰**：續篇script子線，現行模型。
- **團隊**：impedance-audio（內建通道）
- **上游**：next-circuit-course-lead
- **領地**：新聽課-阻抗與交流分析/lesson-data.js、完整口語稿.md。
- **答得出什麼**：講稿與同源資料。
- **答不出什麼**：範圍外內容、角色聲音與發布。
- **怎麼找我**：內建agent /root/next_circuit_course_lead/script。
- **訂閱主題**：無。

### `impedance-audio-builder`
- **狀態**：已收線（2026-10-14）
- **我是誰**：續篇builder子線，現行模型。
- **團隊**：impedance-audio（內建通道）
- **上游**：next-circuit-course-lead
- **領地**：新聽課-阻抗與交流分析/index.html、audio-course.css、audio-course.js、audio-manifest.js。
- **答得出什麼**：圖解與播放器。
- **答不出什麼**：範圍外內容、角色聲音與發布。
- **怎麼找我**：內建agent /root/next_circuit_course_lead/builder。
- **訂閱主題**：無。

### `impedance-audio-qa`
- **狀態**：已收線（2026-10-14）
- **我是誰**：續篇qa子線，現行模型。
- **團隊**：impedance-audio（內建通道）
- **上游**：next-circuit-course-lead
- **領地**：新聽課-阻抗與交流分析/驗收紀錄.md。
- **答得出什麼**：獨立數學及CPU headless驗收。
- **答不出什麼**：範圍外內容、角色聲音與發布。
- **怎麼找我**：內建agent /root/next_circuit_course_lead/qa。
- **訂閱主題**：無。
