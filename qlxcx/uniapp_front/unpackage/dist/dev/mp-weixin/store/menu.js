"use strict";
const common_vendor = require("../common/vendor.js");
const mock_menu = require("../mock/menu.js");
const api_menu = require("../api/menu.js");
const useMenuStore = common_vendor.defineStore("menu", {
  state: () => ({
    categories: [],
    products: {},
    // 以 categoryId 为 key 存储商品列表
    allProducts: [],
    // 所有商品的平铺列表
    currentCategoryId: null,
    status: "idle",
    // 'idle' | 'loading' | 'success' | 'error'
    error: null,
    useRealApi: false
    // 是否使用真实API，可以在设置中切换
  }),
  getters: {
    currentProducts: (state) => {
      if (!state.currentCategoryId || !state.products[state.currentCategoryId]) {
        return [];
      }
      return state.products[state.currentCategoryId];
    }
  },
  actions: {
    setCurrentCategory(categoryId) {
      this.currentCategoryId = categoryId;
    },
    async fetchMenuData() {
      this.status = "loading";
      this.error = null;
      try {
        if (this.useRealApi) {
          await this.fetchRealMenuData();
        } else {
          await this.fetchMockMenuData();
        }
        this.status = "success";
      } catch (err) {
        this.status = "error";
        this.error = err.message || "加载菜单数据失败";
        common_vendor.index.__f__("error", "at store/menu.js:47", "获取菜单数据失败:", err);
      }
    },
    async fetchRealMenuData() {
      const categories = await api_menu.getCategories();
      this.categories = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description
      }));
      const products = await api_menu.getProducts();
      this.allProducts = products;
      this.products = {};
      this.categories.forEach((category) => {
        this.products[category.id] = products.filter((product) => product.category === category.id);
      });
      if (this.categories.length > 0) {
        this.currentCategoryId = this.categories[0].id;
      }
    },
    async fetchMockMenuData() {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.categories = mock_menu.mockMenuData.categories;
      this.products = mock_menu.mockMenuData.products;
      this.allProducts = [];
      Object.values(this.products).forEach((categoryProducts) => {
        this.allProducts.push(...categoryProducts);
      });
      if (this.categories.length > 0) {
        this.currentCategoryId = this.categories[0].id;
      }
    },
    // 设置API模式
    setApiMode(useReal) {
      this.useRealApi = useReal;
      common_vendor.index.__f__("log", "at store/menu.js:97", "API模式设置为:", useReal ? "真实API" : "模拟数据");
    },
    // 切换API模式（保留兼容性）
    toggleApiMode(useReal = false) {
      this.setApiMode(useReal);
      this.fetchMenuData();
    },
    // 添加分类
    async addCategory(categoryData) {
      try {
        if (this.useRealApi) {
          const newCategory = await api_menu.addCategory(categoryData);
          this.categories.push(newCategory);
          this.products[newCategory.id] = [];
        } else {
          const newId = Math.max(...this.categories.map((c) => c.id)) + 1;
          const newCategory = { id: newId, ...categoryData };
          this.categories.push(newCategory);
          this.products[newId] = [];
        }
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/menu.js:123", "添加分类失败:", error);
        throw error;
      }
    },
    // 添加商品
    async addProduct(productData) {
      try {
        if (this.useRealApi) {
          const newProduct = await api_menu.addProduct(productData);
          this.allProducts.push(newProduct);
          if (!this.products[newProduct.category]) {
            this.products[newProduct.category] = [];
          }
          this.products[newProduct.category].push(newProduct);
        } else {
          const newId = Math.max(...this.allProducts.map((p) => p.id)) + 1;
          const newProduct = { id: newId, ...productData };
          this.allProducts.push(newProduct);
          if (!this.products[productData.categoryId]) {
            this.products[productData.categoryId] = [];
          }
          this.products[productData.categoryId].push(newProduct);
        }
        return true;
      } catch (error) {
        common_vendor.index.__f__("error", "at store/menu.js:150", "添加商品失败:", error);
        throw error;
      }
    }
  }
});
exports.useMenuStore = useMenuStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/menu.js.map
