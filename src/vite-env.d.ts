/// <reference types="vite/client" />
// src/shims-vue.d.ts
import { ComponentCustomProperties } from 'vue'
import type { AxiosInstance } from 'axios'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: AxiosInstance
  }
}