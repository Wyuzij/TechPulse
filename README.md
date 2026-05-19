# ⚡ TechPulse

> AI 驱动的每日科技情报看板 — 清晨 8:00 自动更新，国内可访问

[![Daily Update](https://github.com/Wyuzij/TechPulse/actions/workflows/daily.yml/badge.svg)](https://github.com/Wyuzij/TechPulse/actions/workflows/daily.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线访问-brightgreen)](https://wyuzij.github.io/TechPulse/)
[![Vercel](https://img.shields.io/badge/Vercel-备用部署-black)](https://tech-pulse.vercel.app/)

---

## 🔧 工作流机制

每日 **北京时间 08:00**（UTC 00:00），GitHub Actions 自动执行：

```
1. AI HOT API (aihot.virxact.com) 拉取中文 AI 资讯
2. GitHub Search API 多维度搜索热门仓库
3. 对比上一日 star 数，计算 24h 真实涨幅
4. 读取仓库 README 提取项目描述
5. GLM-4-Flash 翻译 GitHub 描述 + 生成趋势解读
6. 构建静态页面，推送至 gh-pages 分支
```

- 📥 **资讯源**：[AI HOT](https://aihot.virxact.com/) 精选 AI 圈动态，中文直达，无需翻译
- ⭐ **GitHub 趋势**：10 条搜索维度，24h star 涨幅排序
- 🤖 **AI 总结**：智谱 GLM-4-Flash 生成每日趋势研判
- 📦 **双线部署**：GitHub Pages（国内可访）+ Vercel（备用）

---

## 🧩 页面布局

| 模块 | 内容 |
|---|---|
| **01 · AI 趋势解读** | 要点速览 · 趋势研判 · 核心关键词 |
| **02 · 技术资讯** | 10 条当日 AI 资讯，心电图风格头条卡片 |
| **03 · GitHub 热门项目** | 按 24h star 涨幅排列，README 提取描述 |

---

## 🚀 本地运行

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器 → localhost:5173
npm run build      # 构建生产版本
npm run preview    # 预览构建结果
```

## 📁 项目结构

```
├── scripts/                 # 自动化脚本
│   ├── fetch-news.js        # → AI HOT API 拉取中文资讯
│   ├── fetch-github.js      # → GitHub Search + README 抓取
│   ├── summarize.js         # → GLM 翻译 + 趋势解读
│   └── update.js            # 数据更新入口
├── src/
│   ├── components/          # Vue 3 SFC 组件
│   ├── data/feed.json       # 每日自动更新的数据文件
│   ├── styles/global.css    # 全局样式
│   ├── App.vue              # 根组件
│   └── main.js              # 入口
├── public/                  # 静态资源
├── .github/workflows/       # CI/CD 工作流
└── vite.config.js
```

## 🛠 技术栈

**前端**: Vue 3 + Vite · 纯 CSS 动画 · SVG 心电图特效
**后端**: Node.js 脚本 · GitHub Actions · 智谱 GLM API
**部署**: GitHub Pages + Vercel 双线

---

*Powered by [AI HOT](https://aihot.virxact.com/) · [GitHub API](https://docs.github.com/en/rest) · [智谱 GLM](https://open.bigmodel.cn/)*
