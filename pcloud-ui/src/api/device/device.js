import request from '@/utils/request'

// 查询尾箱柜列表
export function listInfo(query) {
  return request({
    url: '/device/info/list',
    method: 'get',
    params: query
  })
}

// 查询尾箱柜详细
export function getInfo(deviceId) {
  return request({
    url: '/device/info/' + deviceId,
    method: 'get'
  })
}

// 新增尾箱柜
export function addInfo(data) {
  return request({
    url: '/device/info',
    method: 'post',
    data: data
  })
}

// 修改尾箱柜
export function updateInfo(data) {
  return request({
    url: '/device/info',
    method: 'put',
    data: data
  })
}

// 删除尾箱柜
export function delInfo(deviceId) {
  return request({
    url: '/device/info/' + deviceId,
    method: 'delete'
  })
}

// 导出尾箱柜
export function exportInfo(query) {
  return request({
    url: '/device/info/export',
    method: 'get',
    params: query
  })
}