"use strict";
const utils_config = require("../../utils/config.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "AgreementLinks",
  data() {
    return {
      userAgreementUrl: utils_config.APP_CONFIG.agreements.userAgreement,
      privacyPolicyUrl: utils_config.APP_CONFIG.agreements.privacyPolicy
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userAgreementUrl,
    b: $data.privacyPolicyUrl
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/public/AgreementLinks.js.map
