/**
 * 从 GitHub Search API 拉取热门仓库
 * 对比上一日 feed.json 计算 24h star 涨幅
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

// 多维度搜索：覆盖主流语言 + 近期创建 + 近期活跃
const SEARCH_QUERIES = [
  // 按 stars 排序的主流语言热门仓库
  'stars:>3000 language:python',
  'stars:>3000 language:rust',
  'stars:>3000 language:typescript',
  'stars:>3000 language:go',
  'stars:>3000 language:javascript',
  'stars:>3000 language:java',
  'stars:>3000 language:c',
  'stars:>3000 language:cpp',
  // 近 7 天创建且已有一定关注的新兴项目
  'stars:>200 created:>=' + daysAgo(7),
  // 近 3 天有 push 且星数可观的高活跃项目
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

export async function fetchGitHub() {
  console.log('[GitHub] Searching trending repos...')

  const prevStarMap = loadPrevStars()

  // 并行搜索所有查询
  const results = await Promise.all(
    SEARCH_QUERIES.map(q => searchRepos(q).catch(() => []))
  )

  // 去重：同名仓库取 star 数更高的那条记录
  const dedup = new Map()
  results.flat().forEach(r => {
    const existing = dedup.get(r.full_name)
    if (!existing || r.stargazers_count > existing.stargazers_count) {
      dedup.set(r.full_name, r)
    }
  })

  // 计算 24h 涨幅
  const repos = Array.from(dedup.values())
    .map(r => {
      const prevStars = prevStarMap[r.full_name]
      // 有历史数据：精确差值；无历史数据：按创建天数估算日均涨幅
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

  // 按 24h 涨幅降序，取前 10，重新 rank
  repos.sort((a, b) => b.starsToday - a.starsToday)
  const top10 = repos.slice(0, 10)
  top10.forEach((r, i) => { r.rank = i + 1 })

  console.log(`[GitHub] Top 10 by 24h star growth:`)
  top10.forEach(r => console.log(`  #${r.rank} ${r.name} +${r.starsToday} stars (total: ${r.stars})`))

  return top10
}
