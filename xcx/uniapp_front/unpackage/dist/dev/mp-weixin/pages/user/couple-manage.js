"use strict";
const common_vendor = require("../../common/vendor.js");
const store_couple = require("../../store/couple.js");
const store_user = require("../../store/user.js");
const mixins_theme = require("../../mixins/theme.js");
const _sfc_main = {
  setup() {
    const coupleStore = store_couple.useCoupleStore();
    const userStore = store_user.useUserStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle, getBadgeStyle } = mixins_theme.useTheme();
    const showBindModal = common_vendor.ref(false);
    const showInfoModal = common_vendor.ref(false);
    const bindForm = common_vendor.ref({
      email: "",
      message: ""
    });
    const bindingInfo = common_vendor.computed(() => coupleStore.bindingInfo);
    const pendingRequests = common_vendor.computed(() => coupleStore.pendingRequests || []);
    const bindingHistory = common_vendor.computed(() => coupleStore.bindingHistory || []);
    const currentUser = common_vendor.computed(() => userStore.userInfo);
    const partnerName = common_vendor.computed(() => {
      var _a;
      if (!bindingInfo.value || bindingInfo.value.status !== "active")
        return "";
      const currentUserId = (_a = currentUser.value) == null ? void 0 : _a.id;
      if (!currentUserId)
        return "";
      if (bindingInfo.value.requester.id === currentUserId) {
        return bindingInfo.value.receiver.username;
      } else {
        return bindingInfo.value.requester.username;
      }
    });
    const partnerEmail = common_vendor.computed(() => {
      var _a;
      if (!bindingInfo.value || bindingInfo.value.status !== "active")
        return "";
      const currentUserId = (_a = currentUser.value) == null ? void 0 : _a.id;
      if (!currentUserId)
        return "";
      if (bindingInfo.value.requester.id === currentUserId) {
        return bindingInfo.value.receiver.email;
      } else {
        return bindingInfo.value.requester.email;
      }
    });
    common_vendor.onMounted(() => {
      loadCoupleData();
    });
    common_vendor.onShow(() => {
      loadCoupleData();
    });
    const loadCoupleData = async () => {
      try {
        await Promise.all([
          coupleStore.fetchBindingInfo(),
          coupleStore.fetchPendingRequests(),
          coupleStore.fetchBindingHistory()
        ]);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/couple-manage.vue:244", "加载情侣数据失败:", error);
      }
    };
    const showBindDialog = () => {
      bindForm.value = { email: "", message: "" };
      showBindModal.value = true;
    };
    const closeBindDialog = () => {
      showBindModal.value = false;
    };
    const sendBindRequest = async () => {
      if (!bindForm.value.email) {
        common_vendor.index.showToast({
          title: "请输入对方邮箱",
          icon: "none"
        });
        return;
      }
      try {
        const success = await coupleStore.sendBindingRequest(bindForm.value.email, bindForm.value.message);
        if (success) {
          common_vendor.index.showToast({
            title: "绑定请求已发送",
            icon: "success"
          });
          showBindModal.value = false;
          loadCoupleData();
        }
      } catch (error) {
        let errorMessage = error.message || "网络错误";
        if (errorMessage.includes("您已向该用户发起过绑定请求")) {
          errorMessage = "请等待对方回应，不要重复发送请求";
        } else if (errorMessage.includes("已经处于一个激活的绑定关系")) {
          errorMessage = "您或对方已有绑定关系";
        } else if (errorMessage.includes("该邮箱对应的用户不存在")) {
          errorMessage = "该邮箱用户不存在";
        }
        common_vendor.index.showToast({
          title: errorMessage,
          icon: "none",
          duration: 3e3
        });
      }
    };
    const acceptRequest = async (request) => {
      try {
        const success = await coupleStore.acceptBindingRequest(request.id);
        if (success) {
          common_vendor.index.showToast({
            title: "已接受绑定请求",
            icon: "success"
          });
          loadCoupleData();
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "操作失败: " + (error.message || "网络错误"),
          icon: "none"
        });
      }
    };
    const rejectRequest = async (request) => {
      common_vendor.index.showModal({
        title: "拒绝绑定",
        content: `确定要拒绝来自 ${request.requester.username} 的绑定请求吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const success = await coupleStore.rejectBindingRequest(request.id);
              if (success) {
                common_vendor.index.showToast({
                  title: "已拒绝绑定请求",
                  icon: "success"
                });
                loadCoupleData();
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "操作失败: " + (error.message || "网络错误"),
                icon: "none"
              });
            }
          }
        }
      });
    };
    const cancelRequest = async () => {
      common_vendor.index.showModal({
        title: "取消请求",
        content: "确定要取消绑定请求吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const success = await coupleStore.cancelBindingRequest();
              if (success) {
                common_vendor.index.showToast({
                  title: "已取消绑定请求",
                  icon: "success"
                });
                loadCoupleData();
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "操作失败: " + (error.message || "网络错误"),
                icon: "none"
              });
            }
          }
        }
      });
    };
    const confirmUnbind = () => {
      common_vendor.index.showModal({
        title: "解除绑定",
        content: `确定要与 ${partnerName.value} 解除绑定吗？

解绑后：
• 历史数据将保留
• 可以重新绑定其他用户
• 对方也会收到解绑通知`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const success = await coupleStore.unbind();
              if (success) {
                common_vendor.index.showToast({
                  title: "已解除绑定",
                  icon: "success"
                });
                loadCoupleData();
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "操作失败: " + (error.message || "网络错误"),
                icon: "none"
              });
            }
          }
        }
      });
    };
    const showPartnerInfo = () => {
      showInfoModal.value = true;
    };
    const formatDate = (date) => {
      return common_vendor.dayjs(date).format("YYYY-MM-DD HH:mm");
    };
    const formatDateRange = (startDate, endDate) => {
      const start = common_vendor.dayjs(startDate).format("YYYY-MM-DD");
      const end = endDate ? common_vendor.dayjs(endDate).format("YYYY-MM-DD") : "至今";
      return `${start} ~ ${end}`;
    };
    const getBindingDays = () => {
      var _a;
      if (!((_a = bindingInfo.value) == null ? void 0 : _a.created_at))
        return 0;
      return common_vendor.dayjs().diff(common_vendor.dayjs(bindingInfo.value.created_at), "day");
    };
    const getPartnerAvatar = () => {
      return "/static/images/default-avatar.png";
    };
    const getRequesterAvatar = (requestData) => {
      return "/static/images/default-avatar.png";
    };
    const getHistoryPartnerName = (record) => {
      var _a;
      const currentUserId = (_a = currentUser.value) == null ? void 0 : _a.id;
      if (record.requester.id === currentUserId) {
        return record.receiver.username;
      } else {
        return record.requester.username;
      }
    };
    const getHistoryStatusText = (record) => {
      if (record.deleted_at || record.status === "unbound") {
        return "已解绑";
      } else if (record.status === "active") {
        return "已绑定";
      } else if (record.status === "requesting") {
        return "等待回应";
      } else if (record.status === "rejected") {
        return "已拒绝";
      } else {
        return "未知状态";
      }
    };
    const getHistoryStatusClass = (record) => {
      if (record.deleted_at || record.status === "unbound") {
        return "status-unbound";
      } else if (record.status === "active") {
        return "status-active";
      } else if (record.status === "requesting") {
        return "status-requesting";
      } else if (record.status === "rejected") {
        return "status-rejected";
      } else {
        return "status-unknown";
      }
    };
    return {
      // 数据
      showBindModal,
      showInfoModal,
      bindForm,
      bindingInfo,
      pendingRequests,
      bindingHistory,
      partnerName,
      partnerEmail,
      // 方法
      showBindDialog,
      closeBindDialog,
      sendBindRequest,
      acceptRequest,
      rejectRequest,
      cancelRequest,
      confirmUnbind,
      showPartnerInfo,
      formatDate,
      formatDateRange,
      getBindingDays,
      getPartnerAvatar,
      getRequesterAvatar,
      getHistoryPartnerName,
      getHistoryStatusText,
      getHistoryStatusClass,
      // 主题
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle,
      getBadgeStyle
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_vendor.s($setup.getHeaderStyle()),
    b: $setup.bindingInfo && $setup.bindingInfo.status === "active"
  }, $setup.bindingInfo && $setup.bindingInfo.status === "active" ? {
    c: $setup.getPartnerAvatar(),
    d: common_vendor.t($setup.partnerName),
    e: common_vendor.t($setup.partnerEmail),
    f: common_vendor.t($setup.formatDate($setup.bindingInfo.created_at)),
    g: common_vendor.s($setup.getButtonStyle("outline")),
    h: common_vendor.o((...args) => $setup.showPartnerInfo && $setup.showPartnerInfo(...args)),
    i: common_vendor.s($setup.getButtonStyle("danger")),
    j: common_vendor.o((...args) => $setup.confirmUnbind && $setup.confirmUnbind(...args))
  } : $setup.bindingInfo && $setup.bindingInfo.status === "pending" ? {
    l: common_vendor.t(((_a = $setup.bindingInfo.receiver) == null ? void 0 : _a.email) || ((_b = $setup.bindingInfo.requester) == null ? void 0 : _b.email)),
    m: common_vendor.t($setup.formatDate($setup.bindingInfo.created_at)),
    n: common_vendor.s($setup.getButtonStyle("outline")),
    o: common_vendor.o((...args) => $setup.cancelRequest && $setup.cancelRequest(...args))
  } : {
    p: common_vendor.s($setup.getButtonStyle("primary")),
    q: common_vendor.o((...args) => $setup.showBindDialog && $setup.showBindDialog(...args))
  }, {
    k: $setup.bindingInfo && $setup.bindingInfo.status === "pending",
    r: $setup.pendingRequests.length > 0
  }, $setup.pendingRequests.length > 0 ? {
    s: common_vendor.t($setup.pendingRequests.length),
    t: common_vendor.s($setup.getBadgeStyle("count")),
    v: common_vendor.f($setup.pendingRequests, (request, k0, i0) => {
      return {
        a: $setup.getRequesterAvatar(request),
        b: common_vendor.t(request.requester.username),
        c: common_vendor.t(request.requester.email),
        d: common_vendor.t($setup.formatDate(request.created_at)),
        e: common_vendor.o(($event) => $setup.acceptRequest(request), request.id),
        f: common_vendor.o(($event) => $setup.rejectRequest(request), request.id),
        g: request.id
      };
    }),
    w: common_vendor.s($setup.getButtonStyle("primary")),
    x: common_vendor.s($setup.getButtonStyle("outline"))
  } : {}, {
    y: $setup.bindingHistory.length > 0
  }, $setup.bindingHistory.length > 0 ? {
    z: common_vendor.f($setup.bindingHistory, (record, k0, i0) => {
      return {
        a: common_vendor.t($setup.getHistoryPartnerName(record)),
        b: common_vendor.t($setup.formatDateRange(record.created_at, record.deleted_at)),
        c: common_vendor.t($setup.getHistoryStatusText(record)),
        d: common_vendor.n($setup.getHistoryStatusClass(record)),
        e: record.id
      };
    })
  } : {}, {
    A: $setup.showBindModal
  }, $setup.showBindModal ? {
    B: common_vendor.o((...args) => $setup.closeBindDialog && $setup.closeBindDialog(...args)),
    C: $setup.bindForm.email,
    D: common_vendor.o(($event) => $setup.bindForm.email = $event.detail.value),
    E: $setup.bindForm.message,
    F: common_vendor.o(($event) => $setup.bindForm.message = $event.detail.value),
    G: common_vendor.o((...args) => $setup.closeBindDialog && $setup.closeBindDialog(...args)),
    H: common_vendor.s($setup.getButtonStyle("primary")),
    I: common_vendor.o((...args) => $setup.sendBindRequest && $setup.sendBindRequest(...args)),
    J: common_vendor.o(() => {
    }),
    K: common_vendor.o((...args) => $setup.closeBindDialog && $setup.closeBindDialog(...args))
  } : {}, {
    L: $setup.showInfoModal
  }, $setup.showInfoModal ? common_vendor.e({
    M: common_vendor.o(($event) => $setup.showInfoModal = false),
    N: $setup.bindingInfo
  }, $setup.bindingInfo ? {
    O: common_vendor.t($setup.partnerName),
    P: common_vendor.t($setup.partnerEmail),
    Q: common_vendor.t($setup.formatDate($setup.bindingInfo.created_at)),
    R: common_vendor.t($setup.getBindingDays())
  } : {}, {
    S: common_vendor.s($setup.getButtonStyle("primary")),
    T: common_vendor.o(($event) => $setup.showInfoModal = false),
    U: common_vendor.o(() => {
    }),
    V: common_vendor.o(($event) => $setup.showInfoModal = false)
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b6c4d9b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/couple-manage.js.map
