<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>

      <div class="tips">
        <span style="margin-right:20px;">username: admin</span>
        <span> password: password</span>
      </div>

    </el-form>

    <el-dialog title="动态口令认证" :visible.sync="dialogTableVisible" @close="handleDialogClose">
      <el-steps :active="active" finish-status="success">
        <el-step title="下载应用"></el-step>
        <el-step title="绑定账号"></el-step>
        <el-step title="验证账号"></el-step>
      </el-steps>

     <div>
       <div class="info" v-if="active === 1">
         <div>
           <p>当前账号未绑定令牌APP，请前往各应用市场下载并安装令牌APP，推荐下载Google身份验证器进行认证操作。</p>
           <div style="text-align: center;">
             <img src="@/assets/images/google-auth.png" style="width: 100px;height: 100px;border-radius: 10px;">
           </div>
         </div>
         <div style="text-align: right; margin: 0">
           <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
         </div>
       </div>

       <div class="info" v-if="active === 2">
         <p>请使用令牌APP进行扫码绑定</p>
         <div style="text-align: center;">
           <img v-bind:src="qrCode" style="margin: 0 auto"/>
         </div>
         <div style="text-align: right; margin: 0">
           <el-button style="margin-top: 12px;" @click="previous">上一步</el-button>
           <el-button style="margin-top: 12px;" @click="next">下一步</el-button>
         </div>
       </div>

       <div class="info" v-if="active === 3">
         <div style="text-align: center; margin: 20px auto">
           <el-input
             :key="passwordType"
             v-model="loginForm.code"
             :type="passwordType"
             placeholder="请输入动态口令"
             name="code"
             tabindex="2"
             auto-complete="on"
             style="width: 50%"
           />
         </div>
         <div style="text-align: right; margin: 0">
           <el-button style="margin-top: 12px;" @click="previous">上一步</el-button>
           <el-button :loading="loading" type="primary" style="margin-top: 12px;" @click.native.prevent="handleLogin">确定</el-button>
         </div>
       </div>
     </div>
    </el-dialog>

    <el-dialog title="动态口令认证" :visible.sync="dialogDynamicPasswordVisible" width="30%" @close="handleDialogClose">
      <div class="info" style="width: 70%;margin: 0 auto">
          <el-input
            :key="passwordType"
            v-model="loginForm.code"
            :type="passwordType"
            placeholder="请输入动态口令"
            name="code"
            tabindex="2"
            auto-complete="on"
          />
        <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;margin-top: 10px" @click.native.prevent="handleLogin">确定</el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The code can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: 'password',
        code: ''
      },
      loginRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}],
        code: [{required: true, trigger: 'blur', validator: validateCode}]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      active: 1,
      dialogTableVisible: false,
      dialogDynamicPasswordVisible: false,
      qrCode: '',
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then((res) => {
            if(!res.token && res.mfa === 'bind') {
              this.qrCode = res.qrCode
              this.active = 1
              this.dialogTableVisible = true
            }
            if(!res.token && res.mfa === 'enable') {
              this.dialogDynamicPasswordVisible = true
            }
            this.$router.push({path: this.redirect || '/'})
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    next() {
      if (this.active++ > 3) this.active = 1;
    },
    previous() {
      this.active--
    },
    handleDialogClose(){
      this.loginForm.code = ''
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .login-form {

    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }

    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }
}

.info {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 100%;
    border-bottom: #20a0ff 1px solid;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: #000000;
      height: 47px;
      caret-color: #000000;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
