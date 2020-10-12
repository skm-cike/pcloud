<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="((item)=>{openCreateDir(item, '', '')})"
          v-hasPermi="['store:file:add']"
        >新建文件夹</el-button>
      </el-col>
    </el-row>

    <!-- 上传对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px">
      <el-upload
        ref="upload"
        :data="{layer: upload.layer}"
        :limit="200"
        multiple
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </el-upload>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 新建对话框 -->
    <el-dialog :title="newdir.title" :visible.sync="newdir.open" width="400px">
      <el-form :model="newdir" ref="newdirForm" :inline="true" label-width="68px">
        <el-form-item label="名称" prop="filename">
          <el-input
            v-model="newdir.filename"
            placeholder="新文件夹名称"
            clearable
            size="small"
            @keyup.enter.native="createDir"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createDir">确 定</el-button>
        <el-button @click="newdir.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-table
      :data="treeList"
      ref="fileTable"
      style="width: 100%"
      row-key="id"
      lazy
      :load="load"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="filename" label="文件/目录名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <i v-if="scope.row.type == 'd'" class="el-icon-folder" >{{ scope.row.label }}</i>
          <i v-else-if="scope.row.type == 'f'" class="el-icon-s-order">{{ scope.row.label }}</i>
        </template>
      </el-table-column>
      <el-table-column prop="cId" label="Data CID" width="300px" :show-overflow-tooltip="true"></el-table-column>
      <!-- <el-table-column prop="minerIds" label="minerIds" width="130px" :show-overflow-tooltip="true"></el-table-column> -->
      <el-table-column label="操作" align="right" header-align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.type == 'd'"
            icon="el-icon-plus"
            size="mini"
            style="border:none"
            @click="openCreateDir(scope.row,scope.row.layer,scope.row.id)"
            v-hasPermi="['store:file:add']"
          >新建文件夹</el-button>
          <el-button
            v-if="scope.row.type == 'd'"
            icon="el-icon-upload"
            size="mini"
            style="border:none"
            @click="openUploadFile(scope.row,scope.row.layer,scope.row.id)"
            v-hasPermi="['store:file:add']"
          >上传</el-button>
          <el-button
            v-if="scope.row.type == 'f'"
            icon="el-icon-download"
            size="mini"
            style="border:none"
            @click="downloadFile(scope.row,scope.row.layer,scope.row.id)"
            v-hasPermi="['store:file:add']"
          >下载</el-button>


        </template>
      </el-table-column>
    </el-table>

    <!-- <el-tree
      node-key="id"
      ref="tree"
      :load="loadNode"
      empty-text="无数据"
      lazy
      :props="defaultProps"
      highlight-current="true"
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave"
      @node-drag-over="handleDragOver"
      @node-drag-end="handleDragEnd"
      @node-drop="handleDrop"
      @node-expand="handleExpand"
      @check-change="handleCheckChange">
      draggable
      :allow-drop="allowDrop"
      :allow-drag="allowDrag">
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.type == 'd'" class="el-icon-folder" >{{ node.label }}</i>
            <i v-else-if="data.type == 'f'" class="el-icon-s-order">{{ node.label }}</i>


            <span>
              <span>
                <span v-if="data.type == 'f'" v-text="data.minerIds">{{ data.minerIds }}</span>
                <span v-if="data.type == 'f'" v-text="data.cId">{{ data.cId }}</span>
              </span>
              <el-button
                v-if="data.type == 'd'"
                icon="el-icon-plus"
                size="mini"
                style="border:none"
                @click="((item)=>{openCreateDir(item, data.layer, data.id)})"
                v-hasPermi="['store:file:add']"
              >新建文件夹</el-button>

              <el-button
                v-if="data.type == 'd'"
                icon="el-icon-upload"
                size="mini"
                style="border:none"
                @click="(item)=>{openUploadFile(item, data.layer, data.id)}"
                v-hasPermi="['store:file:add']"
              >上传</el-button>
              <el-button
                v-if="data.type == 'f'"
                icon="el-icon-download"
                size="mini"
                style="border:none"
                @click="(item)=>{downloadFile(item, data.layer, data.id)}"
                v-hasPermi="['store:file:query']"
              >下载</el-button>
            </span>
          </span>
    </el-tree> -->
  </div>
</template>
<script>
  import { getToken } from "@/utils/auth";
  import { createDir,uploadFile,downloadFile,delFile,listFile } from "@/api/store/file";

  export default {
    data() {
      return {
        maps: new Map(),
        defaultProps: {
          label: 'label',
          isLeaf: 'leaf',
          key: 'id'
        },
        treeList: [],
        upload: {
          layer: '',
          // 是否显示弹出层（用户导入）
          open: false,
          // 弹出层标题（用户导入）
          title: "",
          // 是否禁用上传
          isUploading: false,
          // 是否更新已经存在的用户数据
          updateSupport: 0,
          // 设置上传的请求头部
          headers: { Authorization: "Bearer " + getToken() },
          // 上传的地址
          url: process.env.VUE_APP_BASE_API + "/store/filfile/upload"
        },
        newdir: {
          title: "新建文件夹",
          open: false,
          filename: "",
          parentLayer: ""
        },
        recordState: {
          resolve: undefined,
          selectLayer: "",
          selectKey: ""
        }
      };
    },
    mounted(){
      let param = {};
      listFile(param).then(
        response => {
          for(var i in response.data){
            if(  response.data[i].type== 'd')
              response.data[i].hasChildren = true;
          }
          this.treeList = (response.data)
        }
      );
    },
    methods: {
      load(row, node, resolve) {
        console.log(node)
        this.maps.set(row.id, { row, node, resolve })
        let param={}
        if (resolve && !this.recordState.resolve) {
          this.recordState.resolve = resolve
        }
        if (row && row.layer) {
          param.layer=row.layer
        }
        listFile(param).then(
          response => {
            for(var i in response.data){
              if(  response.data[i].type== 'd')
              response.data[i].hasChildren = true;
            }
            resolve(response.data)
          }
        );
      },
    refreshRow(row){
      let param={}

        if (row && row.layer) {
          param.layer=row.layer
        }
        listFile(param).then(
          response => {
            for(var i in response.data){
              if(  response.data[i].type== 'd')
              response.data[i].hasChildren = true;
            }
            this.$set(this.$refs.fileTable.store.states.lazyTreeNodeMap, row.id, response.data)
          }
        );


    },
      handleDragStart(node, ev) {
        console.log('drag start', node);
      },
      handleDragEnter(draggingNode, dropNode, ev) {
        console.log('tree drag enter: ', dropNode.label);
      },
      handleDragLeave(draggingNode, dropNode, ev) {
        console.log('tree drag leave: ', dropNode.label);
      },
      handleDragOver(draggingNode, dropNode, ev) {
        console.log('tree drag over: ', dropNode.label);
      },
      handleDragEnd(draggingNode, dropNode, dropType, ev) {
        console.log('tree drag end: ', dropNode && dropNode.label, dropType);
      },
      handleDrop(draggingNode, dropNode, dropType, ev) {
        console.log('tree drop: ', dropNode.label, dropType);
      },
      handleExpand(draggingNode, dropNode, dropType, ev) {
        // alert(1)
      },
      allowDrop(draggingNode, dropNode, type) {
        if (dropNode.data.label === '二级 3-1') {
          return type !== 'inner';
        } else {
          return true;
        }
      },
      allowDrag(draggingNode) {
        return draggingNode.data.label.indexOf('三级 3-2-2') === -1;
      },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
      handleCheckChange(data){
        // this.currTreeId=data.id
        // setTimeout(() => {
        //   let currtData = this.$refs.tree.getCheckedNodes(true)
        //   this.labelCheckedList = currtData;
        // }, 100);
      },
      loadNode(node, resolve) {
        if (node.level === 0) {
          this.listFile(node, resolve);
        } else {
          this.listFile(node, resolve);
        }
      },
// 收起、展示tree
      selectLabelList() {
        if(!this.isShowTree){
          this.getCategorylist();
        }else{
          this.$refs.tree.$data.store.lazy = false
          this.isShowTree=false;
        }

      },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$alert(response.msg, "上传结果", { dangerouslyUseHTMLString: true });
      this.refreshRow(this.upload.selectRow)
      // let node = this.$refs.tree.getNode(this.upload.selectKey);
      // node.loaded = false;
      // node.expand();
      this.$refs.upload.clearFiles();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
      openUploadFile(row, layer, id) {
        this.upload.layer=layer
        this.upload.selectRow=row
        this.upload.id=id
        this.upload.open = true;
      },
      createDir() {
        this.newdir.parentLayer=this.recordState.selectLayer
        let _this = this
        createDir(this.newdir).then(response => {
          _this.resetForm("newdirForm");
          _this.newdir.open=false
          if (_this.newdir.parentLayer=='') {
            listFile({}).then(
              response => {
                for(var i in response.data){
                  if(  response.data[i].type== 'd')
                  response.data[i].hasChildren = true;
                }
                _this.treeList=response.data
              }
            );
          } else {
            _this.refreshRow(this.recordState.selectRow)
            // node.loaded = false;
            // node.expand();
          }
        });
      },
      uploadFile() {
        // uploadFile()
      },
      downloadFile(e, layer, id) {
        this.downloadFullUrl("/store/filfile/download?id="+id);
      },
      delFile() {
        // delFile()
      },
      openCreateDir(row, layer, id){
        console.log(this.$refs)
        this.recordState.selectLayer=layer;
        this.recordState.selectRow=row;
        this.newdir.open=true
      },
      listFile(node, resolve) {
        let param={}
        if (resolve && !this.recordState.resolve) {
          this.recordState.resolve = resolve
        }
        if (node && node.data) {
          param.layer=node.data.layer
        }
        listFile(param).then(
          response => {
            resolve(response.data)
          }
        );
      },
      formReset() {
        this.resetForm("newdirForm");
      }
    }
  };
</script>
<style lang="scss">
  .el-tree .el-tree-node__expand-icon.expanded {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  .el-tree .el-icon-caret-right:before {
    content: "\e723";
  }
  .el-tree .el-tree-node__expand-icon.expanded.el-icon-caret-right:before{
    content: "\e722";
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
