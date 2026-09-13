<template>
  <div class="task-page-wrapper">
    <PersonalHeader v-if="userStore.token" />
    <div class="task-page">      
      <div class="page-header">
  <div class="header-left">
    <el-button class="back-home-btn" @click="goBackToHome">
      <img src="/images/home-icon.svg" alt="返回首页" class="home-icon" />
      <span class="back-text">返回首页</span>
    </el-button>
    <el-button class="add-task-btn" @click="showAddDialog">
      <img src="/images/addtask-icon.png" alt="添加任务" class="add-icon" />
      <span class="add-text">添加任务</span>
    </el-button>
  </div>
</div>

      <!-- 任务列表 -->
      <div class="task-list">

        <div
          v-for="task in paginatedTasks"
          :key="task.taskId"
          class="task-card"
          :class="getTaskCardClass(task)"
        >
          <div class="task-header">
  <div class="task-status-group">
    <span class="task-level" :class="task.level">{{ getLevelText(task.level) }}</span>
  </div>
</div>
          <div class="task-description">{{ task.description }}</div>
          <div class="task-reward">
            完成奖励：💎{{ getReward(task.level) }}
          </div>
<div class="task-actions">
  <el-button
    v-if="task.status === '未完成'"
    class="complete-btn"
    size="small"
    @click="handleComplete(task)"
  >
    完成任务
  </el-button>
  <el-button
    v-else
    class="completed-btn"
    size="small"
    disabled
  >
    已完成
  </el-button>
  <el-button
    class="delete-btn"
    size="small"
    @click="handleDelete(task)"
  >
    删除任务
  </el-button>
</div>
        </div>
      </div>
    </div>

    <!-- 分页组件 - 固定在左侧 -->
<div class="pagination-sidebar">
  <!-- 自定义上下翻页 -->
  <div class="custom-pagination">
    <div class="pagination-btn prev" :class="{ disabled: currentPage <= 1 }" @click="prevPage">
      <img src="/images/prev-icon.png" alt="上一页" class="pagination-icon" />
    </div>
    <div class="pagination-btn next" :class="{ disabled: currentPage >= totalPages }" @click="nextPage">
      <img src="/images/next-icon.png" alt="下一页" class="pagination-icon" />
    </div>
  </div>
</div>

    <!-- 添加任务对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加新任务"
      width="500px"
    >
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="任务描述">
          <el-input
            v-model="addForm.description"
            placeholder="请输入任务描述"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="任务难度">
          <el-select v-model="addForm.level" placeholder="请选择难度">
            <el-option label="简单 (Easy) - 奖励 1💎" value="easy" />
            <el-option label="普通 (Normal) - 奖励 5💎" value="normal" />
            <el-option label="困难 (Hard) - 奖励 10💎" value="hard" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddTask">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import request from '@/utils/request' //  引入封装的请求工具
import { ArrowLeft } from '@element-plus/icons-vue'
import PersonalHeader from '@/components/PersonalHeader.vue'

const currentPage = ref(1)
const pageSize = ref(6)
const userStore = useUserStore()
const router = useRouter() 
const tasks = ref([])
const addDialogVisible = ref(false)
const addForm = ref({
  description: '',
  level: ''
})

// 定时器引用
let refreshTimer = null

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tasks.value.slice(start, end)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const getLevelText = (level) => {
  const map = { easy: '简单', normal: '普通', hard: '困难' }
  return map[level] || level
}

const getReward = (level) => {
  const map = { easy: 1, normal: 5, hard: 10 }
  return map[level] || 0
}

const getTaskCardClass = (task) => {
  if (task.status === '已完成') return 'task-completed'
  return task.level === 'hard' ? 'card-gradient-rose' : 'card-gradient-blue'
}

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(tasks.value.length / pageSize.value)
})

// 上一页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    handleCurrentChange(currentPage.value)
  }
}

// 下一页方法
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    handleCurrentChange(currentPage.value)
  }
}

// 加载任务列表
const loadTasks = async () => {
  try {
    const res = await request.get('/task/list')
    // request 拦截器已剥离外层，res.data 即为后端返回的 data 字段
    tasks.value = res.data || []
    currentPage.value = 1
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  }
}

const showAddDialog = () => {
  addForm.value = { description: '', level: '' }
  addDialogVisible.value = true
}

// 添加任务
const handleAddTask = async () => {
  if (!addForm.value.description || !addForm.value.level) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    await request.post('/task/add', addForm.value)
    ElMessage.success('任务添加成功')
    addDialogVisible.value = false
    loadTasks()
  } catch (error) {
    ElMessage.error('添加任务失败')
  }
}

// 完成任务
const handleComplete = async (task) => {
  // 防止重复点击：如果已经是已完成状态，直接返回
  if (task.status === '已完成') {
    ElMessage.warning('该任务已完成')
    return
  }
  
  try {
    const res = await request.put(`/task/complete/${task.taskId}`)
    ElMessage.success(`任务完成！获得 ${res.data.reward}💎`)
    
    // 立即更新本地任务状态，让按钮马上变灰
    task.status = '已完成'
    
    // 延迟一点再刷新列表，确保用户体验流畅
    setTimeout(async () => {
      await Promise.all([
        loadTasks(),
        request.get('/user/profile').then(profileRes => {
          userStore.setInfo(profileRes.data)
        })
      ])
    }, 300)
  } catch (error) {
    ElMessage.error(error.message || '完成任务失败')
  }
}

// 删除任务
const handleDelete = (task) => {
  ElMessageBox.confirm(
    `确定要删除任务"${task.description}"吗？`,
    '确认删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await request.delete(`/task/${task.taskId}`)
      ElMessage.success('任务已删除')
      loadTasks()
    } catch (error) {
      ElMessage.error('删除任务失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadTasks()  
  // 每 60 秒自动刷新一次任务列表（检测定时任务是否重置了任务）
  refreshTimer = setInterval(() => {
    console.log('定时检查任务状态更新')
    loadTasks()
  }, 60000) // 60 秒
})

// 页面激活时也刷新（从其他页面返回时）
onActivated(() => {
  console.log('页面激活，刷新任务列表')
  loadTasks()
})

// 组件卸载时清除定时器，避免内存泄漏
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    console.log('清除定时刷新定时器')
  }
})

const goBackToHome = () => {
  router.push('/')
}
</script>


<style scoped>
.task-page-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

.task-page {
  min-height: 100vh;
  width: 100vw;
  background-image: url('/images/bgtask.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  padding: 40px 60px;
  box-sizing: border-box;
}

.task-page {
  min-height: 100vh;
  width: 100vw;
  background-image: url('/images/bgtask1.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  padding: 40px 60px;
  box-sizing: border-box;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff8e1;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-header {
  display: flex;
  justify-content: flex-start;  /* 改为左对齐 */
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0px;
}

.back-home-btn {
  background: transparent !important;
  border: none !important;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 32px 32px !important;  /* 增大内边距 */
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.back-text {
  font-size: 17px;
  color: #8197c2;
  display: none;  /* 默认隐藏文字 */
}

/* 悬停时显示文字 */
.back-home-btn:hover .back-text {
  display: inline;
}

.back-home-btn:hover {
  background: transparent !important;  /* 去除背景色变化 */
  border: none !important;
}

.back-home-btn:hover .home-icon {
  transform: scale(1.1);  /* 图标放大10% */
}

.home-icon {
  width: 89px !important;
  height: 70px !important;
  transition: transform 0.2s ease;  /* 平滑过渡动画 */
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin: 10;
  flex: 1;
  text-align: center;
}

/* 添加任务按钮样式 */
.add-task-btn {
  background: transparent !important;
  border: none !important;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-icon {
  width: 73px;
  height: 73px;
}

.add-text {
  font-size: 17px;
  color: #8197c2;
  display: none;  /* 默认隐藏文字 */
}

/* 悬停时显示文字 */
.add-task-btn:hover .add-text {
  display: inline;
}

.add-task-btn:hover .add-icon {
  transform: scale(1.1);
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.task-card {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
}

.card-gradient-blue {
  background: linear-gradient(135deg, #a4c2f9 0%, white 100%);
}

.card-gradient-rose {
  background: linear-gradient(135deg, #ffc8c7 0%, white 100%);
}

.task-completed {
  background: linear-gradient(135deg, #eeeeee 0%, white 100%);
  opacity: 0.8;
  filter: grayscale(30%);
}

.task-completed .task-description {
  text-decoration: line-through;
  color: #999;
}

.task-header {
  display: flex;
  justify-content: flex-start; /* 左对齐 */
  margin-bottom: 20px;
}

.task-status-group {
  display: flex;
  align-items: flex-end;
  gap: 13px;
}

.task-level {
  font-size: 14px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
}

.task-level.easy { background: #76ca79; }
.task-level.normal { background: #54b2ff; }
.task-level.hard { background: #ff7d74; }

/* .task-status {
  font-size: 14px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
}

.task-status.未完成 { 
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%); 
  color: white; }
.task-status.已完成 { 
  background: linear-gradient(135deg, #92a8d1 0%, #f7cac9 100%);
  color: white; } */

.task-description {
  font-size: 16px;
  color: #333;
  margin: 12px 0;
  line-height: 1.5;
}

.task-reward {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.task-actions .el-button {
  flex: 1;
}

.complete-btn {
  background-color: #76ca79 !important;
  color: white !important;
}

.completed-btn {
  background-color: #909399 !important;
  color: white !important;
}

.delete-btn {
  background-color: #ff7d74 !important;
  color: white !important;
}

.complete-btn:hover {
  background-color: #4ac44e !important;
  border-color: #76ca79 !important;
}

.delete-btn:hover {
  background-color: #ff7d74 !important;
  border-color: #ff7d74 !important;
}

/* 分页组件固定在左侧 */
.pagination-sidebar {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.custom-pagination {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-btn:hover:not(.disabled) {
  background-color: #409eff;
  transform: scale(1.05);
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-icon {
  width: 20px;
  height: 20px;
}

.home-icon {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  vertical-align: middle;
}

.back-home-btn {
  display: flex;
  align-items: center;
}
</style>
