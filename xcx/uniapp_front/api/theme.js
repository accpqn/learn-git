import request from './request';
import { getApiUrl } from '@/config/index';

// 获取主题配置
export function getThemeConfig() {
    return request({
        url: '/core/theme/',
        method: 'GET'
    });
}

// 保存主题配置
export function saveThemeConfig(data) {
    return request({
        url: '/core/theme/',
        method: 'PATCH',
        data
    });
}

// 预设主题配置
export const presetThemes = [
    {
        name: '粉色恋人',
        primaryColor: '#FF69B4',
        secondaryColor: '#FF1493',
        backgroundColor: '#FFF5F8'
    },
    {
        name: '蓝色海洋',
        primaryColor: '#4A90E2',
        secondaryColor: '#357ABD',
        backgroundColor: '#F0F8FF'
    },
    {
        name: '绿色清新',
        primaryColor: '#52C41A',
        secondaryColor: '#389E0D',
        backgroundColor: '#F6FFED'
    },
    {
        name: '橙色活力',
        primaryColor: '#FA8C16',
        secondaryColor: '#D46B08',
        backgroundColor: '#FFF7E6'
    },
    {
        name: '紫色梦幻',
        primaryColor: '#722ED1',
        secondaryColor: '#531DAB',
        backgroundColor: '#F9F0FF'
    },
    {
        name: '红色热情',
        primaryColor: '#F5222D',
        secondaryColor: '#CF1322',
        backgroundColor: '#FFF1F0'
    },
    {
        name: '深邃夜空',
        primaryColor: '#2C3E50',
        secondaryColor: '#34495E',
        backgroundColor: '#ECF0F1'
    },
    {
        name: '温暖日落',
        primaryColor: '#E67E22',
        secondaryColor: '#F39C12',
        backgroundColor: '#FEF9E7'
    }
];

// 应用主题到页面
export function applyTheme(themeConfig) {
    // uni-app中不支持document，直接保存到本地存储
    // 主题应用通过重新加载页面或者动态样式实现
    try {
        uni.setStorageSync('themeConfig', themeConfig);
        console.log('主题配置已保存:', themeConfig);
    } catch (error) {
        console.error('保存主题配置失败:', error);
    }
}

// 从本地存储加载主题
export function loadThemeFromStorage() {
    try {
        const themeConfig = uni.getStorageSync('themeConfig');
        if (themeConfig) {
            applyTheme(themeConfig);
            return themeConfig;
        }
    } catch (error) {
        console.error('加载主题配置失败:', error);
    }
    
    // 返回默认主题
    return presetThemes[0];
}
