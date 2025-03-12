<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { UserInfo } from '../types/types';
import host from '../config/hostname';
import { useUserStore } from '../store/index'
import { ElMessage } from 'element-plus';
import axiosService from "../utils/axios-test"
const userStore = useUserStore()

const hostname = host()
const userInfo = ref<UserInfo>({
    id: 0,
    username: '',
    email: '',
    organization: '',
    avatarUrl: ''
})
//利用本地缓存初始化userInfo
if (userStore.$state.userInfo) {
    userInfo.value = {
        id: userStore.$state.userInfo.id,
        username: userStore.$state.userInfo.username,
        email: userStore.$state.userInfo.email,
        organization: userStore.$state.userInfo.organization,
        avatarUrl: userStore.$state.userInfo.avatarUrl
    };
}

const isEditing = ref(false);
const showAvatarDialog = ref(false);
const selectedFile = ref<File | null>(null);
const avatarPreview = ref('');


// 进入编辑模式
const enterEditMode = () => {

    isEditing.value = true;
};

// 保存用户信息
const saveUserInfo = async () => {
    // 若未修改任何信息，不执行保存操作
    if (userInfo.value.username === userStore.$state.userInfo?.username && userInfo.value.organization === userStore.$state.userInfo?.organization) {
        return;
    }

    // 若 username 或 organization 为空，弹出提示并返回
    if (!userInfo.value.username ||!userInfo.value.organization) {
        ElMessage.error('用户名和机构不能为空');
        return;
    }

    // 若 organization 已存在，弹出提示并返回
    userInfo.value.username = userInfo.value.username
    userInfo.value.organization = userInfo.value.organization
    localStorage.setItem('userinfo', JSON.stringify(userInfo.value))
    userStore.updatUser()
    isEditing.value = false;    
    return

    try {
        // 调用更新用户信息接口
        await axiosService.post(hostname + '/api/user/update', {
            userId: userStore.$state.currentUser?.id,
            username: userInfo.value.username,
            organization: userInfo.value.organization
        });
        // 若更新成功，更新本地用户信息
        userInfo.value.username = userInfo.value.username;
        userInfo.value.organization = userInfo.value.organization;
        localStorage.setItem('userinfo', JSON.stringify(userInfo.value))


        // 关闭编辑模式
        isEditing.value = false;
    } catch (error) {
        console.error('保存失败:', error);
    }
};

// 打开头像上传对话框
const openAvatarDialog = () => {
    showAvatarDialog.value = true;
    selectedFile.value = null;
    avatarPreview.value = '';
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    console.log(file);
    if (file) {
        selectedFile.value = file;
        avatarPreview.value = URL.createObjectURL(file);
        
        console.log(avatarPreview.value);
    }
};

// 上传头像
const uploadAvatar = async () => {
    if (!selectedFile.value) return;

    const formData = new FormData();
    formData.append('multipartFile', selectedFile.value);
    // for (const pair of formData.entries()) {
    //     console.log(pair[0], pair[1], "ffrfffff");
    // }
    try {
        // 调用头像上传接口
        const response = await axiosService.post('/api/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        userInfo.value.avatarUrl = response.data.url;
        showAvatarDialog.value = false;
        if (response.data.code == 200) {
            ElMessage.success("头像上传成功！")
        } else {
            ElMessage.error(response.data.msg)
        }
    } catch (error) {   
        ElMessage.error('头像上传失败：' + error);
        console.error('头像上传失败:', error);
    }
};

</script>

<template>
    <div class="settings-container">
        <h2>个人设置</h2>

        <!-- 头像编辑 -->
        <div class="setting-item avatar-section">
            <img class="avatar" :src="userInfo.avatarUrl" alt="用户头像" />
            <button class="edit-button" @click="openAvatarDialog">更换头像</button>
        </div>

        <!-- 用户信息编辑 -->
        <div class="info-section">
            <div class="setting-item">
                <label>用户名</label>
                <input v-if="isEditing" v-model="userInfo.username">
                <span v-else>{{ userInfo.username }}</span>
            </div>

            <div class="setting-item">
                <label>所属组织</label>
                <input v-if="isEditing" v-model="userInfo.organization">
                <span v-else>{{ userInfo.organization }}</span>
                </div>

            <div class="setting-item">
                <label>邮箱</label>
                <span>{{ userInfo.email }}</span>
                <div class="help-icon" title="邮箱用于绑定账户，无法修改">?</div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
            <template v-if="!isEditing">
                <button class="primary-button" @click="enterEditMode">编辑信息</button>
            </template>
            <template v-else>
                <button class="secondary-button" @click="isEditing = false">取消</button>
                <button class="primary-button" @click="saveUserInfo">保存修改</button>
            </template>
        </div>

        <!-- 头像上传对话框 -->
        <div v-if="showAvatarDialog" class="dialog-mask">
            <div class="dialog-content">
                <h3>上传新头像</h3>
                <div class="avatar-preview">
                    <img v-if="avatarPreview" :src="avatarPreview" alt="预览" />
                    <div v-else class="placeholder">选择图片预览</div>
                </div>
                <label class="file-upload">
                    <input type="file" accept="image/*" @change="handleFileSelect">
                    选择文件
                </label>
                <div class="dialog-actions">
                    <button @click="showAvatarDialog = false">取消</button>
                    <button :disabled="!selectedFile" @click="uploadAvatar">上传</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-container {
    position: relative;
    top: 4rem;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
    color: #1a1a1a;
    margin-bottom: 2rem;
}

.setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.setting-item label {
    width: 120px;
    color: #666;
    font-weight: 500;
}

.avatar-section {
    flex-direction: column;
    align-items: flex-center;
    gap: 1rem;
}

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e9ecef;
}

.info-section {
    margin: 2rem 0;
}

input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #aecdec;
    border-radius: 4px;
    font-size: 1rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.primary-button {
    background: #1677ff;
    color: white;
}

.primary-button:hover {
    background: #1456cb;
}

.secondary-button {
    background: #f0f2f5;
    color: #666;
}

.secondary-button:hover {
    background: #e5e7eb;
}

.dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
}

.avatar-preview {
    width: 200px;
    height: 200px;
    border: 2px dashed #ced4da;
    margin: 1rem auto;
    border-radius: 50%;
    overflow: hidden;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
}

.file-upload {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #f0f2f5;
    border-radius: 4px;
    cursor: pointer;
    margin: 1rem 0;
}

.file-upload input {
    display: none;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}
</style>