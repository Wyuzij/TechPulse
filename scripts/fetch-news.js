/**
 * 从 Hacker News API 和 Dev.to API 拉取技术新闻
 * 返回 15-20 条原始英文新闻（后续由 GLM 翻译和筛选）
 */

const HN_TOP_STORIES = 'https://hacker-news.firebaseio.com/v0/topstories.json'
const HN_ITEM = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`
const DEVTO_ARTICLES = 'https://dev.to/api/articles?per_page=10&tag=programming'

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

/* 尝试从文章 URL 抓取 og:image，3 秒超时 */
async function fetchOgImage(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'techpulse-bot/1.0' },
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const html = await res.text()
    // 匹配 og:image 或 twitter:image
    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)
    const twMatch = html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+name="twitter:image"/i)

    return ogMatch?.[1] || twMatch?.[1] || null
  } catch {
    return null
  }
}

async function fetchHN() {
  console.log('[HN] Fetching top stories...')
  const res = await fetch(HN_TOP_STORIES)
  const ids = await res.json()
  const topIds = ids.slice(0, 50)

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
    image: null, // 在 summarize.js 阶段统一抓取 og:image
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
      image: a.cover_image || a.social_image || null,
    }))
  } catch (e) {
    console.warn('[Dev.to] Failed:', e.message)
    return []
  }
}

export async function fetchNews() {
  const [hn, devto] = await Promise.all([fetchHN(), fetchDevTo()])

  const seen = new Set()
  const merged = []

  for (const item of [...hn, ...devto]) {
    if (!seen.has(item.url)) {
      seen.add(item.url)
      merged.push(item)
    }
  }

  merged.sort((a, b) => b.score - a.score)
  const top = merged.slice(0, 15)

  // 为没有图片的文章抓取 og:image（并行，单条 3s 超时）
  console.log('[News] Fetching og:images for articles without images...')
  const withImages = await Promise.all(
    top.map(async (item) => {
      if (item.image) return item
      const ogImage = await fetchOgImage(item.url)
      return { ...item, image: ogImage }
    })
  )

  return withImages
}
