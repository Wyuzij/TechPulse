import { createApp } from 'vue'
import App from './App.vue'
import VanillaTilt from 'vanilla-tilt'

const app = createApp(App)

/* Global scroll-reveal directive.
   Usage: <div class="reveal-el" v-reveal>
   Element must have .reveal-el class. Directive adds .is-revealed on scroll into view. */
app.directive('reveal', {
  mounted(el, binding) {
    if (!el.classList.contains('reveal-el')) {
      el.classList.add('reveal-el')
    }

    const options = {
      threshold: binding.value?.threshold ?? 0.12,
      rootMargin: binding.value?.margin ?? '0px 0px -30px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // requestAnimationFrame ensures the browser has painted the hidden state
          requestAnimationFrame(() => {
            el.classList.add('is-revealed')
          })
          observer.unobserve(el)
        }
      })
    }, options)

    observer.observe(el)
    el._revealObserver = observer
  },

  unmounted(el) {
    if (el._revealObserver) {
      el._revealObserver.disconnect()
      delete el._revealObserver
    }
  }
})

/* 3D Tilt directive for glass cards.
   Usage: <div class="card-surface" v-tilt> */
app.directive('tilt', {
  mounted(el, binding) {
    const options = {
      max: binding.value?.max ?? 15,
      speed: binding.value?.speed ?? 400,
      glare: binding.value?.glare ?? true,
      'max-glare': binding.value?.maxGlare ?? 0.25,
      perspective: binding.value?.perspective ?? 1000,
      scale: binding.value?.scale ?? 1.02,
      gyroscope: false,
      reverse: false,
    }
    VanillaTilt.init(el, options)
  },
  unmounted(el) {
    if (el.vanillaTilt) {
      el.vanillaTilt.destroy()
      delete el.vanillaTilt
    }
  }
})

app.mount('#app')
