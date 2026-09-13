import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setInfo(info) {
    // 确保 info 是一个对象
    if (info && typeof info === 'object') {
      userInfo.value = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      // 如果传入 null 或空对象，清空用户信息
      userInfo.value = {}
      localStorage.removeItem('userInfo')
    }
  }

   function updatePoints(newPoints) {
    // 确保更新 userInfo 中的 points
    if (userInfo.value) {
      userInfo.value.points = newPoints
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, setToken, setInfo, updatePoints, logout }
})
