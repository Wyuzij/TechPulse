/**
 * 从 Hacker News API 和 Dev.to API 拉取技术新闻
 * 返回 15-20 条原始英文新闻（后续由 GLM 翻译和筛选）
 */

const HN_TOP_STORIES = 'https://hacker-news.firebaseio.com/v0/topstories.json'
const HN_ITEM = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`
const DEVTO_ARTICLES = 'https://dev.to/api/articles?per_page=10&tag=programming'

// 技术相关关键词，用于过滤 HN 新闻
const TECH_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'model', 'openai', 'anthropic',
  'rust', 'python', 'javascript', 'typescript', 'go', 'golang',
  'compiler', 'language', 'framework', 'library', 'tool',
  'browser', 'chrome', 'firefox', 'safari', 'webkit', 'webgpu',
  'database', 'sql', 'postgres', 'backend', 'frontend', 'css',
  'linux', 'kernel', 'server', 'cloud', 'kubernetes', 'docker',
  'github', 'git', 'open source', 'api', 'http', 'protocol',
  'security', 'encryption', 'crypto', 'privacy',
  'code', 'programming', 'software', 'developer', 'engineer',
  'vscode', 'editor', 'ide', 'terminal', 'cli',
  'performance', 'benchmark', 'optimization', 'scaling',
  'neural', 'deep learning', 'machine learning', 'training',
  'bun', 'deno', 'node', 'npm', 'package', 'module',
  'release', 'launch', 'announce', 'update', 'beta', 'alpha',
]

function isTechRelated(title) {
  const lower = title.toLowerCase()
  return TECH_KEYWORDS.some(kw => lower.includes(kw))
}

async function fetchHN() {
  console.log('[HN] Fetching top stories...')
  const res = await fetch(HN_TOP_STORIES)
  const ids = await res.json()
  const topIds = ids.slice(0, 50)

  // 批量获取详情（每次 10 个并发）
  const items = []
  for (let i = 0; i < topIds.length; i += 10) {
    const batch = topIds.slice(i, i + 10)
    const results = await Promise.allSettled(
      batch.map(id =>
        fetch(HN_ITEM(id)).then(r => r.json())
      )
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value && r.value.type === 'story') {
        items.push(r.value)
      }
    }
    // 礼貌延迟，避免被限流
    if (i + 10 < topIds.length) await new Promise(r => setTimeout(r, 200))
  }

  const filtered = items
    .filter(item =>
      item.title &&
      item.title.length > 15 &&
      item.score >= 50 &&
      isTechRelated(item.title)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  console.log(`[HN] Got ${filtered.length} tech stories (from ${items.length} stories)`)
  return filtered.map(item => ({
    title: item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    source: 'Hacker News',
    score: item.score,
  }))
}

async function fetchDevTo() {
  console.log('[Dev.to] Fetching articles...')
  try {
    const res = await fetch(DEVTO_ARTICLES)
    const articles = await res.json()
    console.log(`[Dev.to] Got ${articles.length} articles`)
    return articles.slice(0, 8).map(a => ({
      title: a.title,
      url: a.url,
      source: 'Dev.to',
      score: a.positive_reactions_count || 0,
    }))
  } catch (e) {
    console.warn('[Dev.to] Failed:', e.message)
    return []
  }
}

export async function fetchNews() {
  const [hn, devto] = await Promise.all([fetchHN(), fetchDevTo()])

  // 合并去重（按 URL 去重，HN 优先）
  const seen = new Set()
  const merged = []

  for (const item of [...hn, ...devto]) {
    if (!seen.has(item.url)) {
      seen.add(item.url)
      merged.push(item)
    }
  }

  // 按得分排序，取前 15
  merged.sort((a, b) => b.score - a.score)
  return merged.slice(0, 15)
}
