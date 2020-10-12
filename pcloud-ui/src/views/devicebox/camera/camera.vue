<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="120px">
      <el-form-item label="摄像头名称" prop="cameraName">
        <el-input
          v-model="queryParams.cameraName"
          placeholder="请输入摄像头名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关联尾箱柜" prop="deviceId">
        <el-select v-model="queryParams.deviceId" placeholder="请选择">
                <el-option
                  v-for="item in deviceOptions"
                  :key="item.deviceId"
                  :label="item.deviceName"
                  :value="item.deviceId"
                ></el-option>
              </el-select>
      </el-form-item>
     
    
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['customer:info:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:info:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:info:remove']"
        >删除</el-button>
      </el-col>
      
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="摄像头名称" align="center" prop="cameraName" />
      <el-table-column label="尾箱柜名称" align="center" prop="deviceName" />
      <el-table-column label="ip" align="center" prop="ip" />
      <el-table-column label="物理地址" align="center" prop="mac" />
      <el-table-column label="端口" align="center" prop="port" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['customer:info:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['customer:info:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改柜内摄像头对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
        <el-form-item label="摄像头名称" prop="cameraName">
          <el-input v-model="form.cameraName" placeholder="请输入摄像头名称" />
        </el-form-item>
          </el-col>
           <el-col :span="12">
        <el-form-item label="关联尾箱柜" prop="deviceId">
         <el-select v-model="form.deviceId" placeholder="请选择">
                <el-option
                  v-for="item in deviceOptions"
                  :key="item.deviceId"
                  :label="item.deviceName"
                  :value="item.deviceId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          
           <el-col :span="12">
        <el-form-item label="ip" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入ip" />
        </el-form-item>
        </el-col>
           <el-col :span="12">
        <el-form-item label="物理地址" prop="mac">
          <el-input v-model="form.mac" placeholder="请输入物理地址" />
        </el-form-item>
        </el-col>
           <el-col :span="12">
        <el-form-item label="端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入端口" />
        </el-form-item>
           </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, exportInfo } from "@/api/devicebox/camera/camera";
import { getDeviceListAll } from "@/api/devicebox/device/device";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { validateIP,checkPortVal } from "@/utils/validate";
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 柜内摄像头表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      deviceOptions:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        cameraName: undefined,
        deviceId: undefined,
        deviceName: undefined,
        ip: undefined,
        mac: undefined,
        port: undefined,
        lastModifyTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ip: [{ required: true, message: "ip不能为空", trigger: "blur" },{validator:validateIP,trigger:'blur'}],
        port: [{ required: true, message: "端口不能为空", trigger: "blur" },{validator:checkPortVal,trigger:'blur'}],
        device: [{ required: true, message: "尾箱柜不能为空", trigger: "blur" }],
      }
    };
  },
  created() {
    this.getList();
    getDeviceListAll().then(response => {
            //给尾箱柜下拉框赋值
            this.deviceOptions = response.tDeviceInfoList;
        });
  },
  methods: {

    /** 查询柜内摄像头列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        cameraId: undefined,
        cameraName: undefined,
        deviceId: undefined,
        deviceName: undefined,
        ip: undefined,
        mac: undefined,
        port: undefined,
        createTime: undefined,
        lastModifyTime: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.cameraId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加柜内摄像头";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const cameraId = row.cameraId || this.ids
      getInfo(cameraId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改柜内摄像头";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.cameraId != undefined) {
            updateInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const cameraIds = row.cameraId || this.ids;
      this.$confirm('是否确认删除柜内摄像头编号为"' + cameraIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delInfo(cameraIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有柜内摄像头数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportInfo(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>