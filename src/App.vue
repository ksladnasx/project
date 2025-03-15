<script setup lang="ts">
import { useRouter } from 'vue-router';
// import { useUserStore } from './store';
import Sidebar from './components/Sidebar.vue';
import {ref } from 'vue';



// 路由器实例
const router = useRouter();
// 用户存储
// const userStore = useUserStore();

// 判断当前路由是否需要显示侧边栏
const shouldShowSidebar = () => {
  const publicRoutes = ['Login', 'Register', 'ForgotPassword', "Email","Wrong"];
  return !publicRoutes.includes(router.currentRoute.value.name as string);
};
const shouldShow = ref(true);

</script>

<template>
  <div class="app-container">

    <!-- 只在非登录/注册/找回密码页面显示侧边栏 -->
    <Sidebar v-if="shouldShowSidebar() && shouldShow" />
    
    <button @click="() => shouldShow = !shouldShow" style="height: 100px; width: 30px;" v-if="shouldShowSidebar()">{{
      shouldShow == true ? "<" : ">" }}</button>

    <div class="main-content" :class="{ 'with-sidebar': shouldShowSidebar() }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
  width: 100%;
  height: 100%;
  overflow:visible;
}

button:focus {
  outline: none;
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow:visible;
  display: flex;
  
}

.main-content {
  flex: 1;
  overflow-y:auto;
  transition: all 0.3s ease;
}

.main-content.with-sidebar {
  width: calc(100% - 250px);
}                     

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>