import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listCustomer(query) {
  return request({
    url: '/customer/customer/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getCustomer(customerId) {
  return request({
    url: '/customer/customer/' + customerId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addCustomer(data) {
  return request({
    url: '/customer/customer',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateCustomer(data) {
  return request({
    url: '/customer/customer',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delCustomer(customerId) {
  return request({
    url: '/customer/customer/' + customerId,
    method: 'delete'
  })
}

// 
export function exportCustomer(data) {
  return request({
    url: '/customer/customer/export',
    method: 'get',
    params: query
  })
}

// 记录代理费
export function recordAgencyFee(data) {
  return request({
    url: '/customer/customer/record-agency-fee',
    method: 'post',
    data: data
  })
  // return request({
  //   url: '/customer/customer/record-agency-fee',
  //   method: 'post',
  //   params: data
  // })
}
