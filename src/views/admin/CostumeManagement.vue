<template>
  <div class="costume-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加新装扮</span>
        </div>
      </template>

       <el-form :model="form" label-width="120px">
        <el-form-item label="风格分类">
          <el-input v-model="form.sort" placeholder="例如：万圣、圣诞" />
        </el-form-item>
        
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :max="10000" placeholder="请输入价格" style="width: 200px" />
        </el-form-item>


         <el-divider>上传角色图片</el-divider>

        <div class="role-uploads">
          <div v-for="(roleName, index) in roleNames" :key="index + 1" class="role-upload-item">
            <el-form-item :label="roleName">
              <el-upload
                class="avatar-uploader"
                :action="''"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="(file) => handleFileChange(file, index + 1)"
              >
                <img v-if="form.roles[index + 1].imageUrl" :src="getImageUrl(form.roles[index + 1].imageUrl)" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div v-if="form.roles[index + 1].uploading" class="upload-status">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>上传中...</span>
              </div>
            </el-form-item>
          </div>
        </div>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import { uploadCostumeImage, batchAddCostumes } from '@/api/admin'

const submitting = ref(false)
const form = reactive({
  sort: '',
  roles: {}
})

const roleNames = [
  '崔樱桃',
  '兔拉米',
  '刷粟米',
  '开关锁',
  '眈眈',
  '狐袋子',
  '饭粒',
  '帕哩',
  'KimJa',
  'DOA',
  '夫小橘',
  '哝啵',
  '灿獭哩',
  '蹦蹦'
]

for (let i = 1; i <= 14; i++) {
  form.roles[i] = {
    imageUrl: '',
    file: null,
    uploading: false
  }
}

const getImageUrl = (url) => {
  // 如果是本地预览URL，直接返回
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  // 否则拼接完整URL
  return `http://localhost:8080${url}`
}

const handleFileChange = async (file, roleId) => {
  const rawFile = file.raw
  
  // 验证文件类型
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return
  }

  // 验证文件大小（5MB）
  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  // 先显示本地预览
  form.roles[roleId].imageUrl = URL.createObjectURL(rawFile)
  form.roles[roleId].file = rawFile
  form.roles[roleId].uploading = true

  try {
    // 上传到服务器
    const res = await uploadCostumeImage(rawFile)
    form.roles[roleId].imageUrl = res.data.url
    ElMessage.success(`${roleNames[roleId - 1]}图片上传成功`)
  } catch (error) {
    ElMessage.error(`${roleNames[roleId - 1]}图片上传失败：${error.message}`)
    form.roles[roleId].imageUrl = ''
    form.roles[roleId].file = null
  } finally {
    form.roles[roleId].uploading = false
  }
}

const handleSubmit = async () => {
  if (!form.sort) {
    ElMessage.warning('请输入风格分类')
    return
  }

  const costumes = []
  for (let roleId = 1; roleId <= 14; roleId++) {
    const role = form.roles[roleId]
    if (!role.imageUrl) {
      ElMessage.warning(`请上传${roleNames[roleId - 1]}的图片`)
      return
    }
    if (role.uploading) {
      ElMessage.warning(`${roleNames[roleId - 1]}的图片正在上传中，请稍候`)
      return
    }

    costumes.push({
      roleId: roleId,
      name: roleNames[roleId - 1],
      imageUrl: role.imageUrl,
      sort: form.sort,
      price: form.price || 0
    })
  }

  submitting.value = true
  try {
    await batchAddCostumes(costumes)
    ElMessage.success('装扮添加成功')
    handleReset()
  } catch (error) {
    ElMessage.error('提交失败：' + error.message)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  form.sort = ''
  form.price = 0
  for (let i = 1; i <= 14; i++) {
    form.roles[i] = { 
      imageUrl: '', 
      file: null,
      uploading: false 
    }
  }
}
</script>

<style scoped>
.costume-management {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.role-uploads {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.role-upload-item {
  border: 1px solid #dcdfe6;
  padding: 15px;
  border-radius: 4px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 148px;
  height: 148px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  text-align: center;
  line-height: 148px;
}

.avatar {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: cover;
}

.upload-status {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  font-size: 14px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>