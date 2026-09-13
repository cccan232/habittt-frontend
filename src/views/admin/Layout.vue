<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu router :default-active="$route.path" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>管理账号</span>
        </el-menu-item>
        <el-menu-item index="/admin/costumes">
          <el-icon><Picture /></el-icon>
          <span>更新装扮</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-right">
          <span>管理员：{{ adminInfo?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const adminInfo = ref(null)

onMounted(() => {
  const info = localStorage.getItem('adminInfo')
  if (info) {
    adminInfo.value = JSON.parse(info)
  }
})

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminInfo')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-aside {
  background: linear-gradient(180deg, #f7cac9 0%, #92a8d1 100%);
}

/* 穿透修改菜单样式，透明背景透出渐变 */
:deep(.el-menu) {
  background: transparent !important;
}
:deep(.el-menu-item) {
  color: #333 !important;
}
:deep(.el-menu-item:hover) {
  background-color: #ffbdbc !important;
  color: #333 !important;
}
:deep(.el-menu-item.is-active) {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>