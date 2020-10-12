import request from '@/utils/request'

// 查询miner信息列表
export function listMiners(query) {
  return request({
    url: '/store/miners/list',
    method: 'get',
    params: query
  })
}

// 查询miner信息详细
export function getMiners(id) {
  return request({
    url: '/store/miners/' + id,
    method: 'get'
  })
}

// 新增miner信息
export function addMiners(data) {
  return request({
    url: '/store/miners',
    method: 'post',
    data: data
  })
}

// 修改miner信息
export function updateMiners(data) {
  return request({
    url: '/store/miners',
    method: 'put',
    data: data
  })
}

// 删除miner信息
export function delMiners(id) {
  return request({
    url: '/store/miners/' + id,
    method: 'delete'
  })
}

// 导出miner信息
export function exportMiners(query) {
  return request({
    url: '/store/miners/export',
    method: 'get',
    params: query
  })
}