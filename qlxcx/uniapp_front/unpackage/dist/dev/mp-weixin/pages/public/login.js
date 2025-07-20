"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const store_user = require("../../store/user.js");
const store_couple = require("../../store/couple.js");
const AppIntro = () => "../../components/public/AppIntro.js";
const AgreementLinks = () => "../../components/public/AgreementLinks.js";
const _sfc_main = {
  components: {
    AppIntro,
    AgreementLinks
  },
  setup() {
    const userStore = store_user.useUserStore();
    const coupleStore = store_couple.useCoupleStore();
    return {
      userStore,
      coupleStore
    };
  },
  data() {
    return {
      loginMode: "password",
      // 'password' 或 'code'
      form: {
        email: "",
        password: "",
        code: ""
      },
      countdown: 0,
      registerUrl: utils_config.APP_CONFIG.pages.register
    };
  },
  computed: {
    isEmailValid() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.form.email);
    },
    isFormValid() {
      if (this.loginMode === "password") {
        return this.form.email && this.form.password;
      } else {
        return this.form.email && this.form.code;
      }
    }
  },
  methods: {
    // 切换登录模式
    switchLoginMode(mode) {
      this.loginMode = mode;
      this.form.password = "";
      this.form.code = "";
    },
    async handleLogin() {
      if (!this.isFormValid)
        return;
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
      try {
        let success = false;
        if (this.loginMode === "password") {
          success = await this.userStore.login({
            email: this.form.email,
            password: this.form.password
          });
        } else {
          success = await this.userStore.loginWithCode({
            email: this.form.email,
            code: this.form.code
          });
        }
        if (!success) {
          throw new Error("登录失败");
        }
        common_vendor.index.__f__("log", "at pages/public/login.vue:198", "Login success - userStore state:", {
          isLoggedIn: this.userStore.isLoggedIn,
          userInfo: this.userStore.userInfo,
          token: this.userStore.token
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "登录成功！",
          icon: "success",
          duration: 1500
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/home/index"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "登录失败，请检查账号密码",
          icon: "none",
          duration: 2e3
        });
      }
    },
    async handleSendCode() {
      if (!this.isEmailValid) {
        common_vendor.index.showToast({
          title: "请输入有效的邮箱地址",
          icon: "none"
        });
        return;
      }
      try {
        await this.userStore.sendVerificationCode(this.form.email);
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
          }
        }, 1e3);
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "发送验证码失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.n({
      active: $data.loginMode === "password"
    }),
    b: common_vendor.o(($event) => $options.switchLoginMode("password")),
    c: common_vendor.n({
      active: $data.loginMode === "code"
    }),
    d: common_vendor.o(($event) => $options.switchLoginMode("code")),
    e: $data.form.email,
    f: common_vendor.o(($event) => $data.form.email = $event.detail.value),
    g: $data.loginMode === "password"
  }, $data.loginMode === "password" ? {
    h: $data.form.password,
    i: common_vendor.o(($event) => $data.form.password = $event.detail.value)
  } : {}, {
    j: $data.loginMode === "code"
  }, $data.loginMode === "code" ? {
    k: $data.form.code,
    l: common_vendor.o(($event) => $data.form.code = $event.detail.value),
    m: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s` : "获取验证码"),
    n: !$options.isEmailValid || $data.countdown > 0 ? 1 : "",
    o: !$options.isEmailValid || $data.countdown > 0,
    p: common_vendor.o((...args) => $options.handleSendCode && $options.handleSendCode(...args))
  } : {}, {
    q: common_vendor.t($data.loginMode === "password" ? "立即登录" : "验证登录"),
    r: !$options.isFormValid ? 1 : "",
    s: !$options.isFormValid,
    t: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    v: $data.registerUrl
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/public/login.js.map
