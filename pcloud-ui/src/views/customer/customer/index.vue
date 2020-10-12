<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="客户" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="信用代码" prop="creditCode">
        <el-input
          v-model="queryParams.creditCode"
          placeholder="请输入统一信用代码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属人" prop="belong">
        <el-input
          v-model="queryParams.belong"
          placeholder="请输入所属人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['customer:customer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:customer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:customer:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['customer:customer:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table
      ref="table"
      v-loading="loading"
      :data="customerList"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :height="tableHeight"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="客户名称"
        prop="customerName"
        min-width="180"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <a class="link-type" href="javascript:;" @click="openAgencyFeeTable(scope.row)">{{ scope.row.customerName }}</a>
        </template>
      </el-table-column>
      <el-table-column label="简称" prop="shortName" min-width="90" :show-overflow-tooltip="true" />
      <el-table-column label="统一信用代码" prop="creditCode" width="184" />
      <el-table-column label="收费标准" align="center" prop="monthlyFee" width="75" />
      <el-table-column
        label="计费周期"
        align="center"
        :formatter="billingCycleFormat"
        prop="billingCycle"
        width="75"
      />
      <el-table-column label="到期月份" align="center" sortable="custom" prop="feeExpireDate" width="120">
        <template slot-scope="scope">
          <span>{{ parseDate(scope.row.feeExpireDate,'{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属人" align="center" prop="belong" width="70" />
      <el-table-column
        label="备注信息"
        align="center"
        prop="remark"
        min-width="60"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleCharge(scope.row)"
            v-hasPermi="['customer:customer:edit']"
          >收费</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['customer:customer:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['customer:customer:remove']"
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
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="简称" prop="shortName">
          <el-input v-model="form.shortName" placeholder="请输入简称" />
        </el-form-item>
        <el-form-item label="信用代码" prop="creditCode">
          <el-input v-model="form.creditCode" placeholder="请输入统一信用代码" />
        </el-form-item>
        <el-form-item label="计费周期" prop="billingCycle">
          <el-input v-model="form.billingCycle" placeholder="请输入计费周期(单位月，0未无需收费)" />
        </el-form-item>
        <el-form-item label="收费标准" prop="monthlyFee">
          <el-input v-model.number="form.monthlyFee" placeholder="请输入收费标准" />
        </el-form-item>
        <el-form-item label="到期日期" prop="feeExpireDate">
          <el-date-picker
            clearable
            size="small"
            style="width: 200px"
            :readonly="feeExpireDateReadonly"
            v-model="form.feeExpireDate"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择代理费到期日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="所属人" prop="belong">
          <el-input v-model="form.belong" placeholder="请输入所属人" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 收费对话框 -->
    <el-dialog :title="title" :visible.sync="openCharge" width="500px">
      <el-form ref="chargeForm" :model="formCharge" :rules="chargeRules" label-width="80px">
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="formCharge.customer.customerName" :readonly="true" />
        </el-form-item>
        <el-form-item label="开始月份" prop="beginDate">
          <el-date-picker
            clearable
            size="small" :readonly="true"
            style="width: 200px"
            v-model="formCharge.beginDate"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择收入项目开始月份"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束月份" prop="endDate">
          <el-date-picker
            clearable
            validate="endDateValidate"
            size="small" @change="endDateChange"
            style="width: 200px"
            v-model="formCharge.endDate"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择收入项目结束月份"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="收入金额" prop="incomeMoney">
          <el-input v-model.number="formCharge.incomeMoney" placeholder="请输入收入金额" />
        </el-form-item>
        <el-form-item label="付款方式">
          <el-select v-model="formCharge.paymentMethod" clearable placeholder="请选择付款方式">
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
            v-model="formCharge.incomeMonth"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择收入所属月份"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitChargeForm">确 定</el-button>
        <el-button @click="cancelCharge">取 消</el-button>
      </div>
    </el-dialog>
    <agency-fee-table ref="agencyFee" @ok="handleQuery" />
  </div>
</template>

<script>
import {
  listCustomer,
  getCustomer,
  delCustomer,
  addCustomer,
  updateCustomer,
  exportCustomer,
  recordAgencyFee
} from "@/api/customer/customer";

import agencyFeeTable from "./agencyFeeTable";

export default {
  components: { agencyFeeTable },
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
      tableHeight: 450,
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      customerList: [],
      billingCycles: [],
      paymentMethods: [],
      // 弹出层标题
      title: "",
      feeExpireDateReadonly: false,
      // 是否显示弹出层
      open: false,
      openCharge: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 50,
        orderByColumn: undefined,//"create_time",
        isAsc: undefined,//"desc",
        customerName: undefined,
        shortName: undefined,
        creditCode: undefined,
        billingCycle: undefined,
        feeExpireDate: undefined,
        belong: undefined
      },
      // 表单参数
      form: {},
      formCharge: { customer: {} },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "客户名称不能为空", trigger: "blur" }
        ],
        monthlyFee: [
          { required: true, message: "收费标准为空", trigger: "blur" },
          { type: "number", message: "收费标准必须为数字值", trigger: "blur" }
        ]
      },
      chargeRules: {
        incomeMonth: [
          { required: true, message: "所属月份不能为空", trigger: "blur" }
        ],
        incomeMoney: [
          { required: true, message: "收入金额不能为空", trigger: "blur" }
        ],
        endDate: [
          { required: true, message: "结束月份不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    //billingCycles
    this.getDicts("billing_cycle").then(response => {
      this.billingCycles = response.data;
    });
    this.getDicts("payment_method").then(response => {
      this.paymentMethods = response.data;
    });
  },
  mounted() {
    this.$nextTick(function() {
      this.tableHeight =
        window.innerHeight - 234;
      console.log("tableHeight:" + this.tableHeight);
      console.log(this.$refs.table.$el.offsetTop);
      // 监听窗口大小变化
      let self = this;
      window.onresize = function() {
        self.tableHeight =
          window.innerHeight - 234;
      };
    });
    //this.$refs.table.$el.offsetTop：表格距离浏览器的高度
    //50表示你想要调整的表格距离底部的高度（你可以自己随意调整），因为我们一般都有放分页组件的，所以需要给它留一个高度
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listCustomer(this.queryParams).then(response => {
        this.customerList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelCharge() {
      this.openCharge = false;
      this.resetCharge();
    },
    // 表单重置
    reset() {
      this.form = {
        customerId: undefined,
        customerName: undefined,
        shortName: undefined,
        creditCode: undefined,
        billingCycle: undefined,
        feeExpireDate: undefined,
        monthlyFee: undefined,
        belong: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined
      };
      this.resetForm("form");
    }, // 收费表单重置
    resetCharge() {
      this.formCharge = {
        customer: {
          customerId: undefined,
          customerName: undefined,
          shortName: undefined,
          creditCode: undefined,
          billingCycle: undefined,
          feeExpireDate: undefined,
          monthlyFee: undefined,
          belong: undefined,
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          remark: undefined
        },
        customerId: undefined,
        paymentMethod: undefined,
        incomeMoney: undefined,
        beginDate: undefined,
        endDate: undefined,
        incomeMonth: undefined,
      };
      this.resetForm("chargeForm");
    },
    billingCycleFormat(row, column) {
      if (!row.billingCycle) {
        return "";
      }
      const billingCycleFormatV = this.selectDictLabel(
        this.billingCycles,
        row.billingCycle
      );
      if (billingCycleFormatV === "" && row.billingCycle) {
        return row.billingCycle + "月";
      } else {
        return billingCycleFormatV;
      }
    },
    endDateValidate() {

    },
    endDateChange() {
      console.log(this.formCharge.beginDate);
      if(this.formCharge.beginDate){
        const diffMonth = this.dateDiffMonth(new Date(this.formCharge.beginDate),new Date(this.formCharge.endDate));
        console.log(diffMonth);
        if(diffMonth<0){
          
        }else{
          this.formCharge.incomeMoney = (diffMonth+1)*this.formCharge.customer.monthlyFee;
        }
      }

    },
    /** 打开导入表弹窗 */
    openAgencyFeeTable(row) {
      this.$refs.agencyFee.show(row);
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
      this.ids = selection.map(item => item.customerId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    //
    handleSortChange(sortObj) {
      console.log(sortObj)
      if(sortObj.order==="ascending"){
        this.queryParams.isAsc="asc";
      }else if(sortObj.order==="descending"){
        this.queryParams.isAsc="desc";
      }else{
        this.queryParams.isAsc=undefined;
      }
      if(sortObj.prop==="feeExpireDate" && this.queryParams.isAsc){
        this.queryParams.orderByColumn="fee_expire_date";
      }else{
        this.queryParams.orderByColumn=undefined;
      }
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.feeExpireDateReadonly = false;
      this.title = "添加客户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const customerId = row.customerId || this.ids;
      getCustomer(customerId).then(response => {
        this.form = response.data;
        this.open = true;
        this.feeExpireDateReadonly = true;
        this.title = "修改客户信息";
      });
    },
    handleCharge(row) {
      this.resetCharge();
      const customerId = row.customerId || this.ids;
      getCustomer(customerId).then(response => {
        this.openCharge = true;
        this.formCharge.customer = response.data;
        this.formCharge.customerId = customerId;
        this.formCharge.beginDate = this.dateAddMonth(this.formCharge.customer.feeExpireDate,1);
        if(this.formCharge.customer.billingCycle){
          this.formCharge.endDate = this.dateAddMonth(this.formCharge.customer.feeExpireDate,this.formCharge.customer.billingCycle);
          this.formCharge.incomeMoney = this.formCharge.customer.billingCycle*this.formCharge.customer.monthlyFee;
        }
        this.formCharge.incomeMonth = this.parseDate(new Date(),"{y}-{m}")
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form)
          if (this.form.customerId != undefined) {
            updateCustomer(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addCustomer(this.form).then(response => {
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
    submitChargeForm: function() {
      this.$refs["chargeForm"].validate(valid => {
        if (valid) {
          const postData = {
            customerId:this.formCharge.customer.customerId,
            incomeMoney:this.formCharge.incomeMoney,
          incomeMonth:this.formCharge.incomeMonth,
          beginDate:this.formCharge.beginDate,
          endDate:this.formCharge.endDate,
          paymentMethod:this.formCharge.paymentMethod
          };
          recordAgencyFee(postData).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.openCharge = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const customerIds = row.customerId || this.ids;
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + customerIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delCustomer(customerIds);
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
          return exportCustomer(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>