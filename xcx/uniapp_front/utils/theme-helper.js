/**
 * 主题应用工具函数
 * 用于快速在页面中应用主题样式
 */

import { useThemeStore } from '@/store/theme';

/**
 * 获取当前主题的CSS变量对象
 */
export function getCurrentThemeVars() {
    const themeStore = useThemeStore();
    return {
        '--theme-primary': themeStore.currentTheme.primaryColor,
        '--theme-secondary': themeStore.currentTheme.secondaryColor,
        '--theme-background': themeStore.currentTheme.backgroundColor,
        '--theme-primary-light': themeStore.currentTheme.primaryColor + '20',
        '--theme-secondary-light': themeStore.currentTheme.secondaryColor + '20'
    };
}

/**
 * 应用主题到页面根元素
 * @param {Object} pageInstance - 页面实例
 */
export function applyThemeToPage(pageInstance) {
    try {
        const themeVars = getCurrentThemeVars();
        
        // 在H5环境中直接设置CSS变量
        // #ifdef H5
        const rootElement = document.documentElement;
        Object.keys(themeVars).forEach(key => {
            rootElement.style.setProperty(key, themeVars[key]);
        });
        // #endif
        
        // 在小程序环境中通过页面数据设置
        // #ifndef H5
        if (pageInstance && pageInstance.setData) {
            pageInstance.setData({
                themeVars: themeVars
            });
        }
        // #endif
        
        console.log('主题已应用到页面:', themeVars);
    } catch (error) {
        console.error('应用主题到页面失败:', error);
    }
}

/**
 * 监听主题变化并自动应用
 * @param {Function} callback - 主题变化回调函数
 */
export function watchThemeChange(callback) {
    const themeChangeHandler = (newTheme) => {
        console.log('主题变化:', newTheme);
        
        // 更新CSS变量
        const themeVars = {
            '--theme-primary': newTheme.primaryColor,
            '--theme-secondary': newTheme.secondaryColor,
            '--theme-background': newTheme.backgroundColor,
            '--theme-primary-light': newTheme.primaryColor + '20',
            '--theme-secondary-light': newTheme.secondaryColor + '20'
        };
        
        // #ifdef H5
        const rootElement = document.documentElement;
        Object.keys(themeVars).forEach(key => {
            rootElement.style.setProperty(key, themeVars[key]);
        });
        // #endif
        
        // 执行回调
        if (callback && typeof callback === 'function') {
            callback(newTheme, themeVars);
        }
    };
    
    // 监听主题变化事件
    uni.$on('themeChanged', themeChangeHandler);
    
    // 返回取消监听的函数
    return () => {
        uni.$off('themeChanged', themeChangeHandler);
    };
}

/**
 * 获取主题相关的样式类名
 */
export function getThemeClasses() {
    return {
        primaryBg: 'theme-primary-bg',
        secondaryBg: 'theme-secondary-bg',
        gradientBg: 'theme-gradient-bg',
        primaryColor: 'theme-primary-color',
        secondaryColor: 'theme-secondary-color',
        primaryBorder: 'theme-primary-border'
    };
}

/**
 * 生成主题相关的内联样式
 * @param {string} type - 样式类型 (primary, secondary, gradient, etc.)
 * @param {Object} options - 额外选项
 */
export function getThemeStyle(type, options = {}) {
    const themeStore = useThemeStore();
    const { primaryColor, secondaryColor, backgroundColor } = themeStore.currentTheme;
    
    const baseStyles = {
        borderRadius: options.borderRadius || '20rpx',
        padding: options.padding || '20rpx',
        ...options.extra
    };
    
    switch (type) {
        case 'primary':
            return {
                ...baseStyles,
                background: primaryColor,
                color: 'white'
            };
            
        case 'secondary':
            return {
                ...baseStyles,
                background: secondaryColor,
                color: 'white'
            };
            
        case 'gradient':
            return {
                ...baseStyles,
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                color: 'white'
            };
            
        case 'outline':
            return {
                ...baseStyles,
                background: 'transparent',
                border: `2rpx solid ${primaryColor}`,
                color: primaryColor
            };
            
        case 'light':
            return {
                ...baseStyles,
                background: backgroundColor,
                color: primaryColor
            };
            
        default:
            return baseStyles;
    }
}

/**
 * 页面主题初始化混入
 * 在页面的 onMounted 中调用
 */
export function initPageTheme() {
    const themeStore = useThemeStore();
    
    // 确保主题已初始化
    if (!themeStore.initialized) {
        themeStore.initTheme();
    }
    
    // 应用当前主题
    applyThemeToPage();
    
    // 监听主题变化
    const unwatch = watchThemeChange();
    
    // 返回清理函数
    return unwatch;
}

/**
 * 获取适配当前主题的颜色
 * @param {string} colorType - 颜色类型
 * @param {number} opacity - 透明度 (0-1)
 */
export function getThemeColor(colorType = 'primary', opacity = 1) {
    const themeStore = useThemeStore();
    let color;
    
    switch (colorType) {
        case 'primary':
            color = themeStore.currentTheme.primaryColor;
            break;
        case 'secondary':
            color = themeStore.currentTheme.secondaryColor;
            break;
        case 'background':
            color = themeStore.currentTheme.backgroundColor;
            break;
        default:
            color = themeStore.currentTheme.primaryColor;
    }
    
    if (opacity < 1) {
        // 转换为rgba格式
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
}
