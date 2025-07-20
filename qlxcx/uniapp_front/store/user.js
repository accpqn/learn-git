import { defineStore } from 'pinia';
import { login, verifyAndLogin, sendVerificationCode, refreshToken, getCurrentUser } from '@/api/user';
import { useCoupleStore } from './couple';

export const useUserStore = defineStore('user', {
    state: () => ({
        // 用户信息
        userInfo: null,
        // token信息
        token: null,
        refreshToken: null,
        // 注册状态
        registerStatus: 'idle', // 'idle' | 'pending' | 'success' | 'error'
        registerError: null,
        // 防抖标记
        _fetchingUser: false
    }),

    getters: {
        // 登录状态 - 基于用户信息和token判断
        isLoggedIn() {
            return !!(this.userInfo && this.token);
        },
        userId() {
            if (!this.userInfo) return null;
            return this.userInfo.id;
        },
        username() {
            if (!this.userInfo) return null;
            return this.userInfo.username;
        },
        email() {
            if (!this.userInfo) return null;
            return this.userInfo.email;
        }
    },

    actions: {
        // 设置用户信息
        setUserInfo(info) {
            this.userInfo = info;
            this.saveUserToLocal();
        },

        // 保存用户信息到本地存储
        saveUserToLocal() {
            if (this.userInfo) {
                uni.setStorageSync('userInfo', this.userInfo);
            }
        },

        // 设置token
        setToken(token, refresh) {
            this.token = token;
            this.refreshToken = refresh;

            // 存储到本地
            uni.setStorageSync('token', token);
            uni.setStorageSync('refreshToken', refresh);
        },

        // 清除用户状态
        clearUserState() {
            this.userInfo = null;
            this.token = null;
            this.refreshToken = null;

            // 清除本地存储
            uni.removeStorageSync('token');
            uni.removeStorageSync('refreshToken');
            uni.removeStorageSync('userInfo');
        },

        // 登录
        async login(loginData) {
            try {
                const response = await login(loginData);
                const { token, user } = response;

                this.setToken(token.access, token.refresh);
                this.setUserInfo(user);

                // 登录API返回的用户信息可能不完整，异步获取完整信息
                // 不等待结果，避免阻塞登录流程
                this.fetchCurrentUser().catch(err => {
                    console.warn('Failed to fetch complete user info after login:', err);
                });

                // 登录成功后同步主题配置
                this.syncThemeAfterLogin();

                return true;
            } catch (error) {
                this.clearUserState();
                throw error;
            }
        },

        // 验证码登录
        async loginWithCode(loginData) {
            try {
                const response = await verifyAndLogin(loginData);
                const { token, user } = response;

                this.setToken(token.access, token.refresh);
                this.setUserInfo(user);

                // 登录API返回的用户信息可能不完整，异步获取完整信息
                // 不等待结果，避免阻塞登录流程
                this.fetchCurrentUser().catch(err => {
                    console.warn('Failed to fetch complete user info after login:', err);
                });

                return true;
            } catch (error) {
                this.clearUserState();
                throw error;
            }
        },

        // 发送验证码
        async sendVerificationCode(email) {
            try {
                await sendVerificationCode({ email });
                return true;
            } catch (error) {
                throw error;
            }
        },

        // 注册
        async register(registerData) {
            this.registerStatus = 'pending';
            this.registerError = null;

            try {
                const coupleStore = useCoupleStore();
                const response = await verifyAndLogin(registerData);
                const { token, user } = response;

                this.setToken(token.access, token.refresh);
                this.setUserInfo(user);
                coupleStore.setBindingInfo(user.binding);

                this.registerStatus = 'success';
                return true;
            } catch (error) {
                this.registerStatus = 'error';
                this.registerError = error.message;
                throw error;
            }
        },

        // 登出
        logout() {
            this.clearUserState();
        },

        // 刷新token
        async refreshUserToken() {
            if (!this.refreshToken) return false;

            try {
                const response = await refreshToken(this.refreshToken);
                const { access } = response;

                this.setToken(access, this.refreshToken);
                return true;
            } catch (error) {
                this.clearUserState();
                return false;
            }
        },

        // 获取当前用户信息
        async fetchCurrentUser() {
            // 如果没有token，直接返回
            if (!this.token) {
                console.log('No token available, skipping fetchCurrentUser');
                return false;
            }

            // 防抖：如果正在获取用户信息，直接返回
            if (this._fetchingUser) {
                console.log('Already fetching user info, skipping duplicate request');
                return false;
            }

            this._fetchingUser = true;

            try {
                const coupleStore = useCoupleStore();
                console.log('Fetching current user info...');
                const response = await getCurrentUser();
                console.log('Received user info:', response);

                // 后端直接返回用户数据，不是包装在user字段中
                const { binding, ...userData } = response;
                this.setUserInfo(userData);
                coupleStore.setBindingInfo(binding);

                console.log('User info updated successfully');
                return true;
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                // 如果是401错误，清除用户状态
                if (error.response && error.response.statusCode === 401) {
                    console.log('Token expired, clearing user state');
                    this.clearUserState();
                }
                return false;
            } finally {
                this._fetchingUser = false;
            }
        },

        // 初始化状态
        initFromStorage() {
            const token = uni.getStorageSync('token');
            const refreshToken = uni.getStorageSync('refreshToken');
            const userInfo = uni.getStorageSync('userInfo');

            if (token && refreshToken) {
                this.token = token;
                this.refreshToken = refreshToken;

                // 如果有本地用户信息，先加载它
                if (userInfo) {
                    this.userInfo = userInfo;
                }

                return true;
            }

            return false;
        },

        // 登录后同步主题配置
        syncThemeAfterLogin() {
            try {
                // 发送登录成功事件，让主题Store监听并处理
                uni.$emit('userLoginSuccess', {
                    userId: this.userInfo?.id,
                    timestamp: Date.now()
                });
                console.log('已发送登录成功事件，主题将自动同步');
            } catch (error) {
                console.error('同步主题配置失败:', error);
            }
        }
    }
});