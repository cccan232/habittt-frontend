<template>
  <div class="custom-reward-module">
    <!-- 万能卡 -->
    <div class="universal-card-section">
      <h3>万能卡</h3>
      <div class="universal-card" @click="handlePurchaseUniversalCard">
        <img src="/images/universal-card.png" alt="万能卡" />
        <div class="card-info">
          <p class="card-name">万能卡</p>
          <p class="card-desc">购买后可获得一次自定义奖励资格</p>
          <p class="price-text">
            100💎
          </p>
        </div>
      </div>
    </div>

    <!-- 自定义奖励列表 -->
    <div class="rewards-section">
      <h3>我的自定义奖励</h3>
      <div class="rewards-grid">
        <!-- 空白奖励栏（数量与createQuota一致） -->
        <div
          v-for="index in createQuota"
          :key="'blank-' + index"
          class="reward-card blank-card"
          @click="handleCreateReward"
        >
          <div class="blank-content">
            <el-icon :size="40"><Plus /></el-icon>
            <p>点击创建自定义奖励</p>
          </div>
        </div>

        <!-- 已创建的奖励 -->
        <div
          v-for="reward in rewards"
          :key="reward.rewardId"
          class="reward-card"
          @click="handlePurchaseReward(reward)"
        >
          <img :src="getImageUrl(reward.image) || '/images/default-reward.png'" alt="奖励" />
          <div class="card-info">
            <p class="reward-desc">{{ reward.description }}</p>
            <p class="price-text">
              {{ reward.price }}💎
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建奖励对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建自定义奖励"
      width="500px"
    >
      <el-form :model="rewardForm" label-width="80px">
        <el-form-item label="描述">
          <el-input v-model="rewardForm.description" placeholder="请输入奖励描述" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            action="http://localhost:8080/api/upload/costume"
            name="file"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
          <img v-if="rewardForm.image" :src="getImageUrl(rewardForm.image)" class="preview-image" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="rewardForm.price" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateReward">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const createQuota = ref(0)
const rewards = ref([])
const createDialogVisible = ref(false)
const rewardForm = ref({ description: '', image: '', price: 100 })
const uploadHeaders = { 'Authorization': 'Bearer ' + localStorage.getItem('token') }

const loadData = async () => {
  try {
    const userRes = await request.get('/user/profile')
    createQuota.value = userRes.data.createQuota || 0
    const rewardsRes = await request.get('/reward/list')
    rewards.value = rewardsRes.data
  } catch (error) { ElMessage.error('加载数据失败') }
}

const handlePurchaseUniversalCard = async () => {
  try {
    await ElMessageBox.confirm('确认购买万能卡？', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    const res = await request.post('/reward/universal-card', { price: 100 })
    if (res.data.success) { 
      ElMessage.success('购买成功！')
      // 更新用户货币
      if (res.data.remainingPoints !== undefined) {
        userStore.updatePoints(res.data.remainingPoints)
      }
      await loadData() 
    }
    else { ElMessage.error(res.data.message) }
  } catch (error) { if (error !== 'cancel') ElMessage.error('购买失败') }
}

const handleCreateReward = () => {
  if (createQuota.value <= 0) { ElMessage.warning('没有创建资格，请先购买万能卡'); return }
  createDialogVisible.value = true
}

const handleUploadSuccess = (response) => { 
  if (response.code === 200 && response.data && response.data.url) {
    rewardForm.value.image = response.data.url
  } else {
    ElMessage.error('上传失败')
  }
}

const handleUploadError = (error) => {
  ElMessage.error('图片上传失败，请重试')
  console.error('上传错误:', error)
}

const submitCreateReward = async () => {
  try {
    const res = await request.post('/reward/create', rewardForm.value)
    if (res.data.success) {
      ElMessage.success('创建成功！')
      createDialogVisible.value = false
      rewardForm.value = { description: '', image: '', price: 100 }
      await loadData()
    } else { ElMessage.error(res.data.message) }
  } catch (error) { ElMessage.error('创建失败') }
}

const handlePurchaseReward = async (reward) => {
  try {
    await ElMessageBox.confirm('确认购买该奖励？', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    const res = await request.post(`/reward/purchase/${reward.rewardId}`, {})
    if (res.data.success) { 
      ElMessage.success('恭喜您获得奖励！')
      // 更新用户货币
      if (res.data.remainingPoints !== undefined) {
        userStore.updatePoints(res.data.remainingPoints)
      }
      await loadData() 
    }
    else { ElMessage.error(res.data.message) }
  } catch (error) { if (error !== 'cancel') ElMessage.error('购买失败') }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.custom-reward-module {
  padding: 20px;
}

.universal-card-section {
  margin-bottom: 30px;
}

.universal-card {
  display: flex;
  align-items: center;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  max-width: 400px;
}

.universal-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.universal-card img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-right: 20px;
}

.rewards-section {
  margin-top: 30px;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.reward-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.reward-card:hover {
  border-color: #409eff;
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.blank-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f9f9f9;
  border-style: dashed;
}

.blank-content {
  text-align: center;
  color: #999;
}

.reward-card img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  background: #f9f9f9;
}

.card-info {
  padding: 10px;
  text-align: center;
}

.card-name {
  font-weight: bold;
  font-size: 18px;
  margin: 5px 0;
}

.card-desc {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.reward-desc {
  font-weight: bold;
  margin: 5px 0;
}

.price-text {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-top: 10px;
}
</style>
