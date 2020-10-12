<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="支出名称" prop="expendName">
        <el-input
          v-model="queryParams.expendName"
          placeholder="请输入支出名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支出类型" prop="expendType">
        <el-select v-model="queryParams.expendType" placeholder="请选择支出类型" clearable size="small">
          <el-option
            v-for="dict in expendTypes"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属月份" prop="expendMonth">
        <el-date-picker
          clearable
          size="small"
          style="width: 200px"
          v-model="queryParams.expendMonth"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择支出所属月份"
        ></el-date-picker>
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
          v-hasPermi="['money:expend:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['money:expend:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['money:expend:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['money:expend:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="expendList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="支出ID" align="center" prop="expendId" />
      <el-table-column label="支出名称" align="center" prop="expendName" />
      <el-table-column label="支出类型" align="center" :formatter="expendTypeFormat" prop="expendType" />
      <el-table-column label="支出金额" align="center" prop="expendMoney" />
      <el-table-column label="支出项目开始日期" align="center" prop="beginDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.beginDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支出项目结束日期" align="center" prop="endDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.endDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属月份" align="center" prop="expendMonth" />
      <el-table-column label="备注信息" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['money:expend:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['money:expend:remove']"
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="支出名称" prop="expendName">
          <el-input v-model="form.expendName" placeholder="请输入支出名称" />
        </el-form-item>
        <el-form-item label="支出类型">
          <el-select v-model="form.expendType" placeholder="请选择支出类型">
            <el-option
              v-for="dict in expendTypes"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支出金额" prop="expendMoney">
          <el-input v-model="form.expendMoney" placeholder="请输入支出金额" />
        </el-form-item>
        <el-form-item label="所属月份" prop="expendMonth">
          <el-date-picker
            clearable
            size="small"
            style="width: 200px"
            v-model="form.expendMonth"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择支出所属月份"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate">
          <el-date-picker
            clearable
            size="small"
            style="width: 200px"
            v-model="form.beginDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择支出项目开始日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            clearable
            size="small"
            style="width: 200px"
            v-model="form.endDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择支出项目结束日期"
          ></el-date-picker>
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
import {
  listExpend,
  getExpend,
  delExpend,
  addExpend,
  updateExpend,
  exportExpend
} from "@/api/money/expend";

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
      // 【请填写功能名称】表格数据
      expendList: [],
      expendTypes: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 50,
        expendName: undefined,
        expendType: undefined,
        expendMoney: undefined,
        expendMonth: undefined,
        status: undefined,
        beginDate: undefined,
        endDate: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        expendName: [
          { required: true, message: "支出名称不能为空", trigger: "blur" }
        ],
        expendType: [
          { required: true, message: "支出类型不能为空", trigger: "blur" }
        ],
        expendMonth: [
          { required: true, message: "支出所属月份", trigger: "blur" }
        ],
        expendMoney: [
          {
            required: true,
            message: "支出金额（单位元）不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("expend_type").then(response => {
      this.expendTypes = response.data;
    });
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listExpend(this.queryParams).then(response => {
        this.expendList = response.rows;
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
        expendId: undefined,
        expendName: undefined,
        expendType: undefined,
        expendMoney: undefined,
        expendMonth: undefined,
        status: "0",
        beginDate: undefined,
        endDate: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined
      };
      this.resetForm("form");
    },
    expendTypeFormat(row, column) {
      if (!row.expendType) {
        return "";
      }
      return this.selectDictLabel(this.expendTypes, row.expendType);
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
      this.ids = selection.map(item => item.expendId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加支出";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const expendId = row.expendId || this.ids;
      getExpend(expendId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改支出";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.expendId != undefined) {
            updateExpend(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addExpend(this.form).then(response => {
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
      const expendIds = row.expendId || this.ids;
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + expendIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delExpend(expendIds);
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
      this.$confirm("是否确认导出所有【请填写功能名称】数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportExpend(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>