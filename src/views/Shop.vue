<template>
  <div class="shop-container">
    <!-- PersonalHeader组件始终显示在右上角 -->
    <PersonalHeader class="personal-header" />

    <div class="shop-content">
      <!-- 侧边栏 -->
      <div class="shop-sidebar-wrapper">
        <el-menu
          :default-active="activeMenu"
          class="shop-sidebar"
          @select="handleMenuSelect"
        >
          <el-menu-item index="role">
            <span>角色分类</span>
          </el-menu-item>
          <el-menu-item index="sort">
            <span>风格分类</span>
          </el-menu-item>
          <el-menu-item index="custom">
            <span>自定义奖励</span>
          </el-menu-item>
          <el-menu-item index="lucky">
            <span>幸运箱</span>
          </el-menu-item>
        </el-menu>
        <el-button class="back-home-btn" @click="goBackToHome">
          <img src="/images/home-icon.svg" alt="返回首页" class="home-icon" />
        </el-button>
      </div>

      <!-- 主内容区 -->
      <div class="shop-main">
        <!-- 系统装扮（按角色查看） -->
        <div v-if="activeMenu === 'role'" class="module-container">
          <RoleCostumeModule />
        </div>

        <!-- 系统装扮（按风格查看） -->
        <div v-else-if="activeMenu === 'sort'" class="module-container">
          <SortCostumeModule />
        </div>

        <!-- 自定义奖励 -->
        <div v-else-if="activeMenu === 'custom'" class="module-container">
          <CustomRewardModule />
        </div>

        <!-- 幸运箱 -->
        <div v-else-if="activeMenu === 'lucky'" class="module-container">
          <LuckyBoxModule />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' 
import PersonalHeader from '@/components/PersonalHeader.vue'
import RoleCostumeModule from '@/components/RoleCostumeModule.vue'
import SortCostumeModule from '@/components/SortCostumeModule.vue'
import CustomRewardModule from '@/components/CustomRewardModule.vue'
import LuckyBoxModule from '@/components/LuckyBoxModule.vue'

const activeMenu = ref('role')
const router = useRouter() // 初始化路由

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const goBackToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.shop-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

.personal-header {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.shop-content {
  display: flex;
  height: 100vh;
}

/* 侧边栏容器（包裹按钮+菜单） */
.shop-sidebar-wrapper {
  width: 240px;
  min-height: 100vh;
  border-right: 1px solid white;
  display: flex;
  flex-direction: column;
}

.shop-sidebar {
  /* 移除原有width和border，移到wrapper上 */
  min-height: calc(100vh - 140px); /* 浏览器高度减，给按钮留出空间 */
  flex: 1;
  overflow: visible;
}

.shop-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.module-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-height: calc(100vh - 40px);
}

/* 复用Task.vue的返回首页按钮样式 */
.back-home-btn {
  background: transparent !important;
  border: none !important;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 73px 43px !important;/*上下、左右 */
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 100%;
  min-height: 130px; 
  justify-content: flex-start;
  overflow: visible;
}

.back-text {
  font-size: 13px;
  color: black;
  display: none; /* 默认隐藏文字 */
}

/* 悬停时显示文字 */
.back-home-btn:hover .back-text {
  display: inline;
}

.back-home-btn:hover {
  background: transparent !important;
  border: none !important;
}

.back-home-btn:hover .home-icon {
  transform: scale(1.1); 
}

.home-icon {
  width: 127px !important;
  height: 100px !important;
  display: block;
  overflow: visible;
  transition: transform 0.2s ease; 
}
</style>