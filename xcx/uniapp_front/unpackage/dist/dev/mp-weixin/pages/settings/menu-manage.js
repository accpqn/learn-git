"use strict";
const common_vendor = require("../../common/vendor.js");
const api_menu = require("../../api/menu.js");
const config_index = require("../../config/index.js");
const mixins_theme = require("../../mixins/theme.js");
const store_theme = require("../../store/theme.js");
const _sfc_main = {
  name: "MenuManage",
  setup() {
    const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = mixins_theme.useTheme();
    const themeStore = store_theme.useThemeStore();
    const categories = common_vendor.ref([]);
    const products = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const currentTab = common_vendor.ref(0);
    const showCategoryModal = common_vendor.ref(false);
    const categoryForm = common_vendor.reactive({
      id: null,
      name: "",
      description: ""
    });
    const showProductModal = common_vendor.ref(false);
    const productForm = common_vendor.reactive({
      id: null,
      name: "",
      price: "",
      category: null,
      categoryIndex: 0,
      description: "",
      imageUrl: "",
      imageFile: null
    });
    const categoryOptions = common_vendor.computed(() => {
      return categories.value.map((cat) => cat.name);
    });
    common_vendor.onMounted(() => {
      loadData();
    });
    common_vendor.onShow(() => {
      try {
        common_vendor.index.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: themeStore.currentTheme.primaryColor,
          animation: {
            duration: 0,
            // 立即生效
            timingFunc: "linear"
          }
        });
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:222", "设置导航栏主题失败:", error);
      }
      common_vendor.index.$emit("onPageShow", "pages/settings/menu-manage");
    });
    const loadData = async () => {
      loading.value = true;
      try {
        await Promise.all([
          loadCategories(),
          loadProducts()
        ]);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:238", "加载数据失败:", error);
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "error"
        });
      } finally {
        loading.value = false;
      }
    };
    const loadCategories = async () => {
      try {
        const data = await api_menu.getCategories();
        categories.value = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:254", "加载分类失败:", error);
      }
    };
    const loadProducts = async () => {
      try {
        const data = await api_menu.getProducts();
        products.value = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:264", "加载商品失败:", error);
      }
    };
    const switchTab = (index) => {
      currentTab.value = index;
    };
    const getProductImageUrl = config_index.getProductImageUrl;
    const getCategoryProductCount = (categoryId) => {
      return products.value.filter((p) => p.category === categoryId).length;
    };
    const getCategoryName = (categoryId) => {
      const category = categories.value.find((cat) => cat.id === categoryId);
      return category ? category.name : "未知分类";
    };
    const showAddCategoryModal = () => {
      common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:291", "显示添加分类弹窗");
      resetCategoryForm();
      showCategoryModal.value = true;
    };
    const editCategory = (category) => {
      categoryForm.id = category.id;
      categoryForm.name = category.name;
      categoryForm.description = category.description || "";
      showCategoryModal.value = true;
    };
    const resetCategoryForm = () => {
      categoryForm.id = null;
      categoryForm.name = "";
      categoryForm.description = "";
    };
    const saveCategoryModal = async () => {
      common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:313", "保存分类开始", categoryForm);
      if (!categoryForm.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "error"
        });
        return;
      }
      try {
        const data = {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim()
        };
        common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:327", "准备发送的数据:", data);
        if (categoryForm.id) {
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:331", "编辑分类:", categoryForm.id);
          await api_menu.updateCategory(categoryForm.id, data);
          common_vendor.index.showToast({
            title: "分类更新成功",
            icon: "success"
          });
        } else {
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:339", "新增分类");
          const result = await api_menu.addCategory(data);
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:341", "新增分类结果:", result);
          common_vendor.index.showToast({
            title: "分类添加成功",
            icon: "success"
          });
        }
        showCategoryModal.value = false;
        await loadCategories();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:351", "保存分类失败:", error);
        common_vendor.index.showToast({
          title: "保存失败: " + (error.message || "未知错误"),
          icon: "error"
        });
      }
    };
    const closeCategoryModal = () => {
      showCategoryModal.value = false;
      resetCategoryForm();
    };
    const deleteCategory = (category) => {
      const productCount = getCategoryProductCount(category.id);
      const message = productCount > 0 ? `分类"${category.name}"下有${productCount}个商品，删除分类将同时删除所有商品，确定要删除吗？` : `确定要删除分类"${category.name}"吗？`;
      common_vendor.index.showModal({
        title: "确认删除",
        content: message,
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_menu.deleteCategory(category.id);
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              await loadData();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:385", "删除分类失败:", error);
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "error"
              });
            }
          }
        }
      });
    };
    const showAddProductModal = (categoryId = null) => {
      common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:400", "显示添加商品弹窗", categoryId);
      if (categories.value.length === 0) {
        common_vendor.index.showToast({
          title: "请先添加分类",
          icon: "error"
        });
        return;
      }
      resetProductForm();
      if (categoryId) {
        const categoryIndex = categories.value.findIndex((cat) => cat.id === categoryId);
        if (categoryIndex > -1) {
          productForm.category = categoryId;
          productForm.categoryIndex = categoryIndex;
        }
      }
      showProductModal.value = true;
    };
    const editProduct = (product) => {
      productForm.id = product.id;
      productForm.name = product.name;
      productForm.price = product.price.toString();
      productForm.category = product.category;
      productForm.categoryIndex = categories.value.findIndex((cat) => cat.id === product.category);
      productForm.description = product.description || "";
      productForm.imageUrl = getProductImageUrl(product);
      showProductModal.value = true;
    };
    const resetProductForm = () => {
      productForm.id = null;
      productForm.name = "";
      productForm.price = "";
      productForm.category = categories.value.length > 0 ? categories.value[0].id : null;
      productForm.categoryIndex = 0;
      productForm.description = "";
      productForm.imageUrl = "";
      productForm.imageFile = null;
    };
    const handleCategoryChange = (e) => {
      var _a;
      const index = e.detail ? e.detail.value : e.target.value;
      productForm.categoryIndex = index;
      productForm.category = (_a = categories.value[index]) == null ? void 0 : _a.id;
      common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:448", "分类选择变化:", index, productForm.category);
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          productForm.imageUrl = res.tempFilePaths[0];
          productForm.imageFile = res.tempFiles[0];
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:460", "选择图片:", res.tempFilePaths[0]);
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:463", "选择图片失败:", error);
          if (error.errMsg && error.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "图片留着不添加，谁知道长什么样",
              icon: "none",
              duration: 2e3
            });
          } else {
            common_vendor.index.showToast({
              title: "选择图片失败",
              icon: "error"
            });
          }
        }
      });
    };
    const removeImage = () => {
      productForm.imageUrl = "";
      productForm.imageFile = null;
    };
    const uploadProductWithImage = (productId, data, imagePath, isUpdate) => {
      return new Promise((resolve, reject) => {
        const url = isUpdate ? `${config_index.config.API_BASE_URL}/api/menus/products/${productId}/` : `${config_index.config.API_BASE_URL}/api/menus/products/`;
        const token = common_vendor.index.getStorageSync("token");
        common_vendor.index.uploadFile({
          url,
          filePath: imagePath,
          name: "image",
          formData: {
            ...data,
            _method: isUpdate ? "PUT" : "POST"
          },
          header: {
            "Authorization": `Bearer ${token}`
          },
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:508", "上传成功:", res);
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve(JSON.parse(res.data));
            } else {
              reject(new Error(`上传失败: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:516", "上传失败:", error);
            reject(error);
          }
        });
      });
    };
    const saveProductModal = async () => {
      common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:525", "保存商品开始", productForm);
      if (!productForm.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入商品名称",
          icon: "error"
        });
        return;
      }
      if (!productForm.price || parseFloat(productForm.price) <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效价格",
          icon: "error"
        });
        return;
      }
      if (!productForm.category) {
        common_vendor.index.showToast({
          title: "请选择分类",
          icon: "error"
        });
        return;
      }
      try {
        const baseData = {
          name: productForm.name.trim(),
          price: parseFloat(productForm.price),
          category: productForm.category,
          description: productForm.description.trim()
        };
        common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:559", "准备发送的商品数据:", baseData);
        if (productForm.id) {
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:563", "编辑商品:", productForm.id);
          if (productForm.imageFile) {
            await uploadProductWithImage(productForm.id, baseData, productForm.imageUrl, true);
          } else {
            await api_menu.updateProduct(productForm.id, baseData);
          }
          common_vendor.index.showToast({
            title: "商品更新成功",
            icon: "success"
          });
        } else {
          common_vendor.index.__f__("log", "at pages/settings/menu-manage.vue:579", "新增商品");
          if (productForm.imageFile) {
            await uploadProductWithImage(null, baseData, productForm.imageUrl, false);
          } else {
            await api_menu.addProduct(baseData);
          }
          common_vendor.index.showToast({
            title: "商品添加成功",
            icon: "success"
          });
        }
        showProductModal.value = false;
        await loadProducts();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:598", "保存商品失败:", error);
        common_vendor.index.showToast({
          title: "保存失败: " + (error.message || "未知错误"),
          icon: "error"
        });
      }
    };
    const closeProductModal = () => {
      showProductModal.value = false;
      resetProductForm();
    };
    const deleteProduct = (product) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除商品"${product.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_menu.deleteProduct(product.id);
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              await loadProducts();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/settings/menu-manage.vue:627", "删除商品失败:", error);
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "error"
              });
            }
          }
        }
      });
    };
    return {
      categories,
      products,
      loading,
      currentTab,
      showCategoryModal,
      categoryForm,
      showProductModal,
      productForm,
      categoryOptions,
      loadData,
      switchTab,
      getProductImageUrl,
      getCategoryProductCount,
      getCategoryName,
      // 分类管理
      showAddCategoryModal,
      editCategory,
      saveCategoryModal,
      closeCategoryModal,
      deleteCategory,
      // 商品管理
      showAddProductModal,
      editProduct,
      handleCategoryChange,
      chooseImage,
      removeImage,
      uploadProductWithImage,
      saveProductModal,
      closeProductModal,
      deleteProduct,
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
    a: $setup.currentTab === 0 ? 1 : "",
    b: common_vendor.o(($event) => $setup.switchTab(0)),
    c: $setup.currentTab === 1 ? 1 : "",
    d: common_vendor.o(($event) => $setup.switchTab(1)),
    e: $setup.currentTab === 0
  }, $setup.currentTab === 0 ? common_vendor.e({
    f: common_vendor.o((...args) => $setup.showAddCategoryModal && $setup.showAddCategoryModal(...args)),
    g: common_vendor.f($setup.categories, (category, k0, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: common_vendor.t(category.description || "暂无描述"),
        c: common_vendor.t($setup.getCategoryProductCount(category.id)),
        d: common_vendor.o(($event) => $setup.editCategory(category), category.id),
        e: common_vendor.o(($event) => $setup.deleteCategory(category), category.id),
        f: category.id
      };
    }),
    h: $setup.categories.length === 0
  }, $setup.categories.length === 0 ? {} : {}) : {}, {
    i: $setup.currentTab === 1
  }, $setup.currentTab === 1 ? common_vendor.e({
    j: common_vendor.o((...args) => $setup.showAddProductModal && $setup.showAddProductModal(...args)),
    k: common_vendor.f($setup.products, (product, k0, i0) => {
      return {
        a: $setup.getProductImageUrl(product),
        b: common_vendor.t(product.name),
        c: common_vendor.t(product.category_name || "未知分类"),
        d: common_vendor.t(product.price),
        e: common_vendor.o(($event) => $setup.editProduct(product), product.id),
        f: common_vendor.o(($event) => $setup.deleteProduct(product), product.id),
        g: product.id
      };
    }),
    l: $setup.products.length === 0
  }, $setup.products.length === 0 ? {} : {}) : {}, {
    m: $setup.showCategoryModal
  }, $setup.showCategoryModal ? {
    n: common_vendor.t($setup.categoryForm.id ? "编辑分类" : "添加分类"),
    o: common_vendor.o((...args) => $setup.closeCategoryModal && $setup.closeCategoryModal(...args)),
    p: $setup.categoryForm.name,
    q: common_vendor.o(($event) => $setup.categoryForm.name = $event.detail.value),
    r: $setup.categoryForm.description,
    s: common_vendor.o(($event) => $setup.categoryForm.description = $event.detail.value),
    t: common_vendor.o((...args) => $setup.closeCategoryModal && $setup.closeCategoryModal(...args)),
    v: common_vendor.o((...args) => $setup.saveCategoryModal && $setup.saveCategoryModal(...args)),
    w: common_vendor.o(() => {
    }),
    x: common_vendor.o((...args) => $setup.closeCategoryModal && $setup.closeCategoryModal(...args))
  } : {}, {
    y: $setup.showProductModal
  }, $setup.showProductModal ? common_vendor.e({
    z: common_vendor.t($setup.productForm.id ? "编辑商品" : "添加商品"),
    A: common_vendor.o((...args) => $setup.closeProductModal && $setup.closeProductModal(...args)),
    B: $setup.productForm.name,
    C: common_vendor.o(($event) => $setup.productForm.name = $event.detail.value),
    D: $setup.productForm.price,
    E: common_vendor.o(($event) => $setup.productForm.price = $event.detail.value),
    F: common_vendor.t($setup.categoryOptions[$setup.productForm.categoryIndex] || "请选择分类"),
    G: $setup.productForm.categoryIndex,
    H: $setup.categoryOptions,
    I: common_vendor.o((...args) => $setup.handleCategoryChange && $setup.handleCategoryChange(...args)),
    J: $setup.productForm.description,
    K: common_vendor.o(($event) => $setup.productForm.description = $event.detail.value),
    L: $setup.productForm.imageUrl
  }, $setup.productForm.imageUrl ? {
    M: $setup.productForm.imageUrl
  } : {}, {
    N: common_vendor.o((...args) => $setup.chooseImage && $setup.chooseImage(...args)),
    O: $setup.productForm.imageUrl
  }, $setup.productForm.imageUrl ? {
    P: common_vendor.o((...args) => $setup.removeImage && $setup.removeImage(...args))
  } : {}, {
    Q: common_vendor.o((...args) => $setup.closeProductModal && $setup.closeProductModal(...args)),
    R: common_vendor.o((...args) => $setup.saveProductModal && $setup.saveProductModal(...args)),
    S: common_vendor.o(() => {
    }),
    T: common_vendor.o((...args) => $setup.closeProductModal && $setup.closeProductModal(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-813346e9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/menu-manage.js.map
