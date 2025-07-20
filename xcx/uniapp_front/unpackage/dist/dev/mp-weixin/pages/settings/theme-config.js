"use strict";
const common_vendor = require("../../common/vendor.js");
const store_theme = require("../../store/theme.js");
const mixins_theme = require("../../mixins/theme.js");
const _sfc_main = {
  name: "ThemeConfig",
  setup() {
    const themeStore = store_theme.useThemeStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const saving = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      if (!themeStore.initialized) {
        themeStore.initTheme();
      }
    });
    common_vendor.onShow(() => {
      try {
        common_vendor.index.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: themeStore.currentTheme.primaryColor,
          animation: {
            duration: 0,
            // 立即生效
            timingFunc: "linear"
          }
        });
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/settings/theme-config.vue:116", "设置导航栏主题失败:", error);
      }
      common_vendor.index.$emit("onPageShow", "pages/settings/theme-config");
    });
    const themeConfig = common_vendor.computed(() => currentTheme.value);
    const presetThemes = common_vendor.computed(() => themeStore.presetThemes);
    const showColorPicker = (type) => {
      const currentColor = getThemeColor(type);
      common_vendor.index.showModal({
        title: "输入颜色值",
        content: "请输入十六进制颜色值（如：#FF69B4）",
        editable: true,
        placeholderText: currentColor,
        success: (res) => {
          if (res.confirm && res.content) {
            const color = res.content.trim();
            if (mixins_theme.themeUtils.isValidColor(color)) {
              themeStore.updateThemeColor(type, color);
              common_vendor.index.showToast({
                title: "颜色已更新",
                icon: "success"
              });
            } else {
              common_vendor.index.showToast({
                title: "颜色格式错误，请输入如 #FF69B4 格式",
                icon: "error"
              });
            }
          }
        }
      });
    };
    const isCurrentTheme = (preset) => {
      return preset.primaryColor === themeConfig.value.primaryColor && preset.secondaryColor === themeConfig.value.secondaryColor && preset.backgroundColor === themeConfig.value.backgroundColor;
    };
    const applyPresetTheme = (preset) => {
      themeStore.applyPresetTheme(preset);
      common_vendor.index.showToast({
        title: `已应用${preset.name}主题`,
        icon: "success"
      });
    };
    const saveThemeConfigData = async () => {
      saving.value = true;
      try {
        await themeStore.saveThemeToServer();
        common_vendor.index.showToast({
          title: "主题保存成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/theme-config.vue:184", "保存主题失败:", error);
        common_vendor.index.showToast({
          title: "主题已保存到本地",
          icon: "success"
        });
      } finally {
        saving.value = false;
      }
    };
    const resetTheme = () => {
      common_vendor.index.showModal({
        title: "重置主题",
        content: "确定要重置为默认主题吗？",
        success: (res) => {
          if (res.confirm) {
            themeStore.resetToDefault();
            common_vendor.index.showToast({
              title: "已重置为默认主题",
              icon: "success"
            });
          }
        }
      });
    };
    return {
      saving,
      themeConfig,
      presetThemes,
      showColorPicker,
      isCurrentTheme,
      applyPresetTheme,
      resetTheme,
      saveThemeConfig: saveThemeConfigData,
      getButtonStyle,
      getHeaderStyle,
      getThemeColor
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $setup.themeConfig.primaryColor,
    b: $setup.themeConfig.secondaryColor,
    c: $setup.themeConfig.backgroundColor,
    d: $setup.themeConfig.primaryColor,
    e: common_vendor.t($setup.themeConfig.primaryColor),
    f: common_vendor.o(($event) => $setup.showColorPicker("primary")),
    g: $setup.themeConfig.secondaryColor,
    h: common_vendor.t($setup.themeConfig.secondaryColor),
    i: common_vendor.o(($event) => $setup.showColorPicker("secondary")),
    j: $setup.themeConfig.backgroundColor,
    k: common_vendor.t($setup.themeConfig.backgroundColor),
    l: common_vendor.o(($event) => $setup.showColorPicker("background")),
    m: common_vendor.f($setup.presetThemes, (preset, index, i0) => {
      return {
        a: preset.primaryColor,
        b: preset.secondaryColor,
        c: preset.backgroundColor,
        d: common_vendor.t(preset.name),
        e: index,
        f: $setup.isCurrentTheme(preset) ? 1 : "",
        g: common_vendor.o(($event) => $setup.applyPresetTheme(preset), index)
      };
    }),
    n: common_vendor.o((...args) => $setup.resetTheme && $setup.resetTheme(...args)),
    o: common_vendor.s($setup.getButtonStyle("primary")),
    p: common_vendor.o((...args) => $setup.saveThemeConfig && $setup.saveThemeConfig(...args)),
    q: $setup.saving,
    r: $setup.themeConfig.primaryColor,
    s: $setup.themeConfig.secondaryColor,
    t: $setup.themeConfig.backgroundColor
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7d64be58"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/theme-config.js.map
