"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const store_user = require("../../store/user.js");
const AgreementLinks = () => "../../components/public/AgreementLinks.js";
const _sfc_main = {
  components: {
    AgreementLinks
  },
  setup() {
    const userStore = store_user.useUserStore();
    return {
      userStore
    };
  },
  data() {
    return {
      form: {
        email: "",
        password: "",
        confirmPassword: "",
        code: ""
      },
      countdown: 0,
      loginUrl: utils_config.APP_CONFIG.pages.login
    };
  },
  computed: {
    isFormValid() {
      return this.form.email && this.form.password && this.form.confirmPassword && this.form.code && this.form.password === this.form.confirmPassword;
    },
    isEmailValid() {
      return this.validateEmail(this.form.email);
    },
    isRegistering() {
      return this.userStore.registerStatus === "pending";
    }
  },
  methods: {
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
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
    },
    async handleRegister() {
      if (!this.isFormValid)
        return;
      if (!this.isEmailValid) {
        common_vendor.index.showToast({
          title: "请输入有效的邮箱地址",
          icon: "none"
        });
        return;
      }
      try {
        const success = await this.userStore.register({
          email: this.form.email,
          password: this.form.password,
          code: this.form.code
        });
        if (success) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: utils_config.APP_CONFIG.pages.binding
            });
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "注册失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_agreement_links = common_vendor.resolveComponent("agreement-links");
  _component_agreement_links();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.email,
    b: common_vendor.o(($event) => $data.form.email = $event.detail.value),
    c: $data.form.code,
    d: common_vendor.o(($event) => $data.form.code = $event.detail.value),
    e: common_vendor.t($data.countdown > 0 ? `${$data.countdown}秒后重试` : "获取验证码"),
    f: !$options.isEmailValid || $data.countdown > 0,
    g: common_vendor.o((...args) => $options.handleSendCode && $options.handleSendCode(...args)),
    h: $data.form.password,
    i: common_vendor.o(($event) => $data.form.password = $event.detail.value),
    j: $data.form.confirmPassword,
    k: common_vendor.o(($event) => $data.form.confirmPassword = $event.detail.value),
    l: common_vendor.t($options.isRegistering ? "注册中..." : "注册"),
    m: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    n: !$options.isFormValid || $options.isRegistering,
    o: $data.loginUrl
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/public/register.js.map
