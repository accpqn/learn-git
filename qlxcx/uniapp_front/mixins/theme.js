import { useThemeStore } from '@/store/theme';
import { computed, onMounted, onUnmounted } from 'vue';

/**
 * 主题混入 - 为组件提供主题相关的功能
 */
export function useTheme() {
    const themeStore = useThemeStore();
    
    // 当前主题配置
    const currentTheme = computed(() => themeStore.currentTheme);
    
    // 主题CSS变量
    const themeVars = computed(() => themeStore.cssVariables);
    
    // 主题样式对象
    const themeStyles = computed(() => ({
        '--theme-primary': currentTheme.value.primaryColor,
        '--theme-secondary': currentTheme.value.secondaryColor,
        '--theme-background': currentTheme.value.backgroundColor,
        '--theme-primary-light': currentTheme.value.primaryColor + '20',
        '--theme-secondary-light': currentTheme.value.secondaryColor + '20'
    }));

    // 获取主题颜色的方法
    const getThemeColor = (type = 'primary') => {
        switch (type) {
            case 'primary':
                return currentTheme.value.primaryColor;
            case 'secondary':
                return currentTheme.value.secondaryColor;
            case 'background':
                return currentTheme.value.backgroundColor;
            default:
                return currentTheme.value.primaryColor;
        }
    };

    // 获取渐变背景样式
    const getGradientStyle = (direction = '135deg') => {
        return {
            background: `linear-gradient(${direction}, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`
        };
    };

    // 获取主题按钮样式
    const getButtonStyle = (type = 'primary') => {
        const baseStyle = {
            borderRadius: '40rpx',
            border: 'none',
            fontWeight: 'bold'
        };

        switch (type) {
            case 'primary':
                return {
                    ...baseStyle,
                    background: `linear-gradient(135deg, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`,
                    color: 'white',
                    boxShadow: `0 8rpx 25rpx ${currentTheme.value.primaryColor}40`
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    background: currentTheme.value.backgroundColor,
                    color: currentTheme.value.primaryColor,
                    border: `2rpx solid ${currentTheme.value.primaryColor}`
                };
            case 'outline':
                return {
                    ...baseStyle,
                    background: 'transparent',
                    color: currentTheme.value.primaryColor,
                    border: `2rpx solid ${currentTheme.value.primaryColor}`
                };
            default:
                return baseStyle;
        }
    };

    // 获取卡片样式
    const getCardStyle = () => {
        return {
            background: 'white',
            borderRadius: '20rpx',
            boxShadow: '0 4rpx 20rpx rgba(0, 0, 0, 0.08)',
            border: `1rpx solid ${currentTheme.value.backgroundColor}`
        };
    };

    // 获取头部样式
    const getHeaderStyle = () => {
        return {
            background: `linear-gradient(135deg, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`,
            color: 'white'
        };
    };

    // 主题变化监听
    let themeChangeListener = null;

    onMounted(() => {
        // 监听主题变化事件
        themeChangeListener = (newTheme) => {
            console.log('主题已更新:', newTheme);
            // 可以在这里添加主题变化后的处理逻辑
        };
        
        uni.$on('themeChanged', themeChangeListener);
        
        // 初始化主题
        if (!themeStore.initialized) {
            themeStore.initTheme();
        }
    });

    onUnmounted(() => {
        // 移除事件监听
        if (themeChangeListener) {
            uni.$off('themeChanged', themeChangeListener);
        }
    });

    return {
        // 状态
        currentTheme,
        themeVars,
        themeStyles,
        
        // 方法
        getThemeColor,
        getGradientStyle,
        getButtonStyle,
        getCardStyle,
        getHeaderStyle,
        
        // Store方法
        applyPresetTheme: themeStore.applyPresetTheme,
        updateThemeColor: themeStore.updateThemeColor,
        saveThemeToServer: themeStore.saveThemeToServer,
        resetToDefault: themeStore.resetToDefault
    };
}

/**
 * 主题工具函数
 */
export const themeUtils = {
    // 颜色验证
    isValidColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    },

    // 颜色亮度计算
    getColorBrightness(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    },

    // 判断是否为深色
    isDarkColor(color) {
        return this.getColorBrightness(color) < 128;
    },

    // 获取对比色（黑色或白色）
    getContrastColor(color) {
        return this.isDarkColor(color) ? '#FFFFFF' : '#000000';
    },

    // 颜色透明度处理
    addAlpha(color, alpha) {
        const hex = color.replace('#', '');
        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
        return `#${hex}${alphaHex}`;
    }
};
