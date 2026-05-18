<template>
  <div class="section-inner section-frame reveal-el" v-reveal="{ threshold: 0.08 }" style="transition-delay: 0.05s">
    <div class="section-header reveal-el reveal-section-header" v-reveal="{ threshold: 0.08 }">
      <div class="section-num-wrap">
        <span class="section-num">01</span>
      </div>
      <div class="section-title-block">
        <p class="section-eyebrow">powered by claude &middot; 5 insights</p>
        <h2 class="section-title">AI 趋势解读</h2>
        <p class="section-sub">Claude 自动分析今日资讯，提炼关键趋势与洞察</p>
      </div>
    </div>

    <div class="summary-layout">
      <div class="s-card card-surface reveal-el" v-reveal="{ threshold: 0.06 }"
        v-tilt="{ max: 4, speed: 500, glare: true, maxGlare: 0.1, scale: 1.01 }" style="transition-delay: 0.1s">
        <div class="s-card-inner">
          <h3 class="s-card-title">要点速览</h3>
          <ul class="hl-list">
            <li v-for="(h, i) in summary.highlights" :key="i" class="hl-row">
              <span class="hl-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="hl-body">{{ h }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="s-card card-surface reveal-el" v-reveal="{ threshold: 0.06 }"
        v-tilt="{ max: 4, speed: 500, glare: true, maxGlare: 0.1, scale: 1.01 }" style="transition-delay: 0.18s">
        <div class="s-card-inner">
          <h3 class="s-card-title">趋势研判</h3>
          <p class="trend-body">{{ summary.trendingSummary }}</p>
        </div>
      </div>

      <div class="s-card card-surface reveal-el" v-reveal="{ threshold: 0.06 }"
        v-tilt="{ max: 4, speed: 500, glare: true, maxGlare: 0.1, scale: 1.01 }" style="transition-delay: 0.26s">
        <div class="s-card-inner">
          <h3 class="s-card-title">核心关键词</h3>
          <div class="kw-wrap">
            <div class="kw-flow">
              <div class="kw-line" v-for="n in 2" :key="n">
                <span v-for="kw in summary.keywords" :key="kw + n" class="kw-chip">{{ kw }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const summary = inject('summary', { highlights: [], keywords: [], trendingSummary: '' })
</script>

<style scoped>
.section-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 56px;
  margin-bottom: 60px;
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

.summary-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.s-card {
  overflow: visible;
}

.s-card-inner {
  padding: 36px 40px;
}

.s-card-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  margin-bottom: 28px;
  text-transform: lowercase;
}

.hl-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hl-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.hl-num {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  opacity: 0.40;
  flex-shrink: 0;
  margin-top: 2px;
  min-width: 24px;
}

.hl-body {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.trend-body {
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-secondary);
}

.kw-wrap {
  overflow: hidden;
}

.kw-flow {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kw-line {
  display: flex;
  gap: 6px;
  animation: kwScroll 28s linear infinite;
}

.kw-line:nth-child(2) {
  animation-delay: -14s;
  animation-direction: reverse;
}

@keyframes kwScroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.kw-chip {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.35s ease, color 0.35s ease;
}

.kw-chip:hover {
  border-color: rgba(126, 184, 218, 0.40);
  color: var(--text-primary);
  background: rgba(126, 184, 218, 0.12);
  box-shadow: 0 0 12px rgba(126, 184, 218, 0.15);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .section-inner {
    padding: 0 24px;
  }

  .section-frame {
    padding: 28px 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 20px;
  }

  .section-num {
    font-size: 72px;
  }

  .s-card-highlights {
    grid-row: auto;
  }

  .summary-layout {
    grid-template-columns: 1fr;
  }

  .s-card-inner {
    padding: 24px;
  }
}
</style>
