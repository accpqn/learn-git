"use strict";
const common_vendor = require("../../common/vendor.js");
const store_order = require("../../store/order.js");
const config_index = require("../../config/index.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  setup() {
    const orderStore = store_order.useOrderStore();
    const accepting = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.id) {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:114", "Loading order detail for ID:", options.id);
        orderStore.fetchOrderDetail(options.id);
      }
    });
    const getProductImageUrl = config_index.getProductImageUrl;
    const showOrderActions = common_vendor.computed(() => {
      const order = orderStore.currentOrderDetail;
      if (!order)
        return false;
      if (order.type === "received" && order.status === "PENDING")
        return true;
      return ["PENDING", "CONFIRMED", "ORDERED"].includes(order.status);
    });
    const canUpdateStatus = common_vendor.computed(() => {
      const order = orderStore.currentOrderDetail;
      return order && ["PENDING", "CONFIRMED", "ORDERED"].includes(order.status);
    });
    const formatDate = (date) => {
      if (!date)
        return "未知";
      return common_vendor.dayjs(date).format("YYYY-MM-DD HH:mm");
    };
    const getStatusText = (status) => {
      const statusMap = {
        "PENDING": "待处理",
        "CONFIRMED": "已确认",
        "ORDERED": "已下单",
        "COMPLETED": "已完成",
        "RATED": "已评价",
        "CANCELLED": "已取消",
        // 兼容旧格式
        "pending": "待处理",
        "accepted": "已接收",
        "completed": "已完成"
      };
      return statusMap[status] || "未知";
    };
    const getStatusClass = (status) => {
      return `status-${status}`;
    };
    const acceptOrder = async () => {
      accepting.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:167", "Accepting order:", orderStore.currentOrderDetail.id);
        await api_order.updateOrderStatus(orderStore.currentOrderDetail.id, { status: "CONFIRMED" });
        orderStore.currentOrderDetail.status = "CONFIRMED";
        const orderIndex = orderStore.receivedOrders.findIndex((o) => o.id === orderStore.currentOrderDetail.id);
        if (orderIndex !== -1) {
          orderStore.receivedOrders[orderIndex].status = "CONFIRMED";
        }
        orderStore.saveOrdersToLocal();
        common_vendor.index.showToast({
          title: "订单已接受",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:188", "Accept order failed:", error);
        common_vendor.index.showToast({
          title: "接受失败: " + (error.message || "网络错误"),
          icon: "none"
        });
      } finally {
        accepting.value = false;
      }
    };
    const showStatusOptions = () => {
      const statusOptions = [
        { text: "已确认", value: "CONFIRMED" },
        { text: "已下单", value: "ORDERED" },
        { text: "已完成", value: "COMPLETED" },
        { text: "取消订单", value: "CANCELLED" }
      ];
      common_vendor.index.showActionSheet({
        itemList: statusOptions.map((item) => item.text),
        success: (res) => {
          const selectedStatus = statusOptions[res.tapIndex];
          updateOrderStatusLocal(selectedStatus.value);
        }
      });
    };
    const updateOrderStatusLocal = async (newStatus) => {
      try {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:217", "Updating order status to:", newStatus);
        await api_order.updateOrderStatus(orderStore.currentOrderDetail.id, { status: newStatus });
        orderStore.currentOrderDetail.status = newStatus;
        const sentIndex = orderStore.sentOrders.findIndex((o) => o.id === orderStore.currentOrderDetail.id);
        const receivedIndex = orderStore.receivedOrders.findIndex((o) => o.id === orderStore.currentOrderDetail.id);
        if (sentIndex !== -1) {
          orderStore.sentOrders[sentIndex].status = newStatus;
        }
        if (receivedIndex !== -1) {
          orderStore.receivedOrders[receivedIndex].status = newStatus;
        }
        orderStore.saveOrdersToLocal();
        common_vendor.index.showToast({
          title: "状态更新成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:243", "Update status failed:", error);
        common_vendor.index.showToast({
          title: "更新失败: " + (error.message || "网络错误"),
          icon: "none"
        });
      }
    };
    return {
      orderStore,
      accepting,
      showOrderActions,
      canUpdateStatus,
      formatDate,
      getStatusText,
      getStatusClass,
      getProductImageUrl,
      acceptOrder,
      showStatusOptions,
      updateOrderStatusLocal
    };
  }
};
if (!Array) {
  const _component_u_loading_page = common_vendor.resolveComponent("u-loading-page");
  const _component_u_empty = common_vendor.resolveComponent("u-empty");
  (_component_u_loading_page + _component_u_empty)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $setup.orderStore.status === "loading"
  }, $setup.orderStore.status === "loading" ? {
    b: common_vendor.p({
      ["loading-text"]: "正在加载订单详情..."
    })
  } : $setup.orderStore.currentOrderDetail ? common_vendor.e({
    d: common_vendor.t($setup.orderStore.currentOrderDetail.id),
    e: common_vendor.t($setup.orderStore.currentOrderDetail.type === "sent" ? "发给TA的订单" : "来自TA的订单"),
    f: common_vendor.t($setup.getStatusText($setup.orderStore.currentOrderDetail.status)),
    g: common_vendor.n($setup.getStatusClass($setup.orderStore.currentOrderDetail.status)),
    h: common_vendor.t($setup.formatDate($setup.orderStore.currentOrderDetail.created_at || $setup.orderStore.currentOrderDetail.createTime)),
    i: common_vendor.t($setup.orderStore.currentOrderDetail.creator_username || "未知"),
    j: common_vendor.t($setup.orderStore.currentOrderDetail.total_price || $setup.orderStore.currentOrderDetail.totalPrice),
    k: $setup.orderStore.currentOrderDetail.notes || $setup.orderStore.currentOrderDetail.note
  }, $setup.orderStore.currentOrderDetail.notes || $setup.orderStore.currentOrderDetail.note ? {
    l: common_vendor.t($setup.orderStore.currentOrderDetail.notes || $setup.orderStore.currentOrderDetail.note)
  } : {}, {
    m: common_vendor.t($setup.orderStore.currentOrderDetail.items.length),
    n: common_vendor.f($setup.orderStore.currentOrderDetail.items, (item, index, i0) => {
      return {
        a: $setup.getProductImageUrl(item.product || item.item),
        b: common_vendor.t((item.product || item.item).name),
        c: common_vendor.t((item.product || item.item).description),
        d: common_vendor.t(item.price || (item.product || item.item).price),
        e: common_vendor.t(item.quantity),
        f: common_vendor.t(((item.price || (item.product || item.item).price) * item.quantity).toFixed(2)),
        g: index
      };
    }),
    o: $setup.showOrderActions
  }, $setup.showOrderActions ? common_vendor.e({
    p: $setup.orderStore.currentOrderDetail.type === "received" && $setup.orderStore.currentOrderDetail.status === "PENDING"
  }, $setup.orderStore.currentOrderDetail.type === "received" && $setup.orderStore.currentOrderDetail.status === "PENDING" ? {
    q: common_vendor.t($setup.accepting ? "处理中..." : "接受订单"),
    r: common_vendor.o((...args) => $setup.acceptOrder && $setup.acceptOrder(...args)),
    s: $setup.accepting
  } : {}, {
    t: $setup.canUpdateStatus
  }, $setup.canUpdateStatus ? {
    v: common_vendor.o((...args) => $setup.showStatusOptions && $setup.showStatusOptions(...args))
  } : {}) : {}) : {
    w: common_vendor.p({
      text: "订单不存在",
      mode: "data"
    })
  }, {
    c: $setup.orderStore.currentOrderDetail
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
