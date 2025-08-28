# shhh 敏感词检测工具

[![License](https://img.shields.io/github/license/yimingwang666/shhh)](https://github.com/yimingwang666/shhh/blob/main/LICENSE)![Issues](https://img.shields.io/github/issues/yimingwang666/shhh)[![GitHub Forks](https://img.shields.io/github/forks/yimingwang666/shhh.svg?style=social)](https://github.com/yimingwang666/shhh/network/members)[![GitHub Stars](https://img.shields.io/github/stars/yimingwang666/shhh.svg?style=social)](https://github.com/yimingwang666/shhh/stargazers)

一个基于前端纯静态网页的中文敏感词检测工具。  

## ✨ 功能特点

- **多字典支持**：支持加载多个敏感词库（存放在 `vocabulary/` 文件夹中）。  
- **高亮显示**：检测到的敏感词在原文中会被随机色彩高亮显示。  
- **重复合并**：同一敏感词若出现在多个字典中，会合并为一个条目，并列出所有来源。  
- **状态提示**：检测结果顶部醒目显示状态：  
  - ✅ `你过关`：未发现敏感词  
  - ⚠️ `不要命啦`：发现敏感词  
- **纯前端运行**：无需后端，直接静态网页即可使用。  

## 📂 文件结构

```
project-root/
 │── index.html
 │── style.css
 │── script.js
 │── favicon.ico
 │── vocabulary/    # 敏感词库
```

## 🚀 使用方法

### 在线Demo

访问：

```
https://yimingwang666.github.io/shhh/
```

### 本地使用

1. 克隆或下载本项目到本地。

```bash
git clone https://github.com/yimingwang666/shhh
```

2. 确保所有词库文件放在 `vocabulary/` 文件夹下。

3. 在项目根目录下开启本地服务器：

```bash
python -m http.server 8000
```

4. 打开浏览器访问：

```
http://localhost:8000/index.html
```

## ⚠️ 注意事项

- 必须使用本地或在线服务器（如 python -m http.server），直接用 file:/// 打开会导致字典无法加载。

- 本项目仅供学习与研究使用，请勿用于非法用途。

## 🙏 致谢

本项目中使用的敏感词库基于以下项目，在此表示感谢：

[![Repo](https://img.shields.io/badge/GitHub-Sensitive-lexicon?logo=github)](https://github.com/konsheng/Sensitive-lexicon)