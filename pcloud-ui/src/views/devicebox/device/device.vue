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
        </div>-->
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
        <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="90px">
          <el-form-item label="尾箱柜名称" prop="deviceName">
            <el-input
              v-model="queryParams.deviceName"
              placeholder="请输入尾箱柜名称"
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
              v-hasPermi="['devicebox:device:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['devicebox:device:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['devicebox:device:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['device:info:export']"
            >导出</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="尾箱柜编号" align="center" prop="deviceNumber" />
          <el-table-column label="尾箱柜名称" align="center" prop="deviceName" />
          <el-table-column label="所属机构" align="center" prop="dept.deptName" />
          <el-table-column label="mac" align="center" prop="mac" />
          <el-table-column label="ip" align="center" prop="ip" />
          <el-table-column prop="type" label="类型" :formatter="typeFormat" width="100"></el-table-column>

          <el-table-column label="上线时间" align="center" prop="startDatetime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.startDatetime) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" :formatter="statusFormat" width="100"></el-table-column>
          <el-table-column label="启用/停运" align="center" :formatter="outageFormat"  />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <div style="display:inline-block;" v-if="scope.row.outage=='0'">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['devicebox:device:edit']"
              >修改</el-button>
              </div>
              <div style="display:inline-block;" v-if="scope.row.outage=='0'">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['devicebox:device:remove']"
              >删除</el-button>
              </div>
              <div style="display:inline-block;" v-if="scope.row.outage=='0' && loginUser.admin">
               <el-button style="color: red"
                size="mini"
                type="text"
                icon="el-icon-unlock"
                @click="handleOutage(scope.row)"
                v-hasPermi="['devicebox:device:outage']"
              >停运</el-button>
              </div>
              <div style="display:inline-block;" v-if="scope.row.outage=='1' && loginUser.admin">
               <el-button
                size="mini"
                type="text"
                icon="el-icon-lock"
                @click="handleOutage(scope.row)"
                v-hasPermi="['devicebox:device:outage']"
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

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="尾箱柜编号：" prop="deviceNumber">
              <el-input v-model="form.deviceNumber" placeholder="请输入尾箱柜编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="尾箱柜名称：" prop="deviceName">
              <el-input v-model="form.deviceName" placeholder="请输入尾箱柜名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属机构：" prop="orgId">
              <treeselect v-model="form.orgId" :options="deptOptions" placeholder="请选择" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="mac：" prop="mac">
              <el-input v-model="form.mac" placeholder="请输入mac" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ip：" prop="ip">
              <el-input v-model="form.ip" placeholder="请输入ip" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型：" prop="type">
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
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择上线时间"
                @change="dataSearch"
              ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="密码锁：" prop="lockIds">
              <el-select v-model="form.lockIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in lockOptions"
                  :key="item.lockId"
                  :label="item.lockName"
                  :value="item.lockId"
                ></el-option>
              </el-select>
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
  outage,
  addInfo,
  updateInfo,
  exportInfo
} from "@/api/devicebox/device/device";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { validateIP } from "@/utils/validate";

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
      // 【请填写功能名称】表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 状态数据字典
      statusOptions: [],
      // 类型数据字典
      typeOptions: [],
      //停运起用
      outageOptions: [],
      selectDatetime: "",
      // 部门树选项
      deptOptions: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 角色选项
      lockOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceNumber: undefined,
        deviceName: undefined,
        orgId: undefined,
        mac: undefined,
        ip: undefined,
        lockNumber: undefined,
        keyNumber: undefined,
        type: undefined,
        startDatetime: undefined,
        status: undefined,
        lastModifyTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deviceNumber: [
          { required: true, message: "编号不能为空", trigger: "blur" }
        ],
        deviceName: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        orgId: [
          { required: true, message: "归属机构不能为空", trigger: "blur" }
        ],
        type: [{ required: true, message: "类型不能为空", trigger: "blur" }],
        mac: [{ required: true, message: "mac不能为空", trigger: "blur" }],
        ip: [{ required: true, message: "ip不能为空", trigger: "blur" },{validator:validateIP,trigger:'blur'}],
        lockIds: [{ required: true, message: "密码锁不能为空", trigger: "blur" }]
      }
    };
  },
  
  // watch: {
  //   // 根据名称筛选部门树
  //   deptName(val) {
  //     this.$refs.tree.filter(val);
  //   }
  // },
  created() {
    this.initData({});
    this.getList();
    treeselect().then(response => {
      this.deptOptions = response.data;
    });
    this.getDicts("device_status").then(response => {
      this.statusOptions = response.data;
    });
     this.getDicts("outage").then(response => {
      this.outageOptions = response.data;
    });
    this.getDicts("device_type").then(response => {
      this.typeOptions = response.data;
    });
  },
  methods: {
    dataSearch() {
      this.getListByDataTime();
    },
    async initData(data) {
      //获取当前时间
      var now = new Date();
      var monthn = now.getMonth() + 1;
      var yearn = now.getFullYear();
      var dayn = now.getDate();
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();
      this.selectDatetime =
        yearn + "-" + monthn + "-" + dayn + " " + h + ":" + m + ":" + s;

      this.getListByDataTime();
    },
    async getListByDataTime(data) {},

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
    /** 查询尾箱柜列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
        this.loginUser=response.user;
        console.log(this.loginUser)
      });
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        deviceId: undefined,
        deviceNumber: undefined,
        deviceName: undefined,
        orgId: undefined,
        mac: undefined,
        ip: undefined,
        lockNumber: undefined,
        keyNumber: undefined,
        type: undefined,
        startDatetime: undefined,
        status: "0",
        remark: undefined,
        lastModifyTime: undefined,
        createTime: undefined,
        lockIds: []
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
      this.ids = selection.map(item => item.deviceId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getTreeselect();

      getInfo().then(response => {
        this.lockOptions = response.locks;
        this.open = true;
        this.title = "添加尾箱柜";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const deviceId = row.deviceId || this.ids;
      getInfo(deviceId).then(response => {
        this.form = response.data;
        this.lockOptions = response.locks;
        this.form.lockIds = response.lockIds;
        this.open = true;
        this.title = "修改尾箱柜";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deviceId != undefined) {
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
      const deviceIds = row.deviceId || this.ids;
      this.$confirm("是否确认删除尾箱柜数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return delInfo(deviceIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
     /** 停运按钮操作 */
    handleOutage(row) {
      const deviceIds = row.deviceId || this.ids;
      this.$confirm("是否停云/启用尾箱柜?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return outage(deviceIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("操作成功");
        })
        .catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const ids = this.ids == "" ? null : this.ids;
      const queryParams = this.queryParams;
      const message =
        this.ids == ""
          ? "是否确认导出所有尾箱柜数据项?"
          : "是否确认导出选择的尾箱柜数据项?";
      this.$confirm(message, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportInfo(queryParams, ids);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>