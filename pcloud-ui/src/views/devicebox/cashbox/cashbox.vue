<template>
  <div class="app-container">
    <el-row :gutter="20">
       <!--部门数据-->
      <el-col :span="4" :xs="24">
        <!-- <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div> -->
        <div class="head-container">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="钞箱名称" prop="boxName">
        <el-input
          v-model="queryParams.boxName"
          placeholder="请输入钞箱名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属机构" prop="orgId">
        <treeselect
          v-model="queryParams.orgId"
          :options="deptOptions"
          placeholder="请选择"
          style="width:200px"
        />
        <!-- <el-select
              v-model="queryParams.orgId"
              placeholder="请选择"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in deptOptions"
                :key="dict.deptId"
                :label="dict.deptName"
                :value="dict.deptId"
              />
        </el-select>-->
      </el-form-item>
      <el-form-item label="所属尾箱柜" prop="deviceId">
        <el-select
          v-model="queryParams.deviceId"
          placeholder="请选择"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in deviceOptions"
            :key="dict.deviceId"
            :label="dict.deviceName"
            :value="dict.deviceId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable size="small">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
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
          v-hasPermi="['devicebox:cashbox:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['devicebox:cashbox:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['devicebox:cashbox:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['devicebox:cashbox:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="钞箱编号" align="center" prop="boxNumber" />
      <el-table-column label="钞箱名称" align="center" prop="boxName" />
      <el-table-column label="所属机构" align="center" prop="dept.deptName" />
      <el-table-column label="所属尾箱柜" align="center" prop="device.deviceName" />
      <el-table-column label="RFID属性" align="center" prop="rfid" />
      <el-table-column label="类型" align="center" prop="type" :formatter="typeFormat" />
      <el-table-column label="上线时间" align="center" prop="startDatetime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startDatetime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
       <el-table-column label="启用/停运" align="center" :formatter="outageFormat" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div style="display:inline-block;" v-if="scope.row.outage=='0'">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['devicebox:cashbox:edit']"
          >修改</el-button>
          </div>
          <div style="display:inline-block;" v-if="scope.row.outage=='0'">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['devicebox:cashbox:remove']"
          >删除</el-button>
          </div>
           <div style="display:inline-block;" v-if="scope.row.outage=='0' && loginUser.admin">
               <el-button style="color: red"
                size="mini"
                type="text"
                icon="el-icon-unlock"
                @click="handleOutage(scope.row)"
                v-hasPermi="['devicebox:cashbox:outage']"
              >停运</el-button>
              </div>
              <div style="display:inline-block;" v-if="scope.row.outage=='1' && loginUser.admin">
               <el-button
                size="mini"
                type="text"
                icon="el-icon-lock"
                @click="handleOutage(scope.row)"
                v-hasPermi="['devicebox:cashbox:outage']"
              >启用</el-button>
              </div>
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
</el-col>
    </el-row>
    <!-- 添加或修改尾箱对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="钞箱编号：" prop="boxNumber">
              <el-input v-model="form.boxNumber" placeholder="请输入钞箱编号" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="钞箱名称：" prop="boxName">
              <el-input v-model="form.boxName" placeholder="请输入钞箱名称" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属机构：" prop="orgId" >
              <treeselect
                v-model="form.orgId"
                :options="deptOptions"
                placeholder="请选择"
                maxlength="50"
              @select="selecDeviceByOrgId($event)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属尾箱柜：" prop="deviceId">
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
            <el-form-item label="类型：">
              <el-select v-model="form.type" placeholder="请选择类型" clearable>
                <el-option
                  v-for="dict in typeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上线时间：" prop="startDatetime">
              <el-date-picker
                clearable
                style="width: 200px"
                v-model="form.startDatetime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择上线时间"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态：">
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
        <el-form-item label="备注：" prop="remark">
          <el-input class="text" type="textarea" v-model="form.remark" placeholder="请输入" />
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
  listInfo,
  getInfo,
  delInfo,
  addInfo,
  outage,
  updateInfo,
  exportInfo
} from "@/api/devicebox/cashbox/cashbox";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getDeviceList } from "@/api/devicebox/device/device";

export default {
  components: { Treeselect },
  data() {
    return {
       // 登录人
      loginUser: undefined,
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
      // 尾箱表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 部门树选项
      deptOptions: undefined,
      // 部门名称
      deptName: undefined,
      //尾箱柜
      deviceName: undefined,
      selectDatetime:'',
      deviceOptions: [],
      // 状态数据字典
      statusOptions: [],
      //停运启用
      outageOptions: [],
      //类型
      typeOptions: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        boxName: undefined,
        orgId: undefined,
        deviceId: undefined,
        rfid: undefined,
        type: undefined,
        startDatetime: undefined,
        status: undefined,
        lastModifyTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        boxNumber: [
          { required: true, message: "编号不能为空", trigger: "blur" }
        ],
        boxName: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        orgId: [
          { required: true, message: "归属机构不能为空", trigger: "blur" }
        ],
        deviceId: [
          { required: true, message: "尾箱柜不能为空", trigger: "blur" }
        ]
      }
    };
  },
  // watch: {
  //   // 监听deptId
  //   "form.orgId": "selecDeviceByOrgId"
  // },
  created() {
    this.getList();
    this.getTreeselect();
    // getInfo().then(response => {
    //   this.deviceOptions = response.deviceInfos;
    // });

    treeselect().then(response => {
      this.deptOptions = response.data;
    });
    this.getDicts("cashbox_status").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("outage").then(response => {
      this.outageOptions = response.data;
    });
    this.getDicts("cashbox_type").then(response => {
      this.typeOptions = response.data;
    });
  },
  methods: {
    
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    outageFormat(row, column) {
      return this.selectDictLabel(this.outageOptions, row.outage);
    },
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.type);
    },
    selecDeviceByOrgId(val) {
      //根据单位id获取相应的尾箱柜
      this.form.deviceId = "";
      console.log(val)
      if (val.id != null && val.id != "" && val.id != undefined) {
        getDeviceList(val.id).then(response => {
            //给尾箱柜下拉框赋值
            this.deviceOptions = response.deviceInfos;
        });
      }
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.orgId = data.id;
      this.getList();
    },
    /** 查询尾箱列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
        this.loginUser=response.user;
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
        cashBoxId: undefined,
        boxNumber: undefined,
        boxName: undefined,
        orgId: undefined,
        deviceId: undefined,
        rfid: undefined,
        type: undefined,
        startDatetime: undefined,
        status: "0",
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
      this.ids = selection.map(item => item.cashBoxId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getTreeselect();
      this.open = true;
      this.title = "添加尾箱";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const cashBoxId = row.cashBoxId || this.ids;
      getInfo(cashBoxId).then(response => {
        this.form = response.data;
        this.deviceOptions=response.deviceInfos
        this.open = true;
        this.title = "修改尾箱";
      });
    },
     /** 停运按钮操作 */
    handleOutage(row) {
      const cashBoxId = row.cashBoxId || this.ids;
      this.$confirm("是否停云/启用尾箱?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return outage(cashBoxId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("操作成功");
        })
        .catch(function() {});
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.cashBoxId != undefined) {
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
      const cashBoxIds = row.cashBoxId || this.ids;
      this.$confirm(
        '是否确认删除尾箱编号为"' + cashBoxIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delInfo(cashBoxIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const ids = this.ids==''?null:this.ids;
      const queryParams = this.queryParams;
      const message=this.ids==''?"是否确认导出所有尾箱柜数据项?":"是否确认导出选择的尾箱柜数据项?";
      this.$confirm(message, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportInfo(queryParams,ids);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>