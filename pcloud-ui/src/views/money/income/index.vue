<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="收入名称" prop="incomeName">
        <el-input
          v-model="queryParams.incomeName"
          placeholder="请输入收入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收入类型" prop="incomeType">
        <el-select v-model="queryParams.incomeType" placeholder="请选择收入类型" clearable size="small">
          <el-option
            v-for="dict in incomeTypes"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属月份" prop="incomeMonth">
        <el-date-picker
          clearable
          size="small"
          style="width: 200px"
          v-model="queryParams.incomeMonth"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择收入所属月份"
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
          v-hasPermi="['money:income:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['money:income:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['money:income:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['money:income:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="incomeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="收入名称" align="center" prop="incomeName" min-width="200"/>
      <el-table-column label="收入类型" align="center" :formatter="incomeTypeFormat" prop="incomeType" width="100"/>
      <el-table-column label="收入金额" align="center" prop="incomeMoney" width="80"/>
      <el-table-column label="付款方式" align="center" :formatter="paymentMethodFormat" prop="paymentMethod" width="80"/>
      <el-table-column label="收入项目开始日期" align="center" prop="beginDate" width="130">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.beginDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入项目结束日期" align="center" prop="endDate" width="130">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.endDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属月份" align="center" prop="incomeMonth" width="100"/>
      <el-table-column label="备注信息" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['money:income:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['money:income:remove']"
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
        <el-form-item label="收入名称" prop="incomeName">
          <el-input v-model="form.incomeName" placeholder="请输入收入名称" />
        </el-form-item>
        <el-form-item label="收入类型">
          <el-select v-model="form.incomeType" placeholder="请选择收入类型">
            <el-option
              v-for="dict in incomeTypes"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收入金额" prop="incomeMoney">
          <el-input v-model="form.incomeMoney" placeholder="请输入收入金额" />
        </el-form-item>
        <el-form-item label="付款方式">
          <el-select v-model="form.paymentMethod" placeholder="请选择付款方式">
            <el-option
              v-for="dict in paymentMethods"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属月份" prop="incomeMonth">
          <el-date-picker
            clearable
            size="small"
            style="width: 200px"
            v-model="form.incomeMonth"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择收入所属月份"
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
            placeholder="选择收入项目开始日期"
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
            placeholder="选择收入项目结束日期"
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
  listIncome,
  getIncome,
  delIncome,
  addIncome,
  updateIncome,
  exportIncome
} from "@/api/money/income";

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
      incomeTypes: [],
      paymentMethods: [],
      // 【请填写功能名称】表格数据
      incomeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 50,
        orderByColumn: "create_time",
        isAsc: "desc",
        incomeName: undefined,
        incomeType: undefined,
        incomeMoney: undefined,
        incomeMonth: undefined,
        status: undefined,
        beginDate: undefined,
        endDate: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        incomeName: [
          { required: true, message: "收入名称不能为空", trigger: "blur" }
        ],
        incomeMonth: [
          { required: true, message: "收入所属月份", trigger: "blur" }
        ],
        incomeType: [
          { required: true, message: "收入类型不能为空", trigger: "blur" }
        ],
        incomeMoney: [
          {
            required: true,
            message: "收入金额（单位元）不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("income_type").then(response => {
      this.incomeTypes = response.data;
    });
    this.getDicts("payment_method").then(response => {
      this.paymentMethods = response.data;
    });
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listIncome(this.queryParams).then(response => {
        this.incomeList = response.rows;
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
        incomeId: undefined,
        incomeName: undefined,
        incomeType: undefined,
        incomeMoney: undefined,
        paymentMethod: undefined,
        incomeMonth: undefined,
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
    incomeTypeFormat(row, column) {
      if (!row.incomeType) {
        return "";
      }
      return this.selectDictLabel(this.incomeTypes, row.incomeType);
    },
    paymentMethodFormat(row, column) {
      if (!row.paymentMethod) {
        return "";
      }
      return this.selectDictLabel(this.paymentMethods, row.paymentMethod);
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
      this.ids = selection.map(item => item.incomeId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加收入";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const incomeId = row.incomeId || this.ids;
      getIncome(incomeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改收入";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.incomeId != undefined) {
            updateIncome(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addIncome(this.form).then(response => {
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
      const incomeIds = row.incomeId || this.ids;
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + incomeIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delIncome(incomeIds);
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
          return exportIncome(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>