import { defineStore } from 'pinia';
import verifyCode from '../../tools/verifyCode';
import { ElMessage } from 'element-plus';
import { UserInfo } from '../../types/types';
import { Ref } from 'vue';
import axiosService from '../../utils/axios-test' // 导入配置好的axios实例
import { useRouter } from 'vue-router';

// 获取路由器
const router = useRouter()


/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as Ref<UserInfo> | null
  }),

  actions: {
    /**
     * 用户登录
     * @param  email 用户邮箱
     * @param password 密码
     * @returns 登录是否成功
     */
    async login(email: string, password: string) {

      // 假设邮箱和密码为doctor@126.com 和 password，用于后续测试       
      if (email == 'doctor@126.com' && password == 'password') {
        const user = {
          id: 23232323,
          email: 'doctor@126.com',
          accessToken: "token1",
          refreshToken: "token2"
        }
        const userInfo: UserInfo = {
          id: 23232323,
          username: '张康',
          email: 'doctor@126.com',
          organization: '技术部',
          avatarUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.JCEcaQJVR_vC2kgt6BGZlAAAAA?rs=1&pid=ImgDetMain',
        };
        this.userInfo = userInfo;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        sessionStorage.setItem('accessToken', JSON.stringify(user.accessToken))
        sessionStorage.setItem('refreshToken', JSON.stringify(user.refreshToken))
        return 200
      }



      try {
        const response = await axiosService.post('/auth/login', {
          email: email,
          password: password
        });



        //登录成功获取token
        if (response.data.code === 200) {
          const user = {
            id: response.data.data.id,
            email: response.data.data.email,
            accessToken: response.data.tokens[0],
            refreshToken: response.data.tokens[1]
          }
          localStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('accessToken', JSON.stringify(response.data.tokens[0]))
          sessionStorage.setItem('refreshToken', JSON.stringify(response.data.tokens[1]))

          //获取用户信息
          try {
            const info = await axiosService.post("/api/user/info", {
              userId: user.id,
            })
            if (info.data.code != 200) {
              // ElMessage.error(response.data.msg);
              return response.data.msg;
            }
            if (info.data.data) {
              this.userInfo = info.data.data;
              localStorage.setItem('userInfo', JSON.stringify(info.data.data));
              return 200
            }
          } catch {
            ElMessage.error("获取用户信息失败");
            return "请求用户信息错误"
          }

        } else {
          // ElMessage.error(response.data.msg)
          return response.data.msg;
        }

      } catch (e) {
        console.error(e);
        return "请求错误";
      }
    },

    /**
     * 用户登出
     */
    async logout() {
      this.userInfo = null;
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userInfo');
      const userItem = localStorage.getItem('userInfo');


      if (userItem !== null) {
        try {
          const res = await axiosService.post(`/auth/logout/${this.$state.userInfo?.id}`, {
            userId: this.$state.userInfo?.id
          });
          if (res.data.code === 200) {
            this.userInfo = null;
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userInfo');
            
            ElMessage.success('登出成功');
            return 200
          } else {
            ElMessage.error('登出失败');
            ElMessage.error(verifyCode(res.data.code))
            return 404
          }
        } catch (e) {
          ElMessage.error("登出失败");
          return 404
        }

      } else {
        // 处理用户信息不存在的情况
        console.error("用户信息不存在");
      }



    },
    /**
     * 初始化用户信息
     */
    //更新信息
    updatUser() {
      const user = localStorage.getItem('user');
      const userInfo = localStorage.getItem('userInfo')
      console.log(userInfo)
      if (user && userInfo) {
        this.userInfo = JSON.parse(userInfo);
      }
      // if (!(user || userInfo)) {
      //   router.push("/login")
      // }
    }
  }
});