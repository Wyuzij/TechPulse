/**
 * 从 GitHub Search API 拉取今日热门仓库
 * 按 stars 排序，筛选最近创建/更新的项目
 */

const GITHUB_API = 'https://api.github.com'

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

// 多维度搜索，覆盖不同语言和领域
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

function formatRepo(repo, rank) {
  return {
    rank,
    name: repo.full_name,
    description: repo.description || '',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count,
    starsToday: 0, // GitHub Search 不提供今日 stars，后续可用 trending API 补充
    forks: repo.forks_count,
    url: repo.html_url,
  }
}

export async function fetchGitHub() {
  console.log('[GitHub] Searching trending repos...')

  const allRepos = []
  for (const query of SEARCH_QUERIES) {
    const repos = await searchRepos(query)
    allRepos.push(...repos)
    await new Promise(r => setTimeout(r, 300)) // 速率限制礼貌间隔
  }

  // 去重 + 排序
  const seen = new Set()
  const unique = allRepos
    .filter(r => !seen.has(r.full_name) && seen.add(r.full_name))
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r, i) => formatRepo(r, i + 1))

  console.log(`[GitHub] Got ${unique.length} unique repos`)
  return unique
}
