"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
const mixins_theme = require("../../mixins/theme.js");
require("../../store/theme.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  setup() {
    const userStore = store_user.useUserStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const saving = common_vendor.ref(false);
    const formData = common_vendor.ref({
      username: "",
      email: "",
      bio: ""
    });
    const userInfo = common_vendor.computed(() => userStore.userInfo);
    const getUserAvatarUrl = () => {
      var _a;
      if ((_a = userInfo.value) == null ? void 0 : _a.avatar_url) {
        if (userInfo.value.avatar_url.startsWith("http")) {
          return userInfo.value.avatar_url;
        }
        return `${"https://xcx.euans.xyz"}${userInfo.value.avatar_url}`;
      }
      return "/static/images/default-avatar.png";
    };
    const initFormData = () => {
      if (userInfo.value) {
        formData.value = {
          username: userInfo.value.username || "",
          email: userInfo.value.email || "",
          bio: userInfo.value.bio || ""
        };
      }
    };
    common_vendor.onMounted(() => {
      initFormData();
    });
    const changeAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.__f__("log", "at pages/user/profile.vue:124", "选择的头像:", tempFilePath);
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          try {
            const result = await api_user.uploadAvatar(tempFilePath);
            common_vendor.index.__f__("log", "at pages/user/profile.vue:135", "头像上传成功:", result);
            if (result.user) {
              userStore.userInfo = result.user;
              userStore.saveUserToLocal();
            }
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "头像更新成功",
              icon: "success"
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/user/profile.vue:150", "头像上传失败:", error);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "头像上传失败: " + (error.message || "网络错误"),
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/user/profile.vue:159", "选择图片失败:", error);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const saveProfile = async () => {
      if (!formData.value.username.trim()) {
        common_vendor.index.showToast({
          title: "请输入用户名",
          icon: "none"
        });
        return;
      }
      if (!formData.value.email.trim()) {
        common_vendor.index.showToast({
          title: "请输入邮箱地址",
          icon: "none"
        });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.value.email)) {
        common_vendor.index.showToast({
          title: "邮箱格式不正确",
          icon: "none"
        });
        return;
      }
      saving.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/user/profile.vue:201", "保存用户信息:", formData.value);
        const result = await api_user.updateUserProfile(formData.value);
        common_vendor.index.__f__("log", "at pages/user/profile.vue:205", "用户信息更新成功:", result);
        userStore.userInfo = {
          ...userStore.userInfo,
          ...result
        };
        userStore.saveUserToLocal();
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          goBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/profile.vue:225", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败: " + (error.message || "网络错误"),
          icon: "none"
        });
      } finally {
        saving.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return {
      formData,
      saving,
      getUserAvatarUrl,
      changeAvatar,
      saveProfile,
      goBack,
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
    a: $setup.getUserAvatarUrl(),
    b: common_vendor.o((...args) => $setup.changeAvatar && $setup.changeAvatar(...args)),
    c: $setup.formData.username,
    d: common_vendor.o(($event) => $setup.formData.username = $event.detail.value),
    e: $setup.formData.email,
    f: common_vendor.o(($event) => $setup.formData.email = $event.detail.value),
    g: $setup.formData.bio,
    h: common_vendor.o(($event) => $setup.formData.bio = $event.detail.value),
    i: common_vendor.t($setup.formData.bio.length),
    j: common_vendor.t($setup.saving ? "保存中..." : "保存修改"),
    k: common_vendor.o((...args) => $setup.saveProfile && $setup.saveProfile(...args)),
    l: $setup.saving,
    m: common_vendor.o((...args) => $setup.goBack && $setup.goBack(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/profile.js.map
