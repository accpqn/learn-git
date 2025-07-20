"use strict";
require("../common/vendor.js");
const api_request = require("./request.js");
function getCategories() {
  return api_request.request({
    url: "/menus/categories/",
    method: "GET"
  });
}
function addCategory(data) {
  return api_request.request({
    url: "/menus/categories/",
    method: "POST",
    data
  });
}
function updateCategory(id, data) {
  return api_request.request({
    url: `/menus/categories/${id}/`,
    method: "PUT",
    data
  });
}
function deleteCategory(id) {
  return api_request.request({
    url: `/menus/categories/${id}/`,
    method: "DELETE"
  });
}
function getProducts() {
  return api_request.request({
    url: "/menus/products/",
    method: "GET"
  });
}
function addProduct(data) {
  const isFormData = data instanceof FormData;
  return api_request.request({
    url: "/menus/products/",
    method: "POST",
    data,
    header: isFormData ? {
      "Content-Type": "multipart/form-data"
    } : void 0
  });
}
function updateProduct(id, data) {
  const isFormData = data instanceof FormData;
  return api_request.request({
    url: `/menus/products/${id}/`,
    method: "PUT",
    data,
    header: isFormData ? {
      "Content-Type": "multipart/form-data"
    } : void 0
  });
}
function deleteProduct(id) {
  return api_request.request({
    url: `/menus/products/${id}/`,
    method: "DELETE"
  });
}
exports.addCategory = addCategory;
exports.addProduct = addProduct;
exports.deleteCategory = deleteCategory;
exports.deleteProduct = deleteProduct;
exports.getCategories = getCategories;
exports.getProducts = getProducts;
exports.updateCategory = updateCategory;
exports.updateProduct = updateProduct;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/menu.js.map
