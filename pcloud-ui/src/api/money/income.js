import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listIncome(query) {
  return request({
    url: '/money/income/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getIncome(incomeId) {
  return request({
    url: '/money/income/' + incomeId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addIncome(data) {
  return request({
    url: '/money/income',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateIncome(data) {
  return request({
    url: '/money/income',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delIncome(incomeId) {
  return request({
    url: '/money/income/' + incomeId,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportIncome(query) {
  return request({
    url: '/money/income/export',
    method: 'get',
    params: query
  })
}