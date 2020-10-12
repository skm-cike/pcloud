import request from '@/utils/request'

// 查询组织机构列表
export function listOrg(query) {
  return request({
    url: '/system/org/list',
    method: 'get',
    params: query
  })
}

// 查询组织机构详细
export function getOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'get'
  })
}

// 新增组织机构
export function addOrg(data) {
  return request({
    url: '/system/org',
    method: 'post',
    data: data
  })
}

// 修改组织机构
export function updateOrg(data) {
  return request({
    url: '/system/org',
    method: 'put',
    data: data
  })
}

// 删除组织机构
export function delOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'delete'
  })
}

// 导出组织机构
export function exportOrg(query) {
  return request({
    url: '/system/org/export',
    method: 'get',
    params: query
  })
}


export function treeselect(data) {
  return request({
    url: '/system/org/treeselect',
    method: 'get',
    params: data
  })
}