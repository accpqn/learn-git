"use strict";
const utils_config = require("../../utils/config.js");
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "AppIntro",
  data() {
    return {
      appName: utils_config.APP_CONFIG.appName,
      description: utils_config.APP_CONFIG.description,
      features: [
        {
          title: "定制主题",
          description: "打造你们的专属风格"
        }
      ]
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.t($data.appName),
    c: common_vendor.t($data.description),
    d: common_vendor.f($data.features, (feature, index, i0) => {
      return {
        a: common_vendor.t(feature.title),
        b: common_vendor.t(feature.description),
        c: index
      };
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/public/AppIntro.js.map
