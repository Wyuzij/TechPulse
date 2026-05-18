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

/* 从文章页面抓取配图：og:image → twitter:image → 正文图 → Twitter oEmbed */
function resolveUrl(src, baseUrl) {
  if (!src) return null
  if (src.startsWith('//')) return 'https:' + src
  if (src.startsWith('/')) {
    try { return new URL(src, baseUrl).href } catch { return null }
  }
  if (src.startsWith('http')) return src
  return null
}

/* 从 HTML 里提取真实图片 src（data-original > data-src > src） */
function extractRealSrc(tag) {
  const doMatch = tag.match(/data-original=["']([^"']+)["']/i)
  if (doMatch) return doMatch[1]
  const dsMatch = tag.match(/data-src=["']([^"']+)["']/i)
  if (dsMatch) return dsMatch[1]
  const srcMatch = tag.match(/src=["']([^"']+)["']/i)
  return srcMatch ? srcMatch[1] : null
}

/* Twitter/X 用 oEmbed API 获取图片 */
async function fetchTwitterImage(url) {
  try {
    const oembed = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`
    const res = await fetch(oembed, {
      headers: { 'User-Agent': 'techpulse-bot/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    // oEmbed 返回的 html 中包含图片 URL
    if (data.html) {
      const imgMatch = data.html.match(/<img[^>]+src=["']([^"']+)["']/i)
      if (imgMatch) return imgMatch[1]
    }
    return null
  } catch {
    return null
  }
}

async function fetchArticleImage(url) {
  try {
    // Twitter/X 走 oEmbed API
    if (url.includes('x.com') || url.includes('twitter.com')) {
      return await fetchTwitterImage(url)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null

    const html = await res.text()

    // 策略1: og:image（最可靠）
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch) {
      const img = resolveUrl(ogMatch[1], url)
      if (img && !/icon|logo|favicon/i.test(img) && !img.includes('t.png')) return img
    }

    // 策略2: twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twMatch) {
      const img = resolveUrl(twMatch[1], url)
      if (img && !/icon|logo|favicon/i.test(img)) return img
    }

    // 策略3: 正文大图（跳过 icon/logo/placeholder）
    const imgRe = /<img[^>]+>/gi
    const candidates = []
    let m
    while ((m = imgRe.exec(html)) !== null) {
      const tag = m[0]
      const src = resolveUrl(extractRealSrc(tag), url)
      if (!src) continue
      if (/icon|logo|avatar|favicon|emoji|pixel|track|analytics/i.test(src)) continue
      if (src.includes('t.png')) continue // IT之家占位图

      // 提取尺寸
      const wMatch = tag.match(/width=["']?(\d+)/i)
      const hMatch = tag.match(/height=["']?(\d+)/i)
      const w = wMatch ? parseInt(wMatch[1]) : 0
      const h = hMatch ? parseInt(hMatch[1]) : 0

      // 跳过小图（< 200px 通常是装饰）
      if (w > 0 && w < 200) continue
      if (h > 0 && h < 200) continue

      candidates.push(src)
    }

    // 取第三幅（跳过前两幅装饰图）
    if (candidates.length >= 3) return candidates[2]
    if (candidates.length > 0) return candidates[0] // 只有一两张就直接取第一张

    return null
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
    news.map(item => fetchArticleImage(item.url).catch(() => null))
  )
  news.forEach((item, i) => {
    if (images[i]) {
      item.image = images[i]
      console.log(`  [${i + 1}] ${images[i].slice(0, 80)}`)
    }
  })

  return news
}
