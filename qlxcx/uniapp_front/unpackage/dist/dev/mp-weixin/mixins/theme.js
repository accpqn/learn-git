"use strict";
const common_vendor = require("../common/vendor.js");
const store_theme = require("../store/theme.js");
function useTheme() {
  const themeStore = store_theme.useThemeStore();
  const currentTheme = common_vendor.computed(() => themeStore.currentTheme);
  const themeVars = common_vendor.computed(() => themeStore.cssVariables);
  const themeStyles = common_vendor.computed(() => ({
    "--theme-primary": currentTheme.value.primaryColor,
    "--theme-secondary": currentTheme.value.secondaryColor,
    "--theme-background": currentTheme.value.backgroundColor,
    "--theme-primary-light": currentTheme.value.primaryColor + "20",
    "--theme-secondary-light": currentTheme.value.secondaryColor + "20"
  }));
  const getThemeColor = (type = "primary") => {
    switch (type) {
      case "primary":
        return currentTheme.value.primaryColor;
      case "secondary":
        return currentTheme.value.secondaryColor;
      case "background":
        return currentTheme.value.backgroundColor;
      default:
        return currentTheme.value.primaryColor;
    }
  };
  const getGradientStyle = (direction = "135deg") => {
    return {
      background: `linear-gradient(${direction}, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`
    };
  };
  const getButtonStyle = (type = "primary") => {
    const baseStyle = {
      borderRadius: "40rpx",
      border: "none",
      fontWeight: "bold"
    };
    switch (type) {
      case "primary":
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`,
          color: "white",
          boxShadow: `0 8rpx 25rpx ${currentTheme.value.primaryColor}40`
        };
      case "secondary":
        return {
          ...baseStyle,
          background: currentTheme.value.backgroundColor,
          color: currentTheme.value.primaryColor,
          border: `2rpx solid ${currentTheme.value.primaryColor}`
        };
      case "outline":
        return {
          ...baseStyle,
          background: "transparent",
          color: currentTheme.value.primaryColor,
          border: `2rpx solid ${currentTheme.value.primaryColor}`
        };
      default:
        return baseStyle;
    }
  };
  const getCardStyle = () => {
    return {
      background: "white",
      borderRadius: "20rpx",
      boxShadow: "0 4rpx 20rpx rgba(0, 0, 0, 0.08)",
      border: `1rpx solid ${currentTheme.value.backgroundColor}`
    };
  };
  const getHeaderStyle = () => {
    return {
      background: `linear-gradient(135deg, ${currentTheme.value.primaryColor}, ${currentTheme.value.secondaryColor})`,
      color: "white"
    };
  };
  let themeChangeListener = null;
  common_vendor.onMounted(() => {
    themeChangeListener = (newTheme) => {
      common_vendor.index.__f__("log", "at mixins/theme.js:105", "主题已更新:", newTheme);
    };
    common_vendor.index.$on("themeChanged", themeChangeListener);
    if (!themeStore.initialized) {
      themeStore.initTheme();
    }
  });
  common_vendor.onUnmounted(() => {
    if (themeChangeListener) {
      common_vendor.index.$off("themeChanged", themeChangeListener);
    }
  });
  return {
    // 状态
    currentTheme,
    themeVars,
    themeStyles,
    // 方法
    getThemeColor,
    getGradientStyle,
    getButtonStyle,
    getCardStyle,
    getHeaderStyle,
    // Store方法
    applyPresetTheme: themeStore.applyPresetTheme,
    updateThemeColor: themeStore.updateThemeColor,
    saveThemeToServer: themeStore.saveThemeToServer,
    resetToDefault: themeStore.resetToDefault
  };
}
const themeUtils = {
  // 颜色验证
  isValidColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  },
  // 颜色亮度计算
  getColorBrightness(color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1e3;
  },
  // 判断是否为深色
  isDarkColor(color) {
    return this.getColorBrightness(color) < 128;
  },
  // 获取对比色（黑色或白色）
  getContrastColor(color) {
    return this.isDarkColor(color) ? "#FFFFFF" : "#000000";
  },
  // 颜色透明度处理
  addAlpha(color, alpha) {
    const hex = color.replace("#", "");
    const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, "0");
    return `#${hex}${alphaHex}`;
  }
};
exports.themeUtils = themeUtils;
exports.useTheme = useTheme;
//# sourceMappingURL=../../.sourcemap/mp-weixin/mixins/theme.js.map
