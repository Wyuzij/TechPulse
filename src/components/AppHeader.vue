<template>
  <header class="app-header">
    <div class="header-inner">
      <a href="/" class="header-left">
        <span class="logo">TechPulse</span>
      </a>
      <div class="header-right">
        <span class="header-label">daily tech briefing</span>
        <span class="header-divider"></span>
        <span class="header-status">
          <span class="status-dot"></span>
          <span>{{ time }} CST</span>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref('')
let t = null
onMounted(() => {
  const tick = () => {
    time.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  tick(); t = setInterval(tick, 1000)
})
onUnmounted(() => clearInterval(t))
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 60px;
}

.header-inner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.header-left {
  text-decoration: none;
}

.logo {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.header-label {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  text-transform: lowercase;
}

.header-divider {
  width: 1px;
  height: 10px;
  background: var(--border-default);
  align-self: center;
}

.header-status {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 600px) {
  .app-header {
    padding: 16px 24px;
  }

  .header-label {
    display: none;
  }

  .header-divider {
    display: none;
  }
}
</style>
