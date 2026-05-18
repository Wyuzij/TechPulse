/**
 * 每日数据更新主入口
 * 1. 拉取 HN + Dev.to 新闻
 * 2. 拉取 GitHub 热门
 * 3. GLM 翻译 + 趋势解读
 * 4. 写入 src/data/feed.json
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { fetchNews } from './fetch-news.js'
import { fetchGitHub } from './fetch-github.js'
import { translateNews, translateGitHub, generateSummary } from './summarize.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../public/feed.json')

async function main() {
  console.log('=== 每日数据更新 ===')
  console.log(`开始时间: ${new Date().toISOString()}`)

  // 1. 拉取新闻
  console.log('\n--- 拉取技术新闻 ---')
  const rawArticles = await fetchNews()
  console.log(`共获取 ${rawArticles.length} 篇新闻`)

  // 2. 拉取 GitHub
  console.log('\n--- 拉取 GitHub 热门 ---')
  const rawRepos = await fetchGitHub()
  console.log(`共获取 ${rawRepos.length} 个仓库`)

  // 3. GLM 翻译新闻
  console.log('\n--- GLM 翻译新闻 ---')
  const news = await translateNews(rawArticles)
  // 添加 ID
  news.forEach((n, i) => { n.id = i + 1 })

  // 4. GLM 翻译 GitHub 描述
  console.log('\n--- GLM 翻译 GitHub 描述 ---')
  const repos = await translateGitHub(rawRepos)

  // 5. GLM 生成趋势解读
  console.log('\n--- GLM 生成趋势解读 ---')
  const summary = await generateSummary(news, repos)

  // 6. 组装输出
  const feed = {
    date: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    techNews: news.slice(0, 10),
    githubTrending: repos.slice(0, 10),
    dailySummary: {
      date: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
      highlights: summary.highlights,
      keywords: summary.keywords,
      trendingSummary: summary.trendingSummary,
    },
  }

  // 7. 写入文件
  writeFileSync(OUTPUT, JSON.stringify(feed, null, 2), 'utf-8')
  console.log(`\n✓ 数据已写入: ${OUTPUT}`)
  console.log(`  新闻: ${feed.techNews.length} 条`)
  console.log(`  仓库: ${feed.githubTrending.length} 个`)
  console.log(`  要点: ${feed.dailySummary.highlights.length} 条`)
  console.log(`完成时间: ${new Date().toISOString()}`)
}

main().catch(err => {
  console.error('更新失败:', err)
  process.exit(1)
})
