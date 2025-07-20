"use strict";
const api_request = require("./request.js");
function createOrder(data) {
  return api_request.request({
    url: "/orders/demand-orders/",
    method: "POST",
    data
  });
}
function getOrders() {
  return api_request.request({
    url: "/orders/demand-orders/",
    method: "GET"
  });
}
function getOrderDetail(id) {
  return api_request.request({
    url: `/orders/demand-orders/${id}/`,
    method: "GET"
  });
}
function updateOrderStatus(orderId, data) {
  return api_request.request({
    url: `/orders/demand-orders/${orderId}/update_status/`,
    method: "PATCH",
    data
  });
}
function updateOrderItem(itemId, data) {
  return api_request.request({
    url: `/orders/demand-order-items/${itemId}/`,
    method: "PATCH",
    data
  });
}
exports.createOrder = createOrder;
exports.getOrderDetail = getOrderDetail;
exports.getOrders = getOrders;
exports.updateOrderItem = updateOrderItem;
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
