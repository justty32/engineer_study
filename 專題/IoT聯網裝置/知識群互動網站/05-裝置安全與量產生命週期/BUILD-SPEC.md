# IoT 裝置安全、佈建、量產與生命週期互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[通用品質關卡](../../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是唯一執行契約；補充文件不得覆蓋本檔。

## 1. 全域

- runtime 只有 `index.html`、`styles.css`、`app.js`；相對載入 CSS 與 defer JS。
- 模組鍵：`threat-model`、`device-identity`、`secure-boot`、`ota-budget`、`update-recovery`、`provisioning-line`、`production-gate`、`fleet-lifecycle`。
- 使用 `data-module`、`data-nav`、`data-complete`、`data-reset-module`。
- progress key：`engineerStudy.iotSecurityProduction.v1`；ID：`progress-label`、`progress-fill`、`reset-progress`。
- 無外部字型、圖片、SVG、Canvas、CDN、API 或分析碼；手機、可及性與錯誤規則沿用品質關卡。

## 2. 威脅面初篩

- 輸入：`threat-vector`（`remote` 預設、`physical`、`supply-chain`）、`threat-impact`（`data`、`control` 預設、`safety`）、`threat-scale`（`single`、`fleet` 預設）、`threat-update`（`available` 預設、`none`）。
- 輸出：`threat-priority`、`threat-first-control`、`threat-second-control`、`threat-status`、`threat-feedback`。
- 決策順序：update=none → 可維護性為最高缺口；supply-chain → 簽章 artifact／信任根，再 station 授權與 audit；physical → 不可匯出金鑰，再 secure boot／debug lock；remote+fleet → 每裝置身分／雙向認證，再撤銷／隔離／簽章 OTA；其餘 remote → TLS 身分驗證，再最小權限與更新。
- impact=safety 時將優先級標為高影響，回饋要求 safe state 與故障證據。所有結果皆為初篩警告，不表示已完成 threat model。

## 3. 每裝置身分 gate

- 六個 checkbox：`identity-unique`、`identity-key-nonexport`、`identity-cert-chain` 預設勾；`identity-mutual-auth`、`identity-rotation`、`identity-revocation` 預設未勾，皆為 `data-identity-check`。
- 輸出：`identity-first`、`identity-second`、`identity-count`、`identity-blocker`、`identity-status`、`identity-feedback`。
- 固定順序與必要項：unique identity→non-exportable private key→certificate trust chain→mutual authentication→rotation→revocation。六項皆必要，回報第一缺口，不以總數抵銷。
- 通過只代表身分生命週期設計有基本閉環；仍需 KMS/HSM、憑證政策、後端授權與實機驗證。

## 4. Secure boot 鏈

- `boot-case`：`normal` 預設、`tampered-image`、`downgrade`、`debug-attach`。
- 七個 checkbox：`boot-root-key`、`boot-bootloader-signature`、`boot-app-signature` 預設勾；`boot-antirollback`、`boot-debug-lock`、`boot-fail-closed`、`boot-recovery` 預設未勾，皆為 `data-boot-check`。
- 輸出：`boot-first`、`boot-second`、`boot-count`、`boot-blocker`、`boot-status`、`boot-feedback`。
- 固定順序：immutable root/key→bootloader signature→application signature→anti-rollback→debug lock→fail closed→signed recovery。
- normal/tampered-image 需 root、bootloader、app、fail closed、recovery；downgrade 另需 anti-rollback；debug-attach 另需 debug lock。缺項即阻擋。
- CRC 只能檢查意外損壞，不能替代數位簽章的真實性；debug lock 不可阻斷授權 recovery。

## 5. A/B OTA 容量與傳輸預算

- 輸入：`ota-flash-kib`（2048）、`ota-boot-kib`（128）、`ota-image-kib`（700）、`ota-slots`（2）、`ota-scratch-kib`（128）、`ota-config-kib`（64）、`ota-rate-kib-s`（16）、`ota-delivery-factor`（1.2）。
- 輸出：`ota-required-kib`、`ota-headroom-kib`、`ota-transfer-kib`、`ota-transfer-seconds`、`ota-verdict`、`ota-status`、`ota-feedback`。
- required = boot + image×slots + scratch + config；headroom = flash−required；transfer = image×delivery factor；time = transfer/rate。
- 預設 `1720 KiB`、`328 KiB`、`840 KiB`、`52.5 s`，A/B 容量通過。
- flash/boot/image/scratch/config 非負但 flash、image、rate >0；slots 為 ≥1 的整數；delivery factor≥1。headroom<0 阻擋；slots<2 即使空間足仍警告沒有 A/B rollback。
- 不含檔案系統、對齊、delta update、TLS/協定 overhead、斷點續傳、flash wear 與真實網路功耗。

## 6. 更新故障復原 gate

- `update-case`：`power-loss` 預設、`signature-fail`、`first-boot-fail`、`fleet-regression`。
- 八個 checkbox：`update-authenticity`、`update-integrity`、`update-inactive-slot` 預設勾；`update-atomic-switch`、`update-health-confirm`、`update-rollback`、`update-staged-rollout`、`update-observability` 預設未勾，皆為 `data-update-check`。
- 輸出：`update-first`、`update-second`、`update-count`、`update-blocker`、`update-status`、`update-feedback`。
- 固定順序：signature authenticity→integrity/hash→inactive slot→atomic switch→boot health confirmation→rollback→staged rollout/pause→observability。
- power-loss 需前六項；signature-fail 需 authenticity、integrity、observability；first-boot-fail 需 inactive slot、atomic switch、health、rollback、observability；fleet-regression 需 health、rollback、staged rollout、observability。
- Gate 通過不表示韌體沒有漏洞，只表示失敗處理路徑完整。

## 7. 產線佈建 gate

- `provisioning-case`：`new-device` 預設、`rework`、`certificate-rotation`。
- 八個 checkbox：`provisioning-station-auth`、`provisioning-unique-id`、`provisioning-key-nonexport` 預設勾；`provisioning-cert-bind`、`provisioning-readback`、`provisioning-quarantine`、`provisioning-audit`、`provisioning-debug-lock` 預設未勾，皆為 `data-provisioning-check`。
- 輸出：`provisioning-first`、`provisioning-second`、`provisioning-count`、`provisioning-blocker`、`provisioning-status`、`provisioning-feedback`。
- 固定順序：station authorization→unique serial/MAC→non-exportable key→certificate binding→readback/online challenge→failure quarantine→audit trace→debug lock.
- new-device/rework 八項皆必要；certificate-rotation 不要求 debug lock（但不得解鎖已鎖裝置），其餘七項必要。
- Provisioning 失敗品不得流入下一站；log 不可保存可重建 private key 的明文秘密。

## 8. EVT 到 MP 證據 gate

- `production-stage`：`EVT`、`DVT` 預設、`PVT`、`MP`。
- 八個 checkbox：`production-test-points`、`production-fct` 預設勾；`production-secure-update`、`production-rf-emc`、`production-fixture`、`production-provisioning`、`production-traceability`、`production-change-control` 預設未勾，皆為 `data-production-check`。
- 輸出：`production-first`、`production-second`、`production-count`、`production-blocker`、`production-status`、`production-feedback`。
- 固定順序：test points/SWD→ICT/FCT→secure boot/OTA evidence→RF/EMC prescan→production fixture→provisioning→traceability→change control.
- EVT 需前兩項；DVT 需前四項；PVT 需前七項；MP 八項皆需。預設 DVT 第一缺口為 secure boot/OTA evidence。
- 通過只是該階段的學習 gate，不等於良率達標、認證完成或可直接出貨。

## 9. 機群事件與退役 gate

- `lifecycle-case`：`compromised` 預設、`certificate-expired`、`lost-device`、`retire`。
- 八個 checkbox：`lifecycle-identify`、`lifecycle-quarantine` 預設勾；`lifecycle-revoke`、`lifecycle-rotate`、`lifecycle-patch`、`lifecycle-verify`、`lifecycle-wipe`、`lifecycle-audit` 預設未勾，皆為 `data-lifecycle-check`。
- 輸出：`lifecycle-first`、`lifecycle-second`、`lifecycle-count`、`lifecycle-blocker`、`lifecycle-status`、`lifecycle-feedback`。
- 固定順序：identify scope→quarantine→revoke identity→rotate affected credentials→patch→verify recovery→wipe local data→retain audit evidence.
- compromised 需 identify/quarantine/revoke/rotate/patch/verify/audit；certificate-expired 需 identify/rotate/verify/audit；lost-device 需 identify/quarantine/revoke/audit；retire 需 identify/revoke/wipe/audit。
- 退役必須同時處理後端身分與裝置資料；恢復服務前要驗證，不只看 OTA 任務顯示成功。

## 10. 錯誤、手機與驗收

- 空值、NaN、Infinity、除零、負值與選項錯誤清除舊結果；所有控制即時更新。
- 狀態使用文字、固定符號、邊框與顏色；`aria-live="polite"`；label、button type 與鍵盤操作完整。
- 700px 以下頂部橫向導覽與單欄；390px metrics、gate、長字串與選項不可水平溢位。
- 驗收預設值、OTA 空間不足／單 slot、四種 boot/update/lifecycle 情境、三種 provisioning 情境與四階段 production gate。
