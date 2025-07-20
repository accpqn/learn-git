<template>
	<view class="container">
		<!-- 未登录状态 -->
		<view v-if="!isLoggedIn" class="login-prompt">
			<view class="login-card">
				<view class="login-icon">👤</view>
				<view class="login-title">欢迎使用情侣点餐</view>
				<view class="login-subtitle">登录后享受完整功能</view>
				<button class="login-btn" :style="getButtonStyle('primary')" @click="goToLogin">
					<text class="btn-text">立即登录</text>
				</button>
				<view class="features-preview">
					<view class="feature-item">
						<text class="feature-icon">💕</text>
						<text class="feature-text">情侣绑定</text>
					</view>
					<view class="feature-item">
						<text class="feature-icon">🍽️</text>
						<text class="feature-text">为TA点餐</text>
					</view>
					<view class="feature-item">
						<text class="feature-icon">📝</text>
						<text class="feature-text">订单管理</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 已登录状态 -->
		<view v-else>
			<!-- 头部用户信息 -->
			<view class="profile-header" :style="getHeaderStyle()">
				<view class="user-info">
					<view class="avatar-container" @click="changeAvatar">
						<image
							class="user-avatar"
							:src="getUserAvatarUrl()"
							mode="aspectFill"
						></image>
						<view class="avatar-edit-hint">
							<text class="edit-icon">📷</text>
						</view>
					</view>
					<view class="user-details">
						<text class="username">{{ userInfo.username || '用户' }}</text>
						<text class="user-email">{{ userInfo.email }}</text>
					</view>
				</view>
				<view class="couple-status">
					<view v-if="bindingInfo && bindingInfo.status === 'active'" class="coupled">
						<text class="heart-icon">💕</text>
						<text class="status-text">已与{{ partnerName }}绑定</text>
					</view>
					<view v-else class="single">
						<text class="heart-icon">💔</text>
						<text class="status-text">等待绑定</text>
					</view>
				</view>
			</view>

			<!-- 统计信息 -->
			<view class="stats-section">
				<view class="stat-item">
					<text class="stat-number">{{ orderStats.sent }}</text>
					<text class="stat-label">发出订单</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ orderStats.received }}</text>
					<text class="stat-label">收到订单</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{ orderStats.total }}</text>
					<text class="stat-label">总订单数</text>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-group">
					<text class="group-title">账户管理</text>
					<view class="menu-item" @click="editProfile">
						<text class="menu-icon">👤</text>
						<text class="menu-text">个人信息</text>
						<text class="arrow-icon">›</text>
					</view>
					<view class="menu-item" @click="handleCoupleAction">
						<text class="menu-icon">💕</text>
						<text class="menu-text">{{ bindingInfo && bindingInfo.status === 'active' ? '情侣管理' : '绑定情侣' }}</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>

				<view class="menu-group">
					<text class="group-title">应用设置</text>
					<view class="menu-item" @click="navigateToConfig">
						<text class="menu-icon">⚙️</text>
						<text class="menu-text">全局配置</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>

				<view class="menu-group">
					<text class="group-title">其他</text>
					<view class="menu-item" @click="showAbout">
						<text class="menu-icon">ℹ️</text>
						<text class="menu-text">关于我们</text>
						<text class="arrow-icon">›</text>
					</view>
					<view class="menu-item" @click="clearData">
						<text class="menu-icon">🗑️</text>
						<text class="menu-text">清除数据</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>
			</view>

			<view class="logout-section">
				<button class="logout-btn" :style="getButtonStyle('outline')" @click="handleLogout">
					<text class="logout-text">退出登录</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { useOrderStore } from '@/store/order';
import { useUserStore } from '@/store/user';
import { useCoupleStore } from '@/store/couple';
import { useTheme } from '@/mixins/theme';
import { onShow } from '@dcloudio/uni-app';
import { computed, watch, onMounted } from 'vue';

export default {
	setup() {
		const orderStore = useOrderStore();
		const userStore = useUserStore();
		const coupleStore = useCoupleStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();

		// 计算属性
		const isLoggedIn = computed(() => userStore.isLoggedIn);
		const userInfo = computed(() => userStore.userInfo);
		const bindingInfo = computed(() => coupleStore.bindingInfo);

		const partnerName = computed(() => {
			if (!bindingInfo.value || bindingInfo.value.status !== 'active') return '';
			const currentUserId = userInfo.value?.id;
			if (!currentUserId) return '';

			if (bindingInfo.value.requester.id === currentUserId) {
				return bindingInfo.value.receiver.username;
			} else {
				return bindingInfo.value.requester.username;
			}
		});

		// 订单统计
		const orderStats = computed(() => {
			return {
				sent: orderStore.sentOrders.length,
				received: orderStore.receivedOrders.length,
				total: orderStore.sentOrders.length + orderStore.receivedOrders.length
			};
		});

		onMounted(() => {
			console.log('User page onMounted - isLoggedIn:', userStore.isLoggedIn);
		});

		onShow(() => {
			console.log('User page onShow - isLoggedIn:', userStore.isLoggedIn);
			console.log('User page onShow - userInfo:', userStore.userInfo);
			console.log('User page onShow - token:', userStore.token);

			// 如果已登录但没有完整用户信息，才刷新
			if (userStore.isLoggedIn && (!userStore.userInfo || !userStore.userInfo.id)) {
				console.log('Refreshing user info on page show');
				userStore.fetchCurrentUser();
			}
			// 初始化订单数据以获取统计信息
			orderStore.initOrders();
		});

		// 监听登录状态变化
		watch(() => userStore.isLoggedIn, (newVal, oldVal) => {
			console.log('Login status changed:', oldVal, '->', newVal);
		}, { immediate: true });

		// 跳转到登录页面
		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		};

		// 获取用户头像URL
		const getUserAvatarUrl = () => {
			if (userInfo.value?.avatar_url) {
				// 如果是完整URL，直接返回
				if (userInfo.value.avatar_url.startsWith('http')) {
					return userInfo.value.avatar_url;
				}
				// 如果是相对路径，拼接基础URL
				return `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${userInfo.value.avatar_url}`;
			}
			// 默认头像
			return '/static/images/default-avatar.png';
		};

		// 更换头像
		const changeAvatar = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const tempFilePath = res.tempFilePaths[0];
					console.log('选择的头像文件:', tempFilePath);

					// 显示上传中提示
					uni.showLoading({
						title: '上传中...'
					});

					try {
						// 调用头像上传API
						const { uploadAvatar } = await import('@/api/user');
						const result = await uploadAvatar(tempFilePath);

						console.log('头像上传成功:', result);

						// 更新本地用户信息
						if (result.user) {
							userStore.userInfo = result.user;
							userStore.saveUserToLocal();
						}

						uni.hideLoading();
						uni.showToast({
							title: '头像更新成功',
							icon: 'success'
						});

					} catch (error) {
						console.error('头像上传失败:', error);
						uni.hideLoading();
						uni.showToast({
							title: '头像上传失败: ' + (error.message || '网络错误'),
							icon: 'none'
						});
					}
				},
				fail: (error) => {
					console.error('选择图片失败:', error);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		};

		// 编辑个人信息 - 跳转到专门的页面
		const editProfile = () => {
			uni.navigateTo({
				url: '/pages/user/profile'
			});
		};

		const handleCoupleAction = () => {
			if (bindingInfo.value && bindingInfo.value.status === 'active') {
				uni.showModal({
					title: '情侣管理',
					content: `您已与${partnerName.value}绑定，是否要解除绑定？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const success = await coupleStore.unbind();
								if (success) {
									uni.showToast({
										title: '已解除绑定',
										icon: 'success'
									});
								}
							} catch (error) {
								uni.showToast({
									title: '解绑失败',
									icon: 'none'
								});
							}
						}
					}
				});
			} else {
				uni.showModal({
					title: '绑定情侣',
					content: '请输入对方的邮箱地址',
					editable: true,
					placeholderText: '输入对方邮箱',
					success: async (res) => {
						if (res.confirm && res.content) {
							try {
								const success = await coupleStore.sendBindingRequest(res.content);
								if (success) {
									uni.showToast({
										title: '绑定请求已发送',
										icon: 'success'
									});
								}
							} catch (error) {
								uni.showToast({
									title: '发送失败',
									icon: 'none'
								});
							}
						}
					}
				});
			}
		};



		const navigateToConfig = () => {
			uni.navigateTo({
				url: '/pages/settings/index'
			});
		};

		const showAbout = () => {
			uni.showModal({
				title: '关于我们',
				content: '情侣点餐小程序 v1.0\n\n一个专为情侣设计的点餐应用，让爱情更有味道！',
				showCancel: false
			});
		};

		const clearData = () => {
			uni.showModal({
				title: '清除数据',
				content: '确定要清除所有本地数据吗？此操作不可恢复！',
				success: (res) => {
					if (res.confirm) {
						try {
							// 清除所有本地数据
							orderStore.sentOrders = [];
							orderStore.receivedOrders = [];
							orderStore.saveOrdersToLocal();

							// 清除本地存储
							uni.clearStorageSync();

							uni.showToast({
								title: '数据已清除',
								icon: 'success'
							});
						} catch (error) {
							uni.showToast({
								title: '清除失败',
								icon: 'none'
							});
						}
					}
				}
			});
		};

		const handleLogout = () => {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除用户登录状态
						userStore.logout();
						coupleStore.setBindingInfo(null);

						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
					}
				}
			});
		};

		return {
			isLoggedIn,
			userInfo,
			bindingInfo,
			partnerName,
			orderStats,
			goToLogin,
			getUserAvatarUrl,
			changeAvatar,
			editProfile,
			handleCoupleAction,
			navigateToConfig,
			showAbout,
			clearData,
			handleLogout,
			// 主题相关
			currentTheme,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle
		};
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	background: #f8f9fa;
	min-height: 100vh;
}

/* 未登录状态样式 */
.login-prompt {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 80vh;
	padding: 40rpx;
}

.login-card {
	background: white;
	border-radius: 40rpx;
	padding: 80rpx 60rpx;
	text-align: center;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 600rpx;
}

.login-icon {
	font-size: 120rpx;
	margin-bottom: 40rpx;
	opacity: 0.8;
}

.login-title {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.login-subtitle {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 60rpx;
}

.login-btn {
	width: 100%;
	height: 100rpx;
	border: none;
	border-radius: 50rpx;
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 60rpx;

	.btn-text {
		display: block;
	}

	&:active {
		transform: translateY(2rpx);
		opacity: 0.8;
	}

	&::after {
		border: none;
	}
}

.features-preview {
	display: flex;
	justify-content: space-around;
	margin-top: 40rpx;
}

.feature-item {
	display: flex;
	flex-direction: column;
	align-items: center;

	.feature-icon {
		font-size: 40rpx;
		margin-bottom: 10rpx;
	}

	.feature-text {
		font-size: 24rpx;
		color: #666;
	}
}

.profile-header {
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	color: white;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.avatar-container {
	position: relative;
	width: 120rpx;
	height: 120rpx;

	&:active {
		opacity: 0.8;
	}
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-edit-hint {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 36rpx;
	height: 36rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.edit-icon {
	font-size: 20rpx;
}

.user-details {
	margin-left: 30rpx;
	flex: 1;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.user-email {
	font-size: 24rpx;
	opacity: 0.8;
	display: block;
}

.couple-status {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 15rpx;
}

.coupled, .single {
	display: flex;
	align-items: center;
}

.heart-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
}

.status-text {
	font-size: 28rpx;
}

.stats-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	display: flex;
	justify-content: space-around;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.stat-item {
	text-align: center;
}

.stat-number {
	font-size: 48rpx;
	font-weight: bold;
	color: var(--theme-primary, #FF69B4);
	display: block;
	margin-bottom: 10rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #909399;
	display: block;
}

.menu-section {
	margin-bottom: 30rpx;
}

.menu-group {
	background: white;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.group-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #606266;
	padding: 30rpx 30rpx 20rpx;
	display: block;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background: #f8f9fa;
	}
}

.menu-icon {
	font-size: 32rpx;
	width: 40rpx;
	text-align: center;
}

.menu-text {
	flex: 1;
	margin-left: 20rpx;
	font-size: 30rpx;
	color: #303133;
}

.arrow-icon {
	font-size: 32rpx;
	color: #C0C4CC;
	font-weight: bold;
}

.logout-section {
	padding: 0 20rpx;
	margin-bottom: 40rpx;
}

.logout-btn {
	width: 100%;
	height: 80rpx;
	border: none;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&:active {
		transform: translateY(2rpx);
		opacity: 0.8;
	}
}

.logout-text {
	display: block;
}
</style>
