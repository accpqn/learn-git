"use strict";
const common_vendor = require("../common/vendor.js");
class Storage {
  /**
   * 设置存储数据
   * @param {string} key 存储键
   * @param {any} value 存储值
   * @returns {boolean} 是否成功
   */
  static set(key, value) {
    try {
      const data = JSON.stringify(value);
      common_vendor.index.setStorageSync(key, data);
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:19", `Storage set error for key ${key}:`, error);
      return false;
    }
  }
  /**
   * 获取存储数据
   * @param {string} key 存储键
   * @param {any} defaultValue 默认值
   * @returns {any} 存储的数据或默认值
   */
  static get(key, defaultValue = null) {
    try {
      const data = common_vendor.index.getStorageSync(key);
      if (data) {
        return JSON.parse(data);
      }
      return defaultValue;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:38", `Storage get error for key ${key}:`, error);
      return defaultValue;
    }
  }
  /**
   * 删除存储数据
   * @param {string} key 存储键
   * @returns {boolean} 是否成功
   */
  static remove(key) {
    try {
      common_vendor.index.removeStorageSync(key);
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:53", `Storage remove error for key ${key}:`, error);
      return false;
    }
  }
  /**
   * 清空所有存储数据
   * @returns {boolean} 是否成功
   */
  static clear() {
    try {
      common_vendor.index.clearStorageSync();
      return true;
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:67", "Storage clear error:", error);
      return false;
    }
  }
  /**
   * 获取存储信息
   * @returns {object} 存储信息
   */
  static getInfo() {
    try {
      return common_vendor.index.getStorageInfoSync();
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:80", "Storage getInfo error:", error);
      return { keys: [], currentSize: 0, limitSize: 0 };
    }
  }
  /**
   * 检查键是否存在
   * @param {string} key 存储键
   * @returns {boolean} 是否存在
   */
  static has(key) {
    try {
      const info = this.getInfo();
      return info.keys.includes(key);
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/storage.js:95", `Storage has error for key ${key}:`, error);
      return false;
    }
  }
}
const STORAGE_KEYS = {
  USER_INFO: "userInfo",
  COUPLE_INFO: "coupleInfo",
  CART_ITEMS: "cartItems",
  SENT_ORDERS: "sentOrders",
  RECEIVED_ORDERS: "receivedOrders",
  APP_SETTINGS: "appSettings",
  THEME_CONFIG: "themeConfig",
  MENU_DATA: "menuData"
};
exports.STORAGE_KEYS = STORAGE_KEYS;
exports.Storage = Storage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
