<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">

      <el-form-item label="取箱结果" prop="result">
        <el-select v-model="queryParams.result"  clearable>
                <el-option
                  v-for="dict in resultOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
      </el-form-item>
      <el-form-item label="取箱人" prop="outputRecorder">
        <el-select v-model="queryParams.outputRecorder"  clearable>
                <el-option
                  v-for="item in userOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
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
          v-hasPermi="['customer:records:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:records:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:records:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['customer:records:export']"
        >导出</el-button>
      </el-col>-->
    </el-row>

    <el-table v-loading="loading" :data="recordsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="尾箱柜" align="center" prop="deviceId" />
      <el-table-column label="钞箱" align="center" prop="cashBoxId" />
      <el-table-column label="取箱结果" align="center" :formatter="resultFormat" />
      <el-table-column label="取箱人" align="center" :formatter="outputRecorder" />
      <el-table-column label="取箱时间" align="center" prop="outputTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.outputTime) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="复核人" align="center" prop="reviewer" />
      <el-table-column label="复核时间" align="center" prop="reviewerTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.reviewerTime) }}</span>
        </template>
      </el-table-column>-->
      <el-table-column label="备注" align="center" prop="remark" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bankbox:outputRecord:query']"
          >查看</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['customer:records:remove']"
          >删除</el-button>-->
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

    <!-- 添加或修改取箱记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="尾箱柜：" prop="deviceId">
              <el-input v-model="form.deviceId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="钞箱：" prop="cashBoxId">
              <el-input v-model="form.cashBoxId" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="取箱结果：" >
             
              <el-select v-model="form.result" disabled  clearable>
                <el-option
                  v-for="dict in resultOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取箱人：" prop="outputRecorder">
              <el-select v-model="form.outputRecorder" disabled clearable>
                <el-option
                  v-for="item in userOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取箱时间：" prop="outputTime">
              <el-date-picker
                clearable
                disabled
                style="width: 200px"
                v-model="form.outputTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
             
            <!-- <el-form-item label="复核人" prop="reviewer">
          <el-input v-model="form.reviewer" placeholder="请输入复核人" />
        </el-form-item>
        <el-form-item label="复核时间" prop="reviewerTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.reviewerTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择复核时间">
          </el-date-picker>
            </el-form-item>-->
            <el-form-item label="复核时间" prop="lastModifyTime">
              <el-date-picker
                clearable
                disabled 
                style="width: 200px"
                v-model="form.lastModifyTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：" prop="remark">
          <el-input class="text" disabled type="textarea" v-model="form.remark" />
        </el-form-item>
            <el-form-item label="出库照片：" >
              <img class="img" :src="'/dev-api'+form.photo">
            </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" @click="submitForm">确 定</el-button> -->
         <el-button @click="open = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRecords,
  getRecords,
  delRecords,
  addRecords,
  updateRecords,
  exportRecords
} from "@/api/bankbox/outputRecords";
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
      // 取箱记录表格数据
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
        outputProcessId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        photo: undefined,
        result: undefined,
        outputRecorder: undefined,
        outputTime: undefined,
        reviewer: undefined,
        reviewerTime: undefined,
        lastModifyTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        outputProcessId: [
          {
            required: true,
            message: "申领流程记录表ID不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("outputRecord_result").then(response => {
      this.resultOptions = response.data;
    });
    //取箱人员
    listByDeptId().then(response => {
      this.userOptions = response.listByDeptId;
    });
  },
  methods: {
    //列表申请人
    outputRecorder(row, column) {
      var actions = [];
      Object.keys(this.userOptions).map(key => {
        if (this.userOptions[key].userId == "" + row.outputRecorder) {
          actions.push(this.userOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },
    resultFormat(row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
    /** 查询取箱记录列表 */
    getList() {
      this.loading = true;
      listRecords(this.queryParams).then(response => {
        console.log(this.queryParams)
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
        outputRecordsId: undefined,
        outputProcessId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        photo: undefined,
        result: undefined,
        outputRecorder: undefined,
        outputTime: undefined,
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
      this.ids = selection.map(item => item.outputRecordsId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加取箱记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const outputRecordsId = row.outputRecordsId || this.ids;
      getRecords(outputRecordsId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "查看取箱记录";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.outputRecordsId != undefined) {
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
      const outputRecordsIds = row.outputRecordsId || this.ids;
      this.$confirm(
        '是否确认删除取箱记录编号为"' + outputRecordsIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delRecords(outputRecordsIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有取箱记录数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportRecords(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>
<style>
input[disabled],input:disabled,input.disabled,textarea.disabled,textarea:disabled{  
    color: #333;  
    -webkit-text-fill-color:#333;  
    -webkit-opacity:1;  
    opacity: 1;  
} 
</style>