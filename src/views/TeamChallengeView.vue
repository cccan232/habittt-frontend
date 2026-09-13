<template>
  <div class="challenge-container">
    <!-- 返回按钮 -->
    <div class="top-left">
      <el-button type="primary" @click="goBackToTeam">
        返回
      </el-button>
    </div>

    <!-- 右上角个人信息 -->
    <PersonalHeader v-if="userStore.token" />

    <div class="challenge-content">
      <div v-if="!myTeam" class="no-team">
        <p>你还没有队伍，请先到大厅创建或加入队伍</p>
        <el-button type="primary" @click="goToLobby">前往大厅</el-button>
      </div>
      
      <div v-else class="team-chat-room">
        <div class="chat-header">
          <h2>{{ myTeam.teamName }}</h2>
          <p>当前难度：{{ myTeam?.status === 'confirming' ? '待全员确认' : (myTeam?.level || '-') }}</p>
        </div>
        
        <div class="members-list">
          <el-card 
            v-for="member in myTeam.members" 
            :key="member.userId"
            class="member-card"
            @click="showRemindDialog(member)"
          >
            <img :src="getImageUrl(member.avatar) || defaultAvatar" class="avatar" />
            <span>{{ member.nickname }}</span>
            <el-progress :percentage="member.progress || 0" />
          </el-card>
        </div>
        
        <div class="chat-area" ref="chatAreaRef">
          <div v-for="chat in chatMessages" :key="chat.chatId" class="chat-message">
            <img :src="getImageUrl(chat.senderAvatar) || defaultAvatar" class="chat-avatar" />
            <div class="chat-content">
              <span class="sender-name">{{ chat.senderName }}</span>
              <p>{{ chat.message }}</p>
              <div v-if="chat.messageType === 'system' && chat.message.includes('请确认') && !isCaptain && !hasAccepted" class="challenge-actions">
                <el-button size="small" type="success" @click="handleAcceptChallenge">接受挑战</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
        
        <div v-if="isCaptain" class="challenge-controls">
          <el-button type="warning" @click="showLevelDialog = true">
            选择挑战难度
          </el-button>
        </div>
      </div>
    </div>

    <!-- 选择挑战难度弹窗 -->
    <el-dialog v-model="showLevelDialog" title="选择挑战难度">
      <el-radio-group v-model="selectedLevel">
        <el-radio value="easy">Easy - 每天每人任务完成度>50%，奖励 10 钻石</el-radio>
        <el-radio value="normal">Normal - 每天每人任务完成度>70%，奖励 50 钻石</el-radio>
        <el-radio value="hard">Hard - 每天每人任务完成度>90%，奖励 100 钻石</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="showLevelDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSelectLevel">确认</el-button>
      </template>
    </el-dialog>

    <!-- 提醒队员弹窗 -->
     <el-dialog v-model="showRemindDialogVisible" title="提醒队员">
      <p>是否提醒 {{ currentMember?.nickname }} 完成今日任务？</p>
      <template #footer>
        <el-button @click="showRemindDialogVisible = false">否</el-button>
        <el-button type="primary" @click="handleRemind">是</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getImageUrl } from '@/utils/imageHelper'
import PersonalHeader from '@/components/PersonalHeader.vue'
import { 
  getMyTeam,
  getTeamChat,
  sendChatMessage,
  confirmChallenge,
  selectChallengeLevel,
  remindMember
} from '@/api/team'

const router = useRouter()
const userStore = useUserStore()
const defaultAvatar = '/images/default-avatar.jpg'

const myTeam = ref(null)
const chatMessages = ref([])
const showLevelDialog = ref(false)
const showRemindDialogVisible = ref(false)
const selectedLevel = ref('easy')
const currentMember = ref(null)
const newMessage = ref('')
let refreshTimer = null;
const chatAreaRef = ref(null)

const isCaptain = computed(() => {
  if (!myTeam.value) return false
  let currentUserId = userStore.userInfo?.id || JSON.parse(localStorage.getItem('user') || '{}').id
  return Number(myTeam.value.creatorId) === Number(currentUserId)
})

const hasAccepted = computed(() => {
  const currentUserId = userStore.userInfo?.id || JSON.parse(localStorage.getItem('user') || '{}').id
  return chatMessages.value.some(chat => {
    // 确保类型一致后再比较
    return Number(chat.senderId) === Number(currentUserId) && chat.message.includes('接受')
  })
})

const goBackToTeam = () => {
  router.push('/team')
}

const goToLobby = () => {
  router.push('/team/lobby')
}

const fetchMyTeam = async () => {
  try {
    const res = await getMyTeam()
    myTeam.value = res.data
    // 【修复】确保队伍加载后，立即拉取一次聊天历史
    if (myTeam.value) {
      fetchTeamChat() 
    }
  } catch (error) {
    console.error('获取我的队伍失败')
  }
}

const fetchTeamChat = async () => {
  if (!myTeam.value) return
  try {
    const res = await getTeamChat(myTeam.value.teamId)
    chatMessages.value = res.data
    scrollToBottom()
  } catch (error) {
    console.error('获取聊天消息失败')
  }
}

// 处理 WebSocket 推送的新聊天消息
// 只处理聊天消息，不再处理 progress_update
const handleNewMessage = (event) => {
  const data = event.detail;
  if (!myTeam.value) return;

  // 只有 chat 类型的消息才推送到聊天框
  if (data.type === 'chat' && Number(data.teamId) === Number(myTeam.value.teamId)) {
    chatMessages.value.push({
      chatId: Date.now(),
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      messageType: data.messageType,
      createTime: new Date().toISOString()
    });
    scrollToBottom();
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  try {
    await sendChatMessage({
      teamId: myTeam.value.teamId,
      message: newMessage.value
    })
    newMessage.value = ''
    fetchTeamChat()
  } catch (error) {
    ElMessage.error('发送消息失败')
  }
}

const handleSelectLevel = async () => {
  try {
    await selectChallengeLevel({
      teamId: myTeam.value.teamId,
      level: selectedLevel.value
    })
    ElMessage.success('挑战难度已选择')
    showLevelDialog.value = false
    fetchMyTeam()
    fetchTeamChat()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const handleAcceptChallenge = async () => {
  try {
    await confirmChallenge({ teamId: myTeam.value.teamId })
    ElMessage.success('已接受挑战')
    fetchTeamChat()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const showRemindDialog = (member) => {
  const currentUser = userStore.userInfo || JSON.parse(localStorage.getItem('user') || '{}')
  if (String(member.userId) === String(currentUser.id || currentUser.userId)) {
    ElMessage.warning('不能提醒自己')
    return
  }
  currentMember.value = member
  showRemindDialogVisible.value = true
}

const handleRemind = async () => {
  try {
    await remindMember({
      teamId: myTeam.value.teamId,
      memberId: currentMember.value.userId
    })
    ElMessage.success('提醒已发送')
    showRemindDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
    }
  }, 100)
}

onMounted(() => {
  fetchMyTeam()
  // fetchTeamChat()
  
  // 监听 WebSocket 聊天消息
  window.addEventListener('new-chat-message', handleNewMessage)

  // 启动轮询
  if (refreshTimer) clearInterval(refreshTimer) // 防止重复启动
  refreshTimer = setInterval(() => {
    fetchMyTeam() 
  }, 5000)
})

onUnmounted(() => {
  window.removeEventListener('new-chat-message', handleNewMessage)
})
</script>

<style scoped>
.challenge-container {
  min-height: 100vh;
  padding: 80px 20px 20px 20px;
}

.top-left {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.challenge-content {
  max-width: 1200px;
  margin: 0 auto;
}

.no-team {
  text-align: center;
  padding: 50px;
  color: #999;
}

.team-chat-room {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: calc(100vh - 100px);
  max-height: 800px;
}

.chat-header {
  text-align: center;
}

.members-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  min-width: 200px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
}

.chat-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.chat-area::-webkit-scrollbar {
  width: 6px;
}

.chat-area::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.chat-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: contain;
}

.chat-input {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.challenge-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.challenge-controls {
  text-align: center;
}
</style>