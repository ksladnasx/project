import axios from "axios";
import host from "../config/hostname";
import router from "../router";

// 在拦截器中使用时显式传递
const hostname = host();


// 创建独立Axios实例[7,10](@ref)
const service = axios.create({
    baseURL: hostname, //拼接请求的基地址
    timeout: 15000,
});

// ==================== 请求拦截器 ====================
service.interceptors.request.use(
    config => {

        const url = config.url;
        if (sessionStorage.getItem("accessToken") && url?.indexOf("renewal") === -1) {
            try {   
                const token = JSON.parse(sessionStorage.getItem("accessToken")!);
                config.headers["Authorization"] = `Bearer ${token}`; // 修正拼写错误[8](@ref)
            } catch (e) {
                console.error("Token解析失败:", e);
                sessionStorage.removeItem("accessToken");
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

// ==================== Token刷新机制 ==================== 
const userIds = localStorage.getItem("userinfo")
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

// ==================== 响应拦截器 ====================
service.interceptors.response.use(
    async response => {
        if (response.status === 401 && !response.config.headers.isRefresh) {
            try {
                const res = await getNewToken();
                if (res && res.data && res.data.code === 200 && res.data.data && res.data.data.status) {
                    sessionStorage.setItem("accessToken", JSON.stringify(res.data.data.accessToken));

                    // Retry the original request
                    return service({
                        ...response.config,
                        headers: {
                            ...response.config.headers,
                            Authorization: `Bearer ${res.data.data.accessToken}`
                        }
                    });
                }

            } catch (error) {
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return response.data;
    },
    error => {
        if (error.code === 'ERR_NETWORK') {
            console.error('网络连接断开，请检查您的网络设置');
            // router.push("/wrong");  // 建议使用vue-router跳转[4](@ref)
            return Promise.reject(error);
        }


        if (error.response?.status === 401) {
            console.error("资源未找到:", error.config.url);
            router.push("/wrong");  // 建议使用vue-router跳转[4](@ref)
        }
        return Promise.reject(error);
    }
);

export default service; // 添加默认导出[5,10](@ref)