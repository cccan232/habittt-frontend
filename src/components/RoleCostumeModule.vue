<template>
  <div class="role-costume-module">
    <!-- 角色标签切换 -->
    <div class="role-tabs">
      <el-tag
        v-for="role in roles"
        :key="role.id"
        :type="selectedRole === role.id ? 'primary' : 'info'"
        class="role-tag"
        @click="selectRole(role.id)"
      >
        {{ role.name }}
      </el-tag>
    </div>

    <!-- 核心修改：新增左右布局容器 -->
    <div class="main-container">
      <!-- 装扮展示区域（左侧） -->
      <div class="display-area">
        <div v-if="selectedCostume" class="costume-display">
          <img :src="getImageUrl(selectedCostume.imageUrl)" alt="装扮" class="costume-image" />
          <div class="costume-info">
            <el-button
              type="primary"
              :disabled="selectedCostume.owned"
              @click="handlePurchase"
            >
              {{ selectedCostume.owned ? '已拥有' : '购买' }}
            </el-button>
          </div>
        </div>
        <div v-else class="empty-display">
          <p>请点击右侧装扮查看详情</p>
        </div>
      </div>

      <!-- 装扮列表区域（右侧） -->
      <div class="costume-list">
        <div
          v-for="costume in costumeList"
          :key="costume.id"
          class="costume-card"
          :class="{ active: selectedCostume?.id === costume.id }"
          @click="selectCostume(costume)"
        >
          <img :src="getImageUrl(costume.imageUrl)" alt="装扮" />
          <div class="card-info">
            <!-- <p class="costume-name">{{ costume.name }}</p> -->
            <p class="costume-sort">{{ costume.sort }}</p>
            <p v-if="costume.owned" class="owned-text">已拥有</p>
            <p v-else class="price-text">
              {{ costume.price }}💎
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/imageHelper'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const roles = ref([
  { id: 1, name: '崔樱桃' },
  { id: 2, name: '兔拉米' },
  { id: 3, name: '刷粟米' },
  { id: 4, name: '开关锁' },
  { id: 5, name: '眈眈' },
  { id: 6, name: '狐袋子' },
  { id: 7, name: '饭粒' },
  { id: 8, name: '帕哩' },
  { id: 9, name: 'KimJa' },
  { id: 10, name: 'DOA' },
  { id: 11, name: '夫小橘' },
  { id: 12, name: '哝啵' },
  { id: 13, name: '灿獭哩' },
  { id: 14, name: '蹦蹦' }
])

const selectedRole = ref(1)
const selectedCostume = ref(null)
const costumeList = ref([])

const selectRole = async (roleId) => {
  selectedRole.value = roleId
  await loadCostumes(roleId)
}

const loadCostumes = async (roleId) => {
  try {
    const res = await request.get(`/costume/role/${roleId}`)
    costumeList.value = res.data
  } catch (error) {
    ElMessage.error('加载装扮列表失败')
  }
}

const selectCostume = (costume) => {
  selectedCostume.value = costume
}

const handlePurchase = async () => {
  if (!selectedCostume.value || selectedCostume.value.owned) return
  try {
    await ElMessageBox.confirm('确认购买该装扮？', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    const res = await request.post('/costume/purchase', { costumeId: selectedCostume.value.id })
    if (res.data.success) {
      ElMessage.success('购买成功！可以在个人页面查看')
      // 更新用户货币
      if (res.data.remainingPoints !== undefined) {
        userStore.updatePoints(res.data.remainingPoints)
      }
      await loadCostumes(selectedRole.value)
      const updated = costumeList.value.find(c => c.id === selectedCostume.value.id)
      if (updated) selectedCostume.value = updated
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('购买失败')
  }
}

onMounted(() => { loadCostumes(selectedRole.value) })
</script>

<style scoped>
.role-costume-module {
  padding: 20px;
}

.role-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.role-tag {
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
}

/* 核心新增：左右布局容器 */
.main-container {
  display: flex;
  gap: 20px;
  align-items: flex-start; /* 顶部对齐 */
}

/* 左侧展示区域样式调整 */
.display-area {
  width: 380px;    
  height: 600px;  
  background: #f9f9f9;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 不让宽度被挤压变形 */
}

.costume-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.costume-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
  margin-bottom: 20px;
}

.costume-info h3 {
  margin: 10px 0;
  font-size: 24px;
}

.costume-info p {
  margin: 5px 0;
  font-size: 16px;
  color: #666;
}

.owned-text {
  color: #67c23a;
  font-weight: bold;
}

.price-text {
  color: #e6a23c;
  font-weight: bold;
  font-size: 18px;
}

.empty-display {
  color: #999;
  font-size: 18px;
}

/* 右侧列表区域样式调整 */
.costume-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 15px;
  height: 600px;     
  overflow-y: auto; 
  padding: 10px;
}

.costume-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  height: 250px;
  transition: all 0.3s;
}

.costume-card:hover {
  border-color: #409eff;
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.costume-card.active {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.costume-card img {
  width: 100%;
  height: 160px;
  object-fit: contain;
  background: #f9f9f9;
}

.card-info {
  padding: 3px;
  text-align: center;
}

/* .costume-name {
  font-weight: bold;
  margin: 5px 0;
  font-size: 14px;
} */

.costume-sort {
  font-weight: bold;
  margin: 5px 0;
  font-size: 14px;
}
</style>