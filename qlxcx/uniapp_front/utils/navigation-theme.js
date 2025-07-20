/**
 * 导航栏主题工具函数
 * 用于动态设置页面导航栏的主题颜色
 */

import { useThemeStore } from '@/store/theme';

// 防抖定时器
let navigationBarDebounceTimer = null;

/**
 * 设置当前页面的导航栏主题
 * @param {Object} options - 配置选项
 * @param {boolean} options.useTheme - 是否使用主题颜色，默认true
 * @param {string} options.backgroundColor - 自定义背景色
 * @param {string} options.textStyle - 文字样式 'black' | 'white'
 * @param {string} options.title - 导航栏标题
 */
export function setNavigationBarTheme(options = {}) {
    // 防抖处理
    if (navigationBarDebounceTimer) {
        clearTimeout(navigationBarDebounceTimer);
    }

    navigationBarDebounceTimer = setTimeout(() => {
        try {
            const themeStore = useThemeStore();
            const {
                useTheme = true,
                backgroundColor,
                textStyle = 'white',
                title
            } = options;

            // 获取主题颜色
            const bgColor = useTheme
                ? (backgroundColor || themeStore.currentTheme.primaryColor)
                : (backgroundColor || '#FF69B4');

            // 设置导航栏样式
            const navigationBarStyle = {
                backgroundColor: bgColor,
                textStyle: textStyle
            };

            // 如果提供了标题，也设置标题
            if (title) {
                navigationBarStyle.title = title;
            }

            // 调用uni-app API设置导航栏
            uni.setNavigationBarColor({
                frontColor: textStyle === 'white' ? '#ffffff' : '#000000',
                backgroundColor: bgColor,
                animation: {
                    duration: 300,
                    timingFunc: 'easeIn'
                }
            });

            // 如果有标题，设置标题
            if (title) {
                uni.setNavigationBarTitle({
                    title: title
                });
            }

            console.log('导航栏主题已设置:', navigationBarStyle);
        } catch (error) {
            console.error('设置导航栏主题失败:', error);
        }
    }, 100);
}

/**
 * 重置导航栏为默认主题
 */
export function resetNavigationBarTheme() {
    try {
        uni.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#F8F8F8',
            animation: {
                duration: 300,
                timingFunc: 'easeIn'
            }
        });
        console.log('导航栏主题已重置为默认');
    } catch (error) {
        console.error('重置导航栏主题失败:', error);
    }
}

/**
 * 监听主题变化并自动更新导航栏
 * @param {Object} options - 配置选项
 * @returns {Function} 取消监听的函数
 */
export function watchNavigationBarTheme(options = {}) {
    const { textStyle = 'white' } = options;

    // 防抖处理，避免重复调用
    let debounceTimer = null;

    const themeChangeHandler = (newTheme) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            setNavigationBarTheme({
                useTheme: true,
                textStyle: textStyle
            });
        }, 100);
    };

    // 监听主题变化事件
    uni.$on('themeChanged', themeChangeHandler);

    // 返回取消监听的函数
    return () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        uni.$off('themeChanged', themeChangeHandler);
    };
}

/**
 * 页面主题导航栏混入
 * 在页面的 onShow 中调用
 */
export function initPageNavigationTheme(options = {}) {
    const {
        title,
        textStyle = 'white',
        useTheme = true
    } = options;

    // 设置导航栏主题
    setNavigationBarTheme({
        useTheme,
        textStyle,
        title
    });

    // 简化逻辑：每次都直接设置，不进行复杂的状态管理
    // 由于已经在setNavigationBarTheme中做了防抖，这里不会有性能问题

    return () => {}; // 返回空函数以保持接口一致
}

/**
 * 获取适合当前主题的导航栏配置
 */
export function getNavigationBarConfig() {
    const themeStore = useThemeStore();
    
    return {
        backgroundColor: themeStore.currentTheme.primaryColor,
        textStyle: 'white',
        frontColor: '#ffffff'
    };
}

/**
 * 批量更新多个页面的导航栏主题
 * @param {Array} pages - 页面路径数组
 * @param {Object} options - 配置选项
 */
export function updatePagesNavigationTheme(pages = [], options = {}) {
    const { textStyle = 'white' } = options;
    
    pages.forEach(pagePath => {
        try {
            // 这里只能在当前页面设置，无法跨页面设置
            // 需要在每个页面的 onShow 中调用 initPageNavigationTheme
            console.log(`页面 ${pagePath} 需要在 onShow 中调用 initPageNavigationTheme`);
        } catch (error) {
            console.error(`更新页面 ${pagePath} 导航栏主题失败:`, error);
        }
    });
}

/**
 * 设置TabBar主题颜色
 */
export function setTabBarTheme() {
    try {
        const themeStore = useThemeStore();

        uni.setTabBarStyle({
            color: '#909399',
            selectedColor: themeStore.currentTheme.primaryColor,
            backgroundColor: '#ffffff',
            borderStyle: 'white'
        });

        console.log('TabBar主题已设置:', themeStore.currentTheme.primaryColor);
    } catch (error) {
        console.error('设置TabBar主题失败:', error);
    }
}

/**
 * 检查当前环境是否支持动态导航栏
 */
export function isSupportDynamicNavigationBar() {
    // #ifdef H5
    return true;
    // #endif

    // #ifdef MP-WEIXIN
    return true;
    // #endif

    // #ifdef APP-PLUS
    return true;
    // #endif

    // #ifndef H5 || MP-WEIXIN || APP-PLUS
    return false;
    // #endif
}
