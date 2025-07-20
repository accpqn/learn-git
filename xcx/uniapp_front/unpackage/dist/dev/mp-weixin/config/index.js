"use strict";
const common_vendor = require("../common/vendor.js");
const development = {
  // API基础URL - 优先使用环境变量
  API_BASE_URL: "https://xcx.euans.xyz",
  // 媒体文件基础URL - 优先使用环境变量
  MEDIA_BASE_URL: "https://xcx.euans.xyz",
  // 是否开启调试模式
  DEBUG: true,
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 1e4,
  // 应用名称
  APP_NAME: "情侣点餐小程序"
};
const production = {
  // API基础URL - 优先使用环境变量
  API_BASE_URL: "https://xcx.euans.xyz",
  // 媒体文件基础URL - 优先使用环境变量
  MEDIA_BASE_URL: "https://xcx.euans.xyz",
  // 关闭调试模式
  DEBUG: false,
  // 生产环境请求超时时间
  REQUEST_TIMEOUT: 15e3,
  // 应用名称
  APP_NAME: "情侣点餐小程序"
};
const testing = {
  API_BASE_URL: "https://test-api.your-domain.com",
  MEDIA_BASE_URL: "https://test-cdn.your-domain.com",
  DEBUG: true,
  REQUEST_TIMEOUT: 12e3,
  APP_NAME: "情侣点餐系统(测试版)"
};
const getEnvironment = () => {
  {
    return "development";
  }
};
const CURRENT_ENV = getEnvironment();
const getConfig = () => {
  common_vendor.index.__f__("log", "at config/index.js:66", `当前环境: ${CURRENT_ENV}`);
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
const getApiUrl = (path) => {
  return `${config.API_BASE_URL}/api${path}`;
};
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
exports.getApiUrl = getApiUrl;
exports.getProductImageUrl = getProductImageUrl;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/index.js.map
