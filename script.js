let dictionaries = {};
let colorMap = Object.create(null);   // 词 -> 颜色
let usedColors = new Set();           // 已用颜色，尽量避免重复

// 更稳定的 pastel 颜色生成（黄金角均匀取色，几乎不重复）
function generatePastelColor() {
    const hue = Math.floor((usedColors.size * 137.508) % 360);
    const saturation = 72; // %
    const lightness = 85;  // %
    let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    if (usedColors.has(color)) {
        const altHue = (hue + 23) % 360;
        color = `hsl(${altHue}, ${saturation}%, ${lightness}%)`;
    }
    usedColors.add(color);
    return color;
}

function getColor(word) {
    if (!colorMap[word]) colorMap[word] = generatePastelColor();
    return colorMap[word];
}

async function loadDictionaries() {
    const dictFiles = [
        "COVID-19词库.txt", "GFW补充词库.txt", "暴恐词库.txt", "补充词库.txt",
        "反动词库.txt", "非法网址.txt", "广告类型.txt", "零时-Tencent.txt",
        "民生词库.txt", "其他词库.txt", "色情词库.txt", "色情类型.txt",
        "涉枪涉爆.txt", "贪腐词库.txt", "政治类型.txt", "网易前端过滤敏感词库.txt"
    ];

    for (const file of dictFiles) {
        try {
            // 处理中文文件名
            const response = await fetch("vocabulary/" + encodeURIComponent(file));
            if (!response.ok) continue;
            const text = await response.text();
            const words = text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
            dictionaries[file.replace(/\.txt$/i, "")] = words;
        } catch (e) {
            console.error("加载字典失败:", file, e);
        }
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, ch => (
        { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]
    ));
}

// 找到 text 中 word 的所有出现位置（安全，不用正则，避免转义问题）
function findAllOccurrences(text, word) {
    const out = [];
    if (!word) return out;
    let idx = 0;
    while (true) {
        idx = text.indexOf(word, idx);
        if (idx === -1) break;
        out.push({ start: idx, end: idx + word.length, word });
        idx += word.length; // 跳过当前命中，避免同位置死循环
    }
    return out;
}

function checkText() {
    const inputEl = document.getElementById("inputText");
    const text = inputEl.value.trim();

    const resultDiv = document.getElementById("result");
    const highlightedText = document.getElementById("highlightedText");
    const wordList = document.getElementById("wordList");
    const status = document.getElementById("status");

    if (!text) {
        resultDiv.style.display = "none";
        status.textContent = "";
        status.className = "status";
        return;
    }

    // 收集：word -> Set(来源字典)
    const resultMap = Object.create(null);
    // 收集所有命中区间（基于原始文本）
    const matches = [];

    for (const dictName in dictionaries) {
        const words = dictionaries[dictName];
        for (const word of words) {
            if (!word) continue;
            if (text.indexOf(word) === -1) continue;

            if (!resultMap[word]) resultMap[word] = new Set();
            resultMap[word].add(dictName);

            const occs = findAllOccurrences(text, word);
            for (const m of occs) matches.push(m);
        }
    }

    const hasHit = Object.keys(resultMap).length > 0;

    if (!hasHit) {
        resultDiv.style.display = "none";
        status.className = "status safe";
        status.textContent = "你过关";
        return;
    }

    // 状态提示
    status.className = "status danger";
    status.textContent = "不要命啦";

    // 合并重叠：按开始升序，长度降序（优先长词）
    matches.sort((a, b) => a.start !== b.start
        ? a.start - b.start
        : (b.end - b.start) - (a.end - a.start));

    const selected = [];
    let lastEnd = -1;
    for (const m of matches) {
        if (m.start >= lastEnd) {      // 不重叠就收
            selected.push(m);
            lastEnd = m.end;
        }
        // 如果重叠，已因“长词优先”被更长的覆盖，直接丢弃
    }

    // 生成高亮 HTML（一次性构建，避免二次替换破坏标签）
    let cursor = 0;
    let out = "";
    for (const m of selected) {
        out += escapeHTML(text.slice(cursor, m.start));
        const frag = text.slice(m.start, m.end); // 原文片段
        const color = getColor(m.word);
        out += `<span class="highlight" style="background-color:${color};">${escapeHTML(frag)}</span>`;
        cursor = m.end;
    }
    out += escapeHTML(text.slice(cursor));
    highlightedText.innerHTML = out;

    // 构建列表（只给词本身上底色；括号内来源不着色；去重并合并来源）
    wordList.innerHTML = "";
    Object.keys(resultMap).sort().forEach(word => {
        const li = document.createElement("li");

        const wspan = document.createElement("span");
        wspan.textContent = word;
        wspan.className = "highlight";
        wspan.style.backgroundColor = getColor(word);
        li.appendChild(wspan);

        const src = document.createElement("span");
        const sources = Array.from(resultMap[word]).join("、");
        src.textContent = `（${sources}）`;
        li.appendChild(src);

        wordList.appendChild(li);
    });

    resultDiv.style.display = "block";
}

function clearText() {
    document.getElementById("inputText").value = "";
    document.getElementById("result").style.display = "none";
    document.getElementById("highlightedText").innerHTML = "";
    document.getElementById("wordList").innerHTML = "";
    document.getElementById("status").textContent = "";
    document.getElementById("status").className = "status";
}

document.addEventListener("DOMContentLoaded", loadDictionaries);
