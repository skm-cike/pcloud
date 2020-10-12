import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listRecords(query) {
  return request({
    url: '/bankbox/inputRecord/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getRecords(inputRecordsId) {
  return request({
    url: '/bankbox/inputRecord' + inputRecordsId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addRecords(data) {
  return request({
    url: '/bankbox/inputRecord',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateRecords(data) {
  return request({
    url: '/bankbox/inputRecord',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delRecords(inputRecordsId) {
  return request({
    url: '/bankbox/inputRecord/' + inputRecordsId,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportRecords(query) {
  return request({
    url: '/bankbox/inputRecord/export',
    method: 'get',
    params: query
  })
}