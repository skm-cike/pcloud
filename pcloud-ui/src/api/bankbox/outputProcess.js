import request from '@/utils/request'

// 查询申领流程列表
export function listProcess(query) {
  return request({
    url: '/bankbox/outputProcess/list',
    method: 'get',
    params: query
  })
}

// 查询申领流程详细
export function getProcess(outputProcessId) {
  return request({
    url: '/bankbox/outputProcess/' + outputProcessId,
    method: 'get'
  })
}
export function getdeptAndUser() {
  return request({
    url: '/bankbox/outputProcess/getdeptAndUser/',
    method: 'get'
  })
}

// 新增申领流程
export function addProcess(data) {
  return request({
    url: '/bankbox/outputProcess',
    method: 'post',
    data: data
  })
}

// 修改申领流程
export function updateProcess(data) {
  return request({
    url: '/bankbox/outputProcess',
    method: 'put',
    data: data
  })
}
//重新申领流程
export function reApplyProcess(data) {
  return request({
    url: '/bankbox/outputProcess/reApplyProcess',
    method: 'put',
    data: data
  })
}
// 回退申领流程
export function backProcess(data) {
  return request({
    url: '/bankbox/outputProcess/back/',
    method: 'put',
    data: data
  })
}
// 通过申领流程
export function passProcess(data) {
  return request({
    url: '/bankbox/outputProcess/pass/',
    method: 'put',
    data: data
  })
}

// 删除申领流程
export function delProcess(outputProcessId) {
  return request({
    url: '/bankbox/outputProcess/' + outputProcessId,
    method: 'delete'
  })
}

// 导出申领流程
export function exportProcess(query) {
  return request({
    url: '/bankbox/outputProcess/export',
    method: 'get',
    params: query
  })
}