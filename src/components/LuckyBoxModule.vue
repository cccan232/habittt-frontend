<template>
  <div class="lucky-box-module">
    <!-- 箱子展示 -->
    <div class="box-container">
      <img
        :src="luckyBoxImage"
        alt="幸运箱"
        class="lucky-box"
        @click="handleShowProbabilities"
      />
    </div>

    <!-- 抽奖结果展示 -->
    <div v-if="drawResult" class="draw-result" :class="{ 'dimmed': isDimmed }">
      <div v-if="drawType === 'single'" class="single-result">
        <img :src="getImageUrl(drawResult.imageUrl)" alt="抽奖结果" />
        <h3>{{ drawResult.name }}</h3>
      </div>
      <div v-else class="multi-result">
        <div class="result-row top-row">
          <div v-for="(item, index) in drawResult.slice(0, 2)" :key="index" class="result-item">
            <img :src="getImageUrl(item.imageUrl)" alt="结果" />
            <p>{{ item.name }}</p>
          </div>
        </div>
        <div class="result-row bottom-row">
          <div v-for="(item, index) in drawResult.slice(2)" :key="index" class="result-item">
            <img :src="getImageUrl(item.imageUrl)" alt="结果" />
            <p>{{ item.name }}</p>
          </div>
        </div>
      </div>
    </div>

<!-- 抽奖按钮 -->
  <div class="draw-buttons">
  <el-button class="single-draw-btn" size="large" @click="handleDraw('single')">
    ×1 (💎100)
  </el-button>
  <el-button class="multi-draw-btn" size="large" @click="handleDraw('multiple')">
    ×5 (💎450)
  </el-button>
</div>

    <!-- 概率展示对话框 -->
    <el-dialog
      v-model="probabilityDialogVisible"
      title="获奖概率"
      width="600px"
    >
      <div class="probability-list">
        <div v-for="(prob, sort) in probabilities" :key="sort" class="probability-item">
          <span>{{ sort }}风格</span>
          <span class="probability-value">{{ prob }}%</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getImageUrl } from '@/utils/imageHelper'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const luckyBoxImage = ref('/images/lucky-box1.png')
const drawResult = ref(null)
const drawType = ref('')
const isDimmed = ref(false)
const probabilityDialogVisible = ref(false)

const probabilities = ref({
  '普通': 70,
  'Night': 30
  // 其他风格的概率将在后期添加
})

// 显示概率
const handleShowProbabilities = () => {
  probabilityDialogVisible.value = true
}

// 抽奖逻辑
const handleDraw = async (type) => {
  const count = type === 'single' ? 1 : 5
  const price = type === 'single' ? 100 : 450

  try {
    await ElMessageBox.confirm(`确认花费 ${price}💎进行${type === 'single' ? '一' : '五'}抽？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 使用 request 实例，自动携带 Token，路径自动拼接 baseURL
    const res = await request.post('/costume/draw', { count })

    //request 拦截器已剥离一层 data，直接访问 res.data
    if (res.data.success) {
      drawResult.value = res.data.result
      drawType.value = type
      isDimmed.value = true
      ElMessage.success('抽奖成功！可以在个人页面查看')
      // 更新用户货币
      if (res.data.remainingPoints !== undefined) {
        userStore.updatePoints(res.data.remainingPoints)
      }
      setTimeout(() => {
        isDimmed.value = false
        drawResult.value = null
      }, 3000)
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('请求失败')
    }
  }
}

onMounted(() => {
  // 页面初始化逻辑
})
</script>


<style scoped>
.lucky-box-module {
  padding: 20px;
  text-align: center;
}

.box-container {
  margin: 40px 0;
}

.lucky-box {
  width: 200px;
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s;
}

.lucky-box:hover {
  transform: scale(1.1);
}

.draw-result {
  margin: 40px 0;
  transition: all 0.3s;
}

.draw-result.dimmed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.single-result {
  text-align: center;
}

.single-result img {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

.multi-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-row {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.result-item {
  text-align: center;
}

.result-item img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
}

.draw-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

.probability-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.probability-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.probability-value {
  color: #e6a23c;
  font-weight: bold;
}

/* 1按钮 */
.draw-buttons .single-draw-btn {
  background-color: #f7cac9 !important;
  border-color: #f7cac9 !important;
  color: #fff;
}

.draw-buttons .single-draw-btn:hover {
  background-color: #ffbcba !important;
  border-color: #ffbcba !important;
}

/* 5按钮 */
.draw-buttons .multi-draw-btn {
  background-color: #92a8d1 !important;
  border-color: #92a8d1 !important;
  color: #fff !important;
}

.draw-buttons .multi-draw-btn:hover {
  background-color: #7793c6 !important;
  border-color: #7793c6 !important;
}
</style>
