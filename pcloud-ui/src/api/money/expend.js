import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listExpend(query) {
  return request({
    url: '/money/expend/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getExpend(expendId) {
  return request({
    url: '/money/expend/' + expendId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addExpend(data) {
  return request({
    url: '/money/expend',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateExpend(data) {
  return request({
    url: '/money/expend',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delExpend(expendId) {
  return request({
    url: '/money/expend/' + expendId,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportExpend(query) {
  return request({
    url: '/money/expend/export',
    method: 'get',
    params: query
  })
}