# 兩堂完整音檔接入（等待使用者開始指令）

使用者已授權以目前官方中文音色生成兩堂完整音檔。固定19段（p1-01至p1-09、p2-01至p2-10），課稿不改。TTS線/root/tts_alternatives負責外部GPU生成；audio-course-lead唯一負責repo音檔與audio-manifest.js，收到每段有效完成檔就接入，不等全課。當前0/19，TTS啟動前發現遊戲占GPU，依root指示尚未開始生成。使用者已明確選擇：等他之後說「開始生成」再跑。不得自動監測遊戲結束後啟動；目前沒有安排自動啟動。整課生成授權保留，之後收到開始指令即可續跑，不需重問同一授權。

外部交付清單預計/home/lorkhan/data/engineer-study-audio/qwen3-course/audio-export.json，segments每筆含segment_id、absolute_path、duration_seconds、src、checkpoint、figure。每段接入需確認ID屬本課、ffprobe音訊有效且秒數正值、對應原稿checkpoint，再copy暫存檔後原子替換audio/{id}.mp3；全部檔案有效後原子更新window.CIRCUIT_AUDIO_ASSETS的segments，保留sample。禁止填不存在的檔案或把sample當課程。

UI顯示已生成x/19，未生成仍用瀏覽器朗讀，重新整理取得新增音檔。全19齊後核對覆蓋與總實測時長、HTTP無404、原生時間軸／倍速／段間續播及6個圖停靠；沿用既有headless工具，不新增依賴。音色、長時背景遊戲仍保留真人驗收。

播放器前一輪已完成，證據見[播放器交接](2026-10-14-audio-player.md)。正式預覽為課程內preview_server.py，127.0.0.1:8876，PID53900/exec1552。headless已停，不需生成期間保持瀏覽器開啟。收到TTS段落完成消息再恢復接入與測試。整課音檔尚未生成；本輪已從SESSION與現役CLAIM移除，等待條件改記WAIT_USER。
