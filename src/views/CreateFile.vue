<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axiosService from "../utils/axios-test"
import { TemplateFile } from '../types/types';




const router = useRouter();
const fileName = ref('');
const templateId = ref('');






// 2. 创建axios实例（网页5/网页9）


// 3. 响应式数据
const options = ref<TemplateFile[]>([])
const currentPage = ref(1)
const loading = ref(false)
const hasMore = ref(true)

// 4. 数据获取方法（网页6/网页9）
const fetchData = async (page: number) => {
  try {
    const response = await axiosService.post("/api/template/page", {
      currentPage: currentPage.value,
      pageSize: page
    })
    return response.data.data.data
  } catch (error) {
    console.error('请求失败:', error)
    return []
  }
}

// 5. 初始化加载（网页7）
const loadFirstPage = async () => {
  if (options.value.length > 0 || loading.value) return

  loading.value = true
  options.value = await fetchData(1)
  currentPage.value = 2
  loading.value = false
  console.log(options.value)
}

// 6. 滚动处理（网页6/网页7）
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLSelectElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // 滚动到底部阈值判断（距底部50px触发）
  if (scrollHeight - (scrollTop + clientHeight) < 50
    && !loading.value
    && hasMore.value
  ) {
    loading.value = true
    const newData = await fetchData(currentPage.value)

    options.value = [...options.value, ...newData]
    hasMore.value = newData.length >= 10 // 根据实际接口调整
    currentPage.value++
    loading.value = false
  }
}

const handleSubmit = () => {
 const typename = ".docx"
  if (!fileName.value) {
    ElMessage.warning('请输入文件名称');
    return;
  }
  try {
    axiosService.post("/api/record/create", {
      templateId: templateId.value,
      aiCaseName: fileName.value+typename
    })
  } catch (e) {
    console.error(e)
  }
  ElMessage.success('文件创建成功');
  router.push('/modelfile');
};

// 7. 生命周期管理（网页3）
onMounted(() => {
  const selectEl = document.querySelector('select')
  selectEl?.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  const selectEl = document.querySelector('select')
  selectEl?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="create-template">
    <div class="template-form">
      <h2>创建文件</h2>

      <div class="form-group">
        <label>模板类别</label>
        <div class="select-wrapper">
          <select v-model="templateId" @click="loadFirstPage" @scroll.passive="handleScroll" class="scroll-select">
            <option value=""> </option>
            <option v-for="item in options" :key="item.id" :value="item.id">
              {{ item.templateName }}
            </option>
            <option v-if="loading" disabled>加载中...（已加载{{ options.length }}条）</option>
          </select>
          <div class="help-icon" title="可以无类别">?</div>
        </div>
      </div>

      <div class="form-group">
        <label>文件名称</label>
        <input type="text" v-model="fileName" placeholder="请输入文件名称" />
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