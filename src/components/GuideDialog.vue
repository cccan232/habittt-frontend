<template>
  <div class="guide-mask">
    <div class="guide-container">
      <!-- 左侧角色图片 - 放在对话框外面 -->
      <div class="guide-character-outer">
        <img src="/images/guide-character.png" class="guide-char-outer" />
      </div>

      <!-- 对话框内容 -->
      <div class="guide-box">
        <div v-if="step === 1" class="step-nickname">
          <div class="bubble">欢迎加入Habittt克拉岛，希望怎么称呼你？</div>
          <el-input v-model="nickname" placeholder="请输入昵称" size="large" @keyup.enter="fetchNormalCostumes" />
          <el-button type="primary" @click="fetchNormalCostumes" style="margin-top: 20px;">下一步</el-button>
        </div>

        <div v-if="step === 2" class="step-avatar">
          <div class="bubble">请选择你的初始形象</div>
          <div class="avatar-selector">
            <button @click="prevAvatar" :disabled="currentAvatarIndex <= 0"> ❮ </button>
            <img 
              v-if="normalCostumes.length > 0" 
              :src="getCurrentAvatarImage()" 
              class="preview-avatar" 
            />
            <button @click="nextAvatar" :disabled="currentAvatarIndex >= normalCostumes.length - 1"> ❯ </button>
          </div>
          <div class="avatar-name" v-if="normalCostumes[currentAvatarIndex]">
            {{ normalCostumes[currentAvatarIndex].name }}
          </div>
          <el-button type="primary" @click="submitInit" style="margin-top: 20px;" :disabled="normalCostumes.length === 0">
            start！
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const step = ref(1)
const nickname = ref('')
const currentAvatarIndex = ref(0)
const normalCostumes = ref([])

const emit = defineEmits(['complete'])

// 获取"普通"风格的装扮列表
const fetchNormalCostumes = async () => {
  if (!nickname.value.trim()) {
    ElMessage.warning('请先输入昵称')
    return
  }
  
  try {
    const res = await request.get('/user/normal-costumes')
    normalCostumes.value = res.data || []
    if (normalCostumes.value.length === 0) {
      ElMessage.warning('暂无可用的初始装扮')
      return
    }
    step.value = 2
  } catch (e) {
    ElMessage.error('获取装扮列表失败')
  }
}

// 获取当前选中的装扮图片
const getCurrentAvatarImage = () => {
  const costume = normalCostumes.value[currentAvatarIndex.value]
  if (!costume) return ''
  
  // 如果后端返回了 imageUrl，直接使用
  if (costume.imageUrl) {
    return costume.imageUrl
  }
  
  // 否则使用默认路径规则
  return `/images/costumes/${costume.id}.png`
}

// 获取当前选中的装扮 ID
const getCurrentAvatarId = () => {
  const costume = normalCostumes.value[currentAvatarIndex.value]
  return costume ? costume.id : null
}

const nextAvatar = () => {
  if (currentAvatarIndex.value < normalCostumes.value.length - 1) {
    currentAvatarIndex.value++
  }
}

const prevAvatar = () => {
  if (currentAvatarIndex.value > 0) {
    currentAvatarIndex.value--
  }
}

const submitInit = async () => {
  const avatarId = getCurrentAvatarId()
  if (!avatarId) {
    ElMessage.warning('请选择你的初始形象')
    return
  }
  
  try {
    await request.post('/user/init', {
      nickname: nickname.value,
      avatarId: avatarId.toString()
    })
    ElMessage.success('初始化成功')
    // 先 emit 让父组件刷新用户信息，再关闭弹窗
    emit('complete')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '初始化失败')
  }
}
</script>

<style scoped>
/* 遮罩层 */
.guide-mask { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.6); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 9999; 
}

/* 整体容器 - 使用 flex 布局让图片和对话框并排 */
.guide-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 左侧角色图片容器 - 在对话框外部 */
.guide-character-outer {
  position: relative;
  z-index: 10002;
  margin-right: -30px; /* 负边距让图片向右移动，遮住对话框左侧 */
  animation: bounce 2s ease-in-out infinite;
}

/* 外部角色图片样式 */
.guide-char-outer {
  width: 120px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
}

/* 对话框容器 */
.guide-box {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  width: 420px;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10001;
  transition: all 0.3s ease;
}

/* 隐藏原来对话框内部的角色图片 */
.guide-char {
  display: none;
}

.step-nickname {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bubble {
  background: linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%);
  padding: 15px 20px;
  border-radius: 20px;
  margin-bottom: 25px;
  position: relative;
  color: white;
  font-weight: 500;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar-selector { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 20px; 
  margin: 20px 0; 
}

.avatar-selector button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #92a8d1;
  background: white;
  color: #92a8d1;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-selector button:hover:not(:disabled) {
  background: linear-gradient(135deg, #f7cac9, #92a8d1);
  color: white;
  border-color: transparent;
}

.avatar-selector button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.preview-avatar {
  width: 150px;
  height: 150px;
  object-fit: contain;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar-name {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #f7cac9, #92a8d1);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin: 10px 0 20px 0;
  min-height: 24px;
}

/* Element Plus 按钮样式优化 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #f7cac9, #92a8d1);
  border: none;
  font-weight: 500;
  padding: 10px 28px;
  border-radius: 24px;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #92a8d1, #f7cac9);
  transform: translateY(-2px);
}

:deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(146, 168, 209, 0.15);
  border-radius: 12px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 2px 12px rgba(146, 168, 209, 0.3);
}

/* 响应式调整 */
@media (max-width: 600px) {
  .guide-character-outer {
    margin-right: -20px;
  }
  
  .guide-char-outer {
    width: 80px;
  }
  
  .guide-box {
    width: 320px;
    padding: 25px;
  }
  
  .preview-avatar {
    width: 110px;
    height: 110px;
  }
  
  .bubble {
    font-size: 14px;
    padding: 12px 16px;
  }
}
</style>