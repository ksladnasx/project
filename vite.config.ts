import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 代理规则配置
      '/api': {
        target: 'https://frp-off.com:40507', // 实际的后端接口地址
        changeOrigin: true,
        secure: false,       // 关闭 SSL 验证
        
      },
      // 可以配置多个代理规则
      '/auth': {  
        target: 'https://frp-off.com:40507',
        changeOrigin: true,
        secure: false,       // 关闭 SSL 验证
      }
    }
  }
})
