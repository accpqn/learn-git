import { useUserStore } from '@/store/user';
import config from '@/config/index';

// 后端API基础地址配置
// 使用配置文件中的API基础URL，支持不同环境的自动切换
const BASE_URL = `${config.API_BASE_URL}/api`;

const request = (options) => {
    const userStore = useUserStore();

    return new Promise((resolve, reject) => {
        // 构建完整的请求URL
        options.url = `${BASE_URL}${options.url}`;

        // 添加统一的请求头
        options.header = {
            'Content-Type': 'application/json',
            ...options.header
        };

        // 定义不需要认证的URL列表
        const noAuthUrls = [
            '/users/login/',
            '/users/verify-and-login/',
            '/users/send-code/',
            '/token/refresh/'
        ];

        // 检查当前请求是否需要认证
        const requiresAuth = !noAuthUrls.some(url => options.url.includes(url));

        // 如果有Token且当前请求需要认证，则添加到请求头
        if (userStore.token && requiresAuth) {
            options.header.Authorization = `Bearer ${userStore.token}`;
        }

        uni.request({
            ...options,
            timeout: config.REQUEST_TIMEOUT, // 使用配置文件中的超时时间
            success: async(response) => {
                // 处理Token过期情况
                if (response.statusCode === 401 && !options.url.includes('/token/refresh')) {
                    try {
                        // 尝试刷新Token
                        const success = await userStore.refreshUserToken();
                        if (success) {
                            // 重试当前请求
                            options.header.Authorization = `Bearer ${userStore.token}`;
                            uni.request({
                                ...options,
                                success: (retryResponse) => {
                                    resolve(retryResponse.data);
                                },
                                fail: (error) => {
                                    reject(error);
                                }
                            });
                            return;
                        }
                    } catch (error) {
                        userStore.clearUserState();
                        uni.reLaunch({
                            url: '/pages/public/login'
                        });
                        reject(new Error('登录已过期，请重新登录'));
                        return;
                    }
                }

                // 处理其他错误状态
                if (response.statusCode >= 400) {
                    const error = new Error(response.data.message || response.data.detail || '请求失败');
                    error.response = response;
                    reject(error);
                    return;
                }

                resolve(response.data);
            },
            fail: (error) => {
                console.error('Request failed:', error);
                let errorMessage = '网络错误';

                if (error.errMsg) {
                    if (error.errMsg.includes('timeout')) {
                        errorMessage = '请求超时，请检查网络连接';
                    } else if (error.errMsg.includes('fail')) {
                        errorMessage = '连接服务器失败';
                    }
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 3000
                });

                const customError = new Error(errorMessage);
                customError.originalError = error;
                reject(customError);
            }
        });
    });
};

export default request;