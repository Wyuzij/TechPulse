<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <span class="footer-brand">TechPulse</span>
        <span class="footer-desc">每日清晨八点 · 技术风向速递 · by Wyuzij</span>
      </div>
      <div class="footer-meta">
        <span>2026/05/17 08:00 CST</span>
        <span class="meta-sep">·</span>
        <span class="live-indicator"><span class="status-dot"></span> live</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  z-index: 1;
  padding: 64px 60px;
  border-top: 1px solid var(--border-subtle);
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-top {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-brand {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

.footer-desc {
  font-size: 13px;
  color: var(--text-muted);
  text-transform: lowercase;
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.meta-sep {
  opacity: 0.2;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--green);
  text-transform: lowercase;
}

@media (max-width: 600px) {
  .app-footer {
    padding: 40px 24px;
  }
}
</style>
