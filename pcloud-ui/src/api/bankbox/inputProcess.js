import request from '@/utils/request'

// 查询归还流程列表
export function listProcess(query) {
  return request({
    url: '/bankbox/inputProcess/list',
    method: 'get',
    params: query
  })
}

// 查询归还流程详细
export function getProcess(inputProcessId) {
  return request({
    url: '/bankbox/inputProcess/' + inputProcessId,
    method: 'get'
  })
}

// 新增归还流程
export function addProcess(data) {
  return request({
    url: '/bankbox/inputProcess',
    method: 'post',
    data: data
  })
}

// 修改归还流程
export function updateProcess(data) {
  return request({
    url: '/bankbox/inputProcess',
    method: 'put',
    data: data
  })
}

// 删除归还流程
export function delProcess(inputProcessId) {
  return request({
    url: '/bankbox/inputProcess/' + inputProcessId,
    method: 'delete'
  })
}

// 导出归还流程
export function exportProcess(query) {
  return request({
    url: '/bankbox/inputProcess/export',
    method: 'get',
    params: query
  })
}
//重新申领流程
export function reApplyProcess(data) {
  return request({
    url: '/bankbox/inputProcess/reApplyProcess',
    method: 'put',
    data: data
  })
}
// 回退申领流程
export function backProcess(data) {
  return request({
    url: '/bankbox/inputProcess/back/',
    method: 'put',
    data: data
  })
}
// 通过申领流程
export function passProcess(data) {
  return request({
    url: '/bankbox/inputProcess/pass/',
    method: 'put',
    data: data
  })
}