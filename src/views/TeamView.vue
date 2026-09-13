<template>
  <div class="team-container">
    <!-- 返回首页按钮 -->
    <div class="top-left-buttons">
      <el-button 
        class="back-btn"
        @click="goBackToHome"
      >
        <img src="/images/home-icon.svg" alt="返回首页" class="home-icon" />
      </el-button>
    </div>

    <!-- 右上角个人信息区域 -->
    <PersonalHeader v-if="userStore.token" />

    <!-- 两个功能板块：大厅和挑战 -->
    <div class="sections-wrapper">
      <div 
        v-for="(section, index) in sections" 
        :key="index" 
        class="section-card"
        :class="`pos-${index}`"
      >
        <div 
          class="clickable-area"
          @click="handleSectionClick(section)"
        >
          <div class="section-icon">
            <img 
              :src="section.image" 
              :alt="section.name"
              :style="{
                width: section.size.width + 'px',
                height: section.size.height + 'px'
              }"
            />
          </div>
          <span class="section-name">{{ section.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import PersonalHeader from '@/components/PersonalHeader.vue'

const router = useRouter()
const userStore = useUserStore()

// 两个板块数据（大厅和挑战）
const sections = [
  { 
    name: '大厅', 
    path: '/team/lobby', 
    image: '/images/team-lobby.png',
    size: { width: 300, height: 300 } 
  },
  { 
    name: '挑战', 
    path: '/team/challenge', 
    image: '/images/team-challenge.png',
    size: { width: 500, height: 500 } 
  },
]

const handleSectionClick = (section) => {
  router.push(section.path)
}

// 返回首页
const goBackToHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* ========== 容器 ========== */
.team-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* ========== 板块容器 ========== */
.sections-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 100px;
  padding: 0 40px;
}

.section-icon img {
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-icon img:hover {
  transform: scale(1.03);
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
}

/* 起伏效果 - 两个卡片一个上一个下 */
.pos-0 { transform: translateY(-80px); }
.pos-1 { transform: translateY(80px); }

.pos-0:hover { transform: translateY(-75px) scale(1.05); }
.pos-1:hover { transform: translateY(85px) scale(1.05); }

.clickable-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.section-name { 
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: rgba(247, 202, 201, 0.9);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  background: rgba(146, 168, 209, 0.7);
  padding: 10px 24px;
  border-radius: 30px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 5;
}

.section-card:hover .section-name {
  opacity: 1;
}

/* 左上角返回按钮 - 调整为和Task.vue一致的样式 */
.top-left-buttons {
  position: absolute;
  bottom: 20px;    /*  bottom（距离底部） */
  left: 20px; 
  z-index: 10;
}

.back-btn {
  background: transparent !important;
  border: none !important;
  display: flex;
  align-items: center;
  padding: 73px 43px !important;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  box-shadow: none !important;
}

/* 图标样式 */
.home-icon {
  width: 127px !important;
  height: 100px !important;
  transition: transform 0.2s ease;
}

/* 悬停效果 */
.back-btn:hover {
  background: transparent !important;
  border: none !important;
}

.back-btn:hover .home-icon {
  transform: scale(1.1);
}
</style>