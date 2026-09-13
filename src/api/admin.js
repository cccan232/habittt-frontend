import request from '@/utils/request'

/**
 * 管理员登录
 */
export function adminLogin(data) {
  return request.post('/admin/login', data)
}

/**
 * 获取所有用户列表
 */
export function getAllUsers() {
  return request.get('/admin/users')
}

/**
 * 重置用户密码
 */
export function resetUserPassword(userId, newPassword) {
  return request.put(`/admin/user/${userId}/password`, { newPassword })
}

/**
 * 封禁/解封用户
 */
export function banUser(userId, status) {
  return request.put(`/admin/user/${userId}/status`, { status })
}

/**
 * 上传装扮图片
 */
export function uploadCostumeImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload/costume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 添加单个装扮
 */
export function addCostume(costume) {
  return request.post('/admin/costume', costume)
}

/**
 * 批量添加装扮
 */
export function batchAddCostumes(costumes) {
  return request.post('/admin/costumes/batch', costumes)
}

/**
 * 获取所有装扮风格分类
 */
export function getAllStyles() {
  return request.get('/admin/costume-styles')
}
