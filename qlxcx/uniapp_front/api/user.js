import request from './request';

// 场景二：老用户使用密码登录
export function login(data) {
    return request({
        url: '/users/login/',
        method: 'POST',
        data
    });
}

// 场景一 & 三：注册或验证码登录
export function verifyAndLogin(data) {
    return request({
        url: '/users/verify-and-login/',
        method: 'POST',
        data
    });
}

// 场景一 & 三：发送验证码
export function sendVerificationCode(data) {
    return request({
        url: '/users/send-code/',
        method: 'POST',
        data
    });
}

// 刷新Token
export function refreshToken(refreshToken) {
    return request({
        url: '/token/refresh/',
        method: 'POST',
        data: { refresh: refreshToken }
    });
}

// 获取当前用户信息
export function getCurrentUser() {
    return request({
        url: '/users/me/',
        method: 'GET'
    });
}

// 发送绑定请求
export function sendBindingRequest(email) {
    return request({
        url: '/users/send-binding-request/',
        method: 'POST',
        data: { email }
    });
}

// 获取待处理的绑定请求
export function getPendingBindings() {
    return request({
        url: '/users/pending-bindings/',
        method: 'GET'
    });
}

// 响应绑定请求
export function respondToBinding(bindingId, action) {
    return request({
        url: `/users/${bindingId}/respond-binding/`,
        method: 'POST',
        data: { action }
    });
}

// 解除绑定
export function unbind(bindingId) {
    return request({
        url: `/users/${bindingId}/unbind/`,
        method: 'POST'
    });
}

// 更新用户个人信息
export function updateUserProfile(data) {
    return request({
        url: '/users/update-profile/',
        method: 'PUT',
        data
    });
}

// 上传用户头像
export function uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        uni.uploadFile({
            url: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/users/upload-avatar/`,
            filePath: filePath,
            name: 'avatar',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (res) => {
                console.log('头像上传响应:', res);
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(res.data);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('响应数据解析失败'));
                    }
                } else {
                    reject(new Error(`上传失败: ${res.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('头像上传失败:', error);
                reject(error);
            }
        });
    });
}