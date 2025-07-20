"use strict";
const common_vendor = require("../common/vendor.js");
const api_theme = require("../api/theme.js");
const useThemeStore = common_vendor.defineStore("theme", {
  state: () => ({
    // 当前主题配置
    currentTheme: {
      primaryColor: "#FF69B4",
      secondaryColor: "#FF1493",
      backgroundColor: "#FFF5F8",
      themeName: "粉色恋人"
    },
    // 预设主题列表
    presetThemes: api_theme.presetThemes,
    // 加载状态
    loading: false,
    // 是否已初始化
    initialized: false
  }),
  getters: {
    // 获取当前主题的CSS变量
    cssVariables: (state) => {
      return {
        "--theme-primary": state.currentTheme.primaryColor,
        "--theme-secondary": state.currentTheme.secondaryColor,
        "--theme-background": state.currentTheme.backgroundColor,
        "--theme-primary-light": state.currentTheme.primaryColor + "20",
        "--theme-secondary-light": state.currentTheme.secondaryColor + "20"
      };
    },
    // 获取当前主题名称
    currentThemeName: (state) => {
      const preset = state.presetThemes.find(
        (theme) => theme.primaryColor === state.currentTheme.primaryColor && theme.secondaryColor === state.currentTheme.secondaryColor && theme.backgroundColor === state.currentTheme.backgroundColor
      );
      return preset ? preset.name : state.currentTheme.themeName || "自定义主题";
    },
    // 判断是否为预设主题
    isPresetTheme: (state) => {
      return state.presetThemes.some(
        (theme) => theme.primaryColor === state.currentTheme.primaryColor && theme.secondaryColor === state.currentTheme.secondaryColor && theme.backgroundColor === state.currentTheme.backgroundColor
      );
    }
  },
  actions: {
    // 初始化主题
    async initTheme() {
      if (this.initialized)
        return;
      try {
        const localTheme = this.loadFromStorage();
        if (localTheme) {
          this.currentTheme = { ...localTheme };
          this.applyTheme();
        }
        if (this.isLoggedIn()) {
          await this.fetchThemeFromServer();
        }
        this.setupLoginListener();
        this.initialized = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:79", "初始化主题失败:", error);
        this.currentTheme = { ...api_theme.presetThemes[0] };
        this.applyTheme();
        this.initialized = true;
      }
    },
    // 设置登录监听器
    setupLoginListener() {
      common_vendor.index.$on("userLoginSuccess", async (data) => {
        common_vendor.index.__f__("log", "at store/theme.js:91", "收到用户登录成功事件，开始同步主题配置");
        try {
          await this.fetchThemeFromServer();
          common_vendor.index.__f__("log", "at store/theme.js:94", "登录后主题配置同步成功");
        } catch (error) {
          common_vendor.index.__f__("warn", "at store/theme.js:96", "登录后主题配置同步失败:", error);
        }
      });
    },
    // 从服务器获取主题配置
    async fetchThemeFromServer() {
      if (!this.isLoggedIn()) {
        common_vendor.index.__f__("log", "at store/theme.js:104", "用户未登录，跳过服务器主题获取");
        return;
      }
      this.loading = true;
      try {
        const serverTheme = await api_theme.getThemeConfig();
        if (serverTheme) {
          this.currentTheme = {
            primaryColor: serverTheme.primary_color || serverTheme.primaryColor,
            secondaryColor: serverTheme.secondary_color || serverTheme.secondaryColor,
            backgroundColor: serverTheme.background_color || serverTheme.backgroundColor,
            themeName: serverTheme.theme_name || serverTheme.themeName || this.currentThemeName
          };
          this.applyTheme();
          this.saveToStorage();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:122", "获取服务器主题配置失败:", error);
        if (error.message && error.message.includes("401")) {
          common_vendor.index.__f__("log", "at store/theme.js:125", "认证失败，使用本地主题配置");
        } else {
          throw error;
        }
      } finally {
        this.loading = false;
      }
    },
    // 保存主题配置到服务器
    async saveThemeToServer() {
      if (!this.isLoggedIn()) {
        this.saveToStorage();
        return;
      }
      this.loading = true;
      try {
        const themeData = {
          primary_color: this.currentTheme.primaryColor,
          secondary_color: this.currentTheme.secondaryColor,
          background_color: this.currentTheme.backgroundColor,
          theme_name: this.currentTheme.themeName || this.currentThemeName
        };
        await api_theme.saveThemeConfig(themeData);
        this.saveToStorage();
        common_vendor.index.__f__("log", "at store/theme.js:153", "主题配置已保存到服务器");
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:155", "保存主题配置到服务器失败:", error);
        this.saveToStorage();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 应用预设主题
    applyPresetTheme(preset) {
      this.currentTheme = {
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        backgroundColor: preset.backgroundColor,
        themeName: preset.name
      };
      this.applyTheme();
      this.saveToStorage();
    },
    // 更新主题颜色
    updateThemeColor(colorType, color) {
      if (colorType === "primary") {
        this.currentTheme.primaryColor = color;
      } else if (colorType === "secondary") {
        this.currentTheme.secondaryColor = color;
      } else if (colorType === "background") {
        this.currentTheme.backgroundColor = color;
      }
      if (!this.isPresetTheme) {
        this.currentTheme.themeName = "自定义主题";
      }
      this.applyTheme();
      this.saveToStorage();
    },
    // 应用主题到页面
    applyTheme() {
      try {
        if (this._applyThemeTimer) {
          clearTimeout(this._applyThemeTimer);
        }
        this._applyThemeTimer = setTimeout(() => {
          common_vendor.index.$emit("themeChanged", this.currentTheme);
          common_vendor.index.__f__("log", "at store/theme.js:207", "主题已应用:", this.currentTheme);
        }, 50);
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:210", "应用主题失败:", error);
      }
    },
    // 保存到本地存储
    saveToStorage() {
      try {
        common_vendor.index.setStorageSync("themeConfig", this.currentTheme);
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:219", "保存主题到本地存储失败:", error);
      }
    },
    // 从本地存储加载
    loadFromStorage() {
      try {
        const themeConfig = common_vendor.index.getStorageSync("themeConfig");
        return themeConfig || null;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/theme.js:229", "从本地存储加载主题失败:", error);
        return null;
      }
    },
    // 检查是否已登录
    isLoggedIn() {
      try {
        const token = common_vendor.index.getStorageSync("token");
        return !!token;
      } catch (error) {
        return false;
      }
    },
    // 重置为默认主题
    resetToDefault() {
      this.currentTheme = { ...api_theme.presetThemes[0] };
      this.applyTheme();
      this.saveToStorage();
    }
  }
});
exports.useThemeStore = useThemeStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/theme.js.map
