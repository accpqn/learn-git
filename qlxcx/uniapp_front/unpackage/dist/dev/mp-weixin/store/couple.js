"use strict";
const common_vendor = require("../common/vendor.js");
const api_core = require("../api/core.js");
const api_user = require("../api/user.js");
const store_user = require("./user.js");
const useCoupleStore = common_vendor.defineStore("couple", {
  state: () => ({
    // 绑定关系信息
    bindingInfo: null,
    // 自定义主题
    theme: {
      backgroundColor: "#FFFFFF",
      primaryColor: "#007AFF",
      backgroundImage: null
    },
    // 绑定请求状态
    bindingRequestStatus: "idle",
    // 'idle' | 'pending' | 'success' | 'error'
    bindingRequestError: null
  }),
  getters: {
    isBindingActive: (state) => {
      if (!state.bindingInfo)
        return false;
      return state.bindingInfo.status === "active";
    },
    partnerId: (state) => {
      if (!state.bindingInfo)
        return null;
      const userStore = store_user.useUserStore();
      const { requester, receiver } = state.bindingInfo;
      return requester.id === userStore.userId ? receiver.id : requester.id;
    },
    partnerInfo: (state) => {
      if (!state.bindingInfo)
        return null;
      const userStore = store_user.useUserStore();
      const { requester, receiver } = state.bindingInfo;
      return requester.id === userStore.userId ? receiver : requester;
    }
  },
  actions: {
    // 设置绑定关系
    setBindingInfo(info) {
      this.bindingInfo = info;
    },
    // 设置主题
    setTheme(theme) {
      this.theme = { ...this.theme, ...theme };
    },
    // 发送绑定请求
    async sendBindingRequest(email) {
      this.bindingRequestStatus = "pending";
      this.bindingRequestError = null;
      try {
        await api_user.sendBindingRequest(email);
        this.bindingRequestStatus = "success";
        return true;
      } catch (error) {
        this.bindingRequestStatus = "error";
        this.bindingRequestError = error.message;
        return false;
      }
    },
    // 响应绑定请求
    async respondToBinding(bindingId, action) {
      try {
        const response = await api_user.respondToBinding(bindingId, action);
        if (action === "accept") {
          this.bindingInfo = response;
        }
        return true;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "操作失败",
          icon: "none"
        });
        return false;
      }
    },
    // 解除绑定
    async unbind() {
      if (!this.bindingInfo)
        return false;
      try {
        await api_user.unbind(this.bindingInfo.id);
        this.bindingInfo = null;
        return true;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "解除绑定失败",
          icon: "none"
        });
        return false;
      }
    },
    // 加载主题设置
    async loadTheme() {
      try {
        const response = await api_core.themeApi.get();
        this.setTheme(response);
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/couple.js:108", "Failed to load theme:", error);
        return false;
      }
    },
    // 更新主题设置
    async updateTheme(themeData) {
      try {
        await api_core.themeApi.update(themeData);
        this.setTheme(themeData);
        return true;
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "更新主题失败",
          icon: "none"
        });
        return false;
      }
    }
  }
});
exports.useCoupleStore = useCoupleStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/couple.js.map
