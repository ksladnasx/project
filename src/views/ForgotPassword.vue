<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import verifyCode from '../tools/verifyCode';
import axiosService from "../utils/axios-test"


// 路由器实例
const router = useRouter();


// 邮箱验证表单数据
const emailForm = reactive({
  email: '',
  verificationCode: ''
});

// 重置密码表单数据
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
});

// 表单验证状态
const formErrors = reactive({
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
});

// 验证码计时器
const countdown = ref(0);
const countdownTimer = ref<number | null>(null);

// 发送验证码
const sendVerificationCode = async () => {
  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailForm.email) {
    formErrors.email = '请输入邮箱地址';
    return;
  } else if (!emailRegex.test(emailForm.email)) {
    formErrors.email = '请输入有效的邮箱地址';
    return;
  }

  // 发送验证码
  try {
        
        const response = await axiosService.post('/auth/captcha/email', {
            email: emailForm.email
        });
        console.log(response.data.code)
        console.log(response.data)

        if (response.data.code == 200) {
            ElMessage.success('验证码已发送到您的邮箱');

            // 开始倒计时
            countdown.value = 60;
            if (countdownTimer.value) {
                clearInterval(countdownTimer.value);
            }
            countdownTimer.value = window.setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    if (countdownTimer.value) {
                        clearInterval(countdownTimer.value);
                        countdownTimer.value = null;
                    }
                }
            }, 1000);

        } else {
            const message = response.data.msg;
            ElMessage.error(message);
        }
        // 发送验证码   
    } catch (e) {
        ElMessage.error('验证码请求失败');
        console.log(e);
    }
};


// 重置密码
const resetPassword = async () => {
  // 验证密码
  if (!passwordForm.password) {
    formErrors.password = '请输入新密码';
    return;
  } else if (passwordForm.password.length < 6) {
    formErrors.password = '密码长度不能少于6个字符';
    return;
  }

  // 验证确认密码
  if (!passwordForm.confirmPassword) {
    formErrors.confirmPassword = '请确认新密码';
    return;
  } else if (passwordForm.confirmPassword !== passwordForm.password) {
    formErrors.confirmPassword = '两次输入的密码不一致';
    return;
  }


  // 重置密码的请求
  const response = await axiosService.post("/auth/update", {
    email: emailForm.email,
    password: passwordForm.password,
    emailVerifyCode: emailForm.verificationCode
  })
  // ElMessage.error(response.data.msg);
  if (response.data.code == 200) {
    ElMessage.success('密码重置成功，请使用新密码登录');
    router.push('/login');
  } else {
    ElMessage.error(response.data.msg);
  }

};

// 返回登录页
const goToLogin = () => {
  router.push('/login');
};

</script>

<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <div class="forgot-password-header">
        <h2>找回密码</h2>
        <p>我们将帮助您重置密码</p>
      </div>


      <div class="step-content">
        <div class="form-item">
          <label>邮箱地址 <span class="required">*</span></label>
          <input type="email" v-model="emailForm.email" placeholder="请输入您注册时使用的邮箱" @focus="formErrors.email = ''" />
          <div class="error-message" v-if="formErrors.email">{{ formErrors.email }}</div>
        </div>


        <div class="form-item">
          <label>新密码 <span class="required">*</span></label>
          <input type="password" v-model="passwordForm.password" placeholder="请输入新密码"
            @focus="formErrors.password = ''" />

          <!-- 错误提示 -->
          <div class="error-message" v-if="formErrors.password">{{ formErrors.password }}</div>

        </div>

        <div class="form-item">
          <label>确认新密码 <span class="required">*</span></label>
          <input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码"
            @focus="formErrors.confirmPassword = ''" />
          <div class="error-message" v-if="formErrors.confirmPassword">{{ formErrors.confirmPassword }}</div>
        </div>
        <div class="form-item verification-code">
          <label>验证码 <span class="required">*</span></label>
          <div class="verification-input">
            <input type="text" v-model="emailForm.verificationCode" placeholder="请输入验证码"
              @focus="formErrors.verificationCode = ''" />
            <button class="send-code-btn" @click="sendVerificationCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码' }}
            </button>
          </div>

          <!-- 错误提示 -->
          <div class="error-message" v-if="formErrors.verificationCode">{{ formErrors.verificationCode }}</div>

        </div>

        <div class="form-actions">
          <button class="submit-btn" @click="resetPassword">重置密码</button>
          <button class="back-btn" @click="goToLogin">返回登录</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-container {
  height: 100vh;
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

.forgot-password-box {
  width: 450px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s ease;
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

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-password-header h2 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 10px;
}

.forgot-password-header p {
  font-size: 14px;
  color: #999;
}

/* 步骤指示器样式 */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: #1890ff;
  color: white;
}

.step.completed .step-number {
  background-color: #52c41a;
  color: white;
}

.step-text {
  font-size: 14px;
  color: #999;
  transition: all 0.3s;
}

.step.active .step-text,
.step.completed .step-text {
  color: #333;
  font-weight: bold;
}

.step-line {
  width: 100px;
  height: 2px;
  background-color: #f0f2f5;
  margin: 0 15px;
  transition: all 0.3s;
}

.step-line.active {
  background-color: #1890ff;
}

/* 表单样式 */
.step-content {
  animation: fadeIn 0.5s ease;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.required {
  color: #f56c6c;
}

.form-item input {
  width: 100%;
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

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.verification-input {
  display: flex;
  gap: 10px;
}

.verification-input input {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  height: 40px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.send-code-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.next-btn,
.submit-btn,
.back-btn {
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.next-btn,
.submit-btn {
  background-color: #1890ff;
  color: white;
  border: none;
}

.next-btn:hover,
.submit-btn:hover {
  background-color: #40a9ff;
}

.back-btn {
  background-color: white;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.back-btn:hover {
  background-color: #f0f7ff;
}
</style>