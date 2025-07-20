"use strict";
const common_vendor = require("../../common/vendor.js");
const mixins_theme = require("../../mixins/theme.js");
const store_theme = require("../../store/theme.js");
const _sfc_main = {
  name: "Settings",
  setup() {
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const themeStore = store_theme.useThemeStore();
    const themeConfig = common_vendor.computed(() => currentTheme.value);
    common_vendor.onShow(() => {
      try {
        common_vendor.index.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: themeStore.currentTheme.primaryColor,
          animation: {
            duration: 300,
            timingFunc: "easeIn"
          }
        });
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/settings/index.vue:78", "设置导航栏主题失败:", error);
      }
    });
    const navigateToMenuManage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/settings/menu-manage"
      });
    };
    const navigateToThemeConfig = () => {
      common_vendor.index.navigateTo({
        url: "/pages/settings/theme-config"
      });
    };
    return {
      themeConfig,
      navigateToMenuManage,
      navigateToThemeConfig,
      // 主题相关
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $setup.navigateToMenuManage && $setup.navigateToMenuManage(...args)),
    b: $setup.themeConfig.primaryColor,
    c: $setup.themeConfig.secondaryColor,
    d: $setup.themeConfig.backgroundColor,
    e: common_vendor.o((...args) => $setup.navigateToThemeConfig && $setup.navigateToThemeConfig(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a11b3e9a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/index.js.map
