import request from '@/utils/request'

// 查询密码锁列表
export function listInfo(query) {
  return request({
    url: '/devicebox/lock/list',
    method: 'get',
    params: query
  })
}

// 查询密码锁详细
export function getInfo(lockId) {
  return request({
    url: '/devicebox/lock/' + lockId,
    method: 'get'
  })
}

// 新增密码锁
export function addInfo(data) {
  return request({
    url: '/devicebox/lock',
    method: 'post',
    data: data
  })
}

// 修改密码锁
export function updateInfo(data) {
  return request({
    url: '/devicebox/lock',
    method: 'put',
    data: data
  })
}

// 删除密码锁
export function delInfo(lockId) {
  return request({
    url: '/devicebox/lock/' + lockId,
    method: 'delete'
  })
}

// 导出密码锁
export function exportInfo(query) {
  return request({
    url: '/devicebox/lock/export',
    method: 'get',
    params: query
  })
}