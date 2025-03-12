// utils/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 声明扩展类型
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _queue?: boolean;
  }
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true // 推荐使用 Cookie 方案时启用
});

// 全局状态控制
let isRefreshing = false;
const requestQueue: (() => void)[] = [];
const responseQueue: ((token: string) => void)[] = [];


service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 动态获取最新 token（解决 store 初始化顺序问题）
      const token = localStorage.getItem('accessToken') || '';
      
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 特殊标记无需 token 的请求
      if (config.url?.includes('/auth/refresh')) {
        config._queue = true;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );


  service.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig;
      
      // 401 处理流程
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        // 并发控制
        if (isRefreshing) {
          return new Promise((resolve) => {
            responseQueue.push((newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(service(originalRequest));
            });
          });
        }
  
        isRefreshing = true;
        
        try {
          const { data } = await service.post('/auth/refresh', {
            refreshToken: localStorage.getItem('refreshToken')
          });
  
          // 更新全局状态
          localStorage.setItem('accessToken', data.accessToken);
          service.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
  
          // 处理等待队列
          responseQueue.forEach(cb => cb(data.accessToken));
          responseQueue.length = 0;
  
          return service(originalRequest);
        } catch (refreshError) {
          // 彻底失效处理
          localStorage.clear();
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  export default service;