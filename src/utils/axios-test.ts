import axios from "axios";
import host from "../config/hostname";
import router from "../router";

const hostname = host();

const service = axios.create({
  // baseURL: hostname,
  timeout: 15000,
});

// 请求拦截器（保持不变）
service.interceptors.request.use(
  config => {
    const url = config.url;
    if (sessionStorage.getItem("accessToken") && url?.indexOf("renewal") === -1) {
      try {   
        const token = JSON.parse(sessionStorage.getItem("accessToken")!);
        config.headers["Authorization"] = token;
      } catch (e) {   
        console.error("Token解析失败:", e);
        sessionStorage.removeItem("accessToken");
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// ==================== Token刷新机制（保持不变） ==================== 
const userIds = localStorage.getItem("userinfo");
async function getNewToken() {
  try {
    if (userIds) {
      const refreshToken = JSON.parse(sessionStorage.getItem("refreshToken")!);
      return await service.post("/auth/token/renewal",
        { id: JSON.parse(userIds) },
        {
          headers: {
            accessToken: refreshToken, 
            isRefresh: true
          }
        }
      );
    }
  } catch (error) {
    console.error("刷新Token失败:", error);
    throw error;
  }
}

// ==================== 响应拦截器（关键修改） ====================
service.interceptors.response.use(
  async response => {
    // 如果401且不是刷新Token的请求
    if (response.status === 401 && !response.config.headers.isRefresh) {
      try {
        const res = await getNewToken();
        if (res && res.data && res.data.code === 200 && res.data.data && res.data.data.status) {
          sessionStorage.setItem("accessToken", JSON.stringify(res.data.data.accessToken));

          // 重试原始请求，并返回完整响应对象
          return service({
            ...response.config,
            headers: {
              ...response.config.headers,
              Authorization:  res.data.data.accessToken
            }
          });
        }
      } catch (error) {
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // 返回完整响应对象（⚠️ 关键修改）
    return response;
  },
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('网络连接断开，请检查您的网络设置');
      router.push("/wrong");
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.error("资源未找到:", error.config.url);
      router.push("/wrong");
    }

    // 统一错误格式，确保可以通过 error.response.data.code 访问
    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: {
          code: error.response?.status || 500,
          msg: error.response?.data?.message || '请求失败',
          data: null
        }
      }
    });
  }
);

export default service;