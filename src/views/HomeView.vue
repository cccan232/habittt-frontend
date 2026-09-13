<template>  
  <div class="map-container">
    <!-- 左上角注册/退出按钮 -->
    <div class="top-left-buttons">
      <el-button 
        v-if="!userStore.token" 
        type="primary" 
        class="register-btn"
        @click="goToRegister"
      >
        注册
      </el-button>
      <el-button 
        v-else 
        type="info" 
        class="register-btn"
        @click="handleLogout"
      >
        退出登录
      </el-button>
    </div>

    <!-- 管理链接 - 移到左下角 -->
<div class="bottom-left-admin">
  <el-button 
    link 
    class="admin-link"
    @click="goToAdmin"
  >
    管理
  </el-button>
</div>

    <!-- 右上角个人信息区域 (只有登录后显示) -->
    <PersonalHeader v-if="userStore.token" />

    <!-- 背景层 -->
    <div class="background"></div>
    
    <!-- 装饰性小路 -->
    <div class="path-line"></div>

    <!-- 四个功能板块 -->
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

    <!-- 登录弹窗 -->
    <el-dialog 
      v-model="loginVisible" 
      :show-close="false" 
      width="420px" 
      class="rose-login-dialog"
      align-center
    >
      <template #header>
        <div class="dialog-header">
          <h3>欢迎来到Habittt克拉岛</h3>
        </div>
      </template>

      <el-form :model="loginForm" label-width="0" class="login-form">
        <el-form-item>
          <el-input 
            v-model="loginForm.email" 
            placeholder="请输入邮箱账号" 
            :prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <!-- 图形验证码 -->
        <el-form-item>
          <div class="captcha-row">
            <el-input 
              v-model="loginForm.captcha" 
              placeholder="输入计算结果" 
              size="large"
            />
            <div class="captcha-display" @click="fetchCaptcha" title="点击刷新">
              {{ captchaText || ' 点击获取' }} 
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="dialog-links">
        <el-button link type="primary" @click="goToRegister"> 注册新账号</el-button>
        <el-button link type="primary" @click="goToForgot"> 忘记密码?</el-button>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" class="login-btn" size="large" @click="handleLogin">
             立即登录
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增：新手引导弹窗 (登录且没有昵称时显示) -->
    <GuideDialog 
      v-if="userStore.token && !userInfo.nickname" 
      @complete="handleGuideComplete" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import PersonalHeader from '@/components/PersonalHeader.vue'
import GuideDialog from '@/components/GuideDialog.vue' // 新增引入

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
// 获取用户信息，用于判断是否完成引导
const userInfo = computed(() => userStore.userInfo || {})
// 控制引导弹窗显示的状态
const showGuideDialog = ref(false)
// 弹窗状态
const loginVisible = ref(false)
const captchaText = ref('')
const captchaKey = ref('')
const targetPath = ref('')

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  captcha: ''
})

// 四个板块数据
const sections = [
  { name: '商城', path: '/shop', image: '/images/shop1.png', size: { width: 232, height: 232 } }, 
  { name: '任务', path: '/tasks', image: '/images/task2.png', size: { width: 170, height: 200 } },
  { name: '组队', path: '/team', image: '/images/team1.png', size: { width: 232, height: 300 } },
  { name: '个人', path: '/profile', image: '/images/person.png', size: { width: 200, height: 232 } },
]

// 监听用户信息变化，决定是否显示引导弹窗
watch(() => userStore.userInfo, (newInfo) => {
  if (userStore.token && newInfo && !newInfo.nickname) {
    showGuideDialog.value = true
  } else {
    showGuideDialog.value = false
  }
}, { immediate: true, deep: true })

// 获取图形验证码
const fetchCaptcha = async () => {
  captchaKey.value = Math.random().toString(36).slice(-8)
  try {
    const res = await request.get(`/user/captcha?key=${captchaKey.value}`)
    captchaText.value = res.data.text
  } catch (e) {
    captchaText.value = '5 + 3 = ?'
  }
}

// 点击板块
const handleSectionClick = (section) => {
  if (!userStore.token) {
    targetPath.value = section.path
    loginVisible.value = true
    fetchCaptcha()
  } else {
    // 检查用户是否被封禁
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo)
        if (user.status === '封禁' && section.path !== '/profile') {
          ElMessage.warning('您的账号已被封禁，无法访问该功能')
          return
        }
      } catch (e) {
        console.error('解析用户信息失败', e)
      }
    }
    router.push(section.path)
  }
}

// 跳转注册
const goToRegister = () => {
  router.push('/register')
}

// 跳转管理员
const goToAdmin = () => {
  router.push('/admin/login')
}


// 跳转忘记密码
const goToForgot = () => {
  loginVisible.value = false
  router.push('/forgot-password')
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password || !loginForm.captcha) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    const res = await request.post('/user/login', {
      email: loginForm.email,
      password: loginForm.password,
      captchaKey: captchaKey.value,
      captcha: loginForm.captcha
    })
    
    userStore.setToken(res.data.token)
    userStore.setInfo(res.data.user)
     // 关键修复：把用户信息也存入 localStorage，供其他页面读取
     // 修改：键名改为 'userInfo'，与 user.js 保持一致
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    ElMessage.success('欢迎进入Habittt克拉岛')
    loginVisible.value = false
    
    // 登录成功后跳转到之前点击的板块
    if (targetPath.value) {
      router.push(targetPath.value)
    }
  } catch (e) {
    ElMessage.error('登录失败，请检查信息')
    fetchCaptcha()
    loginForm.captcha = ''
  }
}

const handleLogout = () => {
  userStore.setToken('')
  userStore.setInfo(null)
  ElMessage.success('已退出登录')
  // 退出后刷新页面，重置所有状态
  window.location.reload()
}

// 新增：引导完成后的回调
const handleGuideComplete = async () => {
  showGuideDialog.value = false
  try {
    // 重新获取用户信息，更新 Store 中的头像和昵称
    const res = await request.get('/user/profile')
    userStore.setInfo(res.data)
    ElMessage.success('欢迎来到Habittt克拉岛！')
  } catch (e) {
    console.error("刷新用户信息失败", e)
  }
}

// 页面加载
onMounted(() => {
  fetchCaptcha()
  
  if (route.query.openLogin === 'true') {
    loginVisible.value = true
    if (route.query.email) {
      loginForm.email = route.query.email
    }
    // 清除 URL 中的 query 参数，避免返回时再次触发
    router.replace({ query: {} })
  }
})
</script>

<style scoped>
/* ========== 地图容器 ========== */
.map-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #e8f5e9;
  margin: 0;
  padding: 0;
}

/* 背景图 */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 装饰小路 */
/* 替换后的图片小路 */
.path-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 300px; 
  background-image: url('/images/path-image.png'); 
  background-size: cover; /*覆盖整个宽度 */
  background-repeat: no-repeat;
  background-position: center;
  opacity: 1; /* 透明度 */
  z-index: 1;
  transform: translateY(-50%);
  pointer-events: none; /* 让小路不干扰点击 */
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
  gap: 60px;
  padding: 0 40px;
}

.section-icon img {
  width: 180px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  cursor: pointer;
  transition: all 0.3s ease;
}
.section-icon img:hover {
  transform: scale(1.03);  /* 图片放大效果 */
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
}

/* 起伏效果 */
.pos-0 { transform: translateY(-130px); }
.pos-1 { transform: translateY(140px); }
.pos-2 { transform: translateY(-200px); }
.pos-3 { transform: translateY(90px); }

.pos-0:hover { transform: translateY(-125px) scale(1.05); }
.pos-1:hover { transform: translateY(145px) scale(1.05); }
.pos-2:hover { transform: translateY(-195px) scale(1.05); }
.pos-3:hover { transform: translateY(95px) scale(1.05); }

/* 修改 .clickable-area 为相对定位容器 */
.clickable-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;  /* 添加相对定位，作为绝对定位的基准 */
}

/* 名字默认隐藏 - 改为绝对定位在图片上方 */
.section-name { 
  position: absolute;
  top: 50%;          
  left: 50%;         
  transform: translate(-50%, -50%);  /* 完美居中 */
  margin-top: 0;
  font-size: 20px;
  font-weight: bold;
  color: rgba(247,202,201,0.8);
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  background: rgba(146,168,209,0.6);
  padding: 8px 16px;
  border-radius: 20px;
  white-space: nowrap;  /* 防止文字换行 */
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;  /* 防止阻挡图片点击 */
  z-index: 5;
}

/* 悬停时显示名字 */
.section-card:hover .section-name {
  opacity: 1;
}

/* 左上角按钮容器 */
.top-left-buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.register-btn {
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
  border: none;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

/* 左下角管理按钮容器 */
.bottom-left-admin {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
}

/* 宁静蓝样式 */
.admin-link {
  color: #6a9fb5 !important;  /* 宁静蓝 */
  font-size: 14px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.admin-link:hover {
  color: #8bbdd1 !important;  /* 浅宁静蓝 */
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* ========== 登录弹窗样式 ========== */
.dialog-header h3 {
  text-align: center;
  color: #fff;
  font-size: 22px;
  margin: 0;
}

.login-form {
  margin-top: 15px;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-display {
  flex-shrink: 0;
  width: 120px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s;
}

.captcha-display:hover {
  transform: scale(1.05);
}

.dialog-links {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 15px;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
  border: none;
  font-size: 16px;
  font-weight: bold;
}

.login-btn:hover {
  opacity: 0.9;
}
</style>

<!-- 全局样式 -->
<style>
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

.rose-login-dialog {
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

.rose-login-dialog .el-dialog__header {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  margin: 0;
}

.rose-login-dialog .el-dialog__body {
  padding: 25px 30px;
}

.rose-login-dialog .el-dialog__footer {
  padding: 15px 30px 25px;
}

.rose-login-dialog .el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.rose-login-dialog .el-input__inner {
  color: #333;
}

.rose-login-dialog .el-button--primary.is-link {
  color: #fff !important;
  font-weight: 500;
}

.rose-login-dialog .el-button--primary.is-link:hover {
  color: #f0f0f0 !important;
}
</style>