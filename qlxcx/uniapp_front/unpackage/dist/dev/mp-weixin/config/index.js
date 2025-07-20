"use strict";
const development = {
  // API基础URL
  API_BASE_URL: "http://127.0.0.1:8000",
  // 媒体文件基础URL
  MEDIA_BASE_URL: "http://127.0.0.1:8000",
  // 是否开启调试模式
  DEBUG: true,
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 1e4,
  // 应用名称
  APP_NAME: "情侣点餐系统"
};
const production = {
  // API基础URL - 部署时需要修改为实际的服务器地址
  API_BASE_URL: "https://your-domain.com",
  // 媒体文件基础URL - 可以是CDN地址
  MEDIA_BASE_URL: "https://your-cdn.com",
  // 关闭调试模式
  DEBUG: false,
  // 生产环境请求超时时间
  REQUEST_TIMEOUT: 15e3,
  // 应用名称
  APP_NAME: "情侣点餐系统"
};
const testing = {
  API_BASE_URL: "https://test-api.your-domain.com",
  MEDIA_BASE_URL: "https://test-cdn.your-domain.com",
  DEBUG: true,
  REQUEST_TIMEOUT: 12e3,
  APP_NAME: "情侣点餐系统(测试版)"
};
const CURRENT_ENV = "development";
const getConfig = () => {
  switch (CURRENT_ENV) {
    case "production":
      return production;
    case "testing":
      return testing;
    default:
      return development;
  }
};
const config = getConfig();
const getMediaUrl = (path) => {
  if (!path)
    return "";
  if (path.startsWith("http")) {
    return path;
  }
  return `${config.MEDIA_BASE_URL}${path}`;
};
const getProductImageUrl = (product) => {
  const imageField = product == null ? void 0 : product.image;
  const imageUrlField = product == null ? void 0 : product.image_url;
  if (imageField) {
    return getMediaUrl(imageField);
  }
  if (imageUrlField) {
    return imageUrlField;
  }
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkY2OUI0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguaXoOWbvueJhzwvdGV4dD48L3N2Zz4=";
};
exports.config = config;
exports.getProductImageUrl = getProductImageUrl;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/index.js.map
