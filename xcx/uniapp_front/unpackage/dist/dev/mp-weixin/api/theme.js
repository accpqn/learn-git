"use strict";
require("../common/vendor.js");
const api_request = require("./request.js");
require("../config/index.js");
function getThemeConfig() {
  return api_request.request({
    url: "/core/theme/",
    method: "GET"
  });
}
function saveThemeConfig(data) {
  return api_request.request({
    url: "/core/theme/",
    method: "PATCH",
    data
  });
}
const presetThemes = [
  {
    name: "粉色恋人",
    primaryColor: "#FF69B4",
    secondaryColor: "#FF1493",
    backgroundColor: "#FFF5F8"
  },
  {
    name: "蓝色海洋",
    primaryColor: "#4A90E2",
    secondaryColor: "#357ABD",
    backgroundColor: "#F0F8FF"
  },
  {
    name: "绿色清新",
    primaryColor: "#52C41A",
    secondaryColor: "#389E0D",
    backgroundColor: "#F6FFED"
  },
  {
    name: "橙色活力",
    primaryColor: "#FA8C16",
    secondaryColor: "#D46B08",
    backgroundColor: "#FFF7E6"
  },
  {
    name: "紫色梦幻",
    primaryColor: "#722ED1",
    secondaryColor: "#531DAB",
    backgroundColor: "#F9F0FF"
  },
  {
    name: "红色热情",
    primaryColor: "#F5222D",
    secondaryColor: "#CF1322",
    backgroundColor: "#FFF1F0"
  },
  {
    name: "深邃夜空",
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    backgroundColor: "#ECF0F1"
  },
  {
    name: "温暖日落",
    primaryColor: "#E67E22",
    secondaryColor: "#F39C12",
    backgroundColor: "#FEF9E7"
  }
];
exports.getThemeConfig = getThemeConfig;
exports.presetThemes = presetThemes;
exports.saveThemeConfig = saveThemeConfig;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/theme.js.map
