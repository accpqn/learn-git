"use strict";
const common_vendor = require("../common/vendor.js");
const api_request = require("./request.js");
const config_index = require("../config/index.js");
function login(data) {
  return api_request.request({
    url: "/users/login/",
    method: "POST",
    data
  });
}
function verifyAndLogin(data) {
  return api_request.request({
    url: "/users/verify-and-login/",
    method: "POST",
    data
  });
}
function sendVerificationCode(data) {
  return api_request.request({
    url: "/users/send-code/",
    method: "POST",
    data
  });
}
function refreshToken(refreshToken2) {
  return api_request.request({
    url: "/token/refresh/",
    method: "POST",
    data: { refresh: refreshToken2 }
  });
}
function getCurrentUser() {
  return api_request.request({
    url: "/users/me/",
    method: "GET"
  });
}
function sendBindingRequest(email, message = "") {
  return api_request.request({
    url: "/users/send-binding-request/",
    method: "POST",
    data: { email, message }
  });
}
function getPendingBindings() {
  return api_request.request({
    url: "/users/pending-bindings/",
    method: "GET"
  });
}
function respondToBinding(bindingId, action) {
  return api_request.request({
    url: `/users/${bindingId}/respond-binding/`,
    method: "POST",
    data: { action }
  });
}
function unbind(bindingId) {
  return api_request.request({
    url: `/users/${bindingId}/unbind/`,
    method: "POST"
  });
}
function getBindingInfo() {
  return api_request.request({
    url: "/users/binding-info/",
    method: "GET"
  });
}
function getBindingHistory() {
  return api_request.request({
    url: "/users/binding-history/",
    method: "GET"
  });
}
function cancelBindingRequest() {
  return api_request.request({
    url: "/users/cancel-binding-request/",
    method: "POST"
  });
}
function updateUserProfile(data) {
  return api_request.request({
    url: "/users/update-profile/",
    method: "PUT",
    data
  });
}
function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.uploadFile({
      url: config_index.getApiUrl("/users/upload-avatar/"),
      filePath,
      name: "avatar",
      header: {
        "Authorization": `Bearer ${token}`
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at api/user.js:129", "头像上传响应:", res);
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            reject(new Error("响应数据解析失败"));
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`));
        }
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at api/user.js:142", "头像上传失败:", error);
        reject(error);
      }
    });
  });
}
exports.cancelBindingRequest = cancelBindingRequest;
exports.getBindingHistory = getBindingHistory;
exports.getBindingInfo = getBindingInfo;
exports.getCurrentUser = getCurrentUser;
exports.getPendingBindings = getPendingBindings;
exports.login = login;
exports.refreshToken = refreshToken;
exports.respondToBinding = respondToBinding;
exports.sendBindingRequest = sendBindingRequest;
exports.sendVerificationCode = sendVerificationCode;
exports.unbind = unbind;
exports.updateUserProfile = updateUserProfile;
exports.uploadAvatar = uploadAvatar;
exports.verifyAndLogin = verifyAndLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
