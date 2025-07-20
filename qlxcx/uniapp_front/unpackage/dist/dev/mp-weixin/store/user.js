"use strict";
const common_vendor = require("../common/vendor.js");
const api_user = require("../api/user.js");
const store_couple = require("./couple.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    // 用户信息
    userInfo: null,
    // token信息
    token: null,
    refreshToken: null,
    // 注册状态
    registerStatus: "idle",
    // 'idle' | 'pending' | 'success' | 'error'
    registerError: null,
    // 防抖标记
    _fetchingUser: false
  }),
  getters: {
    // 登录状态 - 基于用户信息和token判断
    isLoggedIn() {
      return !!(this.userInfo && this.token);
    },
    userId() {
      if (!this.userInfo)
        return null;
      return this.userInfo.id;
    },
    username() {
      if (!this.userInfo)
        return null;
      return this.userInfo.username;
    },
    email() {
      if (!this.userInfo)
        return null;
      return this.userInfo.email;
    }
  },
  actions: {
    // 设置用户信息
    setUserInfo(info) {
      this.userInfo = info;
      this.saveUserToLocal();
    },
    // 保存用户信息到本地存储
    saveUserToLocal() {
      if (this.userInfo) {
        common_vendor.index.setStorageSync("userInfo", this.userInfo);
      }
    },
    // 设置token
    setToken(token, refresh) {
      this.token = token;
      this.refreshToken = refresh;
      common_vendor.index.setStorageSync("token", token);
      common_vendor.index.setStorageSync("refreshToken", refresh);
    },
    // 清除用户状态
    clearUserState() {
      this.userInfo = null;
      this.token = null;
      this.refreshToken = null;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("refreshToken");
      common_vendor.index.removeStorageSync("userInfo");
    },
    // 登录
    async login(loginData) {
      try {
        const response = await api_user.login(loginData);
        const { token, user } = response;
        this.setToken(token.access, token.refresh);
        this.setUserInfo(user);
        this.fetchCurrentUser().catch((err) => {
          common_vendor.index.__f__("warn", "at store/user.js:86", "Failed to fetch complete user info after login:", err);
        });
        this.syncThemeAfterLogin();
        return true;
      } catch (error) {
        this.clearUserState();
        throw error;
      }
    },
    // 验证码登录
    async loginWithCode(loginData) {
      try {
        const response = await api_user.verifyAndLogin(loginData);
        const { token, user } = response;
        this.setToken(token.access, token.refresh);
        this.setUserInfo(user);
        this.fetchCurrentUser().catch((err) => {
          common_vendor.index.__f__("warn", "at store/user.js:111", "Failed to fetch complete user info after login:", err);
        });
        return true;
      } catch (error) {
        this.clearUserState();
        throw error;
      }
    },
    // 发送验证码
    async sendVerificationCode(email) {
      try {
        await api_user.sendVerificationCode({ email });
        return true;
      } catch (error) {
        throw error;
      }
    },
    // 注册
    async register(registerData) {
      this.registerStatus = "pending";
      this.registerError = null;
      try {
        const coupleStore = store_couple.useCoupleStore();
        const response = await api_user.verifyAndLogin(registerData);
        const { token, user } = response;
        this.setToken(token.access, token.refresh);
        this.setUserInfo(user);
        coupleStore.setBindingInfo(user.binding);
        this.registerStatus = "success";
        return true;
      } catch (error) {
        this.registerStatus = "error";
        this.registerError = error.message;
        throw error;
      }
    },
    // 登出
    logout() {
      this.clearUserState();
    },
    // 刷新token
    async refreshUserToken() {
      if (!this.refreshToken)
        return false;
      try {
        const response = await api_user.refreshToken(this.refreshToken);
        const { access } = response;
        this.setToken(access, this.refreshToken);
        return true;
      } catch (error) {
        this.clearUserState();
        return false;
      }
    },
    // 获取当前用户信息
    async fetchCurrentUser() {
      if (!this.token) {
        common_vendor.index.__f__("log", "at store/user.js:179", "No token available, skipping fetchCurrentUser");
        return false;
      }
      if (this._fetchingUser) {
        common_vendor.index.__f__("log", "at store/user.js:185", "Already fetching user info, skipping duplicate request");
        return false;
      }
      this._fetchingUser = true;
      try {
        const coupleStore = store_couple.useCoupleStore();
        common_vendor.index.__f__("log", "at store/user.js:193", "Fetching current user info...");
        const response = await api_user.getCurrentUser();
        common_vendor.index.__f__("log", "at store/user.js:195", "Received user info:", response);
        const { binding, ...userData } = response;
        this.setUserInfo(userData);
        coupleStore.setBindingInfo(binding);
        common_vendor.index.__f__("log", "at store/user.js:202", "User info updated successfully");
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/user.js:205", "Failed to fetch current user:", error);
        if (error.response && error.response.statusCode === 401) {
          common_vendor.index.__f__("log", "at store/user.js:208", "Token expired, clearing user state");
          this.clearUserState();
        }
        return false;
      } finally {
        this._fetchingUser = false;
      }
    },
    // 初始化状态
    initFromStorage() {
      const token = common_vendor.index.getStorageSync("token");
      const refreshToken = common_vendor.index.getStorageSync("refreshToken");
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (token && refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        if (userInfo) {
          this.userInfo = userInfo;
        }
        return true;
      }
      return false;
    },
    // 登录后同步主题配置
    syncThemeAfterLogin() {
      var _a;
      try {
        common_vendor.index.$emit("userLoginSuccess", {
          userId: (_a = this.userInfo) == null ? void 0 : _a.id,
          timestamp: Date.now()
        });
        common_vendor.index.__f__("log", "at store/user.js:246", "已发送登录成功事件，主题将自动同步");
      } catch (error) {
        common_vendor.index.__f__("error", "at store/user.js:248", "同步主题配置失败:", error);
      }
    }
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/user.js.map
