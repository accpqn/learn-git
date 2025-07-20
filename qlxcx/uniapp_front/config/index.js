// 应用配置文件
//
// 使用说明：
// 1. 开发时使用 development 配置
// 2. 测试时修改 CURRENT_ENV 为 'testing'
// 3. 生产部署时修改 CURRENT_ENV 为 'production' 并更新生产环境的URL
// 4. 所有图片和API请求都会自动使用对应环境的配置

// 开发环境配置
const development = {
    // API基础URL
    API_BASE_URL: 'http://127.0.0.1:8000',
    // 媒体文件基础URL
    MEDIA_BASE_URL: 'http://127.0.0.1:8000',
    // 是否开启调试模式
    DEBUG: true,
    // 请求超时时间（毫秒）
    REQUEST_TIMEOUT: 10000,
    // 应用名称
    APP_NAME: '情侣点餐系统'
};

// 生产环境配置
const production = {
    // API基础URL - 部署时需要修改为实际的服务器地址
    API_BASE_URL: 'https://your-domain.com',
    // 媒体文件基础URL - 可以是CDN地址
    MEDIA_BASE_URL: 'https://your-cdn.com',
    // 关闭调试模式
    DEBUG: false,
    // 生产环境请求超时时间
    REQUEST_TIMEOUT: 15000,
    // 应用名称
    APP_NAME: '情侣点餐系统'
};

// 测试环境配置
const testing = {
    API_BASE_URL: 'https://test-api.your-domain.com',
    MEDIA_BASE_URL: 'https://test-cdn.your-domain.com',
    DEBUG: true,
    REQUEST_TIMEOUT: 12000,
    APP_NAME: '情侣点餐系统(测试版)'
};

// 环境配置选择
// 可以通过修改这个变量来切换环境：'development' | 'testing' | 'production'
const CURRENT_ENV = 'development';

const getConfig = () => {
    switch (CURRENT_ENV) {
        case 'production':
            return production;
        case 'testing':
            return testing;
        default:
            return development;
    }
};

// 导出当前环境的配置
const config = getConfig();

// 辅助函数：获取完整的API URL
export const getApiUrl = (path) => {
    return `${config.API_BASE_URL}/api${path}`;
};

// 辅助函数：获取完整的媒体文件URL
export const getMediaUrl = (path) => {
    if (!path) return '';
    
    // 如果已经是完整URL，直接返回
    if (path.startsWith('http')) {
        return path;
    }
    
    // 拼接媒体文件基础URL
    return `${config.MEDIA_BASE_URL}${path}`;
};

// 辅助函数：获取商品图片URL
export const getProductImageUrl = (product) => {
    // 优先使用image字段（上传的图片），然后是image_url字段（外链图片）
    const imageField = product?.image;
    const imageUrlField = product?.image_url;
    
    // 如果有上传的图片文件
    if (imageField) {
        return getMediaUrl(imageField);
    }
    
    // 如果有外链图片URL
    if (imageUrlField) {
        return imageUrlField;
    }
    
    // 都没有则返回默认占位图
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY2OUI0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguaXoOWbvueJhzwvdGV4dD48L3N2Zz4=';
};

// 导出配置对象
export default config;
