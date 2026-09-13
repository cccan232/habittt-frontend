<template>
  <div class="profile-container">
    <div class="top-bar">
      <el-button @click="router.back()" circle icon="ArrowLeft" />
      <h2>个人中心</h2>
    </div>

    <!-- 通知按钮 -->
    <div class="profile-header">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
        <el-button circle @click="showNotificationDialog = true">
          <el-icon><Bell /></el-icon>
        </el-button>
      </el-badge>
    </div>

    <!-- 通知弹窗 -->
    <el-dialog v-model="showNotificationDialog" title="通知" width="600px">
      <div class="notification-header">
        <el-button size="small" type="danger" @click="handleClearAllNotifications" :disabled="notifications.length === 0">
          清空所有通知
        </el-button>
      </div>
            <div class="notification-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          class="notification-item"
          :class="{ 'unread': notif.isRead === 0 }"
          @click="handleNotificationClick(notif)"
        >
          <img :src="getImageUrl(notif.applicantAvatar, null) || defaultAvatar" class="notif-avatar" />
          <div class="notif-content">
            <p>{{ notif.content }}</p>
            <div v-if="notif.type === 'team_apply'" class="notif-actions">
              <el-button 
                size="small" 
                type="success" 
                @click.stop="handleNotificationAction(notif.relatedId, 'accept')"
                :disabled="notif.actionTaken === true"
              >
                同意
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click.stop="handleNotificationAction(notif.relatedId, 'reject')"
                :disabled="notif.actionTaken === true"
              >
                拒绝
              </el-button>
            </div>
          </div>
          <div class="notif-delete">
            <el-button 
              size="small" 
              type="info" 
              @click.stop="handleDeleteNotification(notif.id)"
            >
              删除
            </el-button>
          </div>
        </div>
        <div v-if="notifications.length === 0" class="no-notifications">
          <p>暂无通知</p>
        </div>
      </div>

    </el-dialog>

    <div class="content-wrapper">
      <div class="sidebar">
        <div class="menu-item" :class="{ active: currentTab === 'info' }" @click="currentTab = 'info'">个人信息</div>
        <div class="menu-item" :class="{ active: currentTab === 'costume' }" @click="currentTab = 'costume'">装扮衣橱</div>
      </div>

      <div class="main-content">
        <!-- 模块 1: 个人信息 + 上方功能区 -->
<div v-if="currentTab === 'info'" class="info-panel">
  <!-- 顶部：成就展示 + 帮助模块 -->
  <div class="achievement-section">
    <div class="achievement-wrapper">
      <div class="achievement-card">
        <h3 class="section-title">我的成就</h3>
        <div class="achievement-stats">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#92a8d1"><UserFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ achievements.costumeCount }}</div>
              <div class="stat-label">拥有装扮</div>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <el-icon class="stat-icon" color="#f7cac9"><Present /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ achievements.rewardCount }}</div>
              <div class="stat-label">个性化奖励</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 帮助模块 -->
      <div class="help-icon-overlay" @click="showHelpDialog = true">
        <img 
          src="/images/guide-character.png" 
          alt="帮助向导" 
          class="guide-character-img"
        />
      </div>
    </div>
  </div>

  <!-- 下方：个人信息卡片 -->
  <div class="info-card">
  <div class="card-content">
    <div class="avatar-large">
      <img :src="avatarImage" />
    </div>
    <div class="info-list">
      <p><strong>昵称:</strong> {{ userInfo?.nickname || '--' }}</p>
      <p><strong>邮箱:</strong> {{ userInfo?.email || '--' }}</p>
      <p><strong>货币:</strong> {{ userInfo?.points || 0 }}</p>
      <p><strong>状态:</strong> {{ userInfo?.status || '--' }}</p>
      <p v-if="teamName"><strong>队伍:</strong> {{ teamName }}</p>
      <p v-else><strong>队伍:</strong> 暂无队伍</p>
    </div>
  </div>
</div>

</div>

        <!-- 模块 2: 装扮 -->
        <div v-if="currentTab === 'costume'" class="costume-panel">
  <div class="role-tabs">
     <span 
              v-for="role in roleList" 
              :key="role.id" 
              class="role-tab" 
              :class="{ active: selectedRole === role.id }" 
              @click="selectedRole = role.id"
            >
              {{ role.name }}
            </span>
           </div>
  <div class="costume-layout">
    <div class="costume-display">
      <img :src="avatarImage" class="display-img" />
    </div>
    <div class="costume-list">
      <div 
        v-for="item in ownedCostumes" 
        :key="item.id" 
        class="costume-item"
        @click="changeCostume(item.id)"
      >
        <img :src="getImageUrl(item.imageUrl, item.id)" />
        <span>{{ item.sort }}</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <el-dialog v-model="showHelpDialog" title="帮助中心" width="500px">
      <div class="help-dialog-content">
        <el-card shadow="hover" class="help-item-card" @click="showFAQ">
          <div class="help-item">
            <el-icon class="help-icon" color="#409eff"><QuestionFilled /></el-icon>
            <div class="help-text">
              <h4>常见问题解答</h4>
              <p>了解货币、装扮系统等基础问题</p>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="help-item-card" @click="showContact">
          <div class="help-item">
            <el-icon class="help-icon" color="#67c23a"><Service /></el-icon>
            <div class="help-text">
              <h4>客服中心</h4>
              <p>联系开发者(管理员)获取技术支持</p>
            </div>
          </div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 常见问题弹窗 -->
    <el-dialog v-model="showFAQDialog" title="常见问题解答" width="600px">
      <el-collapse accordion>
        <el-collapse-item title="钻石是什么？如何获取？" name="1">
          <div>钻石是克拉大陆的通用货币，可以通过完成任务获得。货币可用于购买装扮和个性化奖励。</div>
        </el-collapse-item>
        <el-collapse-item title="如何更换装扮？" name="2">
          <div>在"装扮衣橱"中点击任意已拥有的装扮即可更换。不同角色类型有不同的装扮。</div>
        </el-collapse-item>
        <el-collapse-item title="如何加入队伍？" name="3">
          <div>在"队伍"页面可以搜索并申请加入现有队伍，或者创建自己的队伍。</div>
        </el-collapse-item>
        <el-collapse-item title="个性化奖励是什么？" name="4">
          <div>个性化奖励是你自己创建的自定义奖励，可以使用"万能卡"获得创建资格。</div>
        </el-collapse-item>
        <el-collapse-item title="发现玩家违规行为怎么处理？" name="5">
          <div>请点击客服中心，向技术人员邮箱发送详细信息，情况属实会封禁该玩家账号。</div>
        </el-collapse-item>
        <el-collapse-item title="发现自己账号被封禁，任何申诉？" name="6">
          <div>请点击客服中心，向技术人员邮箱发送详细信息，管理员根据情况决定是否解封。</div>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>

    <!-- 客服中心弹窗 -->
    <el-dialog v-model="showContactDialog" title="客服中心" width="400px">
      <div class="contact-content">
        <el-icon class="contact-icon" color="#409eff" :size="37"><Message /></el-icon>
        <h3>联系开发者（管理员）</h3>
        <p class="contact-email">3131641975@qq.com</p>
        <p class="contact-tip">如有问题或建议，请发送邮件至以上邮箱.●‿●</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { 
  getUnreadNotificationCount, 
  getNotifications, 
  markNotificationRead,
  handleApplication as handleApplicationApi,
  deleteNotification,
  clearAllNotifications,
  getMyTeam
} from '@/api/team'
import { getRoles } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, UserFilled, Present, QuestionFilled, Service, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = '/default-avatar.png'

const currentTab = ref('info')
const selectedRole = ref(1)
const ownedCostumes = ref([])
const roleList = ref([])

// 成就数据
const achievements = ref({ costumeCount: 0, rewardCount: 0 })

// 通知相关
const showNotificationDialog = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

// 队伍信息
const teamName = ref(null)

// 帮助相关
const showHelpDialog = ref(false)
const showFAQDialog = ref(false)
const showContactDialog = ref(false)

// 使用计算属性直接从 store 获取用户信息
const userInfo = computed(() => userStore.userInfo || {})

const avatarImage = computed(() => {
  const avatar = userInfo.value.avatar
  if (!avatar) return '/images/costumes/role1.png'
  
  // 如果 avatar 是对象（后端返回完整装扮信息）
  if (typeof avatar === 'object' && avatar !== null) {
    if (avatar.imageUrl) {
      // 处理不同来源的图片URL
      if (avatar.imageUrl.startsWith('http://') || avatar.imageUrl.startsWith('https://')) {
        return avatar.imageUrl
      }
      if (avatar.imageUrl.startsWith('/uploads')) {
        return `http://localhost:8080${avatar.imageUrl}`
      }
      return avatar.imageUrl
    }
    return `/images/costumes/${avatar.id}.png`
  }
  
  // 如果 avatar 是数字或字符串 ID
  if (typeof avatar === 'string' && avatar.startsWith('role')) {
    return `/images/costumes/${avatar}.png`
  }
  return `/images/costumes/role${avatar}.png`
})

const fetchProfile = async () => {
  try {
    const res = await request.get('/user/profile')
    console.log('Profile data:', res.data)
    userStore.setInfo(res.data)
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

const fetchAchievements = async () => {
  try {
    const res = await request.get('/user/achievements')
    achievements.value = res.data
  } catch (e) {
    console.error('获取成就数据失败:', e)
  }
}

const fetchRoles = async () => {
  try {
    const res = await getRoles()
    roleList.value = res.data
    console.log('角色列表:', roleList.value)
  } catch (e) {
    console.error('获取角色列表失败:', e)
  }
}

const fetchOwnedCostumes = async (roleId) => {
  try {
    const res = await request.get(`/user/costumes?roleId=${roleId}`)
    ownedCostumes.value = res.data
  } catch (e) {
    console.error('获取装扮列表失败:', e)
  }
}

// 获取装扮图片URL
const getImageUrl = (imageUrl, costumeId) => {
  if (!imageUrl) {
    // 如果没有 imageUrl，返回默认头像或本地路径
    if (costumeId) {
      return `/images/costumes/${costumeId}.png`
    }
    return defaultAvatar
  }
  
  // 如果已经是完整URL（http/https开头），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // 如果是后端上传的图片（以 /uploads 开头），拼接后端地址
  if (imageUrl.startsWith('/uploads')) {
    return `http://localhost:8080${imageUrl}`
  }
  
  // 初始化情况（本地public目录下的图片），直接返回相对路径
  return imageUrl
}

const changeCostume = async (costumeId) => {
  try {
    await request.put('/user/costume', { costumeId })
    await fetchProfile()
  } catch (e) {
    console.error('更换装扮失败:', e)
  }
}

// 获取通知列表
const fetchNotifications = async () => {
  try {
    const res = await getNotifications()
    notifications.value = res.data
    // 计算未读数量（isRead === 0 才是未读）
    unreadCount.value = notifications.value.filter(n => n.isRead === 0).length
  } catch (error) {
    console.error('获取通知失败', error)
  }
}

// 获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadNotificationCount()
    unreadCount.value = res.data
  } catch (error) {
    console.error('获取未读通知数量失败', error)
  }
}

// 获取我的队伍信息
const fetchMyTeam = async () => {
  try {
    const res = await getMyTeam()
    if (res.data) {
      teamName.value = res.data.teamName
    } else {
      teamName.value = null
    }
  } catch (error) {
    console.error('获取队伍信息失败', error)
    teamName.value = null
  }
}

// 标记通知为已读
const handleNotificationClick = async (notif) => {
  if (notif.isRead === 0) {
    try {
      await markNotificationRead(notif.id)
      notif.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
}

// 处理通知中的申请操作（同意/拒绝）
const handleNotificationAction = async (applicationId, action) => {
  try {
    await handleApplicationApi({
      applicationId,
      action
    })
    ElMessage.success(action === 'accept' ? '已同意' : '已拒绝')
    // 重新获取通知和未读数量
    await fetchNotifications()
    await fetchUnreadCount()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除单条通知
const handleDeleteNotification = async (notifId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteNotification(notifId)
    ElMessage.success('删除成功')
    await fetchNotifications()
    await fetchUnreadCount()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 清空所有通知
const handleClearAllNotifications = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有通知吗？此操作不可恢复！', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await clearAllNotifications()
    ElMessage.success('清空成功')
    await fetchNotifications()
    await fetchUnreadCount()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

// 显示常见问题
const showFAQ = () => {
  showHelpDialog.value = false
  showFAQDialog.value = true
}

// 显示客服中心
const showContact = () => {
  showHelpDialog.value = false
  showContactDialog.value = true
}

onMounted(() => {
  fetchProfile()
  fetchAchievements()
  fetchRoles()
  fetchOwnedCostumes(1)
  fetchNotifications()
  fetchUnreadCount()
  fetchMyTeam()
  // 每 30 秒刷新未读通知数量
  setInterval(fetchUnreadCount, 30000)
})

watch(selectedRole, (newRole) => fetchOwnedCostumes(newRole))

</script>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.notification-badge {
  margin-left: auto;
}

.notification-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.notification-list {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.3s;
  align-items: flex-start;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notif-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
}

.notif-delete {
  flex-shrink: 0;
  margin-left: 10px;
}

.no-notifications {
  text-align: center;
  padding: 40px;
  color: #999;
}

.profile-container { display: flex; flex-direction: column; height: 100vh; background: #f5f7fa; }
.top-bar { padding: 20px; background: #fff; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.content-wrapper { display: flex; flex: 1; overflow: hidden; }
.sidebar { width: 200px; background: #fff; padding: 20px; border-right: 1px solid #eee; }
.menu-item { padding: 15px; cursor: pointer; border-radius: 8px; margin-bottom: 10px; transition: background 0.3s; }
.menu-item.active { background: #92a8d1; color: white; }
.main-content { flex: 1; padding: 30px; overflow-y: auto; }

/* 个人信息面板 */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 个人信息区域 */
.info-section {
  width: 100%;
}

/* 个人信息卡片样式 */
.info-card { 
  background: #fff; 
  background-image: url('/public/images/card-bg.png'); 
  background-size: cover;
  background-position: center;
  padding: 25px; 
  border-radius: 12px; 
  text-align: center; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 30px;
  padding-left: 130px;
  /* padding: 30px 40px;  控制整体内容离卡片边缘的距离 */
  justify-content: flex-start;  /* 内容靠左对齐，关键属性 */
}

.avatar-large img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 50%;
  border: 4px solid #f7cac9;
  margin-bottom: 15px;
  background-color: #f0f0f0;
}

.info-list p { font-size: 15px; margin: 8px 0; color: #555;
 text-align: left;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #92a8d1;
  padding-bottom: 8px;
}

/* 成就区域 */
.achievement-section {
  width: 100%;
}

/* 成就卡片容器 - 相对定位 */
.achievement-wrapper {
  position: relative;
  width: 100%;
}

/* 成就卡片样式 */
.achievement-card {
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  color: white;
  position: relative;
  z-index: 1;
}

.achievement-card .section-title {
  color: white;
  border-bottom-color: rgba(255, 255, 255, 0.5);
}

.achievement-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-divider {
  width: 2px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
}

/* 帮助图标覆盖层 - 绝对定位在右侧，略微遮住卡片 */
.help-icon-overlay {
  position: absolute;
  right: -15px;
  top: 110px;  /* 改为固定值，避免上方被遮挡 */
  transform: translateY(-50%);
  z-index: 2;
  cursor: pointer;
  filter: drop-shadow(-2px 4px 8px rgba(0, 0, 0, 0.15));
  transition: all 0.3s ease;
}

.help-icon-overlay:hover {
  transform: translateY(-50%) scale(1.05);
  filter: drop-shadow(-4px 6px 12px rgba(0, 0, 0, 0.2));
}


.guide-character-img {
  width: 100px;
  height: auto;
  display: block;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.guide-character-img:hover {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 6px 12px rgba(146, 168, 209, 0.4));
}


/* 装扮面板样式 */
.role-tabs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
.role-tab { padding: 8px 16px; background: #eee; border-radius: 20px; cursor: pointer; white-space: nowrap; }
.role-tab.active { background: #92a8d1; color: white; }
.display-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
}
/* 装扮面板左右布局 */
.costume-panel {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
}

.role-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.role-tab {
  padding: 8px 16px;
  background: #eee;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
}

.role-tab.active {
  background: #92a8d1;
  color: white;
}

/* 左右布局容器 */
.costume-layout {
  display: flex;
  gap: 30px;
  height: calc(100% - 60px); /* 减去 role-tabs 的高度 */
  min-height: 400px;
}

/* 左侧：当前展示装扮 */
.costume-display {
  flex: 0 0 250px;
  text-align: center;
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.display-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 15px;
}

/* 右侧：拥有的装扮列表 */
.costume-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, 170px);/* 固定宽度 */
  gap: 15px;
  overflow-y: auto;
  max-height: 190px;
  padding-right: 10px;
}

.costume-item {
  text-align: center;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;  
  justify-content: center;  
  width: 170px; /* 固定卡片宽度，与grid列宽一致 */
}

.costume-item img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  display: block;  /* 确保图片是块级元素 */
}

.costume-item span {
  margin-top: 8px;  /* 图片和文字之间的间距 */
}

.costume-item:hover {
  transform: scale(1.05);
  border-color: #92a8d1;
  background: #f5f7fa;
}

/* 帮助弹窗样式 */
.help-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.help-item-card {
  cursor: pointer;
  transition: all 0.3s;
}

.help-item-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.help-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.help-icon {
  font-size: 36px;
}

.help-text h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.help-text p {
  margin: 0;
  color: #999;
  font-size: 13px;
}

/* 客服中心样式 */
.contact-content {
  text-align: center;
  padding: 20px;
}

.contact-icon {
  margin-bottom: 15px;
}

.contact-content h3 {
  margin: 10px 0;
  color: #333;
}

.contact-email {
  font-size: 18px;
  color: #409eff;
  font-weight: 500;
  margin: 15px 0;
}

.contact-tip {
  color: #999;
  font-size: 14px;
}
</style>
