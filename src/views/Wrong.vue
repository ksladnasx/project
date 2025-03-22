<template>
  <div class="not-found-container">
    <div class="content">
      <div class="error-code">401</div>
      <h1 class="title">页面迷路了</h1>
      <p class="description">
        我们似乎找不到您要访问的页面<br>
        请检查网址或返回首页
      </p>
      <button @click="goHome" class="home-button">
        <span>返回首页</span>
      </button>
      <!-- <br> -->
      <button @click="router.back()" class="home-button" style="margin-left: 1rem;">
        <span>返回上一页</span>
      </button>
      <button @click="test" class="home-button">
        <span>获取用户信息请求测试</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus';
import axios from 'axios';
import axiosService from '../utils/axios-test';

const router = useRouter()

const goHome = () => {
  router.push("/login")
}

const test = async () => {
  const user = localStorage.getItem('user')
  if (!user) {
    ElMessage.error("请先登录！");
    return
  } 
  const users = JSON.parse(user)
  
  const token = JSON.parse(sessionStorage.getItem("accessToken")!);
  
  try {
    // console.log("id:"+users.id)
    const info = await axiosService.post("/api/user/info", {
      id: users.id,
    })
    console.log("id"+users.id)
    console.log("获取用户信息请求成功！")
    console.log(info.data.data)
    console.log(info.data.code)
    // return
    if (info.data.code != 200) {
      // ElMessage.error(response.data.msg);
      ElMessage.error(info.data.msg) ;
    }
    if (info.data.data) {
      const userInfo = info.data.data;
      console.log(userInfo)
      localStorage.setItem('userInfo', JSON.stringify(info.data.data));
      ElMessage.success("成功")
    }
  } catch (e){
    ElMessage.error("获取用户信息失败");
    console.log(e)
  }
}

</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.content {
  text-align: center;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.title {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.description {
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.home-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  padding: 1rem 2rem;
  color: white;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.home-button span {
  position: relative;
  z-index: 1;
}

.home-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.home-button:hover::before {
  opacity: 1;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .description {
    font-size: 1rem;
  }
}
</style>