<template>
  <div class="personal-header" @click="goToProfile">
    <div class="currency-box">
      <span class="points">💎{{ points }}</span>
    </div>
    <div class="avatar-box">
      <img :src="avatarImage" alt="Avatar" class="avatar" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { getImageUrl } from '@/utils/imageHelper'

const router = useRouter()
const userStore = useUserStore()

const avatarImage = computed(() => {
  const userInfo = userStore.userInfo
  if (!userInfo) return '/images/costumes/role1.png'
  
  if (typeof userInfo.avatar === 'object' && userInfo.avatar !== null) {
    if (userInfo.avatar.imageUrl) {
      return getImageUrl(userInfo.avatar.imageUrl)
    }
    return `/images/costumes/${userInfo.avatar.id}.png`
  }
  
  const avatarId = userInfo.avatar || 'role1'
  if (typeof avatarId === 'string' && avatarId.startsWith('role')) {
    return `/images/costumes/${avatarId}.png`
  }
  return `/images/costumes/role${avatarId}.png`
})

const points = computed(() => userStore.userInfo?.points || 0)

const goToProfile = () => router.push('/profile')
</script>

<style scoped>
.personal-header {
  position: absolute; 
  top: 20px; 
  right: 20px; 
  display: flex; 
  align-items: center; 
  gap: 15px;
  cursor: pointer; 
  z-index: 100; 
  background: rgba(255, 255, 255, 0.8); 
  padding: 5px 15px;
  border-radius: 20px; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.currency-box { 
  display: flex; 
  align-items: center; 
  gap: 5px; 
  font-weight: bold; 
  color: #555; 
}

.points {
  font-size: 14px;
}

.avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(146, 168, 209, 0.3);
}

.avatar { 
  width: 100%; 
  height: 100%; 
  object-fit: contain;
}
</style>
