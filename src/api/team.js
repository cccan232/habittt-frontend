import request from '@/utils/request'

// 删除通知
export function deleteNotification(notificationId) {
  return request({
    url: `/team/notifications/${notificationId}`,
    method: 'delete'
  })
}

// 清空所有通知
export function clearAllNotifications() {
  return request({
    url: '/team/notifications/clear',
    method: 'delete'
  })
}

// 获取大厅队伍列表
export function getTeamLobby() {
  return request({
    url: '/team/lobby',
    method: 'get'
  })
}

// 创建队伍
export function createTeam(data) {
  return request({
    url: '/team/create',
    method: 'post',
    data
  })
}

// 获取队伍详情
export function getTeamDetail(teamId) {
  return request({
    url: `/team/${teamId}`,
    method: 'get'
  })
}

// 申请加入队伍
export function applyTeam(data) {
  return request({
    url: '/team/apply',
    method: 'post',
    data
  })
}

// 处理队伍申请
export function handleApplication(data) {
  return request({
    url: '/team/handle-application',
    method: 'post',
    data
  })
}

// 获取我的队伍
export function getMyTeam() {
  return request({
    url: '/team/my-team',
    method: 'get'
  })
}

// 获取队伍聊天消息
export function getTeamChat(teamId) {
  return request({
    url: `/team/${teamId}/chat`,
    method: 'get'
  })
}

// 发送聊天消息
export function sendChatMessage(data) {
  return request({
    url: '/team/chat',
    method: 'post',
    data
  })
}

// 队长选择挑战难度
export function selectChallengeLevel(data) {
  return request({
    url: '/team/select-level',
    method: 'post',
    data
  })
}

// 队员确认接受挑战
export function confirmChallenge(data) {
  return request({
    url: '/team/confirm-challenge',
    method: 'post',
    data
  })
}

// 提醒队员完成任务
export function remindMember(data) {
  return request({
    url: '/team/remind-member',
    method: 'post',
    data
  })
}

// 获取通知列表
export function getNotifications() {
  return request({
    url: '/team/notifications',
    method: 'get'
  })
}

// 标记通知为已读
export function markNotificationRead(notificationId) {
  return request({
    url: `/team/notifications/${notificationId}/read`,
    method: 'post'
  })
}

// 获取未读通知数量
export function getUnreadNotificationCount() {
  return request({
    url: '/team/notifications/unread-count',
    method: 'get'
  })
}

// 获取待处理的申请列表
export function getPendingApplications() {
  return request({
    url: '/team/pending-applications',
    method: 'get'
  })
}
