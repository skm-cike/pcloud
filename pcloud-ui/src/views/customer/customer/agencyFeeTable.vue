<template>
  <!-- 导入表 -->
  <el-dialog :title="title" :visible.sync="visible" width="80%" top="5vh">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
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
    <el-row>
      <el-table v-loading="loading" :data="incomeList">
      <el-table-column label="收入名称" prop="incomeName" />
      <el-table-column label="起始月份" align="center" prop="beginDate" width="138">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.beginDate,"{y}-{m}") }}到{{ parseDate(scope.row.endDate,"{y}-{m}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入类型" align="center" :formatter="incomeTypeFormat" prop="incomeType" width="100"/>
      <el-table-column label="收入金额" align="center" prop="incomeMoney" width="80"/>
      <el-table-column label="付款方式" align="center" :formatter="paymentMethodFormat" prop="paymentMethod" width="80"/>
      <el-table-column label="所属月份" align="center" prop="incomeMonth" width="80"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="155"/>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"/>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
// import {
//   listIncome,
//   getIncome,
//   delIncome,
//   addIncome,
//   updateIncome,
//   exportIncome
// } from "@/api/money/income";
import { listIncome } from "@/api/money/income";
export default {
  data() {
    return {
      title: "代理费记录【】",
      loading: true,
      // 遮罩层
      visible: false,
      // 选中数组值
      tables: [],
      // 总条数
      total: 0,
      incomeTypes: [],
      paymentMethods: [],
      // 表数据
      incomeList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: "create_time",
        isAsc: "desc",
        incomeName: undefined,
        incomeMonth: undefined,
        customerId: undefined,
        incomeType:'1'
      }
    };
  },
  methods: {
    // 显示弹框
    show(row) {
      this.loading = true;
      this.incomeList= [];
      this.getDicts("income_type").then(response => {
        this.incomeTypes = response.data;
      });
      this.getDicts("payment_method").then(response => {
        this.paymentMethods = response.data;
      });
      this.queryParams.customerId = row.customerId;
      this.title = "代理费记录【"+row.customerName+"】"
      this.getList();
      this.visible = true;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.tables = selection.map(item => item.tableName);
    },
    // 查询表数据
    getList() {
      listIncome(this.queryParams).then(res => {
        if (res.code === 200) {
          this.incomeList = res.rows;
          this.total = res.total;
          this.loading = false;
        }
      });
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
    /** 导入按钮操作 */
    handleImportTable() {
      importTable({ tables: this.tables.join(",") }).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
          this.$emit("ok");
        }
      });
    }
  }
};
</script>
