/**
 * 通过 GLM API 翻译新闻标题/摘要，生成 GitHub 项目中文描述，产出每日趋势解读
 * GLM-4-Flash 兼容 OpenAI API 格式
 */

const GLM_BASE = 'https://open.bigmodel.cn/api/paas/v4'
const MODEL = 'glm-4-flash'

function glmHeaders() {
  const key = process.env.GLM_API_KEY
  if (!key) {
    throw new Error('GLM_API_KEY not set')
  }
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

async function chat(messages, { maxTokens = 2048, temperature = 0.7 } = {}) {
  const res = await fetch(`${GLM_BASE}/chat/completions`, {
    method: 'POST',
    headers: glmHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GLM API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

/**
 * 翻译新闻标题 + 生成中文摘要，分配分类和标签
 * 返回前端 NewsView 所需格式
 */
export async function translateNews(articles) {
  console.log(`[GLM] Translating ${articles.length} news articles...`)

  const prompt = `你是技术新闻编辑。将以下英文技术新闻标题翻译为中文，并为每条生成一句中文摘要（50字以内）、分配一个分类和2-3个标签。

分类候选：AI, 编程语言, JavaScript, Web, Cloud, 系统, 工具

输入（JSON 数组）：
${JSON.stringify(articles.map(a => ({ title: a.title, url: a.url, source: a.source, image: a.image })), null, 2)}

返回纯 JSON 数组（不要 markdown 代码块），每条格式：
{
  "title": "中文标题",
  "summary": "一句中文摘要，50字以内",
  "category": "分类",
  "tags": ["标签1", "标签2"],
  "url": "原url",
  "source": "原source",
  "image": "原image（透传，不要修改）",
  "time": "生成时间ISO格式"
}`

  const text = await chat([
    { role: 'system', content: '你是专业的技术新闻编辑，只输出合法 JSON，不输出任何其他内容。' },
    { role: 'user', content: prompt },
  ], { maxTokens: 4096, temperature: 0.5 })

  // 清理可能的 markdown 代码块包裹
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    console.error('[GLM] Failed to parse news JSON:', clean.slice(0, 300))
    // 回退：返回原始英文标题
    return articles.map((a, i) => ({
      id: i + 1,
      title: a.title,
      summary: a.title,
      category: 'AI',
      tags: [],
      url: a.url,
      source: a.source,
      image: a.image || null,
      time: new Date().toISOString(),
    }))
  }
}

/**
 * 为 GitHub 仓库生成中文描述
 */
export async function translateGitHub(repos) {
  console.log(`[GLM] Translating ${repos.length} repo descriptions...`)

  const prompt = `将以下 GitHub 仓库的描述翻译为中文摘要（30字以内，突出核心功能和亮点）。

输入：
${JSON.stringify(repos.map(r => ({ name: r.name, description: r.description, language: r.language })), null, 2)}

返回纯 JSON 数组（不要 markdown 代码块），每条格式：
{ "name": "仓库名", "description": "中文描述30字以内" }`

  const text = await chat([
    { role: 'system', content: '你是专业的技术翻译，只输出合法 JSON，不输出任何其他内容。' },
    { role: 'user', content: prompt },
  ], { maxTokens: 2048, temperature: 0.3 })

  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    const translated = JSON.parse(clean)
    const map = new Map(translated.map(t => [t.name, t.description]))
    return repos.map(r => ({
      ...r,
      description: map.get(r.name) || r.description,
    }))
  } catch {
    console.error('[GLM] Failed to parse GitHub JSON:', clean.slice(0, 300))
    return repos
  }
}

/**
 * 生成每日趋势解读（要点速览 + 趋势研判 + 关键词）
 */
export async function generateSummary(newsArticles, repos) {
  console.log('[GLM] Generating daily summary...')

  const newsTitles = newsArticles.map(a => `- ${a.title} (${a.category})`).join('\n')
  const repoNames = repos.map(r => `- ${r.name}: ${r.description}`).join('\n')

  const prompt = `你是资深技术趋势分析师。基于以下今日技术资讯和 GitHub 热门项目，生成趋势解读。

今日资讯：
${newsTitles}

GitHub 热门：
${repoNames}

返回纯 JSON（不要 markdown 代码块）：
{
  "highlights": ["要点1", "要点2", "要点3", "要点4", "要点5"],
  "keywords": ["关键词1", "关键词2", ..., "关键词8"],
  "trendingSummary": "一段趋势研判，150字以内"
}`

  const text = await chat([
    { role: 'system', content: '你是资深技术趋势分析师，只输出合法 JSON，不输出任何其他内容。' },
    { role: 'user', content: prompt },
  ], { maxTokens: 2048, temperature: 0.6 })

  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    console.error('[GLM] Failed to parse summary JSON:', clean.slice(0, 300))
    return {
      highlights: ['今日数据更新完成，具体趋势分析请查看下方资讯'],
      keywords: ['技术资讯', 'GitHub', '开发者'],
      trendingSummary: '今日技术趋势正在生成中，请稍后查看。',
    }
  }
}
