<template>
  <div class="lobby-container">
    <!-- 返回按钮 -->
    <div class="top-left">
      <el-button type="primary" @click="goBackToTeam">
        返回
      </el-button>
    </div>

    <!-- 右上角个人信息 -->
    <PersonalHeader v-if="userStore.token" />

    <div class="lobby-content">
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          创建队伍
        </el-button>
      </div>
      
      <div class="team-list">
        <el-card 
          v-for="team in teamList" 
          :key="team.teamId" 
          class="team-card"
          @click="showTeamDetail(team.teamId)"
        >
          <div class="team-info">
            <h3>{{ team.teamName }}</h3>
            <p>人数：{{ team.memberCount }}/5</p>
            <p>队长：{{ team.creatorName }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 创建队伍弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建队伍">
      <el-form :model="createForm">
        <el-form-item label="队伍名称">
          <el-input v-model="createForm.teamName" />
        </el-form-item>
        <el-form-item label="队伍介绍">
          <el-input v-model="createForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTeam">确认</el-button>
      </template>
    </el-dialog>

    <!-- 队伍详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="队伍详情">
      <div v-if="currentTeam">
        <h3>{{ currentTeam.teamName }}</h3>
        <p>介绍：{{ currentTeam.description }}</p>
        <p>队长：{{ currentTeam.creatorName }}</p>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="showApplyDialog = true">申请加入</el-button>
      </template>
    </el-dialog>

    <!-- 申请加入弹窗 -->
    <el-dialog v-model="showApplyDialog" title="申请加入">
      <el-input v-model="applyMessage" type="textarea" placeholder="输入申请信息..." />
      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleApply">确认申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import PersonalHeader from '@/components/PersonalHeader.vue'
import { getTeamLobby, createTeam, getTeamDetail, applyTeam } from '@/api/team'

const router = useRouter()
const userStore = useUserStore()

const teamList = ref([])
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showApplyDialog = ref(false)
const createForm = ref({ teamName: '', description: '' })
const currentTeam = ref(null)
const currentTeamId = ref(null)
const applyMessage = ref('')

const goBackToTeam = () => {
  router.push('/team')
}

const fetchTeamLobby = async () => {
  try {
    const res = await getTeamLobby()
    teamList.value = res.data
  } catch (error) {
    ElMessage.error('获取队伍列表失败')
  }
}

const handleCreateTeam = async () => {
  try {
    await createTeam(createForm.value)
    ElMessage.success('队伍创建成功')
    showCreateDialog.value = false
    fetchTeamLobby()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const showTeamDetail = async (teamId) => {
  try {
    const res = await getTeamDetail(teamId)
    currentTeam.value = res.data
    currentTeamId.value = teamId
    showDetailDialog.value = true
  } catch (error) {
    ElMessage.error('获取队伍详情失败')
  }
}

const handleApply = async () => {
  try {
    await applyTeam({
      teamId: currentTeamId.value,
      message: applyMessage.value
    })
    ElMessage.success('申请已发送')
    showApplyDialog.value = false
    applyMessage.value = ''
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(() => {
  fetchTeamLobby()
})
</script>

<style scoped>
.lobby-container {
  min-height: 100vh;
  padding: 80px 20px 20px 20px;
}

.top-left {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.lobby-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-actions {
  margin-bottom: 20px;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.team-card {
  cursor: pointer;
  transition: all 0.3s;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.team-info h3 {
  margin: 0 0 10px 0;
}

.team-info p {
  margin: 5px 0;
  color: #666;
}
</style>