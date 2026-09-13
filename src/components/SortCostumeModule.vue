<template>
  <div class="sort-costume-module">
    <!-- 风格标签切换 -->
    <div class="sort-tabs">
      <el-tag
        v-for="sort in sorts"
        :key="sort"
        :type="selectedSort === sort ? 'primary' : 'info'"
        class="sort-tag"
        @click="selectSort(sort)"
      >
        {{ sort }}
      </el-tag>
    </div>

    <!-- 核心修改：新增左右布局容器 -->
    <div class="main-container">
      <!-- 装扮展示区域（左侧） -->
      <div class="display-area">
        <div v-if="selectedCostume" class="costume-display">
          <img :src="getImageUrl(selectedCostume.imageUrl)" alt="装扮" class="costume-image" />
          <div class="costume-info">
            <!-- <h3>{{ selectedCostume.name }}</h3> -->
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
            <p class="costume-name">{{ costume.name }}</p>
            <!-- <p class="costume-role">{{ getRoleName(costume.roleId) }}</p> -->
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

const roleNames = {
  1: '崔樱桃',
  2: '兔拉米',
  3: '刷粟米',
  4: '开关锁',
  5: '眈眈',
  6: '狐袋子',
  7: '饭粒',
  8: '帕哩',
  9: 'KimJa',
  10: 'DOA',
  11: '夫小橘',
  12: '哝啵',
  13: '灿獭哩',
  14: '蹦蹦'
}

const sorts = ref([])
const selectedSort = ref('')
const selectedCostume = ref(null)
const costumeList = ref([])

const getRoleName = (roleId) => roleNames[roleId] || '未知角色'

const loadSorts = async () => {
  try {
    const res = await request.get('/costume/sorts')
    sorts.value = res.data
    if (sorts.value.length > 0) { selectedSort.value = sorts.value[0]; await loadCostumes(selectedSort.value) }
  } catch (error) { ElMessage.error('加载风格列表失败') }
}

const selectSort = async (sort) => { selectedSort.value = sort; await loadCostumes(sort) }

const loadCostumes = async (sort) => {
  try {
    const res = await request.get(`/costume/sort/${sort}`)
    costumeList.value = res.data
    selectedCostume.value = null
  } catch (error) { ElMessage.error('加载装扮列表失败') }
}

const selectCostume = (costume) => { selectedCostume.value = costume }

const handlePurchase = async () => {
  if (!selectedCostume.value || selectedCostume.value.owned) return
  try {
    await ElMessageBox.confirm('确认购买该装扮？', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    const costumeId = selectedCostume.value.id
    const res = await request.post('/costume/purchase', { costumeId })
    if (res.data.success) {
      ElMessage.success('购买成功！可以在个人页面查看')
      // 更新用户货币
      if (res.data.remainingPoints !== undefined) {
        userStore.updatePoints(res.data.remainingPoints)
      }
      await loadCostumes(selectedSort.value)
      const updated = costumeList.value.find(c => c.id === costumeId)
      if (updated) selectedCostume.value = updated
    } else { ElMessage.error(res.data.message) }
  } catch (error) { 
    if (error !== 'cancel') ElMessage.error('购买失败') 
  }
}

onMounted(() => { loadSorts() })
</script>

<style scoped>
.sort-costume-module {
  padding: 20px;
}

.sort-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.sort-tag {
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
}

/* 核心新增：左右布局容器（和RoleCostume保持一致） */
.main-container {
  display: flex;
  gap: 20px;
  align-items: flex-start; /* 顶部对齐 */
}

/* 左侧展示区域样式（和RoleCostume保持一致） */
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

/* 右侧列表区域样式（和RoleCostume保持一致） */
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

.costume-name {
  font-weight: bold;
  margin: 5px 0;
  font-size: 14px;
}

.costume-role {
  color: #999;
  font-size: 12px;
  margin: 5px 0;
}
</style>