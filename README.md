# TechPulse

AI 驱动的科技情报看板

## 核心功能

- **GitHub 热门项目追踪**：自动抓取 GitHub  trending 项目，展示前沿开源动态
- **科技新闻聚合**：实时采集并分类最新科技资讯
- **AI 智能摘要**：自动生成新闻内容摘要，快速掌握核心信息
- **数据可视化看板**：以卡片化、响应式界面直观呈现情报数据
- **动态背景效果**：支持视频/图片背景，打造沉浸式浏览体验

## 技术栈

| 分类 | 技术 |
|------|------|
| **前端框架** | Vue 3 |
| **构建工具** | Vite |
| **UI 组件库** | Naive UI |
| **组合式工具** | VueUse |
| **动画效果** | Vanilla Tilt |
| **字体** | vfonts |
| **自动化脚本** | Node.js |
| **CI/CD** | GitHub Actions |

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
.
├── public/                  # 静态资源
│   ├── bg-video.mp4         # 背景视频
│   └── bg.jpg               # 背景图片
├── scripts/                 # 数据处理脚本
│   ├── fetch-github.js      # GitHub 项目抓取
│   ├── fetch-news.js        # 新闻数据采集
│   ├── summarize.js         # AI 摘要生成
│   └── update.js            # 数据更新入口
├── src/
│   ├── components/          # Vue 组件
│   │   ├── AppHeader.vue    # 顶部导航
│   │   ├── AppFooter.vue    # 底部信息
│   │   ├── HeroSection.vue  # 首屏展示区
│   │   ├── NewsView.vue     # 新闻视图
│   │   ├── ProjectsView.vue # 项目视图
│   │   ├── SummaryView.vue  # 摘要视图
│   │   └── OxideBackground.vue  # 背景组件
│   ├── composables/         # 组合式函数
│   │   └── useReveal.js     # 滚动揭示动画
│   ├── data/                # 数据源
│   │   ├── feed.json        # 数据文件
│   │   └── mockData.js      # 模拟数据
│   ├── styles/              # 全局样式
│   │   └── global.css
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── .github/workflows/       # GitHub Actions 工作流
│   └── daily.yml            # 每日自动更新任务
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置
└── package.json             # 项目依赖
```
