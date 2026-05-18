<template>
  <section class="hero">
    <div class="hero-content">
      <p class="hero-eyebrow hero-enter" style="--enter-delay: 0.1s">
        2026 / 05 / 17 — 08:00 CST
      </p>

      <h1 class="hero-title hero-enter" style="--enter-delay: 0.25s">
        今日<br/>技术风向标
      </h1>

      <p class="hero-desc hero-enter" style="--enter-delay: 0.4s">
        清晨八点，AI 自动采集全球技术资讯与 GitHub 热门项目，Claude 生成趋势解读。
      </p>

      <div class="hero-nav hero-enter" style="--enter-delay: 0.55s">
        <button
          v-for="(item, idx) in navItems"
          :key="item.key"
          class="nav-btn card-surface"
          :style="{ '--btn-delay': (0.6 + idx * 0.08) + 's' }"
          v-tilt="{ max: 4, speed: 500, glare: true, maxGlare: 0.1, scale: 1.01 }"
          @click="$emit('navigate', item.key)"
        >
          <span class="nav-num">{{ item.num }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-line"></span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineEmits(['navigate'])

const navItems = [
  { key: 'summary', num: '01', label: 'AI 趋势解读' },
  { key: 'news', num: '02', label: '技术资讯' },
  { key: 'projects', num: '03', label: '热门项目' }
]
</script>

<style scoped>
.hero {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 120px 60px 80px;
}

.hero-content {
  max-width: 720px;
}

/* Entrance animation — triggers on load via animation-delay */
.hero-enter {
  opacity: 0;
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--enter-delay, 0s);
}

@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  margin-bottom: 48px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(72px, 9vw, 120px);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 0.9;
  color: var(--text-primary);
  margin-bottom: 32px;
}

.hero-desc {
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 64px;
  max-width: 480px;
}

/* Nav — ghost buttons with staggered entrance */
.hero-nav {
  display: flex; gap: 10px;
}

.nav-btn {
  opacity: 0;
  animation: heroFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--btn-delay, 0.6s);

  padding: 14px 24px;
  cursor: pointer;
  display: flex; align-items: center; gap: 14px;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 15px; font-weight: 500;
  letter-spacing: -0.01em;
  position: relative;
  overflow: visible;
  /* card-surface provides background/border/glass */
}

.nav-btn:hover { color: var(--text-primary); }

.nav-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.4s ease;
}

.nav-btn:hover .nav-num { color: var(--accent); }

.nav-line {
  width: 12px; height: 1px;
  background: var(--border-default);
  transition: width 0.4s ease, background 0.4s ease;
}

.nav-btn:hover .nav-line {
  width: 24px;
  background: var(--accent);
}

@media (max-width: 768px) {
  .hero { padding: 100px 24px 60px; }
  .hero-nav { flex-direction: column; gap: 8px; }
  .nav-btn { justify-content: space-between; }
  .hero-title { font-size: 52px; }
}
</style>
