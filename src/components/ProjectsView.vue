<template>
  <div class="section-inner section-frame reveal-el" v-reveal="{ threshold: 0.08 }" style="transition-delay: 0.05s">
    <div class="section-header reveal-el reveal-section-header" v-reveal="{ threshold: 0.08 }">
      <div class="section-num-wrap">
        <span class="section-num">03</span>
      </div>
      <div class="section-title-block">
        <p class="section-eyebrow">{{ repos.length }} repositories · 24h star growth</p>
        <h2 class="section-title">GitHub 热门项目</h2>
        <p class="section-sub">按 24 小时内 Star 上涨量排序，发现今日最受关注的开源项目</p>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="stats-strip card-surface reveal-el" v-reveal="{ threshold: 0.08 }" style="transition-delay: 0.08s">
      <div class="stat-item" v-for="(s, i) in stats" :key="i">
        <span class="stat-num" ref="statRefs">{{ i === 0 ? animatedStats[0] : s.value }}</span>
        <span class="stat-lbl">{{ s.label }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="proj-table card-surface">
      <div class="table-row table-head">
        <span class="col-r">#</span>
        <span class="col-n">repository</span>
        <span class="col-d">description</span>
        <span class="col-l">lang</span>
        <span class="col-s">stars</span>
      </div>
      <a v-for="(repo, idx) in repos" :key="repo.name" :href="repo.url" target="_blank" rel="noopener"
        class="table-row table-data reveal-el" v-reveal="{ threshold: 0.04 }"
        :style="{ transitionDelay: (0.05 + idx * 0.04) + 's' }">
        <span class="col-r" :class="rankCls(repo.rank)">
          <span class="rank-val">{{ String(repo.rank).padStart(2, '0') }}</span>
        </span>
        <span class="col-n">
          <span class="repo-link">{{ repo.name }}</span>
        </span>
        <span class="col-d"><span class="desc-text">{{ repo.description }}</span></span>
        <span class="col-l">
          <span class="lang-dot" :style="{ background: langClr(repo.language) }"></span>
          {{ repo.language }}
        </span>
        <span class="col-s">
          <span class="star-main">{{ fmt(repo.stars) }}</span>
          <span class="star-day">+{{ fmt(repo.starsToday) }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted } from 'vue'

const repos = inject('repos', [])

const stats = computed(() => {
  if (!repos.length) return []
  const totalToday = repos.reduce((s, r) => s + r.starsToday, 0)
  const langs = {}
  repos.forEach(r => { langs[r.language] = (langs[r.language] || 0) + 1 })
  const topLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 2)
  const topGainer = repos.reduce((best, r) => r.starsToday > best.starsToday ? r : best, repos[0])
  return [
    { value: '+' + ((totalToday / 1000).toFixed(1)) + 'k', label: '今日新增 Star' },
    { value: topLangs.map(([l]) => l).join(' / '), label: '热门语言' },
    { value: '+' + fmt(topGainer.starsToday), label: topGainer.name.split('/')[0] + ' 最高涨幅' }
  ]
})

const animatedStats = ref(['0', '', ''])

/* Animate first stat number on scroll */
const statRefs = ref([])
let animated = false

onMounted(() => {
  const el = statRefs.value[0]?.parentElement
  if (!el) return

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !animated) {
      animated = true
      const totalToday = repos.reduce((s, r) => s + r.starsToday, 0)
      const target = totalToday / 1000
      const duration = 1400
      const start = performance.now()

      function tick(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(2, -10 * progress)
        const current = target * eased
        animatedStats.value[0] = '+' + current.toFixed(1) + 'k'
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }
  }, { threshold: 0.5 })

  observer.observe(el)
})

const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

const langClr = (l) => ({
  'Python': '#5c8ec9', 'Rust': '#c98e6b', 'TypeScript': '#5c8ec9',
  'JavaScript': '#c9b86b', 'Go': '#6bc9c0'
}[l] || '#6b6b6b')

const rankCls = (r) => r === 1 ? 'r1' : r === 2 ? 'r2' : r === 3 ? 'r3' : ''
</script>

<style scoped>
.section-inner {
  padding: 0 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 56px;
  margin-bottom: 48px;
}

.section-num-wrap {
  flex-shrink: 0;
  overflow: hidden;
}

.section-title-block {
  padding-top: 28px;
}

.section-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  margin-bottom: 14px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(44px, 5vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.08;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-sub {
  font-size: 17px;
  color: var(--text-secondary);
  max-width: 500px;
  line-height: 1.55;
}

/* Stats strip */
.stats-strip {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.stat-item+.stat-item {
  border-left: 1px solid var(--border-subtle);
}

.stat-num {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.stat-lbl {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

/* Table */
.proj-table {
  overflow: hidden;
}

.table-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
}

.table-head {
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: lowercase;
}

.table-data {
  border-bottom: 1px solid var(--border-subtle);
  text-decoration: none;
  color: inherit;
  transition: background 0.3s ease;
}

.table-data:last-child {
  border-bottom: none;
}

.table-data:hover {
  background: rgba(126, 184, 218, 0.08);
}

.table-data:hover .repo-link {
  color: var(--accent);
}

.table-data:hover .desc-text {
  color: var(--text-primary);
}

.table-data:hover .star-day {
  color: #a0d4a8;
}

.col-r {
  width: 44px;
  flex-shrink: 0;
}

.rank-val {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.r1 .rank-val {
  color: var(--accent);
}

.r2 .rank-val {
  color: #9e9e9e;
}

.r3 .rank-val {
  color: #8b7b74;
}

.col-n {
  flex: 1;
  min-width: 0;
}

.repo-link {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.col-d {
  flex: 1.5;
  min-width: 0;
}

.desc-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.col-l {
  width: 100px;
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.col-s {
  width: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.star-main {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.star-day {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--green);
}

@media (max-width: 1000px) {
  .col-d {
    display: none;
  }
}

@media (max-width: 900px) {
  .section-inner {
    padding: 0 24px;
  }

  .section-header {
    flex-direction: column;
    gap: 20px;
  }

  .section-num {
    font-size: 72px;
  }

  .stats-strip {
    flex-direction: column;
  }

  .stat-item+.stat-item {
    border-left: none;
    border-top: 1px solid var(--border-subtle);
  }
}

@media (max-width: 640px) {
  .col-l {
    display: none;
  }
}
</style>
