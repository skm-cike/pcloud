import request from '@/utils/request'

// 查询存储文件列表
// export function listFile(query) {
//   return request({
//     url: '/store/stfile/list',
//     method: 'get',
//     params: query
//   })
// }

// 查询存储文件详细
export function getFile(id) {
  return request({
    url: '/store/stfile/' + id,
    method: 'get'
  })
}

// 新增存储文件
export function addFile(data) {
  return request({
    url: '/store/stfile',
    method: 'post',
    data: data
  })
}

// 修改存储文件
export function updateFile(data) {
  return request({
    url: '/store/stfile',
    method: 'put',
    data: data
  })
}

// 删除存储文件
// export function delFile(id) {
//   return request({
//     url: '/store/stfile/' + id,
//     method: 'delete'
//   })
// }

// 导出存储文件
export function exportFile(query) {
  return request({
    url: '/store/stfile/export',
    method: 'get',
    params: query
  })
}

// 新建文件夹
export function createDir(data) {
  return request({
    url: '/store/filfile/createDir',
    method: 'post',
    params: data
  })
}

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/store/filfile/upload',
    method: 'post',
    params: data
  })
}


// 下载文件
export function downloadFile(query) {
  return request({
    url: '/store/filfile/download',
    method: 'get',
    params: query
  })
}

// 删除文件
export function delFile(id) {
  return request({
    url: '/store/filfile/' + id,
    method: 'delete'
  })
}


// 查询子文件
export function listFile(query) {
  return request({
    url: '/store/filfile/list',
    method: 'get',
    params: query
  })
}
