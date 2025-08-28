let dictionaries = {};
let colorMap = {};
let usedColors = new Set();

// pastel 随机色生成器
function generatePastelColor() {
    let color;
    do {
        let hue = Math.floor(Math.random() * 360);
        let saturation = 70 + Math.random() * 10; // 70-80%
        let lightness = 80 + Math.random() * 10; // 80-90%
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } while (usedColors.has(color) && usedColors.size < 50);

    usedColors.add(color);
    if (usedColors.size > 50) usedColors.clear(); // 防止过大内存
    return color;
}

function getColor(word) {
    if (!colorMap[word]) {
        colorMap[word] = generatePastelColor();
    }
    return colorMap[word];
}

async function loadDictionaries() {
        let dictFiles = [
            "COVID-19词库.txt", "GFW补充词库.txt", "暴恐词库.txt", "补充词库.txt",
            "反动词库.txt", "非法网址.txt", "广告类型.txt", "零时-Tencent.txt",
            "民生词库.txt", "其他词库.txt", "色情词库.txt", "色情类型.txt",
            "涉枪涉爆.txt", "贪腐词库.txt", "政治类型.txt"
        ];

        for (let file of dictFiles) {
            let response = await fetch("vocabulary/" + file);
            let text = await response.text();
            let words = text.split(/\r?\n/).filter(w => w.trim() !== "");
            dictionaries[file.replace(".txt", "")] = words; // 去掉后缀
        }
    }

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkText() {
    let input = document.getElementById("inputText").value.trim();
    if (!input) return;

    let highlighted = input;
    let resultMap = {}; // { word: Set(dicts) }
    let danger = false;

    for (let dictName in dictionaries) {
        for (let word of dictionaries[dictName]) {
            if (word && input.includes(word)) {
                danger = true;
                if (!resultMap[word]) resultMap[word] = new Set();
                resultMap[word].add(dictName);

                let regex = new RegExp(escapeRegExp(word), "g");
                let color = getColor(word);
                highlighted = highlighted.replace(
                    regex,
                    `<span class="highlight" style="background-color:${color};">${word}</span>`
                );
            }
        }
    }

    let resultDiv = document.getElementById("result");
    let highlightedText = document.getElementById("highlightedText");
    let wordList = document.getElementById("wordList");
    let status = document.getElementById("status");

    if (danger) {
        resultDiv.style.display = "block";
        status.className = "status danger";
        status.textContent = "不要命啦";

        highlightedText.innerHTML = highlighted;
        wordList.innerHTML = "";
        for (let word in resultMap) {
            let li = document.createElement("li");
            let color = getColor(word);
            let span = document.createElement("span");
            span.textContent = word;
            span.style.backgroundColor = color;
            span.className = "highlight";
            li.appendChild(span);

            let sources = Array.from(resultMap[word]).join("、");
            let sourceSpan = document.createElement("span");
            sourceSpan.textContent = `（${sources}）`;
            li.appendChild(sourceSpan);

            wordList.appendChild(li);
        }
    } else {
        resultDiv.style.display = "none";
        status.className = "status safe";
        status.textContent = "你过关";
    }
}

function clearText() {
    document.getElementById("inputText").value = "";
    document.getElementById("result").style.display = "none";
    document.getElementById("highlightedText").innerHTML = "";
    document.getElementById("wordList").innerHTML = "";
    document.getElementById("status").textContent = "";
}


loadDictionaries();
