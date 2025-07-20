"use strict";
const common_vendor = require("../../common/vendor.js");
const store_order = require("../../store/order.js");
const store_user = require("../../store/user.js");
const mixins_theme = require("../../mixins/theme.js");
const _sfc_main = {
  setup() {
    const orderStore = store_order.useOrderStore();
    const userStore = store_user.useUserStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const currentTab = common_vendor.ref(0);
    const tabList = [{ name: "我发出的" }, { name: "我收到的" }];
    const isLoggedIn = common_vendor.computed(() => userStore.isLoggedIn);
    const mockSentOrders = [
      {
        id: "demo-1",
        creator: "demo",
        creator_username: "演示用户",
        status: "PENDING",
        notes: "这是一个演示订单，登录后查看真实数据",
        total_price: "45.00",
        created_at: "2024-06-22T10:30:00Z",
        items: [
          { product: { name: "宫保鸡丁", price: "25.00" }, quantity: 1 },
          { product: { name: "米饭", price: "3.00" }, quantity: 2 }
        ]
      },
      {
        id: "demo-2",
        creator: "demo",
        creator_username: "演示用户",
        status: "COMPLETED",
        notes: "美味的午餐",
        total_price: "32.00",
        created_at: "2024-06-21T12:15:00Z",
        items: [
          { product: { name: "红烧肉", price: "28.00" }, quantity: 1 },
          { product: { name: "汤", price: "4.00" }, quantity: 1 }
        ]
      }
    ];
    const mockReceivedOrders = [
      {
        id: "demo-3",
        creator: "demo-partner",
        creator_username: "TA",
        status: "CONFIRMED",
        notes: "TA为你点的爱心餐",
        total_price: "38.00",
        created_at: "2024-06-22T11:00:00Z",
        items: [
          { product: { name: "糖醋里脊", price: "26.00" }, quantity: 1 },
          { product: { name: "蛋花汤", price: "6.00" }, quantity: 2 }
        ]
      }
    ];
    const displaySentOrders = common_vendor.computed(() => {
      return isLoggedIn.value ? orderStore.sentOrders : mockSentOrders;
    });
    const displayReceivedOrders = common_vendor.computed(() => {
      return isLoggedIn.value ? orderStore.receivedOrders : mockReceivedOrders;
    });
    const refreshOrders = async () => {
      if (userStore.isLoggedIn) {
        common_vendor.index.__f__("log", "at pages/order/list.vue:167", "刷新订单数据...");
        try {
          await Promise.all([
            orderStore.fetchSentOrders(),
            orderStore.fetchReceivedOrders()
          ]);
          common_vendor.index.__f__("log", "at pages/order/list.vue:173", "订单数据刷新完成");
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/order/list.vue:175", "刷新订单数据失败:", error);
        }
      }
    };
    common_vendor.onMounted(() => {
      if (userStore.isLoggedIn) {
        orderStore.initOrders();
        refreshOrders();
      }
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/order/list.vue:191", "订单页面显示");
      if (userStore.isLoggedIn) {
        refreshOrders();
      }
    });
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/public/login"
      });
    };
    const handleTabClick = (item) => {
      currentTab.value = item.index;
    };
    const handleSwiperChange = (e) => {
      currentTab.value = e.detail.current;
    };
    const formatDate = (date) => {
      return common_vendor.dayjs(date).format("MM-DD HH:mm");
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
    const navigateToDetail = (id) => {
      if (!isLoggedIn.value && id.startsWith("demo-")) {
        common_vendor.index.showToast({
          title: "请登录查看订单详情",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${id}`
      });
    };
    const handleRefresh = () => {
      common_vendor.index.showToast({
        title: "刷新中...",
        icon: "loading"
      });
      refreshOrders().then(() => {
        common_vendor.index.hideToast();
        common_vendor.index.showToast({
          title: "刷新完成",
          icon: "success",
          duration: 1e3
        });
      });
    };
    return {
      isLoggedIn,
      orderStore,
      currentTab,
      tabList,
      displaySentOrders,
      displayReceivedOrders,
      goToLogin,
      handleTabClick,
      handleSwiperChange,
      formatDate,
      getStatusText,
      getStatusClass,
      navigateToDetail,
      handleRefresh,
      refreshOrders,
      // 主题相关
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$setup.isLoggedIn
  }, !$setup.isLoggedIn ? {
    b: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args))
  } : {}, {
    c: common_vendor.f($setup.tabList, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: index,
        c: $setup.currentTab === index ? 1 : "",
        d: common_vendor.o(($event) => $setup.handleTabClick({
          index
        }), index)
      };
    }),
    d: common_vendor.o((...args) => $setup.handleRefresh && $setup.handleRefresh(...args)),
    e: $setup.isLoggedIn && $setup.orderStore.status === "loading"
  }, $setup.isLoggedIn && $setup.orderStore.status === "loading" ? {} : common_vendor.e({
    f: common_vendor.f($setup.displaySentOrders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.id),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.n($setup.getStatusClass(order.status)),
        d: common_vendor.t($setup.formatDate(order.created_at || order.createTime)),
        e: common_vendor.t(order.items.length),
        f: common_vendor.t(order.total_price || order.totalPrice),
        g: order.notes || order.note
      }, order.notes || order.note ? {
        h: common_vendor.t(order.notes || order.note)
      } : {}, {
        i: order.id,
        j: common_vendor.o(($event) => $setup.navigateToDetail(order.id), order.id)
      });
    }),
    g: $setup.displaySentOrders.length === 0
  }, $setup.displaySentOrders.length === 0 ? {} : {}), {
    h: $setup.isLoggedIn && $setup.orderStore.status === "loading"
  }, $setup.isLoggedIn && $setup.orderStore.status === "loading" ? {} : common_vendor.e({
    i: common_vendor.f($setup.displayReceivedOrders, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.id),
        b: common_vendor.t($setup.getStatusText(order.status)),
        c: common_vendor.n($setup.getStatusClass(order.status)),
        d: common_vendor.t($setup.formatDate(order.created_at || order.createTime)),
        e: common_vendor.t(order.items.length),
        f: common_vendor.t(order.total_price || order.totalPrice),
        g: order.notes || order.note
      }, order.notes || order.note ? {
        h: common_vendor.t(order.notes || order.note)
      } : {}, {
        i: order.id,
        j: common_vendor.o(($event) => $setup.navigateToDetail(order.id), order.id)
      });
    }),
    j: $setup.displayReceivedOrders.length === 0
  }, $setup.displayReceivedOrders.length === 0 ? {} : {}), {
    k: $setup.currentTab,
    l: common_vendor.o((...args) => $setup.handleSwiperChange && $setup.handleSwiperChange(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map
