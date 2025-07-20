"use strict";
const common_vendor = require("../../common/vendor.js");
const store_order = require("../../store/order.js");
const store_user = require("../../store/user.js");
const store_couple = require("../../store/couple.js");
const mixins_theme = require("../../mixins/theme.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  setup() {
    const orderStore = store_order.useOrderStore();
    const userStore = store_user.useUserStore();
    const coupleStore = store_couple.useCoupleStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const isLoggedIn = common_vendor.computed(() => userStore.isLoggedIn);
    const userInfo = common_vendor.computed(() => userStore.userInfo);
    const bindingInfo = common_vendor.computed(() => coupleStore.bindingInfo);
    const partnerName = common_vendor.computed(() => {
      var _a;
      if (!bindingInfo.value || bindingInfo.value.status !== "active")
        return "";
      const currentUserId = (_a = userInfo.value) == null ? void 0 : _a.id;
      if (!currentUserId)
        return "";
      if (bindingInfo.value.requester.id === currentUserId) {
        return bindingInfo.value.receiver.username;
      } else {
        return bindingInfo.value.requester.username;
      }
    });
    const orderStats = common_vendor.computed(() => {
      return {
        sent: orderStore.sentOrders.length,
        received: orderStore.receivedOrders.length,
        total: orderStore.sentOrders.length + orderStore.receivedOrders.length
      };
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/user/index.vue:169", "User page onMounted - isLoggedIn:", userStore.isLoggedIn);
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/user/index.vue:173", "User page onShow - isLoggedIn:", userStore.isLoggedIn);
      common_vendor.index.__f__("log", "at pages/user/index.vue:174", "User page onShow - userInfo:", userStore.userInfo);
      common_vendor.index.__f__("log", "at pages/user/index.vue:175", "User page onShow - token:", userStore.token);
      if (userStore.isLoggedIn && (!userStore.userInfo || !userStore.userInfo.id)) {
        common_vendor.index.__f__("log", "at pages/user/index.vue:179", "Refreshing user info on page show");
        userStore.fetchCurrentUser();
      }
      orderStore.initOrders();
    });
    common_vendor.watch(() => userStore.isLoggedIn, (newVal, oldVal) => {
      common_vendor.index.__f__("log", "at pages/user/index.vue:188", "Login status changed:", oldVal, "->", newVal);
    }, { immediate: true });
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/public/login"
      });
    };
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
    const changeAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.__f__("log", "at pages/user/index.vue:220", "选择的头像文件:", tempFilePath);
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          try {
            const result = await api_user.uploadAvatar(tempFilePath);
            common_vendor.index.__f__("log", "at pages/user/index.vue:231", "头像上传成功:", result);
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
            common_vendor.index.__f__("error", "at pages/user/index.vue:246", "头像上传失败:", error);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "头像上传失败: " + (error.message || "网络错误"),
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/user/index.vue:255", "选择图片失败:", error);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const editProfile = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user/profile"
      });
    };
    const handleCoupleAction = () => {
      common_vendor.index.navigateTo({
        url: "/pages/user/couple-manage"
      });
    };
    const navigateToConfig = () => {
      common_vendor.index.navigateTo({
        url: "/pages/settings/index"
      });
    };
    const showAbout = () => {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "情侣点餐小程序 v1.0\n\n一个专为情侣设计的点餐应用，让爱情更有味道！",
        showCancel: false
      });
    };
    const clearData = () => {
      common_vendor.index.showModal({
        title: "清除数据",
        content: "确定要清除所有本地数据吗？此操作不可恢复！",
        success: (res) => {
          if (res.confirm) {
            try {
              orderStore.sentOrders = [];
              orderStore.receivedOrders = [];
              orderStore.saveOrdersToLocal();
              common_vendor.index.clearStorageSync();
              common_vendor.index.showToast({
                title: "数据已清除",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.showToast({
                title: "清除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
            coupleStore.setBindingInfo(null);
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    };
    const statNumberStyle = common_vendor.computed(() => ({
      color: currentTheme.value.primaryColor
    }));
    return {
      isLoggedIn,
      userInfo,
      bindingInfo,
      partnerName,
      orderStats,
      goToLogin,
      getUserAvatarUrl,
      changeAvatar,
      editProfile,
      handleCoupleAction,
      navigateToConfig,
      showAbout,
      clearData,
      handleLogout,
      // 主题相关
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle,
      // 动态样式
      statNumberStyle
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$setup.isLoggedIn
  }, !$setup.isLoggedIn ? {
    b: common_vendor.s($setup.getButtonStyle("primary")),
    c: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args))
  } : common_vendor.e({
    d: $setup.getUserAvatarUrl(),
    e: common_vendor.o((...args) => $setup.changeAvatar && $setup.changeAvatar(...args)),
    f: common_vendor.t($setup.userInfo.username || "用户"),
    g: common_vendor.t($setup.userInfo.email),
    h: $setup.bindingInfo && $setup.bindingInfo.status === "active"
  }, $setup.bindingInfo && $setup.bindingInfo.status === "active" ? {
    i: common_vendor.t($setup.partnerName)
  } : {}, {
    j: common_vendor.s($setup.getHeaderStyle()),
    k: common_vendor.t($setup.orderStats.sent),
    l: common_vendor.s($setup.statNumberStyle),
    m: common_vendor.t($setup.orderStats.received),
    n: common_vendor.s($setup.statNumberStyle),
    o: common_vendor.t($setup.orderStats.total),
    p: common_vendor.s($setup.statNumberStyle),
    q: common_vendor.o((...args) => $setup.editProfile && $setup.editProfile(...args)),
    r: common_vendor.t($setup.bindingInfo && $setup.bindingInfo.status === "active" ? "情侣管理" : "绑定情侣"),
    s: common_vendor.o((...args) => $setup.handleCoupleAction && $setup.handleCoupleAction(...args)),
    t: common_vendor.o((...args) => $setup.navigateToConfig && $setup.navigateToConfig(...args)),
    v: common_vendor.o((...args) => $setup.showAbout && $setup.showAbout(...args)),
    w: common_vendor.o((...args) => $setup.clearData && $setup.clearData(...args)),
    x: common_vendor.s($setup.getButtonStyle("outline")),
    y: common_vendor.o((...args) => $setup.handleLogout && $setup.handleLogout(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
