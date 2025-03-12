<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import axiosService from "../utils/axios-test"

const router = useRouter();

// 响应式数据
const templateName = ref('');
const templateType = ref('b类');
const fileList = ref<File[]>([]);
const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const loading = ref(false); // 加载状态

// 文件处理逻辑


// 点击上传处理
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleFile(input.files?.[0]);
  input.value = ''; // 清空输入以便重复选择相同文件
};
const handleFile = (file: File | undefined) => {
  if (!file) return;

  // 单文件限制：清空已有文件
  if (fileList.value.length >= 1) {
    fileList.value = [];
  }

  // 大小限制（示例添加50MB限制）
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    ElMessage.warning('文件大小不能超过50MB');
    return;
  }

  fileList.value.push(file);
};

// 修改拖拽处理（添加多文件过滤）
const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]); // 只取第一个文件
    if (files.length > 1) {
      ElMessage.warning('每次只能上传一个文件');
    }
  }
};

// 文件大小格式化显示
const formatSize = (size: number) => {
  const MB = size / (1024 * 1024);
  return MB >= 1 ? `${MB.toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`;
};

// 提交验证
// 提交逻辑
const handleSubmit = async () => {
  if (!templateName.value.trim()) {
    ElMessage.warning('请输入模板名称');
    return;
  }

  if (fileList.value.length === 0) {
    ElMessage.warning('请上传模板文件');
    return;
  }

  try {
    loading.value = true;

    const formData = new FormData();
    formData.append('templateName', templateName.value);
    formData.append('category', templateType.value);
    formData.append('multipartFile', fileList.value[0]);

    const response = await axiosService.post('/api/template/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // 如果需要认证可以取消注释下面这行
        'Authorization': `Bearer ${JSON.parse(sessionStorage.getItem('accessToken') || '""')}`
      },
      timeout: 30000 // 30秒超时
    });

    if (response.data.code === 200) { // 根据实际接口返回结构调整
      ElMessage.success('模板创建成功');
      router.push('/modelfile');
    } else {
      throw new Error(response.data.message || '上传失败');
    }
  } catch (error) {
    let message = '请求失败，请稍后重试';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 后端返回的错误信息
        message = error.response.data.message || `服务器错误：${error.response.status}`;
      } else if (error.request) {
        message = '网络连接超时，请检查网络';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

// 移除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
};
</script>

<template>
  <div class="create-template">
    <div class="template-form">
      <h2>创建模板</h2>

      <div class="form-group">
        <label>模板类别</label>
        <div class="select-wrapper">
          <select v-model="templateType">
            <option value="a类" disabled>a类</option>
            <option value="b类">b类</option>
          </select>
          <div class="help-icon" title="当前仅有创建b类模板权限">?</div>
        </div>
      </div>

      <div class="form-group">
        <label>模板名称</label>
        <input type="text" v-model.trim="templateName" placeholder="请输入模板名称" maxlength="50" />
      </div>

      <div class="form-group">
        <label>模板上传</label>
        <div class="upload-area" :class="{ 'dragging': isDragging }" @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false" @drop.prevent="handleDrop" @click="fileInput?.click()">
          <transition name="fade" mode="out-in">
            <div v-if="fileList.length === 0" class="upload-placeholder">
              <div class="upload-icon">+</div>
              <p>点击或拖拽文件到此处上传</p>
              <small>仅支持单个文件，最大 50MB</small>
            </div>

            <!-- 文件列表展示始终保持单文件 -->
            <div v-else class="file-list">
              <div v-for="(file, index) in fileList" :key="index" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                <button @click.stop="removeFile(index)" class="remove-btn" title="移除文件">
                  ×
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- 添加单文件选择限制 -->
        <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" multiple="false" />
      </div>

      <button class="submit-btn" @click="handleSubmit" :disabled="loading">
        {{ loading ? '提交中...' : '提交' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.create-template {
  min-height: 100vh;
  padding: 2vw;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #f5f7fa;
}

.template-form {
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 2em;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5em;
  color: #333;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 1.5em;
}

label {
  display: block;
  margin-bottom: 0.5em;
  color: #333;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 0.8em;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9em;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: #409eff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.help-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f4f4f5;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  padding: 2em;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.02);
}

.upload-placeholder {
  color: #909399;
}

.upload-icon {
  font-size: 2.5em;
  color: #909399;
  margin-bottom: 0.5em;
}

.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8em;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 0.5em;
}

.remove-btn {
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 0.5em;
  transition: color 0.3s;
}

.remove-btn:hover {
  color: #f78989;
}

.submit-btn {
  width: 100%;
  padding: 0.8em;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1em;
}

.submit-btn:hover {
  background: #66b1ff;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .create-template {
    padding: 1em;
  }

  .template-form {
    padding: 1.5em;
  }

  .upload-area {
    padding: 1em;
    min-height: 150px;
  }
}

/* 新增拖拽状态样式 */
.upload-area.dragging {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.file-name {
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 优化移动端显示 */
@media (max-width: 768px) {
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
  }

  .file-size {
    font-size: 0.9em;
    color: #666;
  }
}

/* 添加加载状态样式 */
.submit-btn[disabled] {
  background-color: #a0cfff;
  cursor: not-allowed;
  transform: none;
}

.submit-btn[disabled]:hover {
  background-color: #a0cfff;
}
</style>