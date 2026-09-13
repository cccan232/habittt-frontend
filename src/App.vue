<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { initWebSocket } from '@/utils/websocket'
import { watch, onMounted } from 'vue'

const userStore = useUserStore()

// 确保只在登录且没有连接时初始化
onMounted(() => {
  if (userStore.token) {
    initWebSocket()
  }
})

watch(() => userStore.token, (newToken) => {
  if (newToken) {
    initWebSocket()
  }
})
</script>

<style>
/* 强制让项目占满整个屏幕，去掉所有默认边距 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 防止出现滚动条 */
}
</style>

