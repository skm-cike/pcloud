<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="120px">
      <el-form-item label="品牌" prop="lockBrand">
        <el-input
          v-model="queryParams.lockBrand"
          placeholder="请输入品牌"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密码锁名称 " prop="lockName">
        <el-input
          v-model="queryParams.lockName"
          placeholder="请输入密码锁名称 "
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['devicebox:lock:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['devicebox:lock:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['devicebox:lock:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['devicebox:lock:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌" align="center" prop="lockBrand" />
      <el-table-column label="密码锁名称 " align="center" prop="lockName" />
      <el-table-column label="密码锁编号" align="center" prop="lockNumber" />
      <el-table-column label="密码锁钥匙编号" align="center" prop="keyNumber" />
      <el-table-column label="启用时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center"  :formatter="statusFormat"  prop="status" />
      <el-table-column label="修改时间" align="center" prop="lastModifyTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastModifyTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['devicebox:lock:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['devicebox:lock:remove']"
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

    <!-- 添加或修改密码锁对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="品牌：" prop="lockBrand">
              <el-input v-model="form.lockBrand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码锁名称： " prop="lockName">
              <el-input v-model="form.lockName" placeholder="请输入密码锁名称 " />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码锁编号：" prop="lockNumber">
              <el-input v-model="form.lockNumber" placeholder="请输入密码锁编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码锁钥匙编号：" prop="keyNumber">
              <el-input v-model="form.keyNumber" placeholder="请输入密码锁钥匙编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用时间：" prop="startTime">
              <el-date-picker
                clearable
                size="small"
                style="width: 200px"
                v-model="form.startTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择启用时间"
     
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态:">
              <el-select v-model="form.status" placeholder="请选择状态" clearable size="small">
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
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
import {
  listInfo,
  getInfo,
  delInfo,
  addInfo,
  updateInfo,
  exportInfo
} from "@/api/devicebox/lock/lock";
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
      // 密码锁表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
       // 状态数据字典
      statusOptions: [],
      selectDatetime:'',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lockBrand: undefined,
        lockName: undefined,
        lockNumber: undefined,
        keyNumber: undefined,
        startTime: undefined,
        status: undefined,
        lastModifyTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
         lockBrand: [
          { required: true, message: "品牌不能为空", trigger: "blur" }
        ],
        lockName: [
          { required: true, message: "密码锁名称不能为空", trigger: "blur" }
        ],
        lockNumber: [
          { required: true, message: "密码锁编号不能为空", trigger: "blur" }
        ],
        keyNumber: [{ required: true, message: "密码锁钥匙编号不能为空", trigger: "blur" }],
        startTime: [{ required: true, message: "启用时间不能为空", trigger: "blur" }],
      }
    };
  },
  created() {
    this.initData({});
    this.getList();
    this.getDicts("lock_status").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
 dataSearch() {
      this.getListByDataTime();
    },
    async initData(data) {
      //获取当前时间
      var now   = new Date();
      var monthn = now.getMonth()+1;
      var yearn  = now.getFullYear();
      var dayn = now.getDate();
      var h = now.getHours();
      var m =now.getMinutes();
      var s = now.getSeconds();
      this.selectDatetime = yearn+"-"+monthn+"-"+dayn+" "+h+":"+m+":"+s;

      //this.selectUser = parseInt(sessionStorage.getItem("userid"));
      this.getListByDataTime();
    },
    async getListByDataTime(data) {

    },

    /** 查询密码锁列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        lockId: undefined,
        lockBrand: undefined,
        lockName: undefined,
        lockNumber: undefined,
        keyNumber: undefined,
        startTime: undefined,
        status: "0",
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
      this.ids = selection.map(item => item.lockId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加密码锁";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const lockId = row.lockId || this.ids;
      getInfo(lockId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改密码锁";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.lockId != undefined) {
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
      const lockIds = row.lockId || this.ids;
      this.$confirm(
        '是否确认删除密码锁-"' + row.lockName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delInfo(lockIds);
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
      this.$confirm("是否确认导出所有密码锁数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportInfo(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>