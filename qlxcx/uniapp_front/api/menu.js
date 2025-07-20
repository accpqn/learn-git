import request from './request';

// ==================== 分类管理 API ====================

// 获取当前用户的所有分类
export function getCategories() {
    return request({
        url: '/menus/categories/',
        method: 'GET'
    });
}

// 创建新分类
export function addCategory(data) {
    return request({
        url: '/menus/categories/',
        method: 'POST',
        data
    });
}

// 获取单个分类详情
export function getCategoryDetail(id) {
    return request({
        url: `/menus/categories/${id}/`,
        method: 'GET'
    });
}

// 更新分类（完整更新）
export function updateCategory(id, data) {
    return request({
        url: `/menus/categories/${id}/`,
        method: 'PUT',
        data
    });
}

// 更新分类（部分更新）
export function patchCategory(id, data) {
    return request({
        url: `/menus/categories/${id}/`,
        method: 'PATCH',
        data
    });
}

// 删除分类（注意：会删除该分类下的所有商品）
export function deleteCategory(id) {
    return request({
        url: `/menus/categories/${id}/`,
        method: 'DELETE'
    });
}

// ==================== 商品管理 API ====================

// 获取当前用户的所有商品
export function getProducts() {
    return request({
        url: '/menus/products/',
        method: 'GET'
    });
}

// 创建新商品
export function addProduct(data) {
    const isFormData = data instanceof FormData;
    return request({
        url: '/menus/products/',
        method: 'POST',
        data,
        header: isFormData ? {
            'Content-Type': 'multipart/form-data'
        } : undefined
    });
}

// 获取单个商品详情
export function getProductDetail(id) {
    return request({
        url: `/menus/products/${id}/`,
        method: 'GET'
    });
}

// 更新商品（完整更新）
export function updateProduct(id, data) {
    const isFormData = data instanceof FormData;
    return request({
        url: `/menus/products/${id}/`,
        method: 'PUT',
        data,
        header: isFormData ? {
            'Content-Type': 'multipart/form-data'
        } : undefined
    });
}

// 更新商品（部分更新）
export function patchProduct(id, data) {
    return request({
        url: `/menus/products/${id}/`,
        method: 'PATCH',
        data
    });
}

// 删除商品
export function deleteProduct(id) {
    return request({
        url: `/menus/products/${id}/`,
        method: 'DELETE'
    });
}

// ==================== 兼容性和辅助方法 ====================

// 根据分类获取商品（从所有商品中筛选）
export async function getProductsByCategory(categoryId) {
    try {
        const products = await getProducts();
        return products.filter(product => product.category === categoryId);
    } catch (error) {
        console.error('获取分类商品失败:', error);
        throw error;
    }
}

// 获取所有商品（兼容旧版本）
export const getAllProducts = getProducts;