/**
 * 从 GitHub Search API 拉取热门仓库
 * 对比上一日 feed.json 计算 24h star 涨幅
 * 读取 README 提取项目描述（替代 API 短描述）
 * 最终按涨幅降序排列
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GITHUB_API = 'https://api.github.com'
const FEED_PATH = resolve(__dirname, '../src/data/feed.json')

function authHeaders() {
  const token = process.env.GITHUB_TOKEN
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'techpulse-bot',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

const SEARCH_QUERIES = [
  'stars:>3000 language:python',
  'stars:>3000 language:rust',
  'stars:>3000 language:typescript',
  'stars:>3000 language:go',
  'stars:>3000 language:javascript',
  'stars:>3000 language:java',
  'stars:>3000 language:c',
  'stars:>3000 language:cpp',
  'stars:>200 created:>=' + daysAgo(7),
  'stars:>1000 pushed:>=' + daysAgo(3),
]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

async function searchRepos(query) {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`
  const res = await fetch(url, { headers: authHeaders() })

  if (!res.ok) {
    console.warn(`[GitHub] Search failed (${res.status}): ${query}`)
    return []
  }

  const data = await res.json()
  return data.items || []
}

function loadPrevStars() {
  if (!existsSync(FEED_PATH)) {
    console.log('[GitHub] No previous feed.json, all starsToday = 0')
    return {}
  }
  try {
    const prev = JSON.parse(readFileSync(FEED_PATH, 'utf-8'))
    const map = {}
    if (Array.isArray(prev.githubTrending)) {
      prev.githubTrending.forEach(r => { map[r.name] = r.stars })
    }
    console.log(`[GitHub] Loaded ${Object.keys(map).length} repos from previous feed`)
    return map
  } catch {
    console.warn('[GitHub] Failed to parse previous feed.json')
    return {}
  }
}

/* 从 GitHub API 获取 README，提取前几段有效文字 */
async function fetchReadme(fullName) {
  try {
    const url = `${GITHUB_API}/repos/${fullName}/readme`
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) return null

    const data = await res.json()
    // README 内容为 base64 编码
    const raw = Buffer.from(data.content, 'base64').toString('utf-8')
    return extractDescription(raw)
  } catch (e) {
    console.warn(`[GitHub] README fetch failed for ${fullName}: ${e.message}`)
    return null
  }
}

/* 从 README markdown 中提取有意义的描述段落 */
function extractDescription(md) {
  // 移除 HTML 标签
  let text = md.replace(/<[^>]+>/g, '')
  // 移除 markdown 图片、链接，保留文字
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')
  text = text.replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`[^`]*`/g, '')
  // 移除粗体/斜体标记
  text = text.replace(/[*_~]{1,3}/g, '')
  // 移除 markdown 标题符号但保留标题文字
  text = text.replace(/^#{1,6}\s+/gm, '')
  // 移除 badges（[![...]...] 模式）
  text = text.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
  // 合并连续空格
  text = text.replace(/[ \t]+/g, ' ')
  // 合并连续换行
  text = text.replace(/\n{3,}/g, '\n\n')

  // 按段落分割（空行分隔）
  const paragraphs = text.split(/\n\s*\n/)
  const meaningful = []

  for (const p of paragraphs) {
    const cleaned = p.replace(/\n/g, ' ').trim()
    // 跳过太短、纯链接、纯 badge 的段落
    if (cleaned.length < 30) continue
    if (/^(https?:\/\/|#|>|\||-)/.test(cleaned)) continue
    if (cleaned.startsWith('![')) continue
    // 跳过目录项、许可证等
    if (/^(Table of Contents|License|MIT|Apache|Installation|Getting Started)/i.test(cleaned)) continue

    meaningful.push(cleaned)
    if (meaningful.length >= 2) break
  }

  // 拼接，最多 300 字符，截断在完整句子处
  const desc = meaningful.join('。').slice(0, 350)
  const lastPeriod = Math.max(desc.lastIndexOf('.'), desc.lastIndexOf('。'), desc.lastIndexOf('！'))
  return lastPeriod > 200 ? desc.slice(0, lastPeriod + 1) : desc.slice(0, 280)
}

export async function fetchGitHub() {
  console.log('[GitHub] Searching trending repos...')

  const prevStarMap = loadPrevStars()

  const results = await Promise.all(
    SEARCH_QUERIES.map(q => searchRepos(q).catch(() => []))
  )

  const dedup = new Map()
  results.flat().forEach(r => {
    const existing = dedup.get(r.full_name)
    if (!existing || r.stargazers_count > existing.stargazers_count) {
      dedup.set(r.full_name, r)
    }
  })

  const repos = Array.from(dedup.values())
    .map(r => {
      const prevStars = prevStarMap[r.full_name]
      let starsToday
      if (prevStars !== undefined) {
        starsToday = Math.max(0, r.stargazers_count - prevStars)
      } else {
        const daysSinceCreate = Math.max(1, Math.floor(
          (Date.now() - new Date(r.created_at).getTime()) / 86400000
        ))
        starsToday = Math.round(Math.max(0, r.stargazers_count) / daysSinceCreate)
      }
      return {
        name: r.full_name,
        description: r.description || '',
        language: r.language || 'Unknown',
        stars: r.stargazers_count,
        starsToday,
        forks: r.forks_count,
        url: r.html_url,
      }
    })

  repos.sort((a, b) => b.starsToday - a.starsToday)
  const top10 = repos.slice(0, 10)
  top10.forEach((r, i) => { r.rank = i + 1 })

  // 并行拉取 README，替换描述
  console.log('[GitHub] Fetching README for top 10 repos...')
  const readmes = await Promise.all(
    top10.map(r => fetchReadme(r.name).catch(() => null))
  )
  top10.forEach((r, i) => {
    if (readmes[i]) {
      r.description = readmes[i]
      console.log(`  #${r.rank} ${r.name} README: ${readmes[i].slice(0, 80)}...`)
    }
  })

  console.log(`[GitHub] Top 10 by 24h star growth:`)
  top10.forEach(r => console.log(`  #${r.rank} ${r.name} +${r.starsToday} stars (total: ${r.stars})`))

  return top10
}
