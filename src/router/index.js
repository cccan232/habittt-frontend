import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import HomeView from '../views/HomeView.vue'
import TaskView from '../views/Task.vue'
import TeamView from '@/views/TeamView.vue'
import TeamLobbyView from '@/views/TeamLobbyView.vue'
import TeamChallengeView from '@/views/TeamChallengeView.vue' 
import ShopView from '@/views/Shop.vue'
import ProfileView from '@/views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import AdminLogin from '@/views/admin/Login.vue'
import AdminLayout from '@/views/admin/Layout.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import CostumeManagement from '@/views/admin/CostumeManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/tasks', name: 'tasks', component: TaskView },
    { path: '/team', name: 'team', component: TeamView },
    { path: '/team/lobby', name: 'team-lobby', component: TeamLobbyView },
    { path: '/team/challenge', name: 'team-challenge', component: TeamChallengeView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { 
      path: '/admin/login', 
      name: 'admin-login', 
      component: AdminLogin,
      meta: { requiresAdminAuth: false }
    },
    { 
      path: '/admin', 
      component: AdminLayout,
      redirect: '/admin/users',
      children: [
        { path: 'users', component: UserManagement },
        { path: 'costumes', component: CostumeManagement }
      ]
    },
  ],
})

// 全局前置守卫 - 使用新的返回值语法
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  
  // 检查是否是管理员页面
  if (to.path.startsWith('/admin')) {
    // 如果是管理员登录页，直接放行
    if (to.path === '/admin/login') {
      return true
    }
    
    // 其他管理员页面需要验证管理员 token
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      return '/admin/login'
    }
    return true
  }
  
  // 普通页面的权限控制
  if (!token) {
    // 未登录时，只允许访问首页、注册页、忘记密码页
    const publicPaths = ['/', '/register', '/forgot-password']
    if (!publicPaths.includes(to.path)) {
      return '/'
    }
    return true
  }
  
  // 已登录，检查用户状态
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      // 如果用户被禁用，只允许访问个人页面和首页
      if (user.status === '封禁' && to.path !== '/profile' && to.path !== '/') {
        ElMessage.warning('您的账号已被封禁，只能查看个人信息')
        return '/profile'
      }
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }
  
  return true
})

export default router