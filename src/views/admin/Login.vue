<template>
  <div class="admin-login-container">
    <el-card class="login-card">
      <h2>管理系统</h2>
      <el-form :model="form" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button link type="info" @click="goBack">返回主页</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin } from '@/api/admin'

const router = useRouter()
const loginFormRef = ref(null)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await adminLogin(form)
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('adminInfo', JSON.stringify(res.data.admin))
      ElMessage.success('登录成功')
      router.push('/admin/users')
    } catch (error) {
      ElMessage.error('登录失败：' + error.message)
    }
  })
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
