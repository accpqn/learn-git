import { defineStore } from 'pinia';
import { getThemeConfig, saveThemeConfig, presetThemes } from '@/api/theme';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        // 当前主题配置
        currentTheme: {
            primaryColor: '#FF69B4',
            secondaryColor: '#FF1493',
            backgroundColor: '#FFF5F8',
            themeName: '粉色恋人'
        },
        
        // 预设主题列表
        presetThemes: presetThemes,
        
        // 加载状态
        loading: false,
        
        // 是否已初始化
        initialized: false
    }),

    getters: {
        // 获取当前主题的CSS变量
        cssVariables: (state) => {
            return {
                '--theme-primary': state.currentTheme.primaryColor,
                '--theme-secondary': state.currentTheme.secondaryColor,
                '--theme-background': state.currentTheme.backgroundColor,
                '--theme-primary-light': state.currentTheme.primaryColor + '20',
                '--theme-secondary-light': state.currentTheme.secondaryColor + '20'
            };
        },

        // 获取当前主题名称
        currentThemeName: (state) => {
            const preset = state.presetThemes.find(theme => 
                theme.primaryColor === state.currentTheme.primaryColor &&
                theme.secondaryColor === state.currentTheme.secondaryColor &&
                theme.backgroundColor === state.currentTheme.backgroundColor
            );
            return preset ? preset.name : state.currentTheme.themeName || '自定义主题';
        },

        // 判断是否为预设主题
        isPresetTheme: (state) => {
            return state.presetThemes.some(theme => 
                theme.primaryColor === state.currentTheme.primaryColor &&
                theme.secondaryColor === state.currentTheme.secondaryColor &&
                theme.backgroundColor === state.currentTheme.backgroundColor
            );
        }
    },

    actions: {
        // 初始化主题
        async initTheme() {
            if (this.initialized) return;
            
            try {
                // 先从本地存储加载
                const localTheme = this.loadFromStorage();
                if (localTheme) {
                    this.currentTheme = { ...localTheme };
                    this.applyTheme();
                }

                // 如果用户已登录，尝试从服务器加载
                if (this.isLoggedIn()) {
                    await this.fetchThemeFromServer();
                }

                // 设置登录监听器
                this.setupLoginListener();

                this.initialized = true;
            } catch (error) {
                console.error('初始化主题失败:', error);
                // 使用默认主题
                this.currentTheme = { ...presetThemes[0] };
                this.applyTheme();
                this.initialized = true;
            }
        },

        // 设置登录监听器
        setupLoginListener() {
            // 监听用户登录成功事件
            uni.$on('userLoginSuccess', async (data) => {
                console.log('收到用户登录成功事件，开始同步主题配置');
                try {
                    await this.fetchThemeFromServer();
                    console.log('登录后主题配置同步成功');
                } catch (error) {
                    console.warn('登录后主题配置同步失败:', error);
                }
            });
        },

        // 从服务器获取主题配置
        async fetchThemeFromServer() {
            if (!this.isLoggedIn()) {
                console.log('用户未登录，跳过服务器主题获取');
                return;
            }

            this.loading = true;
            try {
                const serverTheme = await getThemeConfig();
                if (serverTheme) {
                    this.currentTheme = {
                        primaryColor: serverTheme.primary_color || serverTheme.primaryColor,
                        secondaryColor: serverTheme.secondary_color || serverTheme.secondaryColor,
                        backgroundColor: serverTheme.background_color || serverTheme.backgroundColor,
                        themeName: serverTheme.theme_name || serverTheme.themeName || this.currentThemeName
                    };
                    this.applyTheme();
                    this.saveToStorage();
                }
            } catch (error) {
                console.error('获取服务器主题配置失败:', error);
                // 如果是401错误，说明token可能过期，只使用本地主题
                if (error.message && error.message.includes('401')) {
                    console.log('认证失败，使用本地主题配置');
                } else if (error.message && (error.message.includes('没有激活的绑定关系') || error.message.includes('403'))) {
                    // 403错误：新用户没有绑定关系，这是正常情况
                    console.log('新用户没有绑定关系，使用默认主题');
                    this.applyTheme(); // 应用当前主题（默认主题）
                } else {
                    console.log('其他错误，使用本地主题配置');
                    this.applyTheme(); // 应用当前主题
                }
            } finally {
                this.loading = false;
            }
        },

        // 保存主题配置到服务器
        async saveThemeToServer() {
            if (!this.isLoggedIn()) {
                // 未登录时只保存到本地
                this.saveToStorage();
                return;
            }

            this.loading = true;
            try {
                const themeData = {
                    primary_color: this.currentTheme.primaryColor,
                    secondary_color: this.currentTheme.secondaryColor,
                    background_color: this.currentTheme.backgroundColor,
                    theme_name: this.currentTheme.themeName || this.currentThemeName
                };

                await saveThemeConfig(themeData);
                this.saveToStorage();
                console.log('主题配置已保存到服务器');
            } catch (error) {
                console.error('保存主题配置到服务器失败:', error);
                // 即使服务器保存失败，也保存到本地
                this.saveToStorage();
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 应用预设主题
        applyPresetTheme(preset) {
            this.currentTheme = {
                primaryColor: preset.primaryColor,
                secondaryColor: preset.secondaryColor,
                backgroundColor: preset.backgroundColor,
                themeName: preset.name
            };
            this.applyTheme();
            this.saveToStorage();
        },

        // 更新主题颜色
        updateThemeColor(colorType, color) {
            if (colorType === 'primary') {
                this.currentTheme.primaryColor = color;
            } else if (colorType === 'secondary') {
                this.currentTheme.secondaryColor = color;
            } else if (colorType === 'background') {
                this.currentTheme.backgroundColor = color;
            }
            
            // 更新名称为自定义主题
            if (!this.isPresetTheme) {
                this.currentTheme.themeName = '自定义主题';
            }
            
            this.applyTheme();
            this.saveToStorage();
        },

        // 应用主题到页面
        applyTheme() {
            try {
                // 防抖处理，避免短时间内重复触发
                if (this._applyThemeTimer) {
                    clearTimeout(this._applyThemeTimer);
                }

                this._applyThemeTimer = setTimeout(() => {
                    // 在uni-app中，我们通过CSS变量和本地存储来实现主题切换
                    // 触发页面重新渲染或通过事件通知组件更新
                    uni.$emit('themeChanged', this.currentTheme);
                    console.log('主题已应用:', this.currentTheme);
                }, 50);
            } catch (error) {
                console.error('应用主题失败:', error);
            }
        },

        // 保存到本地存储
        saveToStorage() {
            try {
                uni.setStorageSync('themeConfig', this.currentTheme);
            } catch (error) {
                console.error('保存主题到本地存储失败:', error);
            }
        },

        // 从本地存储加载
        loadFromStorage() {
            try {
                const themeConfig = uni.getStorageSync('themeConfig');
                return themeConfig || null;
            } catch (error) {
                console.error('从本地存储加载主题失败:', error);
                return null;
            }
        },

        // 检查是否已登录
        isLoggedIn() {
            try {
                const token = uni.getStorageSync('token');
                return !!token;
            } catch (error) {
                return false;
            }
        },

        // 重置为默认主题
        resetToDefault() {
            this.currentTheme = { ...presetThemes[0] };
            this.applyTheme();
            this.saveToStorage();
        }
    }
});
