<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>

      <el-table :data="users" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="points" label="积分" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="showResetDialog(row)">
              重置密码
            </el-button>
            <el-button 
              :type="row.status === '正常' ? 'danger' : 'success'" 
              size="small" 
              @click="toggleBan(row)"
            >
              {{ row.status === '正常' ? '封禁' : '解封' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetDialogVisible" title="重置密码" width="400px">
      <el-form :model="resetForm" label-width="80px">
        <el-form-item label="新密码">
          <el-input v-model="resetForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllUsers, resetUserPassword, banUser } from '@/api/admin'

const users = ref([])
const resetDialogVisible = ref(false)
const resetForm = ref({
  userId: null,
  newPassword: ''
})

const fetchUsers = async () => {
  try {
    const res = await getAllUsers()
    users.value = res.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const showResetDialog = (user) => {
  resetForm.value.userId = user.id
  resetForm.value.newPassword = ''
  resetDialogVisible.value = true
}

const handleResetPassword = async () => {
  if (!resetForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }

  try {
    await resetUserPassword(resetForm.value.userId, resetForm.value.newPassword)
    ElMessage.success('密码重置成功')
    resetDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const toggleBan = async (user) => {
  const newStatus = user.status === '正常' ? '封禁' : '正常'
  const action = user.status === '正常' ? '封禁' : '解封'

  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await banUser(user.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>