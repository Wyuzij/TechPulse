/**
 * 从 GitHub Search API 拉取今日热门仓库
 * 对比上一日数据，计算 24h star 涨幅
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
    'User-Agent': 'tech-radar-bot',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

const SEARCH_QUERIES = [
  'stars:>5000 created:>2024-01-01 language:python',
  'stars:>5000 created:>2024-01-01 language:rust',
  'stars:>5000 created:>2024-01-01 language:typescript',
  'stars:>5000 created:>2024-01-01 language:go',
  'stars:>5000 created:>2024-01-01 language:javascript',
]

async function searchRepos(query) {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`
  const res = await fetch(url, { headers: authHeaders() })

  if (!res.ok) {
    console.warn(`[GitHub] Search failed (${res.status}): ${query}`)
    return []
  }

  const data = await res.json()
  return data.items || []
}

/* 读取上一日 feed.json，提取各仓库的 star 数 */
function loadPrevStars() {
  if (!existsSync(FEED_PATH)) {
    console.log('[GitHub] No previous feed.json, starsToday = 0')
    return {}
  }
  const prev = JSON.parse(readFileSync(FEED_PATH, 'utf-8'))
  const map = {}
  ;(prev.githubTrending || []).forEach(r => { map[r.name] = r.stars })
  console.log(`[GitHub] Loaded ${Object.keys(map).length} repos from previous feed`)
  return map
}

function formatRepo(repo, rank, prevStars) {
  const prev = prevStars[repo.full_name] || repo.stargazers_count
  // 保证 starsToday 不为负数（仓库可能掉 star）
  const starsToday = Math.max(0, repo.stargazers_count - prev)
  return {
    rank,
    name: repo.full_name,
    description: repo.description || '',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count,
    starsToday,
    forks: repo.forks_count,
    url: repo.html_url,
  }
}

export async function fetchGitHub() {
  console.log('[GitHub] Searching trending repos...')

  const prevStarMap = loadPrevStars()

  const allRepos = []
  for (const query of SEARCH_QUERIES) {
    const repos = await searchRepos(query)
    allRepos.push(...repos)
    await new Promise(r => setTimeout(r, 300))
  }

  // 去重，按总 stars 排序取前 N，再按 starsToday 排序即为最终顺序
  const seen = new Set()
  const unique = allRepos
    .filter(r => !seen.has(r.full_name) && seen.add(r.full_name))
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r, i) => formatRepo(r, i + 1, prevStarMap))

  // 按 24h 涨幅重新排序并分配 rank
  unique.sort((a, b) => b.starsToday - a.starsToday)
  unique.forEach((r, i) => { r.rank = i + 1 })

  console.log(`[GitHub] Got ${unique.length} unique repos`)
  return unique
}
