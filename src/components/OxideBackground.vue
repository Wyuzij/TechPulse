<template>
  <div class="oxide-bg">
    <div class="bg-dot-grid"></div>
    <div class="bg-glow-top"></div>
    <div class="bg-glow-bottom"></div>
    <!-- Scanning line across the full page -->
    <div class="bg-scan-line"></div>
  </div>
</template>

<style scoped>
.oxide-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--bg-root);
}

.bg-glow-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 55vh;
  background: radial-gradient(ellipse 65% 45% at 50% 0%,
    rgba(0, 229, 255, 0.03) 0%, transparent 55%);
  pointer-events: none;
}

.bg-glow-bottom {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 35vh;
  background: radial-gradient(ellipse 55% 40% at 50% 100%,
    rgba(0, 229, 255, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

/* Slow scanning line across background */
.bg-scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(0, 229, 255, 0.08) 20%,
    rgba(0, 229, 255, 0.15) 50%,
    rgba(0, 229, 255, 0.08) 80%, transparent 100%);
  pointer-events: none;
  animation: bgScan 8s linear infinite;
}

@keyframes bgScan {
  0% { top: -2px; }
  100% { top: 100%; }
}
</style>
