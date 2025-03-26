<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage } from 'element-plus';


// 路由器实例
const router = useRouter();
// 用户存储
const userStore = useUserStore();

// 表单数据
const userName = ref('');
const password = ref('');
const loading = ref(false);

// 处理登录
const handleLogin = async () => {
  if (!userName.value || !password.value) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }

  loading.value = true;
  try {
    const res = await userStore.login(userName.value, password.value);

    if (res == 200) {
      ElMessage.success('登录成功');
      router.push('/modelfile');
    } else {
      //请求失败的返回

      ElMessage.error(res);
    }
  } catch (error) {
    ElMessage.error('登录失败，请重试');
  } finally {
    loading.value = false;
  }
};




// 跳转到注册页面
const handleRegister = () => {
  router.push('/register');
};

// 跳转到找回密码页面
const handleForgotPassword = () => {
  router.push('/forgot-password');
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>电子病历撰写系统</h2>
        <p>病历撰写数字化平台</p>
      </div>
      <div class="login-form">
        <div class="form-item">
          <span style="display: inline-block;padding-right: 2%;">邮箱✉️:</span>
          <input type="text" v-model="userName" placeholder="请输入邮箱" />
        </div>

        <div class="form-item">
          <span style="display: inline-block;padding-right: 2%;">密码🔒:</span>
          <input type="password" v-model="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
        </div>


        <div class="form-btn">
          <button :disabled="loading" @click="handleLogin" class="login-btn">
            <span class="btn-text">{{ loading ? '登录中...' : '登录' }}</span>
          </button>
        </div>

        <div class="register-btn">
          <button @click="handleRegister" style="width: 80px; height: 35px; font-size: 12px;">
            <span class="btn-text">注册</span>
          </button>
        </div>

        <div class="find-btn">
          <button @click="handleForgotPassword" style="width:80px; height: 35px;font-size: 12px;">
            <span class="btn-text">找回密码</span>
          </button>
        </div>


        <div class="login-tips">
          <p>提示： 用户名 doctor@126.com，密码 password</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

p {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

.login-box {
  width: 600px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s ease;
  transform-origin: center;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 10px;
  animation: fadeInDown 0.8s ease;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header p {
  font-size: 14px;
  color: #999;
  animation: fadeInDown 0.8s ease;
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.login-form {
  /* text-align: center; */
  animation: fadeIn 0.8s ease;
  animation-delay: 0.5s;
  animation-fill-mode: both;
}

.form-btn {
  width: 520px;
  padding-left: 120px;
  padding-top: 20px;
}

.form-item {
  margin-bottom: 24px;
  animation: fadeInUp 0.8s ease;
  animation-delay: calc(0.4s + var(--index, 0) * 0.1s);
  animation-fill-mode: both;
}

.form-item:nth-child(1) {
  --index: 1;
}

.form-item:nth-child(2) {
  --index: 2;
}

.form-item:nth-child(3) {
  --index: 3;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
}

.form-item input {
  width: 380px;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
}

.form-item input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.login-btn {
  width: 250px;
  height: 40px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.register-btn {
  position: relative;
  bottom: 60px;
  left: 450px;
}

.find-btn {
  padding: 0;
  position: relative;
  left: 450px;
  bottom: 50px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.login-btn:hover::before {
  width: 300px;
  height: 300px;
}

.login-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.login-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-tips {
  text-align: center;
  font-size: 12px;
  color: #999;
  animation: fadeIn 0.8s ease;
  animation-delay: 0.7s;
  animation-fill-mode: both;


}
</style>