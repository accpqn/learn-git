"use strict";
const common_vendor = require("../../common/vendor.js");
const store_menu = require("../../store/menu.js");
const store_cart = require("../../store/cart.js");
const store_user = require("../../store/user.js");
const mixins_theme = require("../../mixins/theme.js");
const config_index = require("../../config/index.js");
const _sfc_main = {
  setup() {
    const menuStore = store_menu.useMenuStore();
    const cartStore = store_cart.useCartStore();
    const userStore = store_user.useUserStore();
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const showProductModal = common_vendor.ref(false);
    const selectedProduct = common_vendor.ref(null);
    const currentQuantity = common_vendor.ref(0);
    const isLoggedIn = common_vendor.computed(() => userStore.isLoggedIn);
    const checkAndSetDataMode = () => {
      const wasUsingRealApi = menuStore.useRealApi;
      const shouldUseRealApi = userStore.isLoggedIn;
      if (shouldUseRealApi !== wasUsingRealApi) {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:187", `数据源切换: ${wasUsingRealApi ? "真实" : "模拟"} -> ${shouldUseRealApi ? "真实" : "模拟"}`);
        menuStore.setApiMode(shouldUseRealApi);
        menuStore.fetchMenuData();
      } else if (shouldUseRealApi) {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:192", "用户已登录，使用真实API数据");
      } else {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:194", "用户未登录，使用模拟数据");
      }
    };
    common_vendor.onMounted(() => {
      checkAndSetDataMode();
      cartStore.initCart();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:205", "点餐页面显示，检查登录状态");
      checkAndSetDataMode();
    });
    const currentCategoryName = common_vendor.computed(() => {
      var _a;
      return ((_a = menuStore.categories.find((c) => c.id === menuStore.currentCategoryId)) == null ? void 0 : _a.name) || "";
    });
    const currentCategoryDesc = common_vendor.computed(() => {
      const category = menuStore.categories.find((cat) => cat.id === menuStore.currentCategoryId);
      return category ? category.description : "";
    });
    const getGreeting = () => {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 12)
        return "早餐时光，为TA准备营养早餐吧";
      if (hour < 14)
        return "午餐时间，来点什么好呢？";
      if (hour < 18)
        return "下午茶时光，甜蜜一下";
      return "晚餐时间，和TA一起享受美食";
    };
    const getCategoryProductCount = (categoryId) => {
      var _a;
      return ((_a = menuStore.products[categoryId]) == null ? void 0 : _a.length) || 0;
    };
    const handleCategoryChange = (categoryId) => {
      menuStore.setCurrentCategory(categoryId);
    };
    const handleQuantityChange = (e, product) => {
      cartStore.setItemQuantity(product, e.value);
    };
    const showProductDetail = (product) => {
      selectedProduct.value = product;
      const cartQuantity = cartStore.getItemQuantity(product.id);
      currentQuantity.value = cartQuantity > 0 ? cartQuantity : 1;
      showProductModal.value = true;
    };
    const increaseQuantity = () => {
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:247", "点击增加按钮，当前商品:", selectedProduct.value);
      if (selectedProduct.value) {
        currentQuantity.value++;
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:250", "数量增加到:", currentQuantity.value);
      } else {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:252", "商品未选择");
      }
    };
    const decreaseQuantity = () => {
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:257", "点击减少按钮，当前数量:", currentQuantity.value);
      if (currentQuantity.value > 1) {
        currentQuantity.value--;
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:260", "数量减少到:", currentQuantity.value);
      } else {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:262", "数量已经是最小值");
      }
    };
    const addToCart = () => {
      if (selectedProduct.value && currentQuantity.value > 0) {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:268", "加入购物车:", selectedProduct.value, currentQuantity.value);
        cartStore.setItemQuantity(selectedProduct.value, currentQuantity.value);
        showProductModal.value = false;
        common_vendor.index.showToast({
          title: `已加入购物车`,
          icon: "success"
        });
      }
    };
    const addProductToCart = (product) => {
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:281", "=== 点击加号按钮 ===");
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:282", "商品信息:", product);
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:283", "商品ID:", product == null ? void 0 : product.id);
      common_vendor.index.__f__("log", "at pages/ordering/index.vue:284", "商品名称:", product == null ? void 0 : product.name);
      if (product) {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:287", "添加到购物车");
        try {
          cartStore.setItemQuantity(product, 1);
          common_vendor.index.__f__("log", "at pages/ordering/index.vue:290", "购物车操作完成");
          common_vendor.index.showToast({
            title: "已加入购物车",
            icon: "success"
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/ordering/index.vue:296", "购物车操作失败:", error);
          common_vendor.index.showToast({
            title: "添加失败",
            icon: "error"
          });
        }
      } else {
        common_vendor.index.__f__("log", "at pages/ordering/index.vue:303", "商品信息无效");
        common_vendor.index.showToast({
          title: "商品信息无效",
          icon: "none"
        });
      }
    };
    const increaseProductQuantity = (product) => {
      const currentQty = cartStore.getItemQuantity(product.id);
      cartStore.setItemQuantity(product, currentQty + 1);
    };
    const decreaseProductQuantity = (product) => {
      const currentQty = cartStore.getItemQuantity(product.id);
      if (currentQty > 1) {
        cartStore.setItemQuantity(product, currentQty - 1);
      } else if (currentQty === 1) {
        cartStore.setItemQuantity(product, 0);
      }
    };
    const showCartDetail = () => {
      common_vendor.index.showToast({
        title: `购物车中有${cartStore.totalItems}件商品`,
        icon: "none"
      });
    };
    const goToConfirm = () => {
      if (cartStore.totalItems === 0) {
        common_vendor.index.showToast({
          title: "请先选择商品",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/order/confirm"
      });
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/public/login"
      });
    };
    const reloadMenu = () => {
      menuStore.fetchMenuData();
    };
    const getProductImageUrl = config_index.getProductImageUrl;
    return {
      menuStore,
      cartStore,
      isLoggedIn,
      showProductModal,
      selectedProduct,
      currentQuantity,
      currentCategoryName,
      currentCategoryDesc,
      getGreeting,
      getCategoryProductCount,
      handleCategoryChange,
      handleQuantityChange,
      showProductDetail,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      addProductToCart,
      increaseProductQuantity,
      decreaseProductQuantity,
      showCartDetail,
      goToConfirm,
      goToLogin,
      reloadMenu,
      getProductImageUrl,
      // 主题相关
      currentTheme,
      getThemeColor,
      getButtonStyle,
      getHeaderStyle
    };
  }
};
if (!Array) {
  const _component_u_loading_icon = common_vendor.resolveComponent("u-loading-icon");
  const _component_u_button = common_vendor.resolveComponent("u-button");
  const _component_u_empty = common_vendor.resolveComponent("u-empty");
  const _component_u_transition = common_vendor.resolveComponent("u-transition");
  (_component_u_loading_icon + _component_u_button + _component_u_empty + _component_u_transition)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($setup.getGreeting()),
    b: common_vendor.t($setup.isLoggedIn ? "真实数据" : "模拟数据"),
    c: !$setup.isLoggedIn
  }, !$setup.isLoggedIn ? {
    d: common_vendor.o((...args) => $setup.goToLogin && $setup.goToLogin(...args))
  } : {}, {
    e: common_vendor.s($setup.getHeaderStyle()),
    f: common_vendor.f($setup.menuStore.categories, (category, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(category.name),
        b: $setup.getCategoryProductCount(category.id) > 0
      }, $setup.getCategoryProductCount(category.id) > 0 ? {
        c: common_vendor.t($setup.getCategoryProductCount(category.id))
      } : {}, {
        d: category.id,
        e: common_vendor.n({
          active: category.id === $setup.menuStore.currentCategoryId
        }),
        f: common_vendor.o(($event) => $setup.handleCategoryChange(category.id), category.id)
      });
    }),
    g: $setup.menuStore.status === "loading"
  }, $setup.menuStore.status === "loading" ? {
    h: common_vendor.p({
      text: "正在加载菜单...",
      size: "24"
    })
  } : $setup.menuStore.status === "error" ? {
    j: common_vendor.o($setup.reloadMenu),
    k: common_vendor.p({
      text: "重新加载",
      type: "primary",
      size: "small"
    }),
    l: common_vendor.p({
      text: "加载失败",
      mode: "error"
    })
  } : common_vendor.e({
    m: common_vendor.t($setup.currentCategoryName),
    n: common_vendor.t($setup.currentCategoryDesc),
    o: $setup.menuStore.currentProducts.length === 0
  }, $setup.menuStore.currentProducts.length === 0 ? {
    p: common_vendor.p({
      text: "该分类暂无商品",
      mode: "data"
    })
  } : {
    q: common_vendor.f($setup.menuStore.currentProducts, (product, k0, i0) => {
      return common_vendor.e({
        a: $setup.getProductImageUrl(product),
        b: common_vendor.o(($event) => $setup.showProductDetail(product), product.id),
        c: common_vendor.t(product.name),
        d: common_vendor.t(product.description),
        e: common_vendor.t(product.price),
        f: common_vendor.o(($event) => $setup.showProductDetail(product), product.id),
        g: $setup.cartStore.getItemQuantity(product.id) > 0
      }, $setup.cartStore.getItemQuantity(product.id) > 0 ? {
        h: common_vendor.o(($event) => $setup.decreaseProductQuantity(product), product.id),
        i: common_vendor.t($setup.cartStore.getItemQuantity(product.id)),
        j: common_vendor.o(($event) => $setup.increaseProductQuantity(product), product.id)
      } : {
        k: common_vendor.o(($event) => $setup.addProductToCart(product), product.id)
      }, {
        l: product.id
      });
    })
  }), {
    i: $setup.menuStore.status === "error",
    r: common_vendor.t($setup.cartStore.totalItems),
    s: common_vendor.t($setup.cartStore.totalItems),
    t: common_vendor.t($setup.cartStore.totalPrice),
    v: common_vendor.o((...args) => $setup.showCartDetail && $setup.showCartDetail(...args)),
    w: common_vendor.o((...args) => $setup.goToConfirm && $setup.goToConfirm(...args)),
    x: $setup.cartStore.totalItems === 0,
    y: common_vendor.p({
      show: $setup.cartStore.totalItems > 0,
      mode: "slide-up"
    }),
    z: $setup.showProductModal
  }, $setup.showProductModal ? common_vendor.e({
    A: $setup.selectedProduct
  }, $setup.selectedProduct ? {
    B: common_vendor.o(($event) => $setup.showProductModal = false),
    C: $setup.getProductImageUrl($setup.selectedProduct),
    D: common_vendor.t($setup.selectedProduct.name),
    E: common_vendor.t($setup.selectedProduct.description),
    F: common_vendor.t($setup.selectedProduct.price),
    G: common_vendor.o((...args) => $setup.decreaseQuantity && $setup.decreaseQuantity(...args)),
    H: $setup.currentQuantity <= 1,
    I: common_vendor.t($setup.currentQuantity),
    J: common_vendor.o((...args) => $setup.increaseQuantity && $setup.increaseQuantity(...args)),
    K: common_vendor.o((...args) => $setup.addToCart && $setup.addToCart(...args)),
    L: $setup.currentQuantity <= 0,
    M: common_vendor.o(() => {
    })
  } : {}, {
    N: common_vendor.o(($event) => $setup.showProductModal = false)
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ordering/index.js.map
