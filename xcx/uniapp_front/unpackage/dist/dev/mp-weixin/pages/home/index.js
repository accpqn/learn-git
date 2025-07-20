"use strict";
const common_vendor = require("../../common/vendor.js");
const store_order = require("../../store/order.js");
const store_menu = require("../../store/menu.js");
const store_user = require("../../store/user.js");
const mixins_theme = require("../../mixins/theme.js");
const _sfc_main = {
  setup() {
    const orderStore = store_order.useOrderStore();
    const menuStore = store_menu.useMenuStore();
    const userStore = store_user.useUserStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const isLoggedIn = common_vendor.computed(() => userStore.isLoggedIn);
    common_vendor.onMounted(() => {
      orderStore.initOrders();
      menuStore.fetchMenuData();
    });
    const recentOrders = common_vendor.computed(() => {
      return orderStore.allOrders.slice(0, 5);
    });
    const recommendProducts = common_vendor.computed(() => {
      const allProducts = [];
      Object.values(menuStore.products).forEach((categoryProducts) => {
        allProducts.push(...categoryProducts);
      });
      return allProducts.slice(0, 6);
    });
    const getGreeting = () => {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 12)
        return "早上好！";
      if (hour < 18)
        return "下午好！";
      return "晚上好！";
    };
    const getSubtitle = () => {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 12)
        return "新的一天，为TA准备早餐吧";
      if (hour < 14)
        return "午餐时间，来点什么好呢？";
      if (hour < 18)
        return "下午茶时光，甜蜜一下";
      return "晚餐时间，和TA一起享受美食";
    };
    const formatTime = (time) => {
      return common_vendor.dayjs(time).format("MM-DD HH:mm");
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/public/login"
      });
    };
    const goToOrdering = () => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再使用点餐功能",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              goToLogin();
            }
          }
        });
        return;
      }
      common_vendor.index.switchTab({
        url: "/pages/ordering/index"
      });
    };
    const goToOrders = () => {
      common_vendor.index.switchTab({
        url: "/pages/order/list"
      });
    };
    const goToOrderDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    };
    const goToProduct = (product) => {
      common_vendor.index.switchTab({
        url: "/pages/ordering/index"
      });
    };
    const sendLove = () => {
      common_vendor.index.showToast({
        title: "❤️ 爱心已发送",
        icon: "none"
      });
    };
    const randomFood = () => {
      const allProducts = [];
      Object.values(menuStore.products).forEach((categoryProducts) => {
        allProducts.push(...categoryProducts);
      });
      if (allProducts.length > 0) {
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        common_vendor.index.showModal({
          title: "随机推荐",
          content: `今天试试 ${randomProduct.name} 怎么样？
${randomProduct.description}`,
          confirmText: "去点餐",
          success: (res) => {
            if (res.confirm) {
              goToOrdering();
            }
          }
        });
      }
    };
    const shareApp = () => {
      common_vendor.index.showToast({
        title: "分享功能开发中...",
        icon: "none"
      });
    };
    return {
      isLoggedIn,
      recentOrders,
      recommendProducts,
      getGreeting,
      getSubtitle,
      formatTime,
      goToLogin,
      goToOrdering,
      goToOrders,
      goToOrderDetail,
      goToProduct,
      sendLove,
      randomFood,
      shareApp,
      // 主题相关
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle
    };
  }
};
if (!Array) {
  const _component_u_icon = common_vendor.resolveComponent("u-icon");
  const _component_u_image = common_vendor.resolveComponent("u-image");
  (_component_u_icon + _component_u_image)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.getGreeting()),
    b: common_vendor.t($setup.getSubtitle()),
    c: !$setup.isLoggedIn
  }, !$setup.isLoggedIn ? {
    d: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args))
  } : {}, {
    e: common_vendor.p({
      name: "sun",
      size: "24",
      color: "#FFD700"
    }),
    f: common_vendor.s($setup.getHeaderStyle()),
    g: common_vendor.p({
      name: "shopping-cart",
      size: "32",
      color: "#FF69B4"
    }),
    h: common_vendor.o((...args) => $setup.goToOrdering && $setup.goToOrdering(...args)),
    i: common_vendor.p({
      name: "list",
      size: "32",
      color: "#409EFF"
    }),
    j: common_vendor.o((...args) => $setup.goToOrders && $setup.goToOrders(...args)),
    k: $setup.recentOrders.length > 0
  }, $setup.recentOrders.length > 0 ? {
    l: common_vendor.o((...args) => $setup.goToOrders && $setup.goToOrders(...args)),
    m: common_vendor.f($setup.recentOrders.slice(0, 3), (order, k0, i0) => {
      return {
        a: common_vendor.t(order.type === "sent" ? "发给TA" : "来自TA"),
        b: common_vendor.t($setup.formatTime(order.createTime)),
        c: common_vendor.t(order.items.length),
        d: common_vendor.t(order.totalPrice),
        e: order.id,
        f: common_vendor.o(($event) => $setup.goToOrderDetail(order.id), order.id)
      };
    })
  } : {}, {
    n: common_vendor.f($setup.recommendProducts, (product, k0, i0) => {
      return {
        a: "650c958d-3-" + i0,
        b: common_vendor.p({
          src: product.image || "/static/images/default-product.png",
          width: "120",
          height: "120"
        }),
        c: common_vendor.t(product.name),
        d: common_vendor.t(product.price),
        e: product.id,
        f: common_vendor.o(($event) => $setup.goToProduct(product), product.id)
      };
    }),
    o: common_vendor.p({
      name: "heart-fill",
      size: "28",
      color: "#FF69B4"
    }),
    p: common_vendor.o((...args) => $setup.sendLove && $setup.sendLove(...args)),
    q: common_vendor.p({
      name: "reload",
      size: "28",
      color: "#67C23A"
    }),
    r: common_vendor.o((...args) => $setup.randomFood && $setup.randomFood(...args)),
    s: common_vendor.p({
      name: "share",
      size: "28",
      color: "#409EFF"
    }),
    t: common_vendor.o((...args) => $setup.shareApp && $setup.shareApp(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
