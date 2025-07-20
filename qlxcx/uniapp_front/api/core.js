import request from './request';

// 菜单分类相关接口
export const categoryApi = {
    // 获取分类列表
    getList() {
        return request({
            url: '/core/categories/',
            method: 'GET'
        });
    },
    // 创建分类
    create(data) {
        return request({
            url: '/core/categories/',
            method: 'POST',
            data
        });
    }
};

// 商品相关接口
export const productApi = {
    // 获取商品列表
    getList() {
        return request({
            url: '/core/products/',
            method: 'GET'
        });
    },
    // 创建商品
    create(data) {
        return request({
            url: '/core/products/',
            method: 'POST',
            data
        });
    }
};

// 订单相关接口
export const orderApi = {
    // 创建订单
    create(data) {
        return request({
            url: '/core/demand-orders/',
            method: 'POST',
            data
        });
    },
    // 获取订单列表
    getList() {
        return request({
            url: '/core/demand-orders/',
            method: 'GET'
        });
    },
    // 获取订单详情
    getDetail(orderId) {
        return request({
            url: `/core/demand-orders/${orderId}/`,
            method: 'GET'
        });
    },
    // 更新订单状态
    updateStatus(orderId, data) {
        return request({
            url: `/core/demand-orders/${orderId}/`,
            method: 'PATCH',
            data
        });
    },
    // 更新订单项
    updateOrderItem(itemId, data) {
        return request({
            url: `/core/demand-order-items/${itemId}/`,
            method: 'PATCH',
            data
        });
    }
};

// 评价相关接口
export const reviewApi = {
    // 创建评价
    create(orderId, data) {
        return request({
            url: `/core/demand-orders/${orderId}/reviews/`,
            method: 'POST',
            data
        });
    },
    // 获取评价
    get(orderId) {
        return request({
            url: `/core/demand-orders/${orderId}/reviews/`,
            method: 'GET'
        });
    }
};

// 主题相关接口
export const themeApi = {
    // 获取主题设置
    get() {
        return request({
            url: '/core/theme/',
            method: 'GET'
        });
    },
    // 更新主题设置
    update(data) {
        return request({
            url: '/core/theme/',
            method: 'PATCH',
            data
        });
    }
};