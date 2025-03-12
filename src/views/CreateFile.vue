<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'; 
import axios  from 'axios';
import { useUserStore } from '../store';
import host from '../config/hostname';
import axiosService from "../utils/axios-test"

const userStore = useUserStore();
const hostname = host();


declare type Files = {
  name: string;
  type: string;

};

const router = useRouter();
const fileName = ref('');
const fileType = ref('');


const handleSubmit = () => {
  try{
    axiosService.post(hostname+"/api/ai_case/create",{
    templateId:fileType.value,
    aiCaseName:fileName.value
  })
  }catch(e) {
    console.error(e)
  }
  if (!fileName.value) {
    ElMessage.warning('请输入文件名称');
    return;
  }
  
  ElMessage.success('文件创建成功');
  router.push('/modelfile');
};


</script>

<template>
  <div class="create-template">
    <div class="template-form">
      <h2>创建文件</h2>
      
      <div class="form-group">
        <label>模板类别</label>
        <div class="select-wrapper">
          <select v-model="fileType">
            <option ></option>
            <option value="a类" >陆军医院</option>
            <option value="b类">空军医院</option>
            
          </select>
          <div class="help-icon" title="可以无类别">?</div>
        </div>
      </div>

      <div class="form-group">
        <label>文件名称</label>
        <input 
          type="text" 
          v-model="fileName"
          placeholder="请输入文件名称"
        />
      </div>

    

      <button style="align-items: center;" @click="handleSubmit">创建</button>
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

input, select {
  width: 100%;
  padding: 0.8em;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9em;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus, select:focus {
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
</style>