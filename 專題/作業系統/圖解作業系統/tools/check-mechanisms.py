#!/usr/bin/env python3
"""獨立機制算器：expected 不匯入網站 app，也不以其函式產生答案。"""
from collections import deque
from fractions import Fraction
import argparse
import itertools
import json
from pathlib import Path
import subprocess


def rr(jobs, quantum):
    """逐 ms 模擬；每刻到達先加入 ready，片末才重新加入 running。"""
    assert isinstance(quantum, int) and quantum > 0
    assert all(isinstance(a, int) and a >= 0 and isinstance(b, int) and b > 0 for _, a, b in jobs)
    remaining = {n: b for n, a, b in jobs}
    ready, first, complete, timeline = deque(), {}, {}, []
    ordered = sorted(jobs, key=lambda x: (x[1], x[0]))
    arrivals = {}
    for n, a, _ in ordered:
        arrivals.setdefault(a, []).append(n)
    time = 0
    ready.extend(arrivals.get(0, []))
    while len(complete) < len(jobs):
        if not ready:
            time += 1
            ready.extend(arrivals.get(time, []))
            continue
        name = ready.popleft()
        start = time
        first.setdefault(name, time)
        for _ in range(min(quantum, remaining[name])):
            remaining[name] -= 1
            time += 1
            ready.extend(arrivals.get(time, []))
        timeline.append([name, start, time])
        if remaining[name]:
            ready.append(name)
        else:
            complete[name] = time
    metrics = {n: {"completion": complete[n], "turnaround": complete[n]-a,
                   "response": first[n]-a, "waiting": complete[n]-a-b}
               for n, a, b in jobs}
    assert sum(end-start for _, start, end in timeline) == sum(b for _, _, b in jobs)
    assert all(all(v >= 0 for v in m.values()) for m in metrics.values())
    return {"timeline": timeline, "metrics": metrics}


def translation(va, pfn, tlb="miss", pte="resident", permission="allow"):
    assert isinstance(va, int) and 0 <= va <= 65535
    assert isinstance(pfn, int) and 0 <= pfn <= 63
    vpn, offset = divmod(va, 1024)
    result = {"vpn": vpn, "offset": offset, "effective_tlb_hit": tlb == "hit" and pte == "resident"}
    if pte == "unmapped":
        result.update(result="unmapped", pa=None)
    elif permission == "deny":
        result.update(result="protection", pa=None)
    elif pte != "resident":
        result.update(result="page-fault", pa=None)
    else:
        result.update(result="translated", pa=pfn*1024+offset)
    return result


def replacement(references, frames, policy):
    memory, order, trace = [], [], []
    faults = 0
    for page in references:
        fault = page not in memory
        if fault:
            faults += 1
            if len(memory) == frames:
                victim = order.pop(0)
                memory[memory.index(victim)] = page
            else:
                memory.append(page)
            order.append(page)
        elif policy == "LRU":
            order.remove(page)
            order.append(page)
        trace.append({"page": page, "frames": memory[:], "fault": fault})
    return {"faults": faults, "hits": len(references)-faults, "trace": trace}


def self_checks():
    base = rr([("A", 0, 5), ("B", 1, 3), ("C", 2, 1)], 2)
    assert base["timeline"] == [["A", 0, 2], ["B", 2, 4], ["C", 4, 5], ["A", 5, 7], ["B", 7, 8], ["A", 8, 9]]
    assert [base["metrics"][n]["waiting"] for n in "ABC"] == [4, 4, 2]
    assert rr([("A", 2, 1), ("B", 5, 1), ("C", 5, 1)], 10)["timeline"] == [["A", 2, 3], ["B", 5, 6], ["C", 6, 7]]
    assert rr([("A", 0, 3), ("B", 2, 1), ("C", 2, 1)], 2)["timeline"] == [["A", 0, 2], ["B", 2, 3], ["C", 3, 4], ["A", 4, 5]]
    va = translation(0x1234, 9)
    assert (va["vpn"], va["offset"], va["pa"]) == (4, 564, 9780)
    assert va["pa"] == 0x2634
    assert translation(65535, 63)["pa"] == 65535
    assert translation(1024, 0)["offset"] == 0
    assert translation(1023, 0)["offset"] == 1023
    for pte in ["resident", "nonresident", "unmapped"]:
        for tlb in ["hit", "miss"]:
            assert translation(4660, 9, tlb, pte, "deny")["pa"] is None
            if pte != "resident":
                assert translation(4660, 9, tlb, pte)["pa"] is None
    references = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
    fifo, lru = replacement(references, 3, "FIFO"), replacement(references, 3, "LRU")
    assert (fifo["faults"], lru["faults"]) == (9, 10)
    assert replacement(references, 4, "FIFO")["faults"] == 10
    assert replacement([2, 3, 2, 4, 2, 3], 2, "FIFO")["faults"] == 5
    assert replacement([2, 3, 2, 4, 2, 3], 2, "LRU")["faults"] == 4
    assert replacement([1, 2, 3, 1, 2, 3], 2, "LRU")["faults"] == 6
    assert replacement([1, 2, 3, 1, 2, 3], 3, "LRU")["faults"] == 3
    values = {"amdahl": str(1/(Fraction(1, 4)+Fraction(3, 4)/4)),
              "pages_2500": (2500+1023)//1024, "waste_2500": 3*1024-2500,
              "base_bound_pa": 4096+600,
              "indirect_entries": 4096//4, "max_data_blocks": 12+4096//4,
              "transfer_ms": str(Fraction(64*1024, 16*1024*1024)*1000),
              "poll_us": 16*5, "call_us": 16*2}
    assert values["amdahl"] == "16/7"
    assert values["waste_2500"] == 572
    assert values["transfer_ms"] == "125/32"
    return {"status": "pass", "rr": base, "va": va, "fifo": fifo, "lru": lru, "values": values}


def check_app():
    """只取得 app actual；expected 全由上面的獨立逐刻算器／整除算器提供。"""
    cases, expected = [], []
    for arrivals in itertools.product(range(3), repeat=3):
        for bursts in itertools.product(range(1, 4), repeat=3):
            for q in [1, 2, 3]:
                jobs = [(n, a, b) for n, a, b in zip("ABC", arrivals, bursts)]
                cases.append({"kind": "rr", "jobs": [{"arrival": a, "burst": b} for _, a, b in jobs], "q": q})
                expected.append(rr(jobs, q))
    for arrivals, bursts, q in [([0, 1, 2], [5, 3, 1], 2), ([20, 20, 20], [20, 20, 20], 1),
                               ([0, 20, 20], [1, 1, 20], 10), ([20, 0, 10], [20, 20, 20], 10)]:
        jobs = [(n, a, b) for n, a, b in zip("ABC", arrivals, bursts)]
        cases.append({"kind": "rr", "jobs": [{"arrival": a, "burst": b} for _, a, b in jobs], "q": q})
        expected.append(rr(jobs, q))
    rr_count = len(cases)
    for va, pfn, tlb, state, permission in itertools.product([0, 1, 1023, 1024, 4660, 10940, 65535], [0, 9, 63], ["hit", "miss"], ["resident", "nonresident", "unmapped"], ["allow", "deny"]):
        cases.append({"kind": "va", "input": {"va": hex(va), "pfn": pfn, "tlb": tlb, "state": state, "permission": permission}})
        expected.append(translation(va, pfn, tlb, state, permission))
    va_count = len(cases)-rr_count
    invalid = ["", " ", "-1", "1.5", "NaN", "Infinity", "1e309", "9007199254740993", "<script>"]
    for value in invalid+["0", "11"]:
        cases.append({"kind": "rr", "jobs": [{"arrival": 0, "burst": 1}]*3, "q": value})
        expected.append("error")
    for key, extras in [("arrival", ["21"]), ("burst", ["0", "21"])]:
        for value in invalid+extras:
            jobs = [{"arrival": 0, "burst": 1} for _ in range(3)]
            jobs[0][key] = value
            cases.append({"kind": "rr", "jobs": jobs, "q": 2})
            expected.append("error")
    for key, extras in [("va", ["65536", "0x10000", "0x", "12junk"]), ("pfn", ["64"])]:
        for value in invalid+extras:
            data = {"va": 4660, "pfn": 9, "tlb": "miss", "state": "resident", "permission": "allow"}
            data[key] = value
            cases.append({"kind": "va", "input": data})
            expected.append("error")
    js = """const fs=require('fs');const app=require(process.argv[1]);const cases=JSON.parse(fs.readFileSync(0,'utf8'));console.log(JSON.stringify(cases.map(c=>{try{return c.kind==='rr'?app.roundRobin(c.jobs,c.q):app.translate(c.input)}catch(e){return {error:e.message}}})));"""
    app = Path(__file__).resolve().parent.parent/"dist/app.js"
    result = subprocess.run(["node", "-e", js, str(app)], input=json.dumps(cases), text=True, capture_output=True, check=True)
    actual = json.loads(result.stdout)
    for i, (case, want, got) in enumerate(zip(cases, expected, actual)):
        if want == "error":
            assert got.get("error"), (i, case, got)
        elif case["kind"] == "rr":
            trace = [[s["id"], s["start"], s["end"]] for s in got["steps"] if s["id"] not in (None, "idle")]
            assert trace == want["timeline"], (i, case, trace, want)
            for j in got["jobs"]:
                metric = {"completion": j["finish"], "turnaround": j["turnaround"], "response": j["response"], "waiting": j["waiting"]}
                assert metric == want["metrics"][j["id"]], (i, case, metric, want)
        else:
            assert (got["vpn"], got["offset"], got["pa"], got["hit"]) == (want["vpn"], want["offset"], want["pa"], want["effective_tlb_hit"]), (i, case, got, want)
            expected_fault = {"translated": None, "page-fault": "nonresident", "unmapped": "unmapped", "protection": "protection"}[want["result"]]
            assert got["fault"] == expected_fault, (i, case, got, want)
    return {"status": "pass", "rr_cases": rr_count, "va_cases": va_count, "invalid_cases": len(cases)-rr_count-va_count, "total": len(cases)}


def check_browser(pages):
    """既有 headless runtime，file URL；只操作教具，不進行宿主 OS 實驗。"""
    root = Path(__file__).resolve().parent.parent/"dist"
    targets = pages.split(",") if pages else [p.stem for p in sorted(root.glob("[0-9][0-9]-*.html"))]+["glossary"]
    js = r"""
const {chromium}=require('/home/lorkhan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const config=JSON.parse(fs.readFileSync(0,'utf8'));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/home/lorkhan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
try{const page=await browser.newPage();const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
for(const name of config.pages){await page.goto(pathToFileURL(path.join(config.root,name+'.html')).href);let states=0;
if(name==='glossary'){
const search=page.locator('[data-glossary-search]');await search.waitFor();
for(const [query,count] of [['',46],['tlb',2],[' TLB ',2],['no-such-os-term-928',0],['',46]]){
await search.fill(query);if(await page.locator('[data-term]:visible').count()!==count)throw Error('glossary '+query+' count');states++;}
}else if(name==='04-round-robin'){
await page.waitForSelector('#rr-quantum');let s=await page.locator('[data-rr-output]').innerText();if(!s.includes('9 − 0 = 9')||!s.includes('7 − 3 = 4'))throw Error('RR default mismatch');
await page.locator('#rr-quantum').fill('');if(!await page.locator('[data-rr-output]').isHidden())throw Error('RR invalid output not hidden');await page.locator('button[type=reset]').click();await page.waitForFunction(()=>document.querySelector('#rr-quantum').value==='2'&&!document.querySelector('[data-rr-output]').hidden);states=2;
}else if(name==='12-translation'){
await page.waitForSelector('#va-address');let vaText=await page.locator('[data-va-output]').innerText();if(!vaText.includes('9780 B = 0x2634 B'))throw Error('VA default mismatch');if(!vaText.includes('4660 B = 4 × 1024 B + 564 B'))throw Error('VA units delta mismatch');
for(const state of ['resident','nonresident','unmapped'])for(const permission of ['allow','deny'])for(const tlb of ['hit','miss']){
await page.locator('#va-state').selectOption(state);await page.locator('#va-permission').selectOption(permission);await page.locator('#va-tlb').selectOption(tlb);
const s=await page.locator('[data-va-output]').innerText();if(s.includes('9780 B = 0x2634 B')!==(state==='resident'&&permission==='allow'))throw Error('VA UI branch '+[state,permission,tlb]);states++;}
for(const bad of ['','65536','0x10000','Infinity','9007199254740993','1.5','0xZZ']){await page.locator('#va-address').fill(bad);if(!await page.locator('[data-va-output]').isHidden())throw Error('VA invalid output '+bad);if((await page.locator('[data-va-status]').innerText()).includes('NaN'))throw Error('NaN leak');states++;}
await page.locator('button[type=reset]').click();await page.waitForFunction(()=>document.querySelector('#va-address').value==='0x1234'&&!document.querySelector('[data-va-output]').hidden);
}else{
const widgets=page.locator('[data-trace]');if(!await widgets.count())throw Error(name+' lacks trace');
for(let w=0;w<await widgets.count();w++){const widget=widgets.nth(w),steps=widget.locator('[data-step]'),count=await steps.count();
if(!await widget.locator('[data-action=prev]').isDisabled())throw Error(name+' prev not disabled');
for(let i=0;i<count;i++){
const step=steps.nth(i),token=await step.getAttribute('data-step');
if(await step.getAttribute('aria-current')!=='step')throw Error(name+' current step '+i);
if(!(await widget.locator('[data-trace-status]').innerText()).includes((await step.innerText()).trim()))throw Error(name+' status mismatch '+i);
const highlight=await widget.locator('[data-state].is-current').evaluateAll(nodes=>nodes.map(n=>n.dataset.state));
if(!highlight.length||highlight.some(v=>!v.split(/\s+/).includes(token)))throw Error(name+' SVG state mismatch '+i);
if(i<count-1)await widget.locator('[data-action=next]').click();states++;}
if(!await widget.locator('[data-action=next]').isDisabled())throw Error(name+' next not disabled');
if(count>1){await widget.locator('[data-action=prev]').click();if(await steps.nth(count-2).getAttribute('aria-current')!=='step')throw Error(name+' prev mismatch');}
await widget.locator('[data-action=reset]').click();if(await steps.first().getAttribute('aria-current')!=='step')throw Error(name+' reset mismatch');}}
results.push({page:name,states,status:'pass'});}
if(errors.length)throw Error(errors.join(';'));console.log(JSON.stringify({status:'pass',pages:results.length,results,pageerrors:errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
"""
    result = subprocess.run(["node", "-e", js], input=json.dumps({"root": str(root), "pages": targets}), text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--summary", action="store_true")
    parser.add_argument("--app", action="store_true", help="將網站 actual 對照獨立 expected")
    parser.add_argument("--browser", action="store_true", help="現有 Chromium 操作原型和逐章 trace")
    parser.add_argument("--pages", default="", help="只複驗逗號分隔的課名，不含副檔名")
    args = parser.parse_args()
    result = self_checks()
    if args.summary:
        result = {"status": result["status"], "independent": True, "rr_segments": 6,
                  "va": result["va"], "replacement_faults": {"FIFO": 9, "LRU": 10}, "values": result["values"]}
    if args.app:
        result["app_comparison"] = check_app()
    if args.browser:
        result["browser"] = check_browser(args.pages)
    print(json.dumps(result, ensure_ascii=False, indent=2))
