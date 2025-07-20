"use strict";
const APP_CONFIG = {
  // 应用信息
  appName: "点餐小程序",
  version: "1.0.0",
  description: "2B2自定义点餐",
  // 主题色
  theme: {
    primary: "#FF69B4",
    secondary: "#FFC0CB",
    background: "#FFF0F5"
  },
  // 协议链接
  agreements: {
    userAgreement: "/pages/public/agreement?type=user",
    privacyPolicy: "/pages/public/agreement?type=privacy"
  },
  // 页面路径
  pages: {
    home: "/pages/home/index",
    ordering: "/pages/ordering/index",
    login: "/pages/public/login",
    register: "/pages/public/register"
  }
};
exports.APP_CONFIG = APP_CONFIG;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/config.js.map
