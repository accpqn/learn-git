<template>
    <view class="register-container">
        <view class="header">
            <text class="title">注册账号</text>
            <text class="subtitle">创建您的专属账号</text>
        </view>
        
        <view class="form-section">
            <view class="input-group">
                <input 
                    class="input" 
                    type="text" 
                    v-model="form.email" 
                    placeholder="请输入邮箱"
                    placeholder-class="placeholder"
                />
            </view>
            <view class="input-group code-group">
                <input 
                    class="input code-input" 
                    type="text" 
                    v-model="form.code" 
                    placeholder="请输入验证码"
                    placeholder-class="placeholder"
                    maxlength="6"
                />
                <button 
                    class="code-btn" 
                    :disabled="!isEmailValid || countdown > 0"
                    @click="handleSendCode"
                >
                    {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </button>
            </view>
            <view class="input-group">
                <input 
                    class="input" 
                    type="password" 
                    v-model="form.password" 
                    placeholder="请输入密码"
                    placeholder-class="placeholder"
                />
            </view>
            <view class="input-group">
                <input 
                    class="input" 
                    type="password" 
                    v-model="form.confirmPassword" 
                    placeholder="请确认密码"
                    placeholder-class="placeholder"
                />
            </view>
            
            <button 
                class="register-btn" 
                type="primary" 
                @click="handleRegister" 
                :disabled="!isFormValid || isRegistering"
            >
                {{ isRegistering ? '注册中...' : '注册' }}
            </button>
            
            <view class="login-link">
                <text>已有账号？</text>
                <navigator :url="loginUrl" class="link" open-type="redirect">返回登录</navigator>
            </view>
        </view>
        
        <agreement-links></agreement-links>
    </view>
</template>

<script>
import { APP_CONFIG } from '@/utils/config';
import AgreementLinks from '@/components/public/AgreementLinks.vue';
import { useUserStore } from '@/store/user';

export default {
    components: {
        AgreementLinks
    },
    
    setup() {
        const userStore = useUserStore();
        return {
            userStore
        }
    },
    
    data() {
        return {
            form: {
                email: '',
                password: '',
                confirmPassword: '',
                code: ''
            },
            countdown: 0,
            loginUrl: APP_CONFIG.pages.login
        }
    },
    
    computed: {
        isFormValid() {
            return (
                this.form.email && 
                this.form.password && 
                this.form.confirmPassword &&
                this.form.code &&
                this.form.password === this.form.confirmPassword
            );
        },
        
        isEmailValid() {
            return this.validateEmail(this.form.email);
        },
        
        isRegistering() {
            return this.userStore.registerStatus === 'pending';
        }
    },
    
    methods: {
        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        async handleSendCode() {
            if (!this.isEmailValid) {
                uni.showToast({
                    title: '请输入有效的邮箱地址',
                    icon: 'none'
                });
                return;
            }
            
            try {
                await this.userStore.sendVerificationCode(this.form.email);
                
                this.countdown = 60;
                const timer = setInterval(() => {
                    this.countdown--;
                    if (this.countdown <= 0) {
                        clearInterval(timer);
                    }
                }, 1000);
                
                uni.showToast({
                    title: '验证码已发送',
                    icon: 'success'
                });
            } catch (error) {
                uni.showToast({
                    title: error.message || '发送验证码失败',
                    icon: 'none'
                });
            }
        },
        
        async handleRegister() {
            if (!this.isFormValid) return;
            
            if (!this.isEmailValid) {
                uni.showToast({
                    title: '请输入有效的邮箱地址',
                    icon: 'none'
                });
                return;
            }
            
            try {
                const success = await this.userStore.register({
                    email: this.form.email,
                    password: this.form.password,
                    code: this.form.code
                });
                
                if (success) {
                    uni.showToast({
                        title: '注册成功',
                        icon: 'success'
                    });
                    
                    setTimeout(() => {
                        uni.reLaunch({
                            url: APP_CONFIG.pages.binding
                        });
                    }, 1500);
                }
            } catch (error) {
                uni.showToast({
                    title: error.message || '注册失败',
                    icon: 'none'
                });
            }
        }
    }
}
</script>

<style>
.register-container {
    min-height: 100vh;
    background-color: #FFF;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.header {
    padding: 80rpx 40rpx;
    text-align: center;
}

.title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
}

.subtitle {
    font-size: 28rpx;
    color: #999;
    display: block;
}

.form-section {
    padding: 40rpx;
}

.input-group {
    margin-bottom: 30rpx;
}

.input {
    width: 100%;
    height: 90rpx;
    background: #F8F8F8;
    border-radius: 45rpx;
    padding: 0 40rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

.placeholder {
    color: #999;
}

.register-btn {
    background: linear-gradient(to right, #FF69B4, #FFC0CB);
    border-radius: 45rpx;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 32rpx;
    color: #FFF;
    margin-top: 60rpx;
}

.register-btn[disabled] {
    opacity: 0.6;
    background: linear-gradient(to right, #FF69B4, #FFC0CB);
}

.register-btn::after {
    border: none;
}

.login-link {
    text-align: center;
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #999;
}

.login-link .link {
    color: #FF69B4;
    display: inline;
    margin-left: 10rpx;
}

.code-group {
    position: relative;
    display: flex;
    align-items: center;
}

.code-input {
    padding-right: 200rpx;
}

.code-btn {
    position: absolute;
    right: 20rpx;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 30rpx;
    font-size: 24rpx;
    color: #FF69B4;
    background: none;
    border: 2rpx solid #FF69B4;
    border-radius: 30rpx;
}

.code-btn[disabled] {
    color: #999;
    border-color: #999;
    background: none;
}

.code-btn::after {
    border: none;
}
</style>