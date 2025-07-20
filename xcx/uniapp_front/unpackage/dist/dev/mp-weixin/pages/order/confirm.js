"use strict";
const common_vendor = require("../../common/vendor.js");
const store_cart = require("../../store/cart.js");
const store_order = require("../../store/order.js");
const config_index = require("../../config/index.js");
require("../../api/request.js");
const _sfc_main = {
  setup() {
    const cartStore = store_cart.useCartStore();
    const orderStore = store_order.useOrderStore();
    const orderNote = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    const cartItems = common_vendor.computed(() => {
      return Object.values(cartStore.items);
    });
    const getProductImageUrl = config_index.getProductImageUrl;
    const submitOrder = async () => {
      if (cartItems.value.length === 0) {
        common_vendor.index.showToast({
          title: "购物车为空",
          icon: "none"
        });
        return;
      }
      submitting.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:92", "购物车原始数据:", cartItems.value);
        cartItems.value.forEach((item, index) => {
          var _a;
          common_vendor.index.__f__("log", "at pages/order/confirm.vue:96", `购物车项 ${index}:`, item);
          common_vendor.index.__f__("log", "at pages/order/confirm.vue:97", `- item.item:`, item.item);
          common_vendor.index.__f__("log", "at pages/order/confirm.vue:98", `- item.item.id:`, (_a = item.item) == null ? void 0 : _a.id);
          common_vendor.index.__f__("log", "at pages/order/confirm.vue:99", `- item.quantity:`, item.quantity);
        });
        const orderData = {
          notes: orderNote.value.trim(),
          items: cartItems.value.map((item) => {
            if (!item.item || !item.item.id) {
              common_vendor.index.__f__("error", "at pages/order/confirm.vue:106", "购物车项数据异常:", item);
              throw new Error("购物车数据异常，请重新添加商品");
            }
            return {
              product: item.item.id,
              quantity: item.quantity
            };
          })
        };
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:116", "提交订单数据:", orderData);
        const result = await orderStore.createOrder(orderData);
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:120", "订单创建结果:", result);
        cartStore.clearCart();
        common_vendor.index.showToast({
          title: "订单发送成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/order/list"
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:138", "提交订单失败:", error);
        common_vendor.index.showToast({
          title: "发送失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        submitting.value = false;
      }
    };
    return {
      cartStore,
      cartItems,
      orderNote,
      submitting,
      getProductImageUrl,
      submitOrder
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($setup.cartItems, (item, index, i0) => {
      return {
        a: $setup.getProductImageUrl(item.item),
        b: common_vendor.t(item.item.name),
        c: common_vendor.t(item.item.description),
        d: common_vendor.t(item.item.price),
        e: common_vendor.t(item.quantity),
        f: index
      };
    }),
    b: common_vendor.t($setup.cartStore.totalPrice),
    c: $setup.orderNote,
    d: common_vendor.o(($event) => $setup.orderNote = $event.detail.value),
    e: common_vendor.t($setup.orderNote.length),
    f: common_vendor.t($setup.cartStore.totalPrice),
    g: common_vendor.t($setup.submitting ? "发送中..." : "发送订单"),
    h: common_vendor.o((...args) => $setup.submitOrder && $setup.submitOrder(...args)),
    i: $setup.submitting || $setup.cartItems.length === 0
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/confirm.js.map
