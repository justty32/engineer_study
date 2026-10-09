"use strict";

const scenario = document.getElementById("attack-scenario");
const detail = document.getElementById("attack-detail");
if (scenario && detail) {
  const disclosure = document.createElement("details");
  disclosure.className = "result-disclosure";
  const summary = document.createElement("summary");
  summary.textContent = "先預測狀態改變與關鍵證據，再展開核對結果";
  detail.replaceWith(disclosure);
  disclosure.append(summary, detail);

  const update = () => {
    const option = scenario.selectedOptions[0];
    detail.querySelector("[data-title]").textContent = option.textContent;
    ["pre", "mechanism", "change", "impact", "control", "evidence", "limit"].forEach(key => {
      const node = detail.querySelector(`[data-field="${key}"]`);
      if (node) node.textContent = option.dataset[key] || "—";
    });
    disclosure.open = false;
  };
  scenario.addEventListener("change", update);
  update();
}

const search = document.getElementById("term-search");
if (search) {
  const cards = [...document.querySelectorAll(".term-card")];
  const count = document.getElementById("term-count");
  const empty = document.getElementById("term-empty");
  const filterTerms = () => {
    const query = search.value.trim().toLocaleLowerCase("zh-Hant");
    let visible = 0;
    cards.forEach(card => {
      const match = card.textContent.toLocaleLowerCase("zh-Hant").includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (count) count.textContent = `顯示 ${visible} 個進階條目`;
    if (empty) {
      empty.hidden = visible !== 0;
      empty.textContent = `找不到「${search.value}」。可改用繁中、英文全名、縮寫或白話動作。`;
    }
  };
  search.addEventListener("input", filterTerms);
  filterTerms();
}

const quizBank = {
  "01": [
    {
      question: "身分日誌顯示一次登入成功，最穩健的結論是什麼？",
      options: ["本人理解並同意後續所有操作", "身分服務接受了當次驗證材料", "該帳號沒有遭冒用"],
      answer: 1,
      explanation: "答案是「身分服務接受了當次驗證材料」。成功登入不能單獨證明操作者身分或意圖，還要關聯裝置、核准脈絡與後續資源存取。"
    },
    {
      question: "攻擊者取得仍有效的工作階段權杖後，為何可能不必再知道密碼？",
      options: ["權杖可讓伺服器映射到既有安全主體", "權杖會自動變更帳號密碼", "權杖能停用所有授權檢查"],
      answer: 0,
      explanation: "答案是「權杖可讓伺服器映射到既有安全主體」。權杖是已簽發的工作階段材料，但後續能力仍受其範圍、期限與授權限制。"
    },
    {
      question: "要界定帳號冒用後的資料影響，最需要把哪兩類證據串起來？",
      options: ["登入事件與後續資源存取", "只有登入失敗次數", "只有來源 IP 的國別"],
      answer: 0,
      explanation: "答案是「登入事件與後續資源存取」。前者說明服務接受了材料，後者才界定被冒用主體實際讀取或改變了什麼。"
    }
  ],
  "02": [
    {
      question: "不可信字串跨入命令或查詢解譯器時，優先採用哪種防禦？",
      options: ["把字串轉成大寫", "使用保留資料與控制語意的結構化介面", "只在錯誤發生後記錄完整輸入"],
      answer: 1,
      explanation: "答案是「使用保留資料與控制語意的結構化介面」。參數化與型別化介面能避免資料被重新解讀為控制語法。"
    },
    {
      question: "發現路徑中含有上層目錄語意時，防守端應如何判斷是否越界？",
      options: ["只搜尋特定字元", "正規化後確認最終資源仍位於允許根目錄", "接受所有相對路徑"],
      answer: 1,
      explanation: "答案是「正規化後確認最終資源仍位於允許根目錄」。只比對表面字串會漏掉編碼、分隔符與連結造成的等價路徑。"
    },
    {
      question: "程式因越界存取而崩潰，單靠這個現象可以證明什麼？",
      options: ["已能穩定控制執行流程", "存在需修補與界定暴露面的記憶體安全缺陷", "平台緩解措施全部失效"],
      answer: 1,
      explanation: "答案是「存在需修補與界定暴露面的記憶體安全缺陷」。崩潰不等於可利用；輸入可達性、配置、緩解、權限與穩定性仍須另行驗證。"
    }
  ],
  "03": [
    {
      question: "哪個現象最符合應用層重放，而不只是傳輸層重傳？",
      options: ["舊交易被伺服器再次接受並改變狀態", "同一 TCP 區段因遺失而重送", "健康檢查重複建立新連線"],
      answer: 0,
      explanation: "答案是「舊交易被伺服器再次接受並改變狀態」。重放的關鍵是舊動作再次被接受；傳輸重傳只是可靠傳送機制。"
    },
    {
      question: "名稱解析結果符合預期時，為何仍要驗證端點憑證與名稱？",
      options: ["DNS 回覆不等於應用層端點身分保證", "憑證可以取代所有路由控制", "解析結果一定來自攻擊者"],
      answer: 0,
      explanation: "答案是「DNS 回覆不等於應用層端點身分保證」。名稱與路徑控制可能出錯，端點驗證才是通道身分的收尾。"
    },
    {
      question: "大量連接埠探測最直接證明的是什麼？",
      options: ["資料已遭竊", "有人或某服務正在蒐集可達性資訊", "目標主機已取得系統權限"],
      answer: 1,
      explanation: "答案是「有人或某服務正在蒐集可達性資訊」。偵察會增加對系統的了解，但意圖與是否入侵仍需其他證據。"
    }
  ],
  "04": [
    {
      question: "某帳號沿原有權限登入另一台主機，最精確的分類是什麼？",
      options: ["一定是權限提升", "可能是橫向移動，是否提升權限要另查", "一定只是正常維運"],
      answer: 1,
      explanation: "答案是「可能是橫向移動，是否提升權限要另查」。移到新系統與取得更高權限是不同狀態轉換。"
    },
    {
      question: "服務流量暴增並耗盡資源，哪個結論最合適？",
      options: ["已足以歸因特定攻擊者", "可確認可用性受影響，但仍要區分攻擊、故障與突發合法流量", "表示資料完整性必定遭破壞"],
      answer: 1,
      explanation: "答案是「可確認可用性受影響，但仍要區分攻擊、故障與突發合法流量」。影響證據與意圖、歸因證據不能混為一談。"
    },
    {
      question: "原始碼審查乾淨，為何仍不能排除供應鏈竄改？",
      options: ["建置工具、快取或簽章流程仍可能改變成品", "原始碼永遠無法檢查", "供應鏈事件只發生在使用者端"],
      answer: 0,
      explanation: "答案是「建置工具、快取或簽章流程仍可能改變成品」。應以來源證明、隔離建置與獨立重建比對補上原始碼到成品之間的證據。"
    }
  ],
  "05": [
    {
      question: "不可信內容在受害網站來源下被瀏覽器當成程式執行，最符合哪一類？",
      options: ["CSRF", "XSS", "SSRF"],
      answer: 1,
      explanation: "答案是 XSS。關鍵狀態是攻擊者控制的程式取得受害網站來源可用的瀏覽器能力。"
    },
    {
      question: "瀏覽器自動附帶網站憑證，替使用者送出非其意圖的狀態變更，最符合哪一類？",
      options: ["CSRF", "SSRF", "快取污染"],
      answer: 0,
      explanation: "答案是 CSRF。它借用瀏覽器自動附帶的身分材料；防禦要驗證防偽權杖、來源與重新驗證條件。"
    },
    {
      question: "受信任後端依使用者提供的位置向內部服務取資料，最符合哪一類？",
      options: ["XSS", "SSRF", "物件原型污染"],
      answer: 1,
      explanation: "答案是 SSRF。被借用的是後端的網路身分與可達性，因此要檢查解析後位址、重新導向與最終連線目的。"
    }
  ],
  "06": [
    {
      question: "資源伺服器驗證權杖簽章成功後，還必須核對什麼？",
      options: ["只看權杖長度", "簽發者、受眾、類型、時間與流程關聯", "只看使用者顯示名稱"],
      answer: 1,
      explanation: "答案是「簽發者、受眾、類型、時間與流程關聯」。有效簽章只證明某把金鑰簽過，不代表權杖適用於此資源與此流程。"
    },
    {
      question: "Proof Key for Code Exchange（PKCE）主要把授權碼綁到什麼？",
      options: ["發起流程的客戶端所持驗證材料", "任何知道重新導向網址的人", "資源伺服器的資料庫密碼"],
      answer: 0,
      explanation: "答案是「發起流程的客戶端所持驗證材料」。即使授權碼被攔截，缺少對應驗證值也不應能完成交換。"
    },
    {
      question: "使用者同意某應用取得過寬範圍後，最重要的防守動作是什麼？",
      options: ["把同意視為永久安全證明", "最小化範圍、清楚顯示發布者並支援撤銷", "關閉所有稽核記錄"],
      answer: 1,
      explanation: "答案是「最小化範圍、清楚顯示發布者並支援撤銷」。使用者按下同意不代表理解風險，資源端仍須重新授權。"
    }
  ],
  "07": [
    {
      question: "驗證轉送與重放最關鍵的差別是什麼？",
      options: ["轉送利用進行中的新鮮挑戰，重放重用先前擷取材料", "轉送只會發生在瀏覽器", "重放不涉及任何驗證材料"],
      answer: 0,
      explanation: "答案是「轉送利用進行中的新鮮挑戰，重放重用先前擷取材料」。兩者控制不同：前者要做通道與服務綁定，後者要限制材料重用。"
    },
    {
      question: "帳號剛被停用，既有服務票證通常會立刻失效嗎？",
      options: ["一定會，服務每次都回查帳號狀態", "通常不會；常見服務在票證到期前不回查，需配合縮短壽命或重設金鑰", "票證沒有期限"],
      answer: 1,
      explanation: "答案是「通常不會」。常見情況下，KDC 會在下次簽發或續期時檢查；事件處置不能只停用帳號。"
    },
    {
      question: "評估企業目錄爆炸半徑時，哪種模型最有用？",
      options: ["只按帳號名稱排序", "把主體、群組、機器、服務與委派關係畫成圖", "只計算密碼長度"],
      answer: 1,
      explanation: "答案是「畫成圖」。真正的風險取決於攻擊者能沿成員資格、管理權、委派與登入能力等邊改變哪些狀態。"
    }
  ],
  "08": [
    {
      question: "資料執行防護（DEP）已啟用時，哪個風險仍需其他緩解？",
      options: ["重用既有可執行程式片段", "把資料頁直接當新指令執行", "所有越界讀取都自動消失"],
      answer: 0,
      explanation: "答案是「重用既有可執行程式片段」。DEP 阻止資料頁直接執行，但不保證既有程式碼無法被錯誤控制流重用。"
    },
    {
      question: "資訊洩漏為何可能削弱位址空間配置隨機化（ASLR）？",
      options: ["它可能揭露模組基底，使隨機位置不再未知", "它會自動關閉作業系統", "它能修補越界寫入"],
      answer: 0,
      explanation: "答案是「可能揭露模組基底」。ASLR 仰賴位置未知；洩漏位址會縮小不確定性，但仍不等於已取得控制流。"
    },
    {
      question: "觀察到異常堆疊與程序崩潰時，最適當的初步結論是什麼？",
      options: ["已證明遠端程式碼執行", "存在需重現與修補的異常，利用性仍要評估", "一定只是例外處理"],
      answer: 1,
      explanation: "答案是「存在需重現與修補的異常，利用性仍要評估」。輸入控制程度、緩解與程序權限都是額外判斷條件。"
    }
  ],
  "09": [
    {
      question: "關於單次值（nonce），哪個敘述正確？",
      options: ["所有單次值都必須保密", "有些模式要求同一金鑰下唯一；挑戰值還可能要求不可預測", "只要看起來隨機就一定安全"],
      answer: 1,
      explanation: "答案是「唯一與不可預測要依用途區分」。單次值可以公開，真正條件由加密模式或協定的新鮮度需求決定。"
    },
    {
      question: "只看到一次回應較慢，可以證明存在可利用的時間側通道嗎？",
      options: ["可以，任何延遲都是秘密洩漏", "不可以；要控制環境、收集分布並證明差異與秘密判斷穩定連動", "可以，因為網路沒有雜訊"],
      answer: 1,
      explanation: "答案是「不可以」。單次延遲可能來自排程、網路、快取暖機或負載，還不能證明秘密可被復原。"
    },
    {
      question: "統一對外錯誤訊息後，內部診斷應如何處理？",
      options: ["完全不留記錄", "保留足夠錯誤類別與關聯資訊，但避免金鑰、明文與可重放秘密", "把所有秘密寫入日誌以便分析"],
      answer: 1,
      explanation: "答案是「保留足夠診斷但不記秘密」。對外統一能縮小預言機，對內仍需可稽核性與安全的事件關聯。"
    }
  ],
  "10": [
    {
      question: "工作負載能連到雲端中繼資料服務時，哪組控制最貼近風險來源？",
      options: ["只改頁面顏色", "限制目的位址、強化中繼資料服務並最小化工作負載身分", "讓憑證永久有效"],
      answer: 1,
      explanation: "答案是「限制目的、強化服務並最小化身分」。風險來自後端可達性與取得短期憑證後的控制平面能力。"
    },
    {
      question: "容器內程序取得雲端管理權限，是否必然代表容器逃逸？",
      options: ["是，兩者完全相同", "否；可能是工作負載身分或控制平面授權過寬，主機邊界未必失守", "是，因為容器沒有身分"],
      answer: 1,
      explanation: "答案是「否」。容器逃逸是跨越隔離到主機；控制平面權限也可能經合法身分與錯誤政策取得。"
    },
    {
      question: "發現工作負載秘密已廣泛複製後，單做靜態資料加密是否足夠？",
      options: ["足夠，複本與權限不再重要", "不足；還要縮小分發、撤銷輪替並追查使用紀錄", "不足，所以應把秘密寫入映像檔"],
      answer: 1,
      explanation: "答案是「不足」。靜態資料加密保護儲存媒介，不能取代最小分發、短效憑證、撤銷與使用稽核。"
    }
  ],
  "11": [
    {
      question: "路由前綴被錯誤宣告後，哪兩類證據應分開查？",
      options: ["控制平面的宣告變化與資料平面的實際路徑", "只有終端畫面顏色", "只有使用者密碼長度"],
      answer: 0,
      explanation: "答案是「控制平面與資料平面」。宣告說明路徑為何改變，封包與流量則說明實際受到了什麼影響。"
    },
    {
      question: "反射與放大阻斷服務成立時，最關鍵的兩個條件是什麼？",
      options: ["可偽造受害者來源且回應明顯大於請求", "所有流量都經過同一交換器", "受害者主動登入反射服務"],
      answer: 0,
      explanation: "答案是「來源偽造與放大回應」。反射器把較大的回應送往受害者；來源驗證與限制可被濫用的服務都很重要。"
    },
    {
      question: "看到大量半開連線時，哪個結論最合適？",
      options: ["已證明應用資料遭竊", "可能是傳輸狀態耗盡，也要排除故障與合法尖峰", "表示名稱解析一定被污染"],
      answer: 1,
      explanation: "答案是「可能是狀態耗盡，也要排除其他原因」。連線速率、來源分布、佇列狀態與服務健康度要一起看。"
    }
  ],
  "12": [
    {
      question: "軟體材料清單（SBOM）與來源證明的差別是什麼？",
      options: ["前者列出成分，後者描述成品如何建置", "兩者都保證成品沒有漏洞", "前者只記網路流量，後者只記密碼"],
      answer: 0,
      explanation: "答案是「SBOM 列成分，來源證明描述建置」。兩者提供可驗證脈絡，但都不是成品安全的保證書。"
    },
    {
      question: "乾淨重建成品與發布成品的雜湊不同，能直接下什麼結論？",
      options: ["已證明特定人惡意植入", "只能先證明位元組或建置條件不同", "可以忽略差異"],
      answer: 1,
      explanation: "答案是「只能先證明不同」。還要比較工具鏈、相依、環境與時間戳，才能判斷原因與歸因。"
    },
    {
      question: "要證明資料確實跨出授權邊界，哪組證據最完整？",
      options: ["只有暫存檔名稱", "資料查詢、程序集結、出口流量與目的端分享紀錄", "只有週期性網路連線"],
      answer: 1,
      explanation: "答案是「查詢、程序、出口與目的端紀錄」。各來源分別界定資料被讀、被整理、被傳輸及由誰接收。"
    }
  ]
};

const quizRoot = document.querySelector("[data-chapter-quiz]");
if (quizRoot) {
  const chapter = quizRoot.dataset.chapterQuiz;
  const questions = quizBank[chapter] || [];
  const makeNode = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  quizRoot.replaceChildren();
  quizRoot.append(
    makeNode("p", "eyebrow", `第 ${chapter} 章｜不計分，可重做`),
    makeNode("h2", "", "本章自我檢核"),
    makeNode("p", "", "先完成三題再檢查；每題都會顯示答案與解析。")
  );

  const form = makeNode("form", "quiz-form");
  const questionGrid = makeNode("div", "grid");
  const feedbackNodes = [];

  questions.forEach((item, questionIndex) => {
    const fieldset = makeNode("fieldset", "card");
    const legend = makeNode("legend", "", `${questionIndex + 1}. ${item.question}`);
    fieldset.append(legend);
    item.options.forEach((option, optionIndex) => {
      const label = makeNode("label", "control");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `quiz-${chapter}-${questionIndex}`;
      input.value = String(optionIndex);
      label.append(input, document.createTextNode(` ${option}`));
      fieldset.append(label);
    });
    const feedback = makeNode("p", "note");
    feedback.hidden = true;
    feedback.setAttribute("aria-live", "polite");
    feedbackNodes.push(feedback);
    fieldset.append(feedback);
    questionGrid.append(fieldset);
  });

  const actions = makeNode("div", "controls");
  const checkButton = makeNode("button", "", "檢查答案");
  checkButton.type = "submit";
  const resetButton = makeNode("button", "", "重新作答");
  resetButton.type = "reset";
  const result = makeNode("p", "output");
  result.setAttribute("aria-live", "polite");
  actions.append(checkButton, resetButton);
  form.append(questionGrid, actions, result);
  quizRoot.append(form);

  form.addEventListener("submit", event => {
    event.preventDefault();
    let correctCount = 0;
    questions.forEach((item, questionIndex) => {
      const selected = form.querySelector(`input[name="quiz-${chapter}-${questionIndex}"]:checked`);
      const feedback = feedbackNodes[questionIndex];
      feedback.hidden = false;
      if (!selected) {
        feedback.textContent = `尚未作答。答案是「${item.options[item.answer]}」。${item.explanation}`;
        return;
      }
      const isCorrect = Number(selected.value) === item.answer;
      if (isCorrect) correctCount += 1;
      feedback.textContent = `${isCorrect ? "答對。" : `答錯；答案是「${item.options[item.answer]}」。`}${item.explanation}`;
    });
    result.textContent = `本次答對 ${correctCount} / ${questions.length} 題；可修改選項後再次檢查，或按「重新作答」清空。`;
  });

  form.addEventListener("reset", () => {
    feedbackNodes.forEach(feedback => {
      feedback.hidden = true;
      feedback.textContent = "";
    });
    result.textContent = "已清空，可以重新作答。";
  });
}
