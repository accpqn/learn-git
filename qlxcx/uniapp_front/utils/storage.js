/**
 * 本地存储工具类
 * 提供统一的数据持久化接口
 */

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
            uni.setStorageSync(key, data);
            return true;
        } catch (error) {
            console.error(`Storage set error for key ${key}:`, error);
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
            const data = uni.getStorageSync(key);
            if (data) {
                return JSON.parse(data);
            }
            return defaultValue;
        } catch (error) {
            console.error(`Storage get error for key ${key}:`, error);
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
            uni.removeStorageSync(key);
            return true;
        } catch (error) {
            console.error(`Storage remove error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * 清空所有存储数据
     * @returns {boolean} 是否成功
     */
    static clear() {
        try {
            uni.clearStorageSync();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * 获取存储信息
     * @returns {object} 存储信息
     */
    static getInfo() {
        try {
            return uni.getStorageInfoSync();
        } catch (error) {
            console.error('Storage getInfo error:', error);
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
            console.error(`Storage has error for key ${key}:`, error);
            return false;
        }
    }
}

// 预定义的存储键
export const STORAGE_KEYS = {
    USER_INFO: 'userInfo',
    COUPLE_INFO: 'coupleInfo',
    CART_ITEMS: 'cartItems',
    SENT_ORDERS: 'sentOrders',
    RECEIVED_ORDERS: 'receivedOrders',
    APP_SETTINGS: 'appSettings',
    THEME_CONFIG: 'themeConfig',
    MENU_DATA: 'menuData'
};

// 应用设置管理
export class AppSettings {
    static get() {
        return Storage.get(STORAGE_KEYS.APP_SETTINGS, {
            theme: 'default',
            language: 'zh-CN',
            notifications: true,
            soundEnabled: true,
            vibrationEnabled: true,
            autoSave: true
        });
    }

    static set(settings) {
        const currentSettings = this.get();
        const newSettings = { ...currentSettings, ...settings };
        return Storage.set(STORAGE_KEYS.APP_SETTINGS, newSettings);
    }

    static reset() {
        return Storage.remove(STORAGE_KEYS.APP_SETTINGS);
    }
}

// 用户数据管理
export class UserData {
    static get() {
        return Storage.get(STORAGE_KEYS.USER_INFO, {
            id: null,
            username: '用户',
            avatar: '/static/images/default-avatar.png',
            phone: '',
            email: '',
            createTime: new Date().toISOString()
        });
    }

    static set(userInfo) {
        return Storage.set(STORAGE_KEYS.USER_INFO, userInfo);
    }

    static clear() {
        return Storage.remove(STORAGE_KEYS.USER_INFO);
    }
}

// 情侣数据管理
export class CoupleData {
    static get() {
        return Storage.get(STORAGE_KEYS.COUPLE_INFO, {
            partnerId: null,
            partnerName: null,
            partnerAvatar: null,
            bindTime: null,
            anniversary: null
        });
    }

    static set(coupleInfo) {
        return Storage.set(STORAGE_KEYS.COUPLE_INFO, coupleInfo);
    }

    static clear() {
        return Storage.remove(STORAGE_KEYS.COUPLE_INFO);
    }
}

// 主题配置管理
export class ThemeConfig {
    static get() {
        return Storage.get(STORAGE_KEYS.THEME_CONFIG, {
            primaryColor: '#FF69B4',
            secondaryColor: '#FF1493',
            backgroundColor: '#f8f9fa',
            cardColor: '#ffffff',
            textColor: '#303133',
            borderRadius: '20rpx',
            fontFamily: 'default'
        });
    }

    static set(themeConfig) {
        return Storage.set(STORAGE_KEYS.THEME_CONFIG, themeConfig);
    }

    static reset() {
        return Storage.remove(STORAGE_KEYS.THEME_CONFIG);
    }
}

export default Storage;
