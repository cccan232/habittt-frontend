import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/user/roles',
    method: 'get'
  })
}

export function getOwnedCostumes(roleId) {
  return request({
    url: '/user/costumes',
    method: 'get',
    params: { roleId }
  })
}
