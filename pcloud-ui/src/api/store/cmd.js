import request from '@/utils/request'

// 查询操作命令列表
export function listCmd(query) {
  return request({
    url: '/store/cmd/list',
    method: 'get',
    params: query
  })
}

// 查询操作命令详细
export function getCmd(id) {
  return request({
    url: '/store/cmd/' + id,
    method: 'get'
  })
}

// 新增操作命令
export function addCmd(data) {
  return request({
    url: '/store/cmd',
    method: 'post',
    data: data
  })
}

// 修改操作命令
export function updateCmd(data) {
  return request({
    url: '/store/cmd',
    method: 'put',
    data: data
  })
}

// 删除操作命令
export function delCmd(id) {
  return request({
    url: '/store/cmd/' + id,
    method: 'delete'
  })
}

// 导出操作命令
export function exportCmd(query) {
  return request({
    url: '/store/cmd/export',
    method: 'get',
    params: query
  })
}