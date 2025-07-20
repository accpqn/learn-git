import request from './request';

// 创建订单（点餐）
export function createOrder(data) {
    return request({
        url: '/orders/demand-orders/',
        method: 'POST',
        data
    });
}

// 获取订单列表（包含发出和收到的）
export function getOrders() {
    return request({
        url: '/orders/demand-orders/',
        method: 'GET'
    });
}

// 获取我发出的订单列表
export function getSentOrders() {
    return request({
        url: '/orders/demand-orders/sent/',
        method: 'GET'
    });
}

// 获取我收到的订单列表
export function getReceivedOrders() {
    return request({
        url: '/orders/demand-orders/received/',
        method: 'GET'
    });
}

// 获取订单详情
export function getOrderDetail(id) {
    return request({
        url: `/orders/demand-orders/${id}/`,
        method: 'GET'
    });
}

// 更新订单状态
export function updateOrderStatus(orderId, data) {
    return request({
        url: `/orders/demand-orders/${orderId}/update_status/`,
        method: 'PATCH',
        data
    });
}

// 更新订单条目（评价或记账）
export function updateOrderItem(itemId, data) {
    return request({
        url: `/orders/demand-order-items/${itemId}/`,
        method: 'PATCH',
        data
    });
}

// 添加订单评价
export function addOrderReview(orderId, data) {
    return request({
        url: `/orders/demand-orders/${orderId}/add_review/`,
        method: 'POST',
        data
    });
}

// 订单状态常量
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    ORDERED: 'ORDERED',
    COMPLETED: 'COMPLETED',
    RATED: 'RATED',
    CANCELLED: 'CANCELLED'
};

export const ORDER_STATUS_TEXT = {
    [ORDER_STATUS.PENDING]: '待处理',
    [ORDER_STATUS.CONFIRMED]: '已确认',
    [ORDER_STATUS.ORDERED]: '已下单',
    [ORDER_STATUS.COMPLETED]: '已完成',
    [ORDER_STATUS.RATED]: '已评价',
    [ORDER_STATUS.CANCELLED]: '已取消'
};

// 获取订单状态文本
export function getOrderStatusText(status) {
    return ORDER_STATUS_TEXT[status] || '未知状态';
}

// 判断订单是否可以取消
export function canCancelOrder(status) {
    return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
}

// 判断订单是否可以评价
export function canReviewOrder(status) {
    return status === ORDER_STATUS.COMPLETED;
}