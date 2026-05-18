import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Scroll-triggered reveal for elements.
 * Returns a revealState reactive map: { 'elKey': true/false }
 * Use with v-reveal directive or manual class toggling.
 */
export function useReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options
  const revealed = ref(new Map())
  const observers = new Map()

  let io = null

  function observe(el, key) {
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const k = entry.target.dataset.revealKey
            if (k) {
              revealed.value.set(k, true)
              revealed.value = new Map(revealed.value) // trigger reactivity
            }
            io.unobserve(entry.target)
          }
        })
      }, { threshold, rootMargin })
    }
    el.dataset.revealKey = key
    io.observe(el)
  }

  function unobserveAll() {
    if (io) {
      io.disconnect()
      io = null
    }
  }

  onMounted(() => {})
  onUnmounted(() => unobserveAll())

  return { revealed, observe, unobserveAll }
}

/**
 * Counter animation — animate number from 0 to target over duration
 */
export function useCounter() {
  function animate(el, target, duration = 1600) {
    const start = performance.now()
    const from = 0

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = from + (target - from) * eased
      el.textContent = formatNumber(current, target)
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }

  function formatNumber(current, target) {
    if (target >= 1000) {
      return (current / 1000).toFixed(1) + 'k'
    }
    return String(Math.round(current))
  }

  return { animate }
}
