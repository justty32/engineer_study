# 整流與電容濾波：建置契約

兩堂各九段，lesson er-bridge/er-filter；segment er1-01..09、er2-01..09，各03/06/09對圖一至六停靠。window.CIRCUIT_AUDIO.lessons，正文4200–5000漢字/堂，MD逐字同源。播放器沿暫態模板，storageKey electronics-rectifier-v1，manifest空，手動fallback，不自動朗讀。

第一堂圖一er-input：輸入vs=12sin(2π50t)V，12是峰值，RMS=12/sqrt2≈8.485V，週期20ms；圖只輸入波。圖二er-bridge：交流端A/B、輸出正P負N，四二極體接向明確：A→P、B→P、N→A、N→B。負載R接P到N，正半週A→D_AP→P→R→N→D_NB→B→來源A；負半週B→D_BP→P→R→N→D_NA→A→來源B，兩條高亮路徑都閉合，負載流向皆P→N。可以切換高亮但不改頻率。每個二極體恆壓降0.7，導通路徑兩顆。

圖三er-rectified：無電容，vo=max(abs(vs)-1.4,0)，R=1000Ω，峰10.6V，輸出脈動重複10ms/100Hz；絕不能拿輸入RMS直接減1.4當整流直流平均，也不能說全橋把能量翻倍。平均值可details用數值積分示意，不要稱10.6為平均。圖二切換只操作路徑。

第二堂圖四er-storage：同全橋後C與R並聯，C正P負N；在絕對輸入大於電容電壓加1.4時補電，其他時橋截止、C經R放電。標兩種閉合回路，電容不是接成串聯。圖五er-ripple：固定12Vpeak/50Hz，R1kΩ、C1000μF，週期穩態模型vo(t)=max(max(abs(vs(t))-1.4,0),前一步vo*exp(-dt/(RC)))；先迭代至少10RC時間或解析穩態再畫最後40ms。理想零源阻抗+恆壓降橋，勿把理想補電尖峰宣稱為真實充電電流，未模擬二極體恢復/源阻抗。露出Vmax,Vmin,平均,Vpp與橋導通區；平均須從實際波形算。

圖六er-capacitance互動：id er-cap-uF range100..2000μF step100 default1000；R1k固定。提供100/1000/2000快捷。更新穩態波形和Vmax/Vmin/Vavg/ΔVpp，ΔV≈Iload/(100C)只是小漣波近似，Iload用Vavg/R，不與模擬精確值混稱；C增大漣波降低，輸出有負載仍不成完美直流。可另外R500/1000/2000固定對照說重負載更大漣波，若沒提供R控制稿不能要求調R。模型計算CPU輕量，避免每次input數百萬迭代；可用週期固定點或少量步進，QA獨立較細步核。

圖標時間ms、電壓V，三次停靠說圖號和重點；圖三固定無電容，圖五固定1000μF，圖六才可動。不講LC濾波/穩壓/效率設計，無電容電流波形可細節但不混電容補電。深入連../../圖解電子學/dist/03-rectifier.html及../../電路學-互動課程/聽課-暫態與微分方程/index.html。五類驗收同二極體課；作者獨佔本目錄前端、講稿與局部測試，不碰wf/別課/入口，獨立QA後補。headless需--disable-gpu且協調，作者先不開瀏覽器。
