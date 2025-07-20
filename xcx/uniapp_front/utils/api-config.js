// API配置管理

// 获取API基础URL
export const getApiBaseUrl = () => {
    // 开发环境
    if (process.env.NODE_ENV === 'development') {
        return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    }
    
    // 生产环境
    return import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com';
};

// API端点配置
export const API_ENDPOINTS = {
    // 用户相关
    AUTH: {
        LOGIN: '/api/users/login/',
        REGISTER: '/api/users/register/',
        REFRESH: '/api/token/refresh/',
        CURRENT_USER: '/api/users/current/',
        UPDATE_PROFILE: '/api/users/update-profile/',
        UPLOAD_AVATAR: '/api/users/upload-avatar/',
    },
    
    // 情侣绑定相关
    COUPLE: {
        SEND_REQUEST: '/api/users/send-binding-request/',
        PENDING_BINDINGS: '/api/users/pending-bindings/',
        RESPOND_BINDING: '/api/users/{id}/respond-binding/',
        BINDING_INFO: '/api/users/binding-info/',
        BINDING_HISTORY: '/api/users/binding-history/',
        CANCEL_REQUEST: '/api/users/cancel-binding-request/',
        UNBIND: '/api/users/{id}/unbind/',
    },
    
    // 菜单相关
    MENU: {
        LIST: '/api/menus/',
        DETAIL: '/api/menus/{id}/',
        CREATE: '/api/menus/',
        UPDATE: '/api/menus/{id}/',
        DELETE: '/api/menus/{id}/',
        PRODUCTS: '/api/menus/{id}/products/',
    },
    
    // 产品相关
    PRODUCT: {
        LIST: '/api/menus/{menu_id}/products/',
        DETAIL: '/api/menus/{menu_id}/products/{id}/',
        CREATE: '/api/menus/{menu_id}/products/',
        UPDATE: '/api/menus/{menu_id}/products/{id}/',
        DELETE: '/api/menus/{menu_id}/products/{id}/',
    },
    
    // 订单相关
    ORDER: {
        LIST: '/api/orders/',
        DETAIL: '/api/orders/{id}/',
        CREATE: '/api/orders/',
        UPDATE: '/api/orders/{id}/',
        DELETE: '/api/orders/{id}/',
    },
    
    // 主题相关
    THEME: {
        GET: '/api/core/theme/',
        UPDATE: '/api/core/theme/',
    }
};

// 构建完整的API URL
export const buildApiUrl = (endpoint, params = {}) => {
    const baseUrl = getApiBaseUrl();
    let url = endpoint;
    
    // 替换URL中的参数
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });
    
    return `${baseUrl}${url}`;
};

// 获取媒体文件URL
export const getMediaUrl = (path) => {
    if (!path) return '';
    
    // 如果已经是完整URL，直接返回
    if (path.startsWith('http')) {
        return path;
    }
    
    // 拼接基础URL
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${path}`;
};
