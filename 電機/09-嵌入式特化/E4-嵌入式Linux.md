# E4 嵌入式 Linux（Embedded Linux）概論

> 嵌入式特化第 4 科。
> 名詞對照見 [中英名詞對照表 → 嵌入式](../中英名詞對照表-4.md#嵌入式)。

## 這科在學什麼

當功能複雜到需要檔案系統、網路堆疊、多行程、圖形介面，且硬體有 MMU（記憶體管理單元）與足夠 RAM 時，就從 MCU/RTOS 升級到**嵌入式 Linux**。本科從 EE / 嵌入式視角理解 Linux 系統如何在裝置上跑起來、如何客製與裁剪。

1. 嵌入式 Linux 的開機鏈與組成
2. 核心、Device Tree、驅動模型
3. 根檔案系統與建構系統（Yocto / Buildroot）
4. 即時性（PREEMPT_RT）與效能
5. 容器與部署

> 一般 Linux 應用程式設計（shell、行程、網路 socket）擁有者已熟，從略；聚焦**嵌入式特有**部分。

## 第 1 章　何時用 Linux 而非 RTOS

| 指標 | RTOS（MCU） | 嵌入式 Linux（MPU） |
|---|---|---|
| 硬體 | Cortex-M、無 MMU、KB RAM | Cortex-A、有 MMU、MB~GB RAM |
| 即時性 | 硬即時佳 | 預設非硬即時（可加 PREEMPT_RT） |
| 功能 | 精簡 | 檔案系統、網路、GUI、多行程 |
| 開機 | 毫秒 | 秒級 |
| 功耗 | 極低 | 較高 |

許多產品用 **AMP 異構**：Cortex-A 跑 Linux（介面 / 連網）+ Cortex-M 跑 RTOS（即時控制），透過 RPMsg / OpenAMP 溝通（如 STM32MP1、i.MX）。

## 第 2 章　嵌入式 Linux 開機鏈

```
ROM code（晶片內建）
   → SPL / first-stage bootloader（初始化 DRAM）
   → U-Boot（second-stage bootloader）
   → Linux Kernel（zImage/Image + Device Tree Blob）
   → init（systemd / BusyBox init / SysV）
   → 使用者空間服務 / 應用
```

### 2.1 U-Boot
- 初始化最小硬體、載入核心 + DTB + initramfs。
- 環境變數、開機腳本、網路開機（TFTP / NFS，開發很方便）。
- 支援多種儲存（eMMC、SD、NAND、SPI Flash）。

### 2.2 核心映像與 initramfs
- `Image`/`zImage`、`*.dtb`、可選 `initramfs`（早期根檔案系統）。

## 第 3 章　Device Tree（裝置樹）

### 3.1 為什麼有 Device Tree
ARM 平台硬體千變萬化；不可能每塊板子改核心程式碼。**Device Tree** 用資料描述硬體（哪些周邊、地址、中斷、時脈、接腳），核心開機時讀取，驅動據此綁定。

### 3.2 結構
- `.dts`（板級）＋ `.dtsi`（SoC 共用，include）→ 編譯成 `.dtb`。
- 節點 / 屬性：`compatible`（配對驅動）、`reg`（地址）、`interrupts`、`clocks`、`pinctrl`、`status`。
- **overlay**：執行期動態加裝置（如擴充板 / HAT）。

### 3.3 與驅動的關係
驅動宣告支援的 `compatible` 字串；核心比對 Device Tree 節點 → `probe()` 載入。

## 第 4 章　Linux 驅動模型

### 4.1 使用者空間 vs 核心空間
- 核心空間：驅動、核心執行緒，特權、可碰硬體。
- 使用者空間：應用，受保護；經系統呼叫 / 裝置檔 / sysfs 與核心互動。

### 4.2 裝置分類
- **字元裝置（char）**：序列存取（UART、感測器）— `/dev/ttyXXX`。
- **區塊裝置（block）**：隨機存取 + 快取（eMMC、SD）。
- **網路裝置**：net_device。

### 4.3 驅動框架
盡量用既有子系統框架而非從零寫：
- **GPIO / pinctrl、I²C、SPI、IIO（感測器）、Input、V4L2（影像）、ALSA（音訊）、regmap、clk、DMA engine**。
- 框架處理共通邏輯，驅動只填硬體細節。

### 4.4 從使用者空間碰硬體（免寫核心驅動）
- **sysfs / libgpiod**（GPIO）、**spidev / i2c-dev**、**IIO sysfs**、**UIO**（使用者空間 I/O）、**memmap /dev/mem**。
- 快速原型 / 簡單需求常用，省去寫核心模組。

### 4.5 核心模組
- 可載入模組（`.ko`）：`insmod`/`modprobe`，動態擴充核心。
- `probe`/`remove`、`file_operations`、字元裝置註冊。

## 第 5 章　根檔案系統（Root Filesystem）

### 5.1 組成
- BusyBox（精簡 coreutils）或完整 GNU 工具。
- libc：glibc（功能全）/ musl / uClibc（小）。
- init 系統：systemd（功能多、較大）/ BusyBox init / OpenRC。
- 應用 + 函式庫 + 設定。

### 5.2 儲存格式
- **可讀寫**：ext4。
- **唯讀 / 壓縮**：SquashFS（省空間、防改）。
- **Flash 專用**：UBIFS / JFFS2（raw NAND，含磨損平衡）。
- **唯讀根 + overlay**：提升可靠度（掉電安全），可寫資料另置一區。

## 第 6 章　建構系統（Build System）

從零湊一套交叉工具鏈 + 核心 + rootfs 很痛苦，故用建構系統自動化：

### 6.1 Buildroot
- 簡單、快速、Makefile + Kconfig。
- 產出固定 image，適合中小型、變動少的產品。

### 6.2 Yocto Project / OpenEmbedded
- 業界主流、強大但學習曲線陡。
- **layer / recipe / bitbake**：分層描述如何抓原始碼、編譯、打包。
- 可重現建構、套件管理、SDK 生成、授權追蹤。
- 適合長期維護、大型、多板子產品線。

### 6.3 交叉編譯工具鏈
`aarch64-linux-gnu-gcc` 等；sysroot 提供目標的標頭與函式庫。

## 第 7 章　即時性與效能

### 7.1 PREEMPT_RT
標準 Linux 不保證硬即時（中斷關閉區段、不可搶占核心路徑造成延遲）。**PREEMPT_RT** patch 讓幾乎整個核心可搶占、中斷執行緒化 → 低且有界的延遲（數十 µs）。
- 仍不如裸機 RTOS，但對多數軟 / 韌即時夠用。

### 7.2 其他手段
- CPU 親和性（affinity）、隔離核心（isolcpus）給即時任務專用。
- 高解析計時器、SCHED_FIFO/RR 即時排程類別。
- 異構（A+M）把硬即時丟給 M 核。

### 7.3 開機時間最佳化
精簡核心 / 服務、延後載入、唯讀 rootfs、U-Boot 跳過延遲——車機 / 工業要求快速開機。

## 第 8 章　容器與現代部署

- **容器（Docker / Podman / balena）**：把應用 + 相依打包，邊緣裝置部署一致、易更新。
- **OTA 系統更新**：Mender、RAUC、SWUpdate、OSTree——A/B 分區 + 原子更新 + 回滾（接 E3 OTA 觀念，但更新整個系統映像）。
- **遠端管理 / 監控**：邊緣機群管理。

## 第 9 章　圖形與多媒體（簡介）

- 顯示：framebuffer、DRM/KMS、Wayland。
- GUI 框架：Qt、LVGL（也可無 OS）、Flutter-embedded、web（Chromium kiosk）。
- 多媒體：GStreamer pipeline、硬體編解碼（VPU）。

## 第 10 章　資安

- 安全開機（verified boot：U-Boot 驗章 → 核心 → rootfs，dm-verity）。
- rootfs 加密（dm-crypt / LUKS）、TPM / 安全元件。
- 最小化攻擊面（拿掉沒用的服務）、權限分離、SELinux / AppArmor。
- 更新簽章與防回滾。

## 與其他科目的銜接

- RTOS（E2）：對照其即時性與足跡；AMP 異構共存。
- 韌體與驅動（E3）：裸機驅動觀念 → Linux 驅動框架。
- 計算機組織：MMU、特權級、虛擬記憶體。
- 作業系統（軟體本科）：行程 / 排程 / 記憶體 / 檔案系統理論基礎。
- IoT 與邊緣運算（E5）：Linux 常是邊緣閘道 / AI 裝置的底座。

下一科：[IoT 與邊緣運算 →](E5-IoT與邊緣運算.md)
