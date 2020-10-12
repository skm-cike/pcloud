import request from '@/utils/request'

// 查询柜内摄像头列表
export function listInfo(query) {
  return request({
    url: '/devicebox/camera/list',
    method: 'get',
    params: query
  })
}
// 查询柜内摄像头列表
export function list1() {
  return request({
    url: '/devicebox/camera/list1',
    method: 'get'
  })
}

// 查询柜内摄像头详细
export function getInfo(cameraId) {
  return request({
    url: '/devicebox/camera/' + cameraId,
    method: 'get'
  })
}

// 新增柜内摄像头
export function addInfo(data) {
  return request({
    url: '/devicebox/camera',
    method: 'post',
    data: data
  })
}

// 柜内摄像头
export function updateInfo(data) {
  return request({
    url: '/devicebox/camera',
    method: 'put',
    data: data
  })
}

// 删除柜内摄像头
export function delInfo(cameraId) {
  return request({
    url: '/devicebox/camera/' + cameraId,
    method: 'delete'
  })
}

// 导出柜内摄像头
export function exportInfo(query) {
  return request({
    url: '/devicebox/camera/export',
    method: 'get',
    params: query
  })
}