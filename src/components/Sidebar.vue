<script setup lang="ts">
// import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus';
const route = useRoute()
// 路由器实例
const router = useRouter();
// 用户存储
const userStore = useUserStore();
// 活动菜单项索引
// const activeIndex = ref('1');

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path);
};

// 跳转到个人信息
const navigateToProfile = () => {
  router.push('/setting');
};

// 登出
const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <h2>电子病历撰写系统</h2>
    </div>

    <div class="user-express">
      <div class="main-avatar">
        <img src="https://tse3-mm.cn.bing.net/th/id/OIP-C.JCEcaQJVR_vC2kgt6BGZlAAAAA?rs=1&pid=ImgDetMain"
          alt="User Avatar" class="icon"
          @click="navigateToProfile"
           />
      </div>
      <p></p>
      <div style="width: 86px; text-align: center;">{{ userStore.$state.userInfo?.username }}
      </div>
    </div>


    <div class="menu">

      <div class="menu-item" @click="navigateTo('/modelfile')" :class="{ active: route.path === '/modelfile' }">
        <i class="el-icon-document-add"></i>
        <span>模板管理</span>
      </div>
      
      <div class="menu-item" @click="navigateTo('/filemanage')" :class="{ active: route.path === '/filemanage' }">
        <i class="el-icon-folder"></i>
        <span>文件管理</span>
      </div>

      <div class="menu-item" @click="navigateTo('/permissions')" :class="{ active: route.path === '/permissions' }">
        <i class="el-icon-document-add"></i>
        <span>权限管理</span>
      </div>

      <div class="menu-item" @click="navigateTo('/setting')" :class="{ active: route.path === '/setting' }">
        <i class="el-icon-document-add"></i>
        <span>设置</span>
      </div>
    </div>
    <div class="user-info">
      <div class="avatar">
        <img src="https://tse3-mm.cn.bing.net/th/id/OIP-C.JCEcaQJVR_vC2kgt6BGZlAAAAA?rs=1&pid=ImgDetMain"
          alt="User Avatar"
          @click="navigateToProfile"
          />
      </div>
      <div class="user-details">
        <div class="user-name">{{ userStore.$state.userInfo?.username }}</div>
        <div class="user-role">{{ userStore.$state.userInfo?.organization }}</div>
      </div>
      <div class="logout" @click="logout">
        <i class="el-icon-switch-button">X</i>
      </div>
    </div>
  </div>
</template>

<style scoped>
*{
  -webkit-user-select: none;  /* Chrome/Safari/Edge */
  -moz-user-select: none;     /* Firefox */
  -ms-user-select: none;      /* IE10+ */
  user-select: none;          /* 标准语法 */
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
  background-color: #263445;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 1px;
}

.menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  border-radius: 4px;
  margin-left: 10px;
  margin-right: 10px;
  
}

.menu-item:hover {
  background-color: #263445;
  transform: translateX(5px);
}

.menu-item.active {
  background-color: #1890ff;
  color: white;
}

.menu-item i {
  margin-right: 10px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.menu-item:hover i {
  transform: scale(1.2);
}

.user-express{
  width: 86px;
  height: 108px;
  font-size: 13px;
  /* display: flex; */
  position: relative;
  left: 70px;
}

.user-info {
  height: 80px;
  border-top: 1px solid #1f2d3d;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #263445;
}

.main-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}
.icon{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #1890ff;
  transform: scale(1.05);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: bold;
}

.user-role {
  font-size: 12px;
  color: #ccc;
}

.logout {
  cursor: pointer;
  font-size: 18px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.logout:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ff6b6b;
  transform: rotate(180deg);
}

.sidebar {
  width: clamp(80px, 20vw, 220px); /* 动态宽度，范围200-300px */
  height: 100vh;      
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  flex-shrink: 0;
  transition: width 0.3s ease; /* 添加过渡动画 */
}

.logo {
  height: clamp(50px, 8vh, 70px); /* 动态高度 */
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
  background-color: #263445;
}

.logo h2 {
  margin: 0;
  font-size: clamp(14px, 1.5vw, 18px); /* 动态字体大小 */
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu {
  flex: 1;
  padding: 2vh 0;
  overflow-y: auto;
}

.menu-item {
  height: clamp(40px, 6vh, 50px); /* 动态高度 */
  display: flex;
  align-items: center;
  padding: 0 clamp(10px, 1.5vw, 20px);
  margin: 0 0.5rem 0.5rem;
  font-size: clamp(12px, 1.1vw, 14px); /* 动态字体 */
}

.menu-item i {
  margin-right: clamp(8px, 1vw, 12px);
  font-size: clamp(16px, 1.5vw, 18px);
}

.user-express {
  width: auto;
  height: auto;
  margin: 2vh auto;
  left: 0;
  text-align: center;
}

.main-avatar {
  width: clamp(70px, 10vw, 90px);
  height: clamp(70px, 10vw, 90px);
  margin: 0 auto;
}

.user-info {
  height: clamp(60px, 8vh, 80px);
  padding: 0 clamp(10px, 1.5vw, 20px);
}

.avatar {
  width: clamp(30px, 4vw, 40px);
  height: clamp(30px, 4vw, 40px);
}

.user-name {
  font-size: clamp(12px, 1.1vw, 14px);
}

.user-role {
  font-size: clamp(10px, 0.9vw, 12px);
}

.logout {
  width: clamp(25px, 3vw, 30px);
  height: clamp(25px, 3vw, 30px);
  font-size: clamp(14px, 1.5vw, 18px);
}

</style>