# 機器人學習與訓練互動課程 Brief

## 讀者與目標

「機器人訓練」在本課指讓策略從資料或互動改善行為，包括模仿學習（Imitation Learning, IL）、強化學習（Reinforcement Learning, RL）、模擬訓練與模擬轉真實（simulation-to-real, sim-to-real）。讀者會 C++，但不假設懂機器學習。

完成後能定義觀測、狀態、動作、策略與獎勵；辨識資料洩漏與分布偏移；解釋行為複製與資料集聚合；理解馬可夫決策過程、回報、價值與策略更新；設計 sim-to-real 與安全部署閘門。

## 概念依賴

`控制迴路與資料 → 監督／模仿學習 → MDP 與回報 → 策略改善 → 模擬與 domain randomization → 安全評估與 C++ 部署`

## 邊界

互動只展示小型數值模型，不訓練神經網路、不連接真實機器人、不保證任何演算法收斂或實機安全。

## 來源

- 本地：[七軸機械手臂運動學](../../機器人運動學/互動課程/index.html)、[系統動態與控制](../../../機械/05-動態系統與控制/13-系統動態與控制.md)。
- 外部基礎參考：[Sutton 與 Barto《Reinforcement Learning: An Introduction》](https://mitpress.mit.edu/9780262039246/reinforcement-learning/)。
- 模仿學習原始論文：[A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning](https://www.cs.cmu.edu/~sross1/publications/Ross-AIStats11-NoRegret.pdf)。

