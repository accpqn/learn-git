"use strict";
const common_vendor = require("../common/vendor.js");
const utils_storage = require("../utils/storage.js");
const useCartStore = common_vendor.defineStore("cart", {
  state: () => ({
    // 购物车商品，格式: { productId: { item, quantity } }
    items: {}
  }),
  getters: {
    // 购物车商品总数
    totalItems: (state) => Object.values(state.items).reduce((total, { quantity }) => total + quantity, 0),
    // 购物车总价
    totalPrice: (state) => {
      const price = Object.values(state.items).reduce((total, { item, quantity }) => total + item.price * quantity, 0);
      return price.toFixed(2);
    },
    // 获取某个商品的数量
    getItemQuantity(state) {
      return function(productId) {
        const item = state.items[productId];
        return item ? item.quantity : 0;
      };
    }
  },
  actions: {
    // 从本地存储加载购物车数据
    loadCartFromLocal() {
      const cartData = utils_storage.Storage.get(utils_storage.STORAGE_KEYS.CART_ITEMS, {});
      this.items = cartData;
    },
    // 保存购物车数据到本地存储
    saveCartToLocal() {
      utils_storage.Storage.set(utils_storage.STORAGE_KEYS.CART_ITEMS, this.items);
    },
    // 添加商品到购物车
    addItem(product) {
      common_vendor.index.__f__("log", "at store/cart.js:44", "CartStore addItem - 商品数据:", product);
      if (!product || !product.id) {
        common_vendor.index.__f__("error", "at store/cart.js:46", "商品数据无效:", product);
        return;
      }
      if (this.items[product.id]) {
        this.items[product.id].quantity++;
        common_vendor.index.__f__("log", "at store/cart.js:52", "增加商品数量:", this.items[product.id]);
      } else {
        this.items[product.id] = { item: product, quantity: 1 };
        common_vendor.index.__f__("log", "at store/cart.js:55", "新增商品到购物车:", this.items[product.id]);
      }
      this.saveCartToLocal();
    },
    // 从购物车移除商品
    removeItem(productId) {
      if (this.items[productId] && this.items[productId].quantity > 1) {
        this.items[productId].quantity--;
      } else if (this.items[productId]) {
        delete this.items[productId];
      }
      this.saveCartToLocal();
    },
    // 直接设置商品数量
    setItemQuantity(product, quantity) {
      common_vendor.index.__f__("log", "at store/cart.js:72", "CartStore setItemQuantity - 商品数据:", product, "数量:", quantity);
      if (!product || !product.id) {
        common_vendor.index.__f__("error", "at store/cart.js:74", "商品数据无效:", product);
        return;
      }
      if (quantity > 0) {
        this.items[product.id] = { item: product, quantity };
        common_vendor.index.__f__("log", "at store/cart.js:80", "设置商品数量:", this.items[product.id]);
      } else {
        delete this.items[product.id];
        common_vendor.index.__f__("log", "at store/cart.js:83", "删除商品:", product.id);
      }
      this.saveCartToLocal();
    },
    // 清空购物车
    clearCart() {
      this.items = {};
      this.saveCartToLocal();
    },
    // 初始化购物车
    initCart() {
      this.loadCartFromLocal();
    }
  }
});
exports.useCartStore = useCartStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/cart.js.map
