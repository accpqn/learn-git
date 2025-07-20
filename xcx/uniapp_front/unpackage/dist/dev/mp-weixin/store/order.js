"use strict";
const common_vendor = require("../common/vendor.js");
const api_order = require("../api/order.js");
const utils_storage = require("../utils/storage.js");
const useOrderStore = common_vendor.defineStore("order", {
  state: () => ({
    sentOrders: [],
    receivedOrders: [],
    currentOrderDetail: null,
    status: "idle",
    error: null
  }),
  getters: {
    allOrders: (state) => [...state.sentOrders, ...state.receivedOrders].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  },
  actions: {
    async createOrder(orderData) {
      this.status = "loading";
      try {
        common_vendor.index.__f__("log", "at store/order.js:22", "OrderStore createOrder - 原始数据:", orderData);
        const apiOrderData = {
          items: orderData.items.map((item) => {
            common_vendor.index.__f__("log", "at store/order.js:27", "处理订单项:", item);
            const productId = item.product || item.item && item.item.id;
            if (!productId) {
              common_vendor.index.__f__("error", "at store/order.js:31", "无法获取商品ID:", item);
              throw new Error("商品ID缺失");
            }
            return {
              product: productId,
              quantity: item.quantity
            };
          }),
          notes: orderData.notes || orderData.note || ""
          // 兼容不同的字段名
        };
        common_vendor.index.__f__("log", "at store/order.js:42", "Creating order with data:", apiOrderData);
        const createdOrder = await api_order.createOrder(apiOrderData);
        common_vendor.index.__f__("log", "at store/order.js:47", "Order created successfully:", createdOrder);
        const normalizedOrder = this.normalizeOrderData(createdOrder);
        normalizedOrder.type = "sent";
        this.sentOrders.unshift(normalizedOrder);
        this.saveOrdersToLocal();
        this.status = "success";
        return normalizedOrder;
      } catch (err) {
        this.status = "error";
        this.error = err.message;
        common_vendor.index.__f__("error", "at store/order.js:64", "Failed to create order:", err);
        throw err;
      }
    },
    // 从本地存储加载订单数据
    loadOrdersFromLocal() {
      this.sentOrders = utils_storage.Storage.get(utils_storage.STORAGE_KEYS.SENT_ORDERS, []);
      this.receivedOrders = utils_storage.Storage.get(utils_storage.STORAGE_KEYS.RECEIVED_ORDERS, []);
    },
    // 保存订单数据到本地存储
    saveOrdersToLocal() {
      utils_storage.Storage.set(utils_storage.STORAGE_KEYS.SENT_ORDERS, this.sentOrders);
      utils_storage.Storage.set(utils_storage.STORAGE_KEYS.RECEIVED_ORDERS, this.receivedOrders);
    },
    // 标准化后端订单数据格式
    normalizeOrderData(backendOrder) {
      return {
        id: backendOrder.id,
        creator: backendOrder.creator,
        creator_username: backendOrder.creator_username,
        status: backendOrder.status,
        notes: backendOrder.notes,
        note: backendOrder.notes,
        // 兼容前端使用note字段
        total_price: backendOrder.total_price,
        totalPrice: backendOrder.total_price,
        // 兼容前端使用totalPrice字段
        created_at: backendOrder.created_at,
        createTime: backendOrder.created_at,
        // 兼容前端使用createTime字段
        updated_at: backendOrder.updated_at,
        items: backendOrder.items || [],
        created_by_current_user: backendOrder.created_by_current_user
      };
    },
    // 检查订单是否有变化（新增、删除、状态变化）
    checkOrderChanges(oldOrders, newOrders) {
      if (oldOrders.length !== newOrders.length) {
        return true;
      }
      for (const newOrder of newOrders) {
        const oldOrder = oldOrders.find((o) => o.id === newOrder.id);
        if (!oldOrder) {
          return true;
        }
        if (oldOrder.status !== newOrder.status) {
          common_vendor.index.__f__("log", "at store/order.js:116", `订单 ${newOrder.id} 状态变化: ${oldOrder.status} -> ${newOrder.status}`);
          return true;
        }
        if (oldOrder.updated_at !== newOrder.updated_at) {
          common_vendor.index.__f__("log", "at store/order.js:121", `订单 ${newOrder.id} 更新时间变化`);
          return true;
        }
      }
      return false;
    },
    async fetchSentOrders() {
      this.status = "loading";
      try {
        common_vendor.index.__f__("log", "at store/order.js:132", "Fetching sent orders...");
        const data = await api_order.getOrders();
        const newSentOrders = data.filter((order) => order.created_by_current_user).map((order) => {
          const normalized = this.normalizeOrderData(order);
          normalized.type = "sent";
          return normalized;
        });
        const hasChanges = this.checkOrderChanges(this.sentOrders, newSentOrders);
        if (hasChanges) {
          common_vendor.index.__f__("log", "at store/order.js:147", "发现发送订单变化，更新数据");
          this.sentOrders = newSentOrders;
          this.saveOrdersToLocal();
        }
        common_vendor.index.__f__("log", "at store/order.js:152", "Sent orders fetched:", this.sentOrders.length, "条");
        this.status = "success";
      } catch (err) {
        this.status = "error";
        this.error = err.message;
        common_vendor.index.__f__("error", "at store/order.js:157", "Failed to fetch sent orders:", err);
      }
    },
    async fetchReceivedOrders() {
      this.status = "loading";
      try {
        common_vendor.index.__f__("log", "at store/order.js:164", "Fetching received orders...");
        const data = await api_order.getOrders();
        const newReceivedOrders = data.filter((order) => !order.created_by_current_user).map((order) => {
          const normalized = this.normalizeOrderData(order);
          normalized.type = "received";
          return normalized;
        });
        const hasChanges = this.checkOrderChanges(this.receivedOrders, newReceivedOrders);
        if (hasChanges) {
          common_vendor.index.__f__("log", "at store/order.js:179", "发现接收订单变化，更新数据");
          this.receivedOrders = newReceivedOrders;
          this.saveOrdersToLocal();
        }
        common_vendor.index.__f__("log", "at store/order.js:184", "Received orders fetched:", this.receivedOrders.length, "条");
        this.status = "success";
      } catch (err) {
        this.status = "error";
        this.error = err.message;
        common_vendor.index.__f__("error", "at store/order.js:189", "Failed to fetch received orders:", err);
      }
    },
    async fetchOrderDetail(id) {
      this.status = "loading";
      try {
        let order = this.sentOrders.find((o) => o.id == id) || this.receivedOrders.find((o) => o.id == id);
        if (order) {
          this.currentOrderDetail = order;
        } else {
          common_vendor.index.__f__("log", "at store/order.js:203", "Fetching order detail from API for id:", id);
          const data = await api_order.getOrderDetail(id);
          const normalizedOrder = this.normalizeOrderData(data);
          normalizedOrder.type = data.created_by_current_user ? "sent" : "received";
          this.currentOrderDetail = normalizedOrder;
        }
        common_vendor.index.__f__("log", "at store/order.js:213", "Order detail loaded:", this.currentOrderDetail);
        this.status = "success";
      } catch (err) {
        this.status = "error";
        this.error = err.message;
        common_vendor.index.__f__("error", "at store/order.js:218", "Failed to fetch order detail:", err);
      }
    },
    async updateOrderItem({ orderId, itemId, data }) {
      try {
        const order = this.sentOrders.find((o) => o.id === orderId) || this.receivedOrders.find((o) => o.id === orderId);
        if (order) {
          const item = order.items.find((i) => i.item.id === itemId);
          if (item) {
            Object.assign(item, data);
            this.saveOrdersToLocal();
          }
        }
        if (api_order.updateOrderItem) {
          await api_order.updateOrderItem(orderId, itemId, data);
        }
        await this.fetchOrderDetail(orderId);
      } catch (err) {
        common_vendor.index.__f__("error", "at store/order.js:242", "Failed to update order item:", err);
        throw err;
      }
    },
    // 初始化订单数据
    initOrders() {
      this.loadOrdersFromLocal();
    }
  }
});
exports.useOrderStore = useOrderStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/order.js.map
