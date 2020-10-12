import request from '@/utils/request'

// 查询尾箱柜列表
export function listInfo(query) {
  return request({
    url: '/devicebox/device/list',
    method: 'get',
    params: query
  })
}

// 查询尾箱柜详细
export function getInfo(deviceId) {
  return request({
    url: '/devicebox/device/' + deviceId,
    method: 'get'
  })
}

// 新增尾箱柜
export function addInfo(data) {
  return request({
    url: '/devicebox/device',
    method: 'post',
    data: data
  })
}

// 修改尾箱柜
export function updateInfo(data) {
  return request({
    url: '/devicebox/device',
    method: 'put',
    data: data
  })
}

// 删除尾箱柜
export function delInfo(deviceId) {
  return request({
    url: '/devicebox/device/' + deviceId,
    method: 'delete'
  })
}
// 停运
export function outage(deviceId) {
  return request({
    url: '/devicebox/device/' + deviceId,
    method: 'put'
  })
}

// 导出尾箱柜
export function exportInfo(query,ids) {
  return request({
    url: '/devicebox/device/exportInfo/'+ids,
    method: 'get',
    params: query
  })
}

// 根据部门查询尾箱柜
export function getDeviceList(orgid) {
  return request({
    url: '/devicebox/device/getDeviceList/' + orgid,
    method: 'get'
  })
}
export function getDeviceListAll() {
  return request({
    url: '/devicebox/device/getDeviceListAll',
    method: 'get'
  })
}