<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import host from '../config/hostname';
import axiosService from "../utils/axios-test"


//请求的主地址
const hostname = host()


// 路由器实例
const router = useRouter();

// 当前步骤
const currentStep = ref(1);


// 表单数据
const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
});

// 验证码相关
const captchaImage = ref('');
const captchaText = ref('');

// 表单验证状态
const formErrors = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
});



// 生成随机验证码
const generateCaptcha = () => {
    // 生成随机字符
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaText.value = captcha;

    // 创建验证码图片
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // 背景
        ctx.fillStyle = '#f0f2f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 文字
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Arial';
        ctx.textBaseline = 'middle';

        // 添加干扰线
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // 添加验证码文字
        for (let i = 0; i < captcha.length; i++) {
            ctx.fillStyle = `rgb(${Math.random() * 150},${Math.random() * 150},${Math.random() * 150})`;
            ctx.fillText(
                captcha.charAt(i),
                20 + i * 20,
                canvas.height / 2 + Math.random() * 8 - 4
            );
        }
    }

    // 转换为图片URL
    captchaImage.value = canvas.toDataURL('image/png');
};

// 表单验证
const validateForm = () => {
    let isValid = true;

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
        formErrors.email = '请输入邮箱地址';
        isValid = false;
    } else if (!emailRegex.test(formData.email)) {
        formErrors.email = '请输入有效的邮箱地址';
        isValid = false;
    } else {
        formErrors.email = '';
    }

    // 验证密码
    if (!formData.password) {
        formErrors.password = '请输入密码';
        isValid = false;
    } else if (formData.password.length < 6) {
        formErrors.password = '密码长度不能少于6个字符';
        isValid = false;
    } else {
        formErrors.password = '';
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
        formErrors.confirmPassword = '请确认密码';
        isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
        formErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
    } else {
        formErrors.confirmPassword = '';
    }

    // 验证验证码
    if (!formData.captcha) {
        formErrors.captcha = '请输入验证码';
        isValid = false;
    } else if (formData.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
        formErrors.captcha = '验证码不正确';
        isValid = false;
    } else {
        formErrors.captcha = '';
    }

    return isValid;
};


// 返回登录页
const goToEmail = () => {

    if (validateForm()) {
        ElMessage.warning('请验证邮箱');
        currentStep.value = 2;
    }
}

const goToPre = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
}
// 组件挂载时生成验证码
generateCaptcha();


// 邮箱验证表单数据
const emailForm = reactive({
    email: '',
    verificationCode: ''
});


// 表单验证状态
const EmailformErrors = reactive({
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
    // 发送验证码
    try {
        const response = await axiosService.post(hostname + '/auth/captcha/email' ,{
            email: emailForm.email
        });
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

// 验证邮箱和验证码
const verifyEmail = async () => {


    // 验证验证码
    try {
        const response = await axiosService.post(hostname + '/auth/register', {
            email: emailForm.email,
            password: formData.password,
            emailVerifyCode: emailForm.verificationCode
        });

        if (response.data.code == 200) {
            ElMessage.success('邮箱验证通过');

            // 存储 
            const user = {
                id: response.data.data.id,
                email: response.data.data.email,
                accessToken: response.data.tokens[0],
                refreshToken: response.data.tokens[1]
            }
            localStorage.setItem('user', JSON.stringify(user));

            // 跳转到首页
            router.push('/');


        } else {
            const message = response.data.msg;
            ElMessage.error(message);
        }
    } catch (e) {
        ElMessage.error('注册验证请求失败');
        console.log(e);
    }


    // 注册请求
    // const response = await axiosService.post('/auth/register', {

    // 验证通过，进入下一步
    ElMessage.success('注册成功');
    router.push('/login');
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
                <h2>注册</h2>
                <p>两步以完成您的注册</p>
            </div>

            <!-- 步骤指示器 -->
            <div class="steps">
                <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                    <div class="step-number">1</div>
                    <div class="step-text">注册信息</div>
                </div>
                <div class="step-line" :class="{ active: currentStep > 1 }"></div>
                <div class="step" :class="{ active: currentStep >= 2 }">
                    <div class="step-number">2</div>
                    <div class="step-text">验证邮箱</div>
                </div>
            </div>
            <!-- 步骤1：密码 -->
            <div v-if="currentStep === 1" class="step-content">
                <div class="register-form">
                    <div class="form-item">
                        <label>邮箱 <span class="required">*</span></label>
                        <input type="email" v-model="formData.email" placeholder="请输入邮箱地址"
                            @focus="formErrors.email = ''" />
                        <div class="error-message" v-if="formErrors.email">{{ formErrors.email }}</div>
                    </div>

                    <div class="form-item">
                        <label>密码 <span class="required">*</span></label>
                        <input type="password" v-model="formData.password" placeholder="请输入密码"
                            @focus="formErrors.password = ''" />
                        <div class="error-message" v-if="formErrors.password">{{ formErrors.password }}</div>
                    </div>

                    <div class="form-item">
                        <label>确认密码 <span class="required">*</span></label>
                        <input type="password" v-model="formData.confirmPassword" placeholder="请再次输入密码"
                            @focus="formErrors.confirmPassword = ''" />
                        <div class="error-message" v-if="formErrors.confirmPassword">{{ formErrors.confirmPassword }}
                        </div>
                    </div>

                    <div class="form-item captcha-container">
                        <label>验证码 <span class="required">*</span></label>
                        <div class="captcha-input-container">
                            <input type="text" v-model="formData.captcha" placeholder="请输入验证码"
                                @focus="formErrors.captcha = ''" />
                            <div class="captcha-image" @click="generateCaptcha">
                                <img :src="captchaImage" alt="验证码" />
                            </div>
                        </div>
                        <div class="error-message" v-if="formErrors.captcha">{{ formErrors.captcha }}</div>
                    </div>


                    <div class="form-actions">

                        <button class="next-btn" @click="goToEmail">下一步</button>
                        <button class="login-btn" @click="goToLogin">返回登录</button>
                    </div>
                </div>
            </div>



            <!-- 步骤2：邮箱验证 -->
            <div v-if="currentStep === 2" class="step-content">

                <div class="form-item">
                    <label>请验证您注册时使用的邮箱: <span style="font-size: 12px;display:block;text-align: right;">{{
                        formData.email }}</span></label>


                </div>

                <div class="form-item verification-code">
                    <label>验证码 <span class="required">*</span></label>
                    <div class="verification-input">
                        <input type="text" v-model="emailForm.verificationCode" placeholder="请输入验证码"
                            @focus="EmailformErrors.verificationCode = ''" />
                        <button class="send-code-btn" @click="sendVerificationCode" :disabled="countdown > 0">
                            {{ countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码' }}
                        </button>
                    </div>
                    <div class="error-message" v-if="EmailformErrors.verificationCode">{{
                        EmailformErrors.verificationCode }}</div>
                </div>

                <div class="form-actions">
                    <button class="pre-btn" @click="goToPre">上一步</button>
                    <button class="next-btn" @click="verifyEmail">注册</button>
                    <!-- <button class="back-btn" @click="goToLogin">返回登录</button> -->
                </div>
            </div>


        </div>
    </div>
</template>

<style scoped>
/* 注册页面的样式 */
.register-container {
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

.register-box {
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

.register-header {
    text-align: center;
    margin-bottom: 30px;
}

.register-header h2 {
    font-size: 28px;
    color: #1890ff;
    margin-bottom: 10px;
}

.register-header p {
    font-size: 14px;
    color: #999;
}

.register-form {
    animation: fadeIn 0.8s ease;
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

.captcha-container {
    margin-bottom: 30px;
}

.captcha-input-container {
    display: flex;
    align-items: center;
}

.captcha-input-container input {
    flex: 1;
    margin-right: 10px;
}

.captcha-image {
    width: 100px;
    height: 40px;
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    overflow: hidden;
}

.captcha-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.form-actions {
    display: flex;
    position: relative;
    top: 20px;
    flex-direction: column;
    gap: 15px;
}

.register-btn,
.login-btn {
    height: 40px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

.register-btn {
    background-color: #1890ff;
    color: white;
    border: none;
}

.register-btn:hover {
    background-color: #40a9ff;
}

.login-btn {
    background-color: white;
    color: #1890ff;
    border: 1px solid #1890ff;
}

.login-btn:hover {
    background-color: #f0f7ff;
}











/* 邮箱验证页面的样式 */
.form-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.register-btn,
.login-btn {
    height: 40px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

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
    font-size: 15px;
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

.pre-btn,
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