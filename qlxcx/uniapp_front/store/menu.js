import { defineStore } from 'pinia';
import { mockMenuData } from '@/mock/menu';
import * as menuApi from '@/api/menu';

export const useMenuStore = defineStore('menu', {
    state: () => ({
        categories: [],
        products: {}, // 以 categoryId 为 key 存储商品列表
        allProducts: [], // 所有商品的平铺列表
        currentCategoryId: null,
        status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
        error: null,
        useRealApi: false // 是否使用真实API，可以在设置中切换
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
            // 因为现在是本地数据，不再需要按需加载，数据是全的
        },

        async fetchMenuData() {
            this.status = 'loading';
            this.error = null;

            try {
                if (this.useRealApi) {
                    // 使用真实API
                    await this.fetchRealMenuData();
                } else {
                    // 使用模拟数据
                    await this.fetchMockMenuData();
                }
                this.status = 'success';
            } catch (err) {
                this.status = 'error';
                this.error = err.message || '加载菜单数据失败';
                console.error('获取菜单数据失败:', err);
            }
        },

        async fetchRealMenuData() {
            // 获取分类
            const categories = await menuApi.getCategories();
            this.categories = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                description: cat.description
            }));

            // 获取所有商品
            const products = await menuApi.getProducts();
            this.allProducts = products;

            // 按分类组织商品
            this.products = {};
            this.categories.forEach(category => {
                this.products[category.id] = products.filter(product => product.category === category.id);
            });

            // 设置默认分类
            if (this.categories.length > 0) {
                this.currentCategoryId = this.categories[0].id;
            }
        },

        async fetchMockMenuData() {
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            this.categories = mockMenuData.categories;
            this.products = mockMenuData.products;

            // 构建allProducts
            this.allProducts = [];
            Object.values(this.products).forEach(categoryProducts => {
                this.allProducts.push(...categoryProducts);
            });

            if (this.categories.length > 0) {
                this.currentCategoryId = this.categories[0].id;
            }
        },

        // 设置API模式
        setApiMode(useReal) {
            this.useRealApi = useReal;
            console.log('API模式设置为:', useReal ? '真实API' : '模拟数据');
        },

        // 切换API模式（保留兼容性）
        toggleApiMode(useReal = false) {
            this.setApiMode(useReal);
            // 重新加载数据
            this.fetchMenuData();
        },

        // 添加分类
        async addCategory(categoryData) {
            try {
                if (this.useRealApi) {
                    const newCategory = await menuApi.addCategory(categoryData);
                    this.categories.push(newCategory);
                    this.products[newCategory.id] = [];
                } else {
                    // 模拟添加分类
                    const newId = Math.max(...this.categories.map(c => c.id)) + 1;
                    const newCategory = { id: newId, ...categoryData };
                    this.categories.push(newCategory);
                    this.products[newId] = [];
                }
                return true;
            } catch (error) {
                console.error('添加分类失败:', error);
                throw error;
            }
        },

        // 添加商品
        async addProduct(productData) {
            try {
                if (this.useRealApi) {
                    const newProduct = await menuApi.addProduct(productData);
                    this.allProducts.push(newProduct);
                    if (!this.products[newProduct.category]) {
                        this.products[newProduct.category] = [];
                    }
                    this.products[newProduct.category].push(newProduct);
                } else {
                    // 模拟添加商品
                    const newId = Math.max(...this.allProducts.map(p => p.id)) + 1;
                    const newProduct = { id: newId, ...productData };
                    this.allProducts.push(newProduct);
                    if (!this.products[productData.categoryId]) {
                        this.products[productData.categoryId] = [];
                    }
                    this.products[productData.categoryId].push(newProduct);
                }
                return true;
            } catch (error) {
                console.error('添加商品失败:', error);
                throw error;
            }
        },
    }
});