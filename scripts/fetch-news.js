/**
 * 从 AI HOT API (https://aihot.virxact.com) 获取每日 AI 资讯
 * 数据已是中文，直接映射为前端格式，无需 GLM 翻译
 */

const API_ITEMS = 'https://aihot.virxact.com/api/public/items?mode=selected'

// API 分类 → 前端分类
const CATEGORY_MAP = {
  'ai-products': 'AI',
  'ai-models': 'AI',
  'paper': 'AI',
  'tip': '工具',
  'industry': '行业',
  'technique': '工具',
}

/* 从文章页面抓取第三幅图片（跳过前两幅通常是 icon/logo） */
async function fetchThirdImage(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; techpulse-bot/1.0)' },
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const html = await res.text()
    // 匹配所有 <img> 标签的 src
    const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    const imgs = []
    let m
    while ((m = imgRe.exec(html)) !== null) {
      imgs.push(m[1])
    }

    // 跳过前两幅（icon/logo），取第三幅
    const third = imgs[2]
    if (!third) return imgs[imgs.length - 1] || null

    // 处理相对路径
    if (third.startsWith('//')) return 'https:' + third
    if (third.startsWith('/')) {
      const u = new URL(url)
      return u.origin + third
    }
    return third
  } catch {
    return null
  }
}

// 从标题提取标签的关键词表
const TAG_PATTERNS = [
  { pattern: /OpenAI|GPT|ChatGPT/i, tag: 'OpenAI' },
  { pattern: /Claude|Anthropic/i, tag: 'Claude' },
  { pattern: /Gemini|谷歌|Google/i, tag: 'Gemini' },
  { pattern: /Llama|Meta|开源模型/i, tag: 'Llama' },
  { pattern: /阿里|通义|Qwen/i, tag: '阿里' },
  { pattern: /腾讯|混元/i, tag: '腾讯' },
  { pattern: /百度|文心/i, tag: '百度' },
  { pattern: /字节|豆包/i, tag: '字节' },
  { pattern: /DeepSeek|深度求索/i, tag: 'DeepSeek' },
  { pattern: /视频生成|视频模型|Vidu|Sora|PixVerse/i, tag: '视频生成' },
  { pattern: /图像生成|绘画|绘图|Midjourney|DALL/i, tag: '图像生成' },
  { pattern: /编程|代码|Copilot|Codex|编程助手/i, tag: '编程' },
  { pattern: /开源|GitHub|开源项目/i, tag: '开源' },
  { pattern: /API|接口|中转/i, tag: 'API' },
  { pattern: /机器人|Figure|具身智能/i, tag: '机器人' },
  { pattern: /Agent|智能体|agent/i, tag: 'Agent' },
  { pattern: /RAG|检索增强/i, tag: 'RAG' },
  { pattern: /MCP|模型上下文协议/i, tag: 'MCP' },
  { pattern: /推理|o3|o4|思维链/i, tag: '推理' },
  { pattern: /多模态|视觉|语音|multimodal/i, tag: '多模态' },
  { pattern: /芯片|GPU|NVIDIA|算力/i, tag: '算力' },
  { pattern: /安全|风险|漏洞/i, tag: '安全' },
  { pattern: /设计|UI|UX|Figma/i, tag: '设计' },
  { pattern: /浏览器|Chrome|Safari|Firefox/i, tag: '浏览器' },
]

function extractTags(title, category) {
  const tags = []
  for (const { pattern, tag } of TAG_PATTERNS) {
    if (pattern.test(title)) {
      tags.push(tag)
      if (tags.length >= 3) break
    }
  }
  // 保底：用分类名
  if (!tags.length) {
    tags.push(category)
  }
  return tags
}

export async function fetchNews() {
  console.log('[AI-HOT] Fetching today AI news...')

  // 过去 24 小时
  const res = await fetch(API_ITEMS, {
    headers: { 'User-Agent': 'techpulse-bot/1.0' },
  })

  if (!res.ok) {
    throw new Error(`AI-HOT API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const items = data.items || []
  console.log(`[AI-HOT] Got ${items.length} items`)

  // 精选模式已按时间排序，取前 10 条映射为前端格式
  const news = items.slice(0, 10).map((item, i) => ({
    title: item.title,
    summary: item.summary || item.title,
    category: CATEGORY_MAP[item.category] || 'AI',
    tags: extractTags(item.title, item.category),
    url: item.url,
    source: item.source,
    image: null,
    time: item.publishedAt || new Date().toISOString(),
  }))

  // 并行抓取每篇文章的第三幅图片
  console.log('[AI-HOT] Fetching article images...')
  const images = await Promise.all(
    news.map(item => fetchThirdImage(item.url).catch(() => null))
  )
  news.forEach((item, i) => {
    if (images[i]) {
      item.image = images[i]
      console.log(`  [${i + 1}] ${images[i].slice(0, 80)}`)
    }
  })

  return news
}
