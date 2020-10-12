import request from '@/utils/request'

// 查询取箱记录列表
export function listRecords(query) {
  return request({
    url: '/bankbox/outputRecord/list',
    method: 'get',
    params: query
  })
}

// 查询取箱记录详细
export function getRecords(outputRecordsId) {
  return request({
    url: '/bankbox/outputRecord/' + outputRecordsId,
    method: 'get'
  })
}

// 新增取箱记录
export function addRecords(data) {
  return request({
    url: '/bankbox/outputRecord',
    method: 'post',
    data: data
  })
}

// 修改取箱记录
export function updateRecords(data) {
  return request({
    url: '/bankbox/outputRecord',
    method: 'put',
    data: data
  })
}

// 删除取箱记录
export function delRecords(outputRecordsId) {
  return request({
    url: '/bankbox/outputRecord/' + outputRecordsId,
    method: 'delete'
  })
}

// 导出取箱记录
export function exportRecords(query) {
  return request({
    url: '/bankbox/outputRecord/export',
    method: 'get',
    params: query
  })
}