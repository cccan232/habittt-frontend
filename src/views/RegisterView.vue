<template>
  <div class="page-container">
    <div class="header-bg"></div>
    <div class="content-box">
      <img src="/public/images/costumes/role14.png" alt="logo" class="logo-img" />
      <h2>加入Habittt克拉岛</h2>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <div style="display: flex; gap: 10px;">
            <el-input v-model="form.email" placeholder="请输入邮箱" style="flex: 1;" />
            <el-button @click="sendCode" :disabled="countdown > 0" style="white-space: nowrap;">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.code" placeholder="邮箱验证码" maxlength="6" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="handleRegister" :loading="loading">注册</el-button>
        <div style="margin-top: 10px; text-align: right;">
          <el-button link @click="router.push('/login')">去登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const countdown = ref(0)
const loading = ref(false)
const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const sendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('邮箱格式不正确')
    return
  }
  
  try {
    await request.post('/user/send-code', { 
      email: form.email,
      scene: 'register'
    })
    ElMessage.success('验证码已发送，请查收邮件')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '发送失败，请稍后重试')
  }
}

const handleRegister = async () => {
  // 表单验证
  if (!form.email || !form.code || !form.password || !form.confirmPassword) {
    ElMessage.warning('请填写所有字段')
    return
  }
  
  // 邮箱格式验证
  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('邮箱格式不正确')
    return
  }
  
  // 验证码格式验证
  if (!/^\d{6}$/.test(form.code)) {
    ElMessage.warning('请输入6位数字验证码')
    return
  }
  
  // 密码一致性验证
  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  
  // 密码长度验证
  if (form.password.length < 6) {
    ElMessage.warning('密码长度至少6位')
    return
  }
  
  loading.value = true
  try {
    await request.post('/user/register', {
      email: form.email,
      password: form.password,
      code: form.code
    })
    ElMessage.success('注册成功，即将跳转登录')
    
    // 跳转到首页，并通过 query 参数告知需要打开登录弹窗
    setTimeout(() => {
      router.push({ path: '/', query: { openLogin: 'true', email: form.email } })
    }, 1000)
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '注册失败，请检查验证码是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.header-bg {
  height: 150px;
  background: linear-gradient(to right, #f7cac9, #92a8d1);
  width: 100%;
  flex-shrink: 0;
}
.content-box {
  flex: 1;
  background: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: -50px auto 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  box-sizing: border-box;
}

.logo-img {
  display: block;
  width: 100px;        
  height: 100px;     
  margin: -30px auto 10px;  /* 上负边距让图片往上，auto实现居中，下边距控制与标题距离 */
  object-fit: contain;
}

.content-box h2 {
  text-align: center;
  margin-top: 0;      /* 如果图片有边距，这里可以设为0 */
  margin-bottom: 30px;
}
</style>

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
</style>