<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="120px">
     
      <el-form-item label="还箱人" prop="inputRecorder">
        <el-select v-model="queryParams.inputRecorder"  clearable>
                <el-option
                  v-for="item in userOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
      </el-form-item>
      <el-form-item label="还箱结果" prop="result">
        <el-select v-model="queryParams.result"  clearable>
                <el-option
                  v-for="dict in resultOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['bankbox:inputRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['bankbox:inputRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['bankbox:inputRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['bankbox:inputRecord:export']"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="recordsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="申领流程记录" align="center" prop="inputProcessId" />
      <el-table-column label="尾箱设备" align="center" prop="deviceId" />
      <el-table-column label="钞箱" align="center" prop="cashBoxId" />
      <el-table-column label="还箱结果" align="center" prop="result" />
      <el-table-column label="还箱人" align="center" :formatter="inputRecorder" />
      <el-table-column label="还箱时间" align="center" prop="inputTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.inputTime) }}</span>
        </template>
      </el-table-column>
 
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bankbox:inputRecord:query']"
          >查看</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bankbox:inputRecord:remove']"
          >删除</el-button> -->
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

    <!-- 添加或修改归还记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="申领流程记录表" prop="inputProcessId">
          <el-input v-model="form.inputProcessId" placeholder="请输入申领流程记录表ID" />
        </el-form-item>
        <el-form-item label="尾箱设备" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入尾箱设备" />
        </el-form-item>
        <el-form-item label="钞箱" prop="cashBoxId">
          <el-input v-model="form.cashBoxId" placeholder="请输入钞箱" />
        </el-form-item>
        <!-- <el-form-item label="出库照片" prop="photo">
          <el-input v-model="form.photo" placeholder="请输入出库照片" />
        </el-form-item> -->
        <el-form-item label="还箱结果" prop="result">
          <el-select v-model="form.result" disabled  clearable>
                <el-option
                  v-for="dict in resultOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
        </el-form-item>
        <el-form-item label="还箱人" prop="inputRecorder">
          <el-input v-model="form.inputRecorder" placeholder="请输入还箱人" />
        </el-form-item>
        <el-form-item label="还箱时间" prop="inputTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.inputTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择还箱时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="复核人" prop="reviewer">
          <el-input v-model="form.reviewer" placeholder="请输入复核人" />
        </el-form-item>
        <el-form-item label="复核时间" prop="reviewerTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.reviewerTime"
            type="datetime"
            value-format="yyyy-MM-dd  HH:mm:ss"
            placeholder="选择复核时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="修改时间" prop="lastModifyTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.lastModifyTime"
            type="datetime"
            value-format="yyyy-MM-dd  HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="=入库照片：" >
              <img class="img" :src="'/dev-api'+form.photo">
            </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRecords, getRecords, delRecords, addRecords, updateRecords, exportRecords } from "@/api/bankbox/inputRecords";
import { listUser, listByDeptId } from "@/api/system/user";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

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
      // 归还记录表格数据
      recordsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
       // 类型数据字典
      resultOptions: [],
      userOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inputProcessId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        photo: undefined,
        result: undefined,
        inputRecorder: undefined,
        inputTime: undefined,
        reviewer: undefined,
        reviewerTime: undefined,
        lastModifyTime: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        inputProcessId: [
          { required: true, message: "申领流程记录表ID不能为空", trigger: "blur" }
        ],      }
    };
  },
  created() {
    this.getList();
     this.getDicts("inputRecord_result").then(response => {
      this.resultOptions = response.data;
    });
    //取箱人员
    listByDeptId().then(response => {
      this.userOptions = response.listByDeptId;
    });
  },
  methods: {
     //列表申请人
    inputRecorder(row, column) {
      var actions = [];
      Object.keys(this.userOptions).map(key => {
        if (this.userOptions[key].userId == "" + row.inputRecorder) {
          actions.push(this.userOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },
     resultFormat(row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
    /** 查询归还记录列表 */
    getList() {
      this.loading = true;
      listRecords(this.queryParams).then(response => {
        this.recordsList = response.rows;
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
        inputRecordsId: undefined,
        inputProcessId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        photo: undefined,
        result: undefined,
        inputRecorder: undefined,
        inputTime: undefined,
        reviewer: undefined,
        reviewerTime: undefined,
        remark: undefined,
        lastModifyTime: undefined,
        createTime: undefined
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
      this.ids = selection.map(item => item.inputRecordsId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加归还记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const inputRecordsId = row.inputRecordsId || this.ids
      getRecords(inputRecordsId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改归还记录";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.inputRecordsId != undefined) {
            updateRecords(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addRecords(this.form).then(response => {
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
      const inputRecordsIds = row.inputRecordsId || this.ids;
      this.$confirm('是否确认删除归还记录编号为"' + inputRecordsIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRecords(inputRecordsIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有归还记录数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRecords(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>