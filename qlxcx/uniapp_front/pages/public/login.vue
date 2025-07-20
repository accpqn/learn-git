<template>
	<view class="login-container">
		<!-- 顶部装饰 -->
		<view class="header-decoration">
			<view class="decoration-circle circle-1"></view>
			<view class="decoration-circle circle-2"></view>
			<view class="decoration-circle circle-3"></view>
		</view>

		<!-- 应用介绍 -->
		<view class="app-intro-section">
			<view class="app-logo">💕</view>
			<view class="app-title">情侣点餐</view>
			<view class="app-subtitle">为爱而生，为你点餐</view>
		</view>

		<view class="login-section">
			<!-- 登录卡片 -->
			<view class="login-card">
				<!-- 模式切换 -->
				<view class="login-mode-switcher">
					<view
						:class="['mode-item', { active: loginMode === 'password' }]"
						@click="switchLoginMode('password')"
					>
						<text class="mode-icon">🔐</text>
						<text class="mode-text">密码登录</text>
					</view>
					<view
						:class="['mode-item', { active: loginMode === 'code' }]"
						@click="switchLoginMode('code')"
					>
						<text class="mode-icon">📧</text>
						<text class="mode-text">验证码登录</text>
					</view>
				</view>

				<!-- 登录表单 -->
				<view class="login-form">
					<!-- 邮箱输入 -->
					<view class="input-group">
						<view class="input-icon">📧</view>
						<input
							class="input"
							type="text"
							v-model="form.email"
							placeholder="请输入邮箱地址"
							placeholder-class="placeholder"
						/>
					</view>

					<!-- 密码登录表单 -->
					<view v-if="loginMode === 'password'" class="input-group">
						<view class="input-icon">🔒</view>
						<input
							class="input"
							type="password"
							v-model="form.password"
							placeholder="请输入密码"
							placeholder-class="placeholder"
						/>
					</view>

					<!-- 验证码登录表单 -->
					<view v-if="loginMode === 'code'" class="input-group code-group">
						<view class="input-icon">🔢</view>
						<input
							class="input code-input"
							type="text"
							v-model="form.code"
							placeholder="请输入6位验证码"
							placeholder-class="placeholder"
							maxlength="6"
						/>
						<button
							class="code-btn"
							:class="{ disabled: !isEmailValid || countdown > 0 }"
							:disabled="!isEmailValid || countdown > 0"
							@click="handleSendCode"
						>
							{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
						</button>
					</view>
				</view>

				<!-- 登录按钮 -->
				<button
					class="login-btn"
					:class="{ disabled: !isFormValid }"
					:disabled="!isFormValid"
					@click="handleLogin"
				>
					<text class="btn-text">{{ loginMode === 'password' ? '立即登录' : '验证登录' }}</text>
				</button>

				<!-- 注册链接 -->
				<view class="register-link">
					<text class="register-text">还没有账号？</text>
					<navigator :url="registerUrl" class="register-btn">立即注册</navigator>
				</view>
			</view>
		</view>

		<!-- 底部装饰 -->
		<view class="footer-decoration">
			<view class="heart-icon">💖</view>
		</view>
	</view>
</template>

<script>
import { APP_CONFIG } from '@/utils/config';
import AppIntro from '@/components/public/AppIntro.vue';
import AgreementLinks from '@/components/public/AgreementLinks.vue';
import { useUserStore } from '@/store/user';
import { useCoupleStore } from '@/store/couple';

export default {
	components: {
		AppIntro,
		AgreementLinks
	},
	
	setup() {
		const userStore = useUserStore();
		const coupleStore = useCoupleStore();
		return {
			userStore,
			coupleStore
		}
	},
	
	data() {
		return {
			loginMode: 'password', // 'password' 或 'code'
			form: {
				email: '',
				password: '',
				code: ''
			},
			countdown: 0,
			registerUrl: APP_CONFIG.pages.register
		}
	},
	
	computed: {
		isEmailValid() {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(this.form.email);
		},
		isFormValid() {
			if (this.loginMode === 'password') {
				return this.form.email && this.form.password;
			} else {
				return this.form.email && this.form.code;
			}
		}
	},
	
	methods: {
		// 切换登录模式
		switchLoginMode(mode) {
			this.loginMode = mode;
			// 清空表单
			this.form.password = '';
			this.form.code = '';
		},

		async handleLogin() {
			if (!this.isFormValid) return;

			// 显示加载提示
			uni.showLoading({
				title: '登录中...',
				mask: true
			});

			try {
				let success = false;
				if (this.loginMode === 'password') {
					// 密码登录
					success = await this.userStore.login({
						email: this.form.email,
						password: this.form.password
					});
				} else {
					// 验证码登录
					success = await this.userStore.loginWithCode({
						email: this.form.email,
						code: this.form.code
					});
				}

				if (!success) {
					throw new Error('登录失败');
				}

				console.log('Login success - userStore state:', {
					isLoggedIn: this.userStore.isLoggedIn,
					userInfo: this.userStore.userInfo,
					token: this.userStore.token
				});

				uni.hideLoading();

				// 显示成功提示
				uni.showToast({
					title: '登录成功！',
					icon: 'success',
					duration: 1500
				});

				// 延迟跳转，让用户看到成功提示
				setTimeout(() => {
					// 跳转到首页
					uni.switchTab({
						url: '/pages/home/index'
					});
				}, 1500);

			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: error.message || '登录失败，请检查账号密码',
					icon: 'none',
					duration: 2000
				});
			}
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
		}
	}
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 50%, #FFC0CB 100%);
	position: relative;
	overflow: hidden;
}

/* 顶部装饰 */
.header-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 300rpx;
	overflow: hidden;

	.decoration-circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);

		&.circle-1 {
			width: 200rpx;
			height: 200rpx;
			top: -100rpx;
			right: -50rpx;
			animation: float 6s ease-in-out infinite;
		}

		&.circle-2 {
			width: 150rpx;
			height: 150rpx;
			top: 50rpx;
			left: -75rpx;
			animation: float 8s ease-in-out infinite reverse;
		}

		&.circle-3 {
			width: 100rpx;
			height: 100rpx;
			top: 150rpx;
			right: 100rpx;
			animation: float 10s ease-in-out infinite;
		}
	}
}

/* 应用介绍区域 */
.app-intro-section {
	text-align: center;
	padding: 120rpx 40rpx 60rpx;
	color: white;

	.app-logo {
		font-size: 120rpx;
		margin-bottom: 20rpx;
		animation: heartbeat 2s ease-in-out infinite;
	}

	.app-title {
		font-size: 48rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.app-subtitle {
		font-size: 28rpx;
		opacity: 0.9;
		font-weight: 300;
	}
}

/* 登录区域 */
.login-section {
	flex: 1;
	padding: 0 40rpx 40rpx;
}

.login-card {
	background: white;
	border-radius: 40rpx;
	padding: 60rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
	animation: slideUp 0.6s ease-out;
}

/* 模式切换器 */
.login-mode-switcher {
	display: flex;
	background: #F8F9FA;
	border-radius: 50rpx;
	padding: 8rpx;
	margin-bottom: 60rpx;

	.mode-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
		border-radius: 42rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;

		.mode-icon {
			font-size: 32rpx;
			margin-bottom: 8rpx;
		}

		.mode-text {
			font-size: 24rpx;
			color: #666;
			font-weight: 500;
		}

		&.active {
			background: linear-gradient(135deg, #FF69B4, #FF1493);
			box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.3);
			transform: translateY(-2rpx);

			.mode-text {
				color: white;
			}
		}
	}
}

/* 表单区域 */
.login-form {
	margin-bottom: 60rpx;
}

.input-group {
	position: relative;
	margin-bottom: 40rpx;

	.input-icon {
		position: absolute;
		left: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 32rpx;
		z-index: 2;
	}

	.input {
		width: 100%;
		height: 100rpx;
		background: #F8F9FA;
		border: 2rpx solid transparent;
		border-radius: 50rpx;
		padding: 0 40rpx 0 80rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
		transition: all 0.3s ease;

		&:focus {
			background: white;
			border-color: #FF69B4;
			box-shadow: 0 0 0 6rpx rgba(255, 105, 180, 0.1);
		}
	}

	&.code-group {
		.code-input {
			padding-right: 200rpx;
		}

		.code-btn {
			position: absolute;
			right: 10rpx;
			top: 10rpx;
			height: 80rpx;
			padding: 0 30rpx;
			background: linear-gradient(135deg, #FF69B4, #FF1493);
			color: white;
			border: none;
			border-radius: 40rpx;
			font-size: 24rpx;
			font-weight: 500;
			transition: all 0.3s ease;

			&:not(.disabled):active {
				transform: scale(0.95);
			}

			&.disabled {
				background: #E9ECEF;
				color: #ADB5BD;
			}
		}
	}
}

.placeholder {
	color: #ADB5BD;
}

/* 登录按钮 */
.login-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, #FF69B4, #FF1493);
	border: none;
	border-radius: 50rpx;
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.4);
	transition: all 0.3s ease;
	margin-bottom: 40rpx;

	.btn-text {
		display: block;
	}

	&:not(.disabled):active {
		transform: translateY(2rpx);
		box-shadow: 0 5rpx 15rpx rgba(255, 105, 180, 0.4);
	}

	&.disabled {
		opacity: 0.6;
		box-shadow: 0 5rpx 15rpx rgba(255, 105, 180, 0.2);
	}

	&::after {
		border: none;
	}
}

/* 注册链接 */
.register-link {
	text-align: center;

	.register-text {
		font-size: 28rpx;
		color: #666;
	}

	.register-btn {
		color: #FF69B4;
		font-size: 28rpx;
		font-weight: 500;
		margin-left: 10rpx;
		text-decoration: none;

		&:active {
			opacity: 0.7;
		}
	}
}

/* 底部装饰 */
.footer-decoration {
	text-align: center;
	padding: 40rpx;

	.heart-icon {
		font-size: 40rpx;
		animation: heartbeat 2s ease-in-out infinite;
		opacity: 0.8;
	}
}

/* 动画效果 */
@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

@keyframes heartbeat {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(60rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
