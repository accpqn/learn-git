"use strict";
const api_request = require("./request.js");
const themeApi = {
  // 获取主题设置
  get() {
    return api_request.request({
      url: "/core/theme/",
      method: "GET"
    });
  },
  // 更新主题设置
  update(data) {
    return api_request.request({
      url: "/core/theme/",
      method: "PATCH",
      data
    });
  }
};
exports.themeApi = themeApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/core.js.map
