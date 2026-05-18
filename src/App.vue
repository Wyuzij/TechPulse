<template>
  <div class="app-root">
    <!-- Video background -->
    <video class="video-bg" autoplay muted loop playsinline>
      <source src="/bg-video.mp4" type="video/mp4">
    </video>

    <!-- Scroll progress bar -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>

    <AppHeader />

    <HeroSection @navigate="scrollToSection" />

    <section id="summary-sec" ref="sumSec" class="full-section alt-bg">
      <div class="section-gradient section-gradient-top"></div>
      <SummaryView />
    </section>

    <section id="news-sec" ref="newsSec" class="full-section">
      <div class="section-gradient section-gradient-top"></div>
      <NewsView />
    </section>

    <section id="projects-sec" ref="projSec" class="full-section alt-bg">
      <div class="section-gradient section-gradient-top"></div>
      <ProjectsView />
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import NewsView from './components/NewsView.vue'
import ProjectsView from './components/ProjectsView.vue'
import SummaryView from './components/SummaryView.vue'
import AppFooter from './components/AppFooter.vue'
import feed from './data/feed.json'

// 直接使用工作流生成的实时数据
const news = reactive([...feed.techNews])
const repos = reactive([...feed.githubTrending])
const summary = reactive({ ...feed.dailySummary })

provide('news', news)
provide('repos', repos)
provide('summary', summary)

const sumSec = ref(null)
const newsSec = ref(null)
const projSec = ref(null)

const scrollToSection = (name) => {
  const map = { summary: sumSec, news: newsSec, projects: projSec }
  const el = map[name]?.value
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

/* Scroll progress */
const scrollProgress = ref(0)

function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style>
@import './styles/global.css';

/* Video background — fixed, blurred, dimmed */
.video-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  filter: brightness(0.4);
  transform: none;
}
</style>

<style scoped>
.app-root {
  position: relative;
  z-index: 1;
}

/* Scroll progress bar */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 1px;
  background: var(--accent);
  z-index: 200;
  transition: width 0.15s linear;
}

.full-section {
  position: relative;
  z-index: 1;
  padding: 140px 0;
  background: transparent;
}
</style>
