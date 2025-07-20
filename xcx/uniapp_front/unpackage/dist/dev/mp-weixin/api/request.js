"use strict";
const common_vendor = require("../common/vendor.js");
const store_user = require("../store/user.js");
const config_index = require("../config/index.js");
const BASE_URL = `${config_index.config.API_BASE_URL}/api`;
const request = (options) => {
  const userStore = store_user.useUserStore();
  return new Promise((resolve, reject) => {
    options.url = `${BASE_URL}${options.url}`;
    options.header = {
      "Content-Type": "application/json",
      ...options.header
    };
    const noAuthUrls = [
      "/users/login/",
      "/users/verify-and-login/",
      "/users/send-code/",
      "/token/refresh/"
    ];
    const requiresAuth = !noAuthUrls.some((url) => options.url.includes(url));
    if (userStore.token && requiresAuth) {
      options.header.Authorization = `Bearer ${userStore.token}`;
    }
    common_vendor.index.request({
      ...options,
      timeout: config_index.config.REQUEST_TIMEOUT,
      // 使用配置文件中的超时时间
      success: async (response) => {
        if (response.statusCode === 401 && !options.url.includes("/token/refresh")) {
          try {
            const success = await userStore.refreshUserToken();
            if (success) {
              options.header.Authorization = `Bearer ${userStore.token}`;
              common_vendor.index.request({
                ...options,
                success: (retryResponse) => {
                  resolve(retryResponse.data);
                },
                fail: (error) => {
                  reject(error);
                }
              });
              return;
            }
          } catch (error) {
            userStore.clearUserState();
            common_vendor.index.reLaunch({
              url: "/pages/public/login"
            });
            reject(new Error("登录已过期，请重新登录"));
            return;
          }
        }
        if (response.statusCode >= 400) {
          const error = new Error(response.data.message || response.data.detail || "请求失败");
          error.response = response;
          reject(error);
          return;
        }
        resolve(response.data);
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at api/request.js:81", "Request failed:", error);
        let errorMessage = "网络错误";
        if (error.errMsg) {
          if (error.errMsg.includes("timeout")) {
            errorMessage = "请求超时，请检查网络连接";
          } else if (error.errMsg.includes("fail")) {
            errorMessage = "连接服务器失败";
          }
        }
        common_vendor.index.showToast({
          title: errorMessage,
          icon: "none",
          duration: 3e3
        });
        const customError = new Error(errorMessage);
        customError.originalError = error;
        reject(customError);
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map
