import request from '@/utils/request'

// 查询尾箱列表
export function listInfo(query) {
  return request({
    url: '/devicebox/cashbox/list',
    method: 'get',
    params: query
  })
}

// 查询尾箱详细
export function getInfo(cashBoxId) {
  return request({
    url: '/devicebox/cashbox/' + cashBoxId,
    method: 'get'
  })
}

// 新增尾箱
export function addInfo(data) {
  return request({
    url: '/devicebox/cashbox',
    method: 'post',
    data: data
  })
}

// 修改尾箱
export function updateInfo(data) {
  return request({
    url: '/devicebox/cashbox',
    method: 'put',
    data: data
  })
}

// 删除尾箱
export function delInfo(cashBoxId) {
  return request({
    url: '/devicebox/cashbox/' + cashBoxId,
    method: 'delete'
  })
}

// 导出尾箱
export function exportInfo(query,ids) {
  return request({
    url: '/devicebox/cashbox/export/'+ids,
    method: 'get',
    params: query
  })
}
// 根据尾箱柜查询尾箱
export function getBoxList(deviceIds,status) {
  const data = {
    deviceIds,
    status
  }
  return request({
    url: '/devicebox/cashbox/getBoxList',
    method: 'get',
    params: data
  })

}
  // 停运
  export function outage(cashBoxId) {
    return request({
      url: '/devicebox/cashbox/' + cashBoxId,
      method: 'put'
    })
  }