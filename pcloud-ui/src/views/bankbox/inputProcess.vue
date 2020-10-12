<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="所属机构" prop="orgId">
       <treeselect
                v-model="queryParams.orgId"
                :options="deptOptions"
                clearable
                placeholder="请选择"
                style="width:200px"
              />
      </el-form-item>
  
        <el-form-item label="归还状态" prop="status">
        <el-select v-model="queryParams.status"  clearable>
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
          v-hasPermi="['bankbox:inputProcess:add']"
        >归还</el-button>
      </el-col>
       <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleDelete"
          v-hasPermi="['bankbox:outputProcess:remove']"
        >删除</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="processList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属机构" align="center"  prop="dept.deptName" />
      <el-table-column label="尾箱柜设备" align="center" prop="deviceId" />
      <el-table-column label="钞箱" align="center" prop="cashBoxId" />
      <el-table-column label="钞箱数量" align="center" prop="quantity" />
      <el-table-column label="申请人员" align="center" :formatter="applyUser" />
      <el-table-column label="申请日期" align="center" prop="applyDatatime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyDatatime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="复核人员" align="center" :formatter="reviewUser" />
      <el-table-column label="复核日期" align="center" prop="reviewDatatime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.reviewDatatime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人员" align="center" :formatter="approvalUser" />
      <el-table-column label="审批日期" align="center" prop="approvalDatatime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.approvalDatatime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="归还结果" align="center" prop="result" />
      <el-table-column label="归还状态" align="center" :formatter="statusFormat" />
      <el-table-column label="计划还箱人" align="center" :formatter="planInputUser"/>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center"  width="200"  class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div style="display:inline-block;" v-if="scope.row.toApplyUserId">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bankbox:inputProcess:edit']"
          >修改</el-button>
      </div>
      <div style="display:inline-block;" v-if="scope.row.status=='3'">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleReApply(scope.row)"
            v-hasPermi="['bankbox:inputProcess:reApply']"
          >重新归还</el-button>
      </div>
      <div style="display:inline-block;" v-if="scope.row.toReviewUser&&(scope.row.result=='' || scope.row.result==null)">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleRec(scope.row)"
            v-hasPermi="['bankbox:inputProcess:recheck']"
          >复核</el-button>
      </div>
      <div style="display:inline-block;" v-if="scope.row.toApprovalUser">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleRec(scope.row)"
            v-hasPermi="['bankbox:inputProcess:approve']"
          >审批</el-button>
      </div>
      <div style="display:inline-block;" v-if="scope.row.toApplyUserId">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bankbox:inputProcess:remove']"
          >删除</el-button>
      </div>
      <div style="display:inline-block;">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['bankbox:inputProcess:query']"
          >查看</el-button>
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

    <!-- 添加或修改归还流程对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
        <el-form-item label="所属机构"  prop="orgId">
              <treeselect
                v-model="form.orgId"
                :options="deptOptions"
                clearable
                disabled
                placeholder="请选择"
                style="width:200px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
        <el-form-item label="尾箱柜设备" prop="deviceId">
         <el-select
                v-model="form.deviceId"
                @change="selectBoxByDeviceId($event)"
                clearable
                placeholder="请选择"
              >
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
       <el-form-item label="钞箱："  prop="cashboxs">
              <el-select v-model="form.cashboxs"  multiple clearable>
                <el-option
                  v-for="item in cashBoxOptions"
                  :key="item.cashBoxId"
                  :label="item.boxName"
                  :value="item.cashBoxId"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-col>
        
          <el-col :span="12">
        <el-form-item label="申请人员" prop="applyUserId">
          <el-select v-model="form.applyUserId"  clearable placeholder="请选择">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="申请日期" prop="applyDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.applyDatatime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择申请日期">
          </el-date-picker>
        </el-form-item>
        </el-col> -->
          <el-col :span="12">
        <el-form-item label="复核人员" prop="reviewUserId">
           <el-select v-model="form.reviewUserId"  clearable placeholder="请输入复核人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="复核日期" prop="reviewDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.reviewDatatime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择复核日期">
          </el-date-picker>
        </el-form-item>
        </el-col> -->
          <el-col :span="12">
        <el-form-item label="审批人员" prop="approvalUserId">
          <el-select v-model="form.approvalUserId"  clearable placeholder="请输入审批人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="审批日期" prop="approvalDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.approvalDatatime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择审批日期">
          </el-date-picker>
        </el-form-item>
        </el-col> -->
         
          <el-col :span="12">
        <el-form-item label="归还状态">
          <el-select v-model="form.status" disabled  clearable>
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
         <el-col :span="12">
        <el-form-item label="归箱人员" prop="approvalUserId">
          <el-select v-model="form.planInputUserId"  clearable placeholder="请选择归箱人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="父流程id" prop="pid">
          <el-input v-model="form.pid" placeholder="请输入父流程id" />
        </el-form-item>
        </el-col> -->
          <el-col :span="12">
        <el-form-item label="计划归还时间" prop="planInputTime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.planInputTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="计划归还时间">
          </el-date-picker>
        </el-form-item>
        </el-col>
        </el-row>
        <el-form-item label="归还结果：" prop="result">
          <el-input class="text" disabled type="textarea" v-model="form.result"/>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input class="text"  type="textarea" v-model="form.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

     <!-- 查看 -->
    <el-dialog :title="title" :visible.sync="openView" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
        <el-form-item label="所属机构"  prop="orgId">
              <treeselect
                v-model="form.orgId"
                :options="deptOptions"
                clearable
                disabled
                placeholder="请选择"
                style="width:200px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
        <el-form-item label="尾箱柜设备" prop="deviceId">
         <el-select
                v-model="form.deviceId"
                @change="selectBoxByDeviceId($event)"
                clearable
                disabled
                placeholder="请选择"
              >
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
       <el-form-item label="钞箱："  prop="cashboxs">
              <el-select v-model="form.cashboxs" disabled multiple clearable>
                <el-option
                  v-for="item in cashBoxOptions"
                  :key="item.cashBoxId"
                  :label="item.boxName"
                  :value="item.cashBoxId"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-col>
        
          <el-col :span="12">
        <el-form-item label="申请人员" prop="applyUserId">
          <el-select v-model="form.applyUserId" disabled  clearable placeholder="请选择">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="申请日期" prop="applyDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.applyDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="复核人员" prop="reviewUserId">
           <el-select v-model="form.reviewUserId" disabled clearable placeholder="请输入复核人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="复核日期" prop="reviewDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.reviewDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="审批人员" prop="approvalUserId">
          <el-select v-model="form.approvalUserId" disabled clearable placeholder="请输入审批人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="审批日期" prop="approvalDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.approvalDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
         
          <el-col :span="12">
        <el-form-item label="归还状态">
          <el-select v-model="form.status" disabled  clearable>
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
         <el-col :span="12">
        <el-form-item label="归箱人员" prop="approvalUserId">
          <el-select v-model="form.planInputUserId" disabled clearable placeholder="请选择归箱人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="父流程id" prop="pid">
          <el-input v-model="form.pid" placeholder="请输入父流程id" />
        </el-form-item>
        </el-col> -->
          <el-col :span="12">
        <el-form-item label="计划归还时间" prop="planInputTime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.planInputTime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
        </el-row>
        <el-form-item label="归还结果：" prop="result">
          <el-input class="text" type="textarea" disabled v-model="form.result"/>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input class="text" disabled type="textarea" v-model="form.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openView = false" style="color: #4194f6;background: none;border-color: #4194f6;">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 复核审批 -->
    <el-dialog :title="title" :visible.sync="openRec" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
        <el-form-item label="所属机构"  prop="orgId">
              <treeselect
                v-model="form.orgId"
                :options="deptOptions"
                clearable
                disabled
                placeholder="请选择"
                style="width:200px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
        <el-form-item label="尾箱柜设备" prop="deviceId">
         <el-select
                v-model="form.deviceId"
                @change="selectBoxByDeviceId($event)"
                clearable
                disabled
                placeholder="请选择"
              >
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
       <el-form-item label="钞箱："  prop="cashboxs">
              <el-select v-model="form.cashboxs" disabled multiple clearable>
                <el-option
                  v-for="item in cashBoxOptions"
                  :key="item.cashBoxId"
                  :label="item.boxName"
                  :value="item.cashBoxId"
                ></el-option>
              </el-select>
            </el-form-item>
        </el-col>
        
          <el-col :span="12">
        <el-form-item label="申请人员" prop="applyUserId">
          <el-select v-model="form.applyUserId" disabled  clearable placeholder="请选择">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="申请日期" prop="applyDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.applyDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="复核人员" prop="reviewUserId">
           <el-select v-model="form.reviewUserId" disabled clearable placeholder="请输入复核人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="复核日期" prop="reviewDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.reviewDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="审批人员" prop="approvalUserId">
          <el-select v-model="form.approvalUserId" disabled clearable placeholder="请输入审批人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <el-col :span="12">
        <el-form-item label="审批日期" prop="approvalDatatime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.approvalDatatime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
         
          <el-col :span="12">
        <el-form-item label="归还状态">
          <el-select v-model="form.status" disabled  clearable>
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
         <el-col :span="12">
        <el-form-item label="归箱人员" prop="approvalUserId">
          <el-select v-model="form.planInputUserId" disabled clearable placeholder="请选择归箱人员">
                <el-option
                  v-for="item in reviewUserOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                ></el-option>
              </el-select>
        </el-form-item>
        </el-col>
          <!-- <el-col :span="12">
        <el-form-item label="父流程id" prop="pid">
          <el-input v-model="form.pid" placeholder="请输入父流程id" />
        </el-form-item>
        </el-col> -->
          <el-col :span="12">
        <el-form-item label="计划归还时间" prop="planInputTime">
          <el-date-picker clearable  style="width: 200px"
            v-model="form.planInputTime"
            type="datetime"
            disabled
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="">
          </el-date-picker>
        </el-form-item>
        </el-col>
        </el-row>
        <el-form-item label="归还结果：" prop="result">
          <el-input class="text" type="textarea"  v-model="form.result"/>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input class="text" disabled type="textarea" v-model="form.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary"  @click="submitFormpass">通过</el-button>
        <el-button type="primary" style="color: FFFFFF;background: #EF9C57;" @click="submitFormback">不通过</el-button>
        <el-button @click="openRec = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProcess, getProcess, delProcess, addProcess, updateProcess, exportProcess,backProcess,
  passProcess, reApplyProcess} from "@/api/bankbox/inputProcess";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { validateIP } from "@/utils/validate";
import { getDeviceList } from "@/api/devicebox/device/device";
import { getBoxList } from "@/api/devicebox/cashbox/cashbox";
import { listUser,listByDeptId } from "@/api/system/user";
import {getdeptAndUser} from "@/api/bankbox/outputProcess";
export default {
   components: { Treeselect },
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
      // 归还流程表格数据
      processList: [],
       //尾箱柜
      deviceOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
       // 部门树选项
      deptOptions: undefined,
      //状态
      statusOptions: [],
      //复核人员
      reviewUserOptions: [],
       //尾箱
      cashBoxOptions: [],
       // 登录人
      loginUser: undefined,
      openView: false,
      openRec: false,
      open: false,
       //是否为重新申领
      isReApply:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        quantity: undefined,
        applyUserId: undefined,
        applyDatatime: undefined,
        reviewUserId: undefined,
        reviewDatatime: undefined,
        approvalUserId: undefined,
        approvalDatatime: undefined,
        result: undefined,
        status: undefined,
        pid: undefined,
        planInputUserId: undefined,
        planInputTime: undefined,
        lastModifyTime: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
     treeselect().then(response => {
      this.deptOptions = response.data;
    });
    //复核人员
    listByDeptId().then(response => {
      this.reviewUserOptions = response.listByDeptId;
    });
     this.getDicts("output_status").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
     //列表申请人
    applyUser(row, column) {
      var actions = [];
      Object.keys(this.reviewUserOptions).map(key => {
        if (this.reviewUserOptions[key].userId == "" + row.applyUserId) {
          actions.push(this.reviewUserOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },

reviewUser(row, column) {
      var actions = [];
      Object.keys(this.reviewUserOptions).map(key => {
        if (this.reviewUserOptions[key].userId == "" + row.reviewUserId) {
          actions.push(this.reviewUserOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },
    approvalUser(row, column) {
      var actions = [];
      Object.keys(this.reviewUserOptions).map(key => {
        if (this.reviewUserOptions[key].userId == "" + row.approvalUserId) {
          actions.push(this.reviewUserOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },
    planInputUser(row, column) {
      var actions = [];
      Object.keys(this.reviewUserOptions).map(key => {
        if (this.reviewUserOptions[key].userId == "" + row.planInputUserId) { 
          actions.push(this.reviewUserOptions[key].nickName);
          return false;
        }
      });
      return actions.join("");
    },
    selectBoxByDeviceId(val) {
      //根据尾箱柜id获取相应的尾箱
      this.form.cashBoxId = "";
      this.cashBoxOptions = [];
      this.form.cashboxs="";
      if (val != null && val != "" && val != undefined) {
        getBoxList(val,"2").then(response => {//选择可归还的尾箱
          //给尾箱柜下拉框赋值
          this.cashBoxOptions = response.cashBoxOptions;
        });
      }
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    /** 查询归还流程列表 */
    getList() {
      this.loading = true;
      listProcess(this.queryParams).then(response => {
        this.processList = response.rows;
        this.total = response.total;
        this.loginUser = response.user;
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
        inputProcessId: undefined,
        orgId: undefined,
        deviceId: undefined,
        cashBoxId: undefined,
        quantity: undefined,
        applyUserId: undefined,
        applyDatatime: undefined,
        reviewUserId: undefined,
        reviewDatatime: undefined,
        approvalUserId: undefined,
        approvalDatatime: undefined,
        result: undefined,
        status: "0",
        pid: undefined,
        planInputUserId: undefined,
        planInputTime: undefined,
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
      this.ids = selection.map(item => item.inputProcessId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form.deviceId = "";
      this.form.cashBoxId = ""; //清除
      this.reset();
      this.open = true;
      this.title = "添加归还流程";
      getdeptAndUser().then(response =>{
        console.log(response.deptLogin)
        this.form.orgId=response.deptLogin.deptId;
        this.form.applyUserId=response.applyUser.userId;
        this.form.planInputUserId=response.applyUser.userId;

         getDeviceList(response.deptLogin.deptId).then(response => {
          //给尾箱柜下拉框赋值
          this.deviceOptions = response.deviceInfos;
        });

      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const inputProcessId = row.inputProcessId || this.ids
      getProcess(inputProcessId).then(response => {
        this.form = response.data;
        this.cashBoxOptions=response.cashboxList;
        this.deviceOptions=response.deviceList;
        this.form.cashboxs = response.cashboxs;
        this.open = true;
        this.title = "修改归还流程";
      });
    }, 
    /** 重新归还按钮操作 */
    handleReApply(row) {
      this.reset();
      const inputProcessId = row.inputProcessId || this.ids;
      getProcess(inputProcessId).then(response => {
        this.form = response.data;
        this.cashBoxOptions=response.cashboxList;
        this.deviceOptions=response.deviceList;
        this.form.cashboxs = response.cashboxs;
        this.open = true;
        this.title = "重新归还流程";
        this.isReApply=true;
      });
    },
    submitFormback: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.inputProcessId != undefined&&(this.form.result!=='' && this.form.result!==null)) {
            backProcess(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("回退修改成功");
                this.openRec = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else{
            this.msgError("如未通过，归还结果必填");
          }
          }
      })
     },
    submitFormpass: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.inputProcessId != undefined&&(this.form.result=='' || this.form.result==null)) {
            passProcess(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("审核修改成功");
                this.openRec = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }else{
            this.msgError("如通过，不要填写归还结果");
          }
          }
      })
     },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.inputProcessId != undefined&&!this.isReApply) {
            updateProcess(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }else if (this.form.inputProcessId != undefined&&this.isReApply){
            reApplyProcess(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("重建成功");
                this.open = false;
                this.openRec = false;
                this.getList();
                this.isReApply=false;
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addProcess(this.form).then(response => {
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
      const inputProcessIds = row.inputProcessId || this.ids;
      this.$confirm('是否确认删除归还流程编号为"' + inputProcessIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delProcess(inputProcessIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    handleRec(row){
      
      const inputProcessId = row.inputProcessId || this.ids;
      getProcess(inputProcessId).then(response => {
      this.form = response.data;
      this.cashBoxOptions=response.cashboxList;
      this.deviceOptions=response.deviceList;
      this.form.cashboxs = response.cashboxs;
      //this.form = row;
      this.openRec = true;
      this.title = "";
      });
    },
     handleView(row){
      
      const inputProcessId = row.inputProcessId || this.ids;
      getProcess(inputProcessId).then(response => {
      this.form = response.data;
      this.cashBoxOptions=response.cashboxList;
      this.deviceOptions=response.deviceList;
      this.form.cashboxs = response.cashboxs;
      //this.form = row;
      this.openView = true;
      this.title = "查看详情";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有归还流程数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportProcess(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
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