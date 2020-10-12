<template>
  <div class="login">
    <el-form ref="form" :model="form" :rules="formRules" class="login-form">
      <h3 class="title">新用户注册</h3>
      <el-form-item prop="userName">
        <el-input v-model="form.userName" type="text" auto-complete="off" placeholder="请输入账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          auto-complete="off"
          placeholder="请输入密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.repassword"
          type="password"
          auto-complete="off"
          placeholder="请再次输入密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>

       <el-form-item>
         <el-link type="primary" href="/login" :underline="false">账号登录</el-link>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width:100%;"
          @click.native.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2019-2020 tsara-ipfs.com All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { register } from '@/api/system/user'

export default {
  name: "Register",
  data() {
    var validatePass = (rule, value, callback) => {
        if (value === '') {
                callback(new Error('请输入密码'));
        } else {
          if (this.form.password && this.form.repassword&& this.form.password !== this.form.repassword) {
              // this.$refs.form.validateField('repassword');
              callback(new Error('两次输入密码不一致'));
          }else{
              callback();
          }
        }
      };
    return {
      form: {
        userName: "",
        password: "",
        repassword: ""
      },
      formRules: {
        userName: [
          { required: true, trigger: "blur", message: "账号不能为空" }
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      loading: false,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
  },
  methods: {
    handleRegister() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
          register(this.form).then(() => {
              this.loading = false;
              this.$router.push({ path: this.redirect || "/login" });
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/image/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
