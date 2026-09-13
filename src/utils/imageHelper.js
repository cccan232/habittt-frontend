/**
 * 统一处理图片路径
 * @param {string} imageUrl - 图片URL
 * @returns {string} 完整的图片访问URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  
  // 如果已经是完整URL（http/https开头），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // 如果是后端上传的图片（以 /uploads 开头），拼接后端地址
  if (imageUrl.startsWith('/uploads')) {
    return `http://localhost:8080${imageUrl}`
  }
  
  // 初始化情况（本地public目录下的图片），直接返回相对路径
  return imageUrl
}
