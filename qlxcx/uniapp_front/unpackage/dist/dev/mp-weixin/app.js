"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_user = require("./store/user.js");
const store_order = require("./store/order.js");
const store_theme = require("./store/theme.js");
if (!Math) {
  "./pages/home/index.js";
  "./pages/ordering/index.js";
  "./pages/settings/index.js";
  "./pages/settings/menu-manage.js";
  "./pages/settings/theme-config.js";
  "./pages/public/login.js";
  "./pages/public/register.js";
  "./pages/user/index.js";
  "./pages/user/profile.js";
  "./pages/order/list.js";
  "./pages/order/detail.js";
  "./pages/order/confirm.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:8", "App Launch");
    const userStore = store_user.useUserStore();
    const orderStore = store_order.useOrderStore();
    const themeStore = store_theme.useThemeStore();
    themeStore.initTheme().then(() => {
      this.updateCSSVariables(themeStore.currentTheme);
    }).catch((err) => {
      common_vendor.index.__f__("error", "at App.vue:20", "主题初始化失败:", err);
      this.updateCSSVariables(themeStore.currentTheme);
    });
    this.updateCSSVariables(themeStore.currentTheme);
    this.updateTabBarTheme(themeStore.currentTheme);
    common_vendor.index.$on("themeChanged", (theme) => {
      this.updateCSSVariables(theme);
      this.updateTabBarTheme(theme);
      this.updateNavigationBarTheme(theme);
    });
    if (userStore.initFromStorage()) {
      userStore.fetchCurrentUser().catch((err) => {
        common_vendor.index.__f__("error", "at App.vue:40", "Failed to fetch current user:", err);
        userStore.clearUserState();
      });
    }
    orderStore.initOrders();
  },
  methods: {
    // 更新CSS变量
    updateCSSVariables(theme) {
      try {
        common_vendor.index.__f__("log", "at App.vue:54", "正在更新CSS变量:", theme);
        common_vendor.index.__f__("log", "at App.vue:71", "小程序环境，通过动态样式绑定实现主题");
      } catch (error) {
        common_vendor.index.__f__("log", "at App.vue:75", "CSS变量更新失败:", error);
      }
    },
    // 更新TabBar主题
    updateTabBarTheme(theme) {
      try {
        const pages = getCurrentPages();
        if (pages.length === 0)
          return;
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route;
        const tabBarPages = [
          "pages/home/index",
          "pages/ordering/index",
          "pages/order/list",
          "pages/user/index"
        ];
        if (tabBarPages.includes(route)) {
          common_vendor.index.__f__("log", "at App.vue:99", "正在更新TabBar主题:", theme);
          common_vendor.index.setTabBarStyle({
            color: "#909399",
            selectedColor: theme.primaryColor,
            backgroundColor: "#ffffff",
            borderStyle: "white"
          });
          common_vendor.index.__f__("log", "at App.vue:108", "TabBar主题已更新");
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at App.vue:111", "TabBar主题更新失败:", error);
      }
    },
    // 更新导航栏主题
    updateNavigationBarTheme(theme) {
      try {
        common_vendor.index.__f__("log", "at App.vue:118", "正在更新导航栏主题:", theme);
        const pages = getCurrentPages();
        if (pages.length === 0)
          return;
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route;
        const themePages = [
          "pages/settings/index",
          "pages/settings/menu-manage",
          "pages/settings/theme-config",
          "pages/user/profile"
        ];
        if (themePages.includes(route)) {
          common_vendor.index.setNavigationBarColor({
            frontColor: "#ffffff",
            backgroundColor: theme.primaryColor,
            animation: {
              duration: 300,
              timingFunc: "easeIn"
            }
          });
          common_vendor.index.__f__("log", "at App.vue:146", "导航栏主题已更新");
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at App.vue:149", "导航栏主题更新失败:", error);
      }
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:154", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:157", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  app.use(common_vendor.uviewPlus);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
