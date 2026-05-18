<template>
  <div class="section-inner section-frame reveal-el" v-reveal="{ threshold: 0.08 }" style="transition-delay: 0.05s">
    <div class="section-header reveal-el reveal-section-header" v-reveal="{ threshold: 0.08 }">
      <div class="section-num-wrap">
        <span class="section-num">02</span>
      </div>
      <div class="section-title-block">
        <p class="section-eyebrow">{{ news.length }} signals acquired</p>
        <h2 class="section-title">技术资讯</h2>
        <p class="section-sub">清晨八点采集全球开发者社区与技术媒体的最新动态</p>
      </div>
    </div>

    <div class="news-layout">
      <!-- Featured card -->
      <a
        :href="news[0].url"
        target="_blank"
        rel="noopener"
        class="news-card featured card-surface reveal-el"
        v-reveal="{ threshold: 0.06 }"
        v-tilt="{ max: 4, speed: 600, glare: true, maxGlare: 0.1, scale: 1.01 }"
        style="transition-delay: 0.1s"
      >
        <div class="card-visual">
          <div class="ecg-monitor">
            <div class="ecg-grid"></div>
            <svg class="ecg-trace" viewBox="0 0 600 200" preserveAspectRatio="none">
              <path class="ecg-line" d="M0,100 L120,100 L140,100 L155,20 L170,180 L185,100 L205,100 L220,100 L235,60 L250,140 L265,100 L600,100" />
              <path class="ecg-line ecg-ghost" d="M0,100 L120,100 L140,100 L155,20 L170,180 L185,100 L205,100 L220,100 L235,60 L250,140 L265,100 L600,100" />
            </svg>
            <div class="ecg-dot"></div>
            <span class="ecg-label">SIGNAL ACTIVE</span>
          </div>
          <span class="visual-badge">FEATURED</span>
        </div>
        <div class="card-body">
          <div class="card-meta-top">
            <span class="cat-badge" :class="catClass(news[0].category)">{{ news[0].category }}</span>
            <span class="card-time">{{ news[0].time }}</span>
          </div>
          <h3 class="card-headline">{{ news[0].title }}</h3>
          <p class="card-text card-expandable">{{ news[0].summary }}</p>
          <div class="card-footer-row">
            <div class="tags-row">
              <span v-for="t in news[0].tags" :key="t" class="tag">{{ t }}</span>
            </div>
            <span class="source">{{ news[0].source }}</span>
          </div>
        </div>
      </a>

      <!-- Grid cards -->
      <div class="news-grid">
        <a
          v-for="(item, idx) in news.slice(1)"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener"
          class="news-card card-surface reveal-el"
          v-reveal="{ threshold: 0.06 }"
          v-tilt="{ max: 4, speed: 600, glare: true, maxGlare: 0.1, scale: 1.01 }"
          :style="{ transitionDelay: (0.12 + idx * 0.06) + 's' }"
        >
          <div class="card-body">
            <div class="card-meta-top">
              <span class="cat-badge" :class="catClass(item.category)">{{ item.category }}</span>
              <span class="card-num">{{ String(idx + 2).padStart(2, '0') }}</span>
            </div>
            <h3 class="card-headline-small">{{ item.title }}</h3>
            <p class="card-text-short card-expandable">{{ item.summary }}</p>
            <div class="card-footer-row">
              <div class="tags-row">
                <span v-for="t in item.tags" :key="t" class="tag">{{ t }}</span>
              </div>
              <span class="source">{{ item.source }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const news = inject('news', [])

const catClass = (c) => ({
  'AI': 'c-ai', '编程语言': 'c-lang', 'JavaScript': 'c-js',
  'Web': 'c-web', 'Cloud': 'c-cloud', '系统': 'c-sys', '工具': 'c-tools', '行业': 'c-industry'
}[c] || '')
</script>

<style scoped>
.section-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

.section-header {
  display: flex; align-items: flex-start; gap: 56px;
  margin-bottom: 60px;
}

.section-num-wrap { flex-shrink: 0; overflow: hidden; }

.section-title-block { padding-top: 28px; }

.section-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px; color: var(--text-muted);
  letter-spacing: 0.06em; text-transform: lowercase;
  margin-bottom: 14px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(44px, 5vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em; line-height: 1.08;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-sub {
  font-size: 17px; color: var(--text-secondary);
  max-width: 500px; line-height: 1.55;
}

.news-layout {
  display: flex; flex-direction: column; gap: 10px;
}

.news-card {
  overflow: visible;
  text-decoration: none; color: inherit;
  display: block;
  position: relative;
  z-index: 1;
  transition: z-index 0s step-end;
}

.news-card:hover { z-index: 20; transition: z-index 0s step-start; }

.news-card.featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.card-visual {
  position: relative;
  min-height: 260px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

/* ECG monitor */
.ecg-monitor {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(100,200,160,0.06) 0%, transparent 60%),
    var(--bg-elevated);
}

.ecg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(100,200,160,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100,200,160,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

.ecg-trace {
  position: absolute;
  width: 100%;
  height: 70%;
  overflow: visible;
}

.ecg-line {
  fill: none;
  stroke: #4ecb9a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: ecgDraw 2.5s linear infinite;
  filter: drop-shadow(0 0 6px rgba(78,203,154,0.5)) drop-shadow(0 0 12px rgba(78,203,154,0.2));
}

@keyframes ecgDraw {
  0% { stroke-dashoffset: 800; }
  60% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -800; }
}

.ecg-ghost {
  stroke: rgba(78,203,154,0.12);
  stroke-width: 4;
  filter: none;
  animation: ecgGhost 2s ease-in-out infinite;
}

@keyframes ecgGhost {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
}

.ecg-dot {
  position: absolute;
  right: 18%;
  top: 50%;
  transform: translateY(-50%);
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #4ecb9a;
  box-shadow: 0 0 10px #4ecb9a, 0 0 20px rgba(78,203,154,0.4);
  animation: ecgBlip 1.5s ease-in-out infinite;
}

@keyframes ecgBlip {
  0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
  50% { opacity: 0.4; transform: translateY(-50%) scale(1.8); }
}

.ecg-label {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  color: rgba(78,203,154,0.5);
  text-transform: uppercase;
}

.visual-badge {
  position: absolute; bottom: 20px; right: 24px;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--accent); letter-spacing: 0.12em;
  padding: 5px 12px;
  border: 1px solid rgba(126, 184, 218, 0.18);
  border-radius: 20px;
  opacity: 0.7;
}

.card-body {
  padding: 32px 32px;
  display: flex; flex-direction: column; gap: 16px;
}

.card-meta-top {
  display: flex; justify-content: space-between; align-items: center;
}

.cat-badge {
  font-size: 10px; font-weight: 600;
  padding: 3px 8px; border-radius: 2px;
  letter-spacing: 0.05em; text-transform: uppercase;
}

.c-ai    { background: rgba(126,184,218,0.12); color: #a4ccdc; }
.c-lang  { background: rgba(126,184,133,0.12); color: #a0d4a8; }
.c-js    { background: rgba(201,160,107,0.12); color: #d4b98e; }
.c-web   { background: rgba(130,160,190,0.12); color: #a8bcd0; }
.c-cloud { background: rgba(180,140,140,0.12); color: #ccb0b0; }
.c-sys   { background: rgba(201,160,107,0.12); color: #d4b98e; }
.c-tools { background: rgba(150,158,168,0.12); color: #b8bec4; }
.c-industry { background: rgba(180,160,200,0.12); color: #c0b8d0; }

.card-time {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
}

.card-num {
  font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
}

.card-headline {
  font-family: var(--font-display);
  font-size: 24px; font-weight: 600;
  line-height: 1.35; letter-spacing: -0.02em;
  color: var(--text-primary);
}

.card-headline-small {
  font-family: var(--font-display);
  font-size: 16px; font-weight: 600;
  line-height: 1.4; letter-spacing: -0.01em;
  color: var(--text-primary);
}

.card-text {
  font-size: 15px; line-height: 1.7; color: var(--text-secondary);
}

.card-text-short {
  font-size: 13px; line-height: 1.6; color: var(--text-secondary);
}

.card-expandable {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 2.8em;
  transition: max-height 0.35s ease;
}

.news-card:hover .card-expandable {
  -webkit-line-clamp: unset;
  max-height: 20em;
  transition: max-height 0.45s ease;
}

.card-footer-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto;
}

.tags-row { display: flex; gap: 5px; flex-wrap: wrap; }

.tag {
  font-family: var(--font-mono); font-size: 9.5px;
  padding: 2px 7px; border-radius: 2px;
  background: rgba(255,255,255,0.02);
  color: var(--text-muted);
  border: 1px solid rgba(255,255,255,0.04);
  transition: color 0.25s ease, border-color 0.25s ease;
}

.news-card:hover .tag {
  border-color: rgba(126, 184, 218, 0.25);
  color: var(--text-primary);
  background: rgba(126, 184, 218, 0.06);
}

.news-card:hover .card-headline,
.news-card:hover .card-headline-small {
  color: var(--accent);
}

.news-card:hover .cat-badge {
  box-shadow: 0 0 8px rgba(126, 184, 218, 0.2);
}

.source {
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  flex-shrink: 0;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: start;
}

@media (max-width: 1200px) {
  .news-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .section-inner { padding: 0 24px; }
  .section-frame { padding: 28px 20px; }
  .section-header { flex-direction: column; gap: 20px; }
  .section-num { font-size: 72px; }
  .news-card.featured { grid-template-columns: 1fr; }
  .card-visual { min-height: 160px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
}

@media (max-width: 640px) {
  .news-grid { grid-template-columns: 1fr; }
}
</style>
