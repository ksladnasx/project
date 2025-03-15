<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onUnmounted, Ref } from "vue";
import { useRoute } from 'vue-router';
import testdata from '../data/data';
import { MyFile } from "../types/types";
import router from "../router";
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from "../store";
import formatDate from "../tools/formatDate";
import axiosService from "../utils/axios-test"

const userId = ref()


export default defineComponent({
    name: "FileManagement",
    setup() {
        const route = useRoute();
        const MyFiles: Ref<MyFile[]> = ref(testdata().fileData)

        const filters = ref({
            id: "", //文件id
            filename: "",
            templateName: "", //关联模板名
            author: "", //模板作者
            //都是自己的文件，不需要判断是不是a类型，是不是能删除
            modifyDate: "",
        });

        // 检查URL参数，如果有则应用筛选条件
        onMounted(() => {
            const queryName = route.query.name as string;
            if (queryName) filters.value.templateName = queryName;
        });

        const filteredTemplates = ref<MyFile[]>(MyFiles.value);
        const currentPage = ref(1);
        const showPage = ref(1);
        const pageSize = 10;
        const inpval = ref();
        // 多定义一个inpvals的原因是按钮的激活判断inpval == showPage，如果直接给输入框绑定inpval会导致用户没有点击跳转按钮就使得按钮因为输入的数据实时变化而激活，
        // 所以要多定义一个变量用于存输入的内容，在需要变化inpval 的时候再变化
        const inpvals = ref('');

        // 控制操作下拉菜单的显示
        const showActionMenu = ref<number | null>(null);

        const paginatedTemplates = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredTemplates.value.slice(start, start + pageSize);
        });

        const totalPages = ref(100)

        //日期处理函数，将时间戳转化为具体对应的年月日以及精确的AM和PM
        function customParse(dateStr: string) {
            const date = new Date(dateStr); // 转换为 Date 对象
            return date.getTime(); // 获取时间戳（毫秒级）
        }

        const gotoFileCreate = () => {
            router.push('/createfile');
        };

        const applyFilters = () => {
            console.log(filters.value)
            if (filters.value.id || filters.value.author || filters.value.filename || filters.value.templateName || filters.value.modifyDate) {
                console.log(filters.value)
                updatePage(currentPage.value, pageSize, Number(filters.value.id), filters.value.author, filters.value.filename, filters.value.templateName, customParse(filters.value.modifyDate))
            }


            // filteredTemplates.value = result;
            currentPage.value = 1;
        };

        const resetFilters = () => {
            filters.value = {
                id: '',
                filename: '',
                templateName: '',
                author: '',
                modifyDate: '',
            };
            filteredTemplates.value = MyFiles.value;
            currentPage.value = 1;
        };

        // 切换操作菜单的显示状态
        const toggleActionMenu = (id: number) => {
            if (showActionMenu.value === id) {
                showActionMenu.value = null;
            } else {
                showActionMenu.value = id;
            }
        };

        //文件操作


        //文件列表刷新的函数


        // 查看文件详情（GET）
        const viewFileDetails = async (id: number) => {
            try {
                const response = await axiosService.get(`/api/files/${id}`);
                // console.log('文件详情:', response.data);

                // 实际开发中这里可以跳转到详情页
                if (response.data.code == 200) {
                    ElMessage.success('文件详情获取成功');
                } else {
                    ElMessage.error('获取文件详情失败');
                    ElMessage.error(response.data.msg);
                }
            } catch (error) {
                ElMessage.error('获取文件详情失败');
                console.error('Error fetching file details:', error);
            }
            showActionMenu.value = null;
        };

        // 删除文件（DELETE）
        const deleteFile = async (id: number) => {
            try {
                await ElMessageBox.confirm('确定要删除该文件吗？', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                });

                const response = await axiosService.post(`/api/ai_case/delete`,
                    {
                        id: id
                    }
                );
                if (response.data.code == 200) {
                    ElMessage.success('文件删除成功');
                } else {
                    ElMessage.error('文件删除失败');
                    ElMessage.error(response.data.msg);
                }

                // 刷新文件列表
                // fetchFileList();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('文件删除失败');
                    console.error('Error deleting file:', error);
                }
            }
            showActionMenu.value = null;
        };

        // 下载文件（POST）
        const downloadFile = async (id: number) => {
            try {
                const response = await axiosService.get(`/api/ai_case/download/${id}`, {
                    responseType: 'blob',
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    }
                });

                // 创建临时下载链接
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;

                // 从Content-Disposition获取文件名
                const fileName = response.headers['content-disposition']
                    ?.split('filename=')[1]
                    ?.replace(/"/g, '') || `file_${id}`;

                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();

                if (response.data.code == 200) {
                    ElMessage.success('文件下载已开始');
                } else {
                    ElMessage.error('文件下载失败');
                    ElMessage.error(response.data.msg);
                }

            } catch (error) {
                ElMessage.error('文件下载失败');
                console.error('Error downloading file:', error);
            }
            showActionMenu.value = null;
        };

        // 重命名文件
        const renameFile = async (id: number) => {
            try {
                const { value: newName } = await ElMessageBox.prompt(
                    '请输入新文件名',
                    '重命名文件',
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        inputPattern: /\S+/, // 非空验证
                        inputErrorMessage: '文件名不能为空'
                    }
                );

                const response = await axiosService.post(`/api/ai_case/rename`, {
                    id: id,
                    templateName: newName
                });
                if (response.data.code == 200) {
                    ElMessage.success('重命名成功');
                } else {
                    ElMessage.error(response.data.msg);
                }

                // 刷新文件列表
                // fetchFileList();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('重命名失败');
                    console.error('Error renaming file:', error);
                }
            }
            showActionMenu.value = null;
        };




        // 页面跳转脚本实现
        function changePage(event: any) {
            const value = event.target.innerText;

            // 注意这里innerText是字符串，直接赋值会导致数据类型变化
            currentPage.value = Number(value)
            console.log('Clicked value:', value); // 输出: Clicked value: 1

        }
        function prevPage() {
            // 先清空
            inpval.value = ''
            if (currentPage.value > 1) {
                currentPage.value--
                if (currentPage.value % 4 == 0) {
                    showPage.value = showPage.value - 4
                }
            }
        }
        function nextPage() {
            // 先清空
            inpval.value = ''
            if (currentPage.value < totalPages.value) {
                currentPage.value++
                if (currentPage.value >= showPage.value + 4) {
                    showPage.value = currentPage.value
                }
            }
        }
        function gotoPage() {
            if (inpvals.value == '') {
                return
            }
            inpval.value = inpvals.value
            // 先清空输入框
            inpvals.value = ''

            // 输入判断
            if (inpval.value <= 0 || inpval.value > totalPages.value) {
                return
            }
            currentPage.value = inpval.value

            // 在currentPage更新之后，立即要想到更新showPage变量
            if (inpval.value < showPage.value) {
                showPage.value = (Math.trunc(inpval.value / 4) - 1) * 4 + 1
            }
            if (inpval.value > showPage.value + 3) {
                showPage.value = Math.trunc(inpval.value / 4) * 4 + 1
            }
        }

        //更新页面的函数
        const updatePage = async (currentPage: number, pageSize: number, id?: number, fuzzyFileName?: string, fuzzyTemplateName?: string, authorName?: string, updateTimeStart?: number) => {
            const configData: any = {
                currentPage,
                pageSize
            };

            // 检查每个可选参数是否被传入，如果传入则添加到 configData
            if (id && id != 0) configData.id = id;
            if (fuzzyFileName && fuzzyFileName != "") configData.fuzzyFileName = fuzzyFileName;
            if (authorName && authorName != '') configData.authorName = authorName;
            if (fuzzyTemplateName && fuzzyTemplateName != '') configData.fuzzyTemplateName = fuzzyTemplateName;
            if (updateTimeStart) configData.updateTimeStart = updateTimeStart;
            console.log("请求的数据：")
            console.log(configData)

            try {

                const res = await axiosService.post("/api/ai_case/page", configData)
                if (res.data.code != 200) {
                    ElMessage.error(res.data.msg)
                    return;
                }
                MyFiles.value = res.data.data
                totalPages.value = res.data.totalPage


            } catch (e) {
                ElMessage.error("网络请求失败")
                console.log("data:" + configData)
                console.error(e);
            }
        };
        // 监听 currentPage 的变化，随时更新页面数据
        watch(
            () => currentPage.value,
            (newPage, oldPage) => {
                if (oldPage != undefined) {
                    console.log(`页码从 ${oldPage} 变为 ${newPage}`);
                    updatePage(newPage, pageSize);
                }
            },
            { immediate: true } // 立即执行一次，确保初始值也被处理
        );
        // 挂载时候发请求加载初始页面
        onMounted(async () => {
            const userStore = useUserStore();
            userId.value = userStore.$state.userInfo?.id
            console.log(`加载了初始的第${currentPage.value}页数据`)
            console.log(userId.value)
            try {
                const res = await axiosService.post("/api/template/page", {
                    currentPage: currentPage.value - 1,
                    pageSize: pageSize
                })
                MyFiles.value = res.data.data
                totalPages.value = res.data.totalPage
            } catch (e) {
                console.error(e)
            }

        });
        onUnmounted(() => {
            console.log("卸载了")
        })



        return {
            filters,
            paginatedTemplates,
            currentPage,
            showPage,
            inpval,
            inpvals,
            totalPages,
            showActionMenu,
            gotoFileCreate,
            toggleActionMenu,
            viewFileDetails,
            deleteFile,
            downloadFile,
            renameFile,
            gotoPage,
            formatDate,
            applyFilters,
            resetFilters,
            changePage,
            prevPage,
            nextPage,
        };
    },
});
</script>

<template>
    <div class="file-management">
        <header class="header">
            <h2>文件管理</h2>
            <p>我的文件列表</p>

            <button class="create-file-btn" @click="gotoFileCreate">创建文件</button>
            <hr style="width: 1350px;">
        </header>

        <div class="filter-container">
            <div class="filter-group">
                <div class="filter-item">
                    <label>ID:</label>
                    <input type="text" v-model="filters.id" placeholder="输入ID">
                </div>
                <div class="filter-item">
                    <label>文档名称:</label>
                    <input type="text" v-model="filters.filename" placeholder="输入文件名称">
                </div>
                <div class="filter-item">
                    <label>关联模板:</label>
                    <input type="text" v-model="filters.templateName" placeholder="输入文件名称">
                </div>
                <div class="filter-item">
                    <label>作者:</label>
                    <input type="text" v-model="filters.author" placeholder="输入作者">
                </div>
                <div class="filter-item">
                    <label>修改日期:</label>
                    <input type="date" v-model="filters.modifyDate">
                </div>

                <div class="filter-item filter-actions">
                    <button class="btn query" @click="applyFilters">查询</button>
                    <button class="btn reset" @click="resetFilters">
                        <svg t="1740899657675" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1471" width="200" height="200">
                            <path
                                d="M130 562.5c0-19.33 15.67-35 35-35s35 15.67 35 35C200 735.089 339.911 875 512.5 875S825 735.089 825 562.5 685.089 250 512.5 250c-19.33 0-35-15.67-35-35s15.67-35 35-35C723.749 180 895 351.251 895 562.5S723.749 945 512.5 945 130 773.749 130 562.5z"
                                fill="#2F54EB" p-id="1472"></path>
                            <path
                                d="M482.657 214.747l79.355 79.356c10.74 10.74 10.74 28.151 0 38.89-10.74 10.74-28.151 10.74-38.89 0l-85.573-85.572c-18.045-18.045-18.045-47.302 0-65.348l85.766-85.766c10.74-10.74 28.152-10.74 38.891 0 10.74 10.74 10.74 28.151 0 38.89l-79.55 79.55z"
                                fill="#2F54EB" p-id="1473"></path>
                        </svg>
                        重置
                    </button>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>文档ID</th>
                        <th>文档名</th>
                        <th>模板</th>
                        <th>作者</th>
                        <th>修改时间</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="paginatedTemplates.length === 0">
                        <td colspan="6" class="no-data">暂无相关数据</td>
                    </tr>
                    <tr v-else v-for="template in paginatedTemplates" :key="template.id">
                        <td>{{ template.id }}</td>
                        <td>{{ template.aiCaseName }}</td>
                        <td>{{ template.templateName }}</td>
                        <td>{{ template.authorName }}</td>
                        <td>{{ formatDate(template.updateTime).split(" ")[0] }}
                            <div style="font-size: smaller; color: gray;">
                                {{ formatDate(template.updateTime).split(" ")[1] }}
                                {{ formatDate(template.updateTime).split(" ")[2] }}
                            </div>
                        </td>
                        <td class="action-cell">
                            <div class="act">
                                <button class="action-btn" @click="toggleActionMenu(template.id)">
                                    <i class="dropdown-icon">▼</i>
                                </button>
                                <!-- 添加show类的绑定不然没法正常显示 -->
                                <div class="action-menu" :class="{ show: showActionMenu === template.id }">
                                    <div class="action-item" style="background-color:orangered;"
                                        @click="deleteFile(template.id)">
                                        <i class="delete-icon"></i>
                                        <span>删除</span>
                                    </div>
                                    <div class="action-item" style="background-color:#409eff;"
                                        @click="viewFileDetails(template.id)">
                                        <i class="view-icon"></i>
                                        <span>查看</span>
                                    </div>
                                    <div class="action-item" style="background-color:palevioletred;"
                                        @click="downloadFile(template.id)">
                                        <i class="download-icon"></i>
                                        <span>下载</span>
                                    </div>
                                    <div class="action-item " style="background-color:greenyellow;"
                                        @click="renameFile(template.id)">
                                        <i class="rename-icon"></i>
                                        <span>重命名</span>
                                    </div>

                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination" v-if="totalPages > 0">
            <button :disabled="currentPage === 1" @click="prevPage">&lt;</button>
            <button @click="changePage($event)" :class="{ active: showPage === currentPage || inpval == showPage }">{{
                showPage }}</button>
            <button @click="changePage($event)" v-if="showPage + 1 <= totalPages"
                :class="{ active: currentPage === showPage + 1 || inpval == showPage + 1 }">{{ showPage + 1 }}</button>
            <button @click="changePage($event)" v-if="showPage + 2 <= totalPages"
                :class="{ active: currentPage === showPage + 2 || inpval == showPage + 2 }">{{ showPage + 2 }}</button>
            <button @click="changePage($event)" v-if="showPage + 3 <= totalPages"
                :class="{ active: currentPage === showPage + 3 || inpval == showPage + 3 }">{{ showPage + 3 }}</button>
            <button :disabled="currentPage === totalPages" @click="nextPage">&gt;</button>
            <div>
                <input type="text" style="width: 60px;" v-model="inpvals"> <button @click="gotoPage">Go</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 添加一个简单的 active 状态样式 */
button.active {
    background-color: #6eb9fb;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}

.icon {
    width: 20px;
    height: 20px;
    padding: 0;
}

.file-management {
    /* min-height: 100vh; */
    padding: 2vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.header {
    width: 100%;
    margin-bottom: 4vh;
    position: relative;
    left: 2vw;
}

.create-file-btn {
    background: #409eff;
    color: white;
    position: relative;
    left: 1250px;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.create-file-btn:hover {
    background: #66b1ff;
}

.filter-container {
    padding: 2vw;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    /* box-sizing: border-box; */
    position: relative;
    left: 5vw;
}

.filter-group {
    position: relative;
    right: 10vh;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 6px;
}

.filter-item {
    position: relative;
    display: flex;
    flex-direction: column;
    /* gap: 4px; */
}

label {
    /* width: 60px; */
    font-size: 12px;
    color: #606266;
}

input,
select {
    padding: 8px 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    width: 200px;
}

.filter-actions {
    width: 100vh;
    height: 5vh;
    display: flex;
    position: relative;
    top: 1.3vh;
    flex-direction: row;
    align-items: center;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn.query {
    background: #409eff;
    color: white;
    border: none;
}

.btn.reset {
    background: #f4f4f5;
    color: #606266;
    border: 1px solid #d3d4d6;
}

.btn:hover {
    opacity: 0.9;
}

.table-container {
    border: 1px solid #ebeef5;
    border-radius: 8px;

    /* overflow: hidden; */
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background: #f5f7fa;
    color: #909399;
    font-weight: 500;
    padding: 12px;
    text-align: center;
}

td {
    padding-bottom: 6px;
    padding-top: 6px;
    padding-left: 30px;
    padding-right: 30px;
    border-top: 1px solid #ebeef5;
    color: #606266;
    text-align: center;
}

.category-tag {
    display: inline-block;
    padding: 4px 8px;
    background: #ecf5ff;
    color: #409eff;
    border-radius: 4px;
    font-size: 12px;
}

.no-data {
    text-align: center;
    padding: 24px;
    color: #909399;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
}

/* 操作按钮和下拉菜单样式 */
.action-cell {
    position: relative;
    width: 80px;
}

.act {
    position: relative;
    right: 10vh;
    display: flex;
    justify-content: center;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background: #f0f2f5;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.action-btn:hover {
    background: #e0e2e5;
}

.dropdown-icon {
    font-size: 10px;
    transition: transform 0.3s;
}

.action-menu {
    position: absolute;
    top: 100px;
    right: -120px;
    width: 120px;
    background: transparent;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transform: translateY(-50%) translateX(20px) scale(0.95);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.action-menu.show {
    opacity: 1;
    transform: translateY(-50%) translateX(0) scale(1);
    pointer-events: auto;
}

.action-item {
    color: white;
    display: flex;
    border-radius: 4px;

    align-items: center;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    /* margin: 4px 0; */
    gap: 8px;
}

.action-item:hover {
    color: #000000;
    transform: translateX(6px);
    background: rgba(255, 255, 255, 0.2) !important;
}

.action-item.delete {
    color: #f56c6c;
}

.action-item.delete:hover {
    background: #fef0f0;
}

.action-item i {
    margin-right: 8px;
    font-size: 16px;
}

/* 新增样式 */
.filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.filter-group {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.filter-actions {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    margin-left: 12px;
}

/* 调整原有按钮间距 */
.btn {
    min-width: 80px;
}

/* 图标样式修正 */
.download-icon::before {
    content: "⤓";
    font-weight: 900;
}

.rename-icon::before {
    content: "✎";
}

.delete-icon::before {
    content: "×";
    font-weight: 900;
}

.view-icon::before {
    content: "👁️";
}
</style>