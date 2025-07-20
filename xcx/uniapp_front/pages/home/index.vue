<template>
	<view class="home-container">
		<!-- 欢迎横幅 -->
		<view class="welcome-banner" :style="getHeaderStyle()">
			<view class="banner-content">
				<text class="greeting">{{ getGreeting() }}</text>
				<text class="subtitle">{{ getSubtitle() }}</text>
				<view v-if="!isLoggedIn" class="login-hint">
					<text class="hint-text">登录后体验完整功能</text>
					<text class="hint-link" @click="goToLogin">立即登录</text>
				</view>
			</view>
			<view class="weather-info">
				<u-icon name="sun" size="24" color="#FFD700"></u-icon>
				<text class="weather-text">今天适合点餐</text>
			</view>
		</view>

		<!-- 快捷操作 -->
		<view class="quick-actions">
			<view class="action-item" @click="goToOrdering">
				<view class="action-icon">
					<u-icon name="shopping-cart" size="32" color="#FF69B4"></u-icon>
				</view>
				<text class="action-text">立即点餐</text>
				<text class="action-desc">为TA挑选美味</text>
			</view>
			<view class="action-item" @click="goToOrders">
				<view class="action-icon">
					<u-icon name="list" size="32" color="#409EFF"></u-icon>
				</view>
				<text class="action-text">订单记录</text>
				<text class="action-desc">查看历史订单</text>
			</view>
		</view>

		<!-- 最近订单 -->
		<view v-if="recentOrders.length > 0" class="recent-section">
			<view class="section-header">
				<text class="section-title">最近订单</text>
				<text class="section-more" @click="goToOrders">查看全部</text>
			</view>
			<view class="recent-orders">
				<view v-for="order in recentOrders.slice(0, 3)" :key="order.id" class="recent-order" @click="goToOrderDetail(order.id)">
					<view class="order-info">
						<text class="order-title">{{ order.type === 'sent' ? '发给TA' : '来自TA' }}</text>
						<text class="order-time">{{ formatTime(order.createTime) }}</text>
					</view>
					<view class="order-summary">
						<text class="order-items">{{ order.items.length }}件商品</text>
						<text class="order-price">¥{{ order.totalPrice }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 推荐菜品 -->
		<view class="recommend-section">
			<view class="section-header">
				<text class="section-title">今日推荐</text>
			</view>
			<scroll-view scroll-x class="recommend-scroll">
				<view v-for="product in recommendProducts" :key="product.id" class="recommend-item" @click="goToProduct(product)">
					<u-image class="recommend-image" :src="product.image || '/static/images/default-product.png'" width="120" height="120"></u-image>
					<text class="recommend-name">{{ product.name }}</text>
					<text class="recommend-price">¥{{ product.price }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 情侣互动 -->
		<view class="couple-section">
			<view class="section-header">
				<text class="section-title">情侣互动</text>
			</view>
			<view class="couple-actions">
				<view class="couple-item" @click="sendLove">
					<u-icon name="heart-fill" size="28" color="#FF69B4"></u-icon>
					<text class="couple-text">发送爱心</text>
				</view>
				<view class="couple-item" @click="randomFood">
					<u-icon name="reload" size="28" color="#67C23A"></u-icon>
					<text class="couple-text">随机选择</text>
				</view>
				<view class="couple-item" @click="shareApp">
					<u-icon name="share" size="28" color="#409EFF"></u-icon>
					<text class="couple-text">分享应用</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { useOrderStore } from '@/store/order';
import { useMenuStore } from '@/store/menu';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/mixins/theme';
import { onMounted, computed } from 'vue';
import dayjs from 'dayjs';

export default {
	setup() {
		const orderStore = useOrderStore();
		const menuStore = useMenuStore();
		const userStore = useUserStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();

		// 登录状态
		const isLoggedIn = computed(() => userStore.isLoggedIn);

		onMounted(() => {
			orderStore.initOrders();
			menuStore.fetchMenuData();
		});

		// 最近订单
		const recentOrders = computed(() => {
			return orderStore.allOrders.slice(0, 5);
		});

		// 推荐商品
		const recommendProducts = computed(() => {
			const allProducts = [];
			Object.values(menuStore.products).forEach(categoryProducts => {
				allProducts.push(...categoryProducts);
			});
			return allProducts.slice(0, 6);
		});

		const getGreeting = () => {
			const hour = new Date().getHours();
			if (hour < 12) return '早上好！';
			if (hour < 18) return '下午好！';
			return '晚上好！';
		};

		const getSubtitle = () => {
			const hour = new Date().getHours();
			if (hour < 12) return '新的一天，为TA准备早餐吧';
			if (hour < 14) return '午餐时间，来点什么好呢？';
			if (hour < 18) return '下午茶时光，甜蜜一下';
			return '晚餐时间，和TA一起享受美食';
		};

		const formatTime = (time) => {
			return dayjs(time).format('MM-DD HH:mm');
		};

		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		};

		const goToOrdering = () => {
			if (!isLoggedIn.value) {
				uni.showModal({
					title: '提示',
					content: '请先登录后再使用点餐功能',
					confirmText: '去登录',
					success: (res) => {
						if (res.confirm) {
							goToLogin();
						}
					}
				});
				return;
			}
			uni.switchTab({
				url: '/pages/ordering/index'
			});
		};

		const goToOrders = () => {
			uni.switchTab({
				url: '/pages/order/list'
			});
		};

		const goToOrderDetail = (orderId) => {
			uni.navigateTo({
				url: `/pages/order/detail?id=${orderId}`
			});
		};

		const goToProduct = (product) => {
			// 跳转到点餐页面并定位到该商品
			uni.switchTab({
				url: '/pages/ordering/index'
			});
		};

		const sendLove = () => {
			uni.showToast({
				title: '❤️ 爱心已发送',
				icon: 'none'
			});
		};

		const randomFood = () => {
			const allProducts = [];
			Object.values(menuStore.products).forEach(categoryProducts => {
				allProducts.push(...categoryProducts);
			});

			if (allProducts.length > 0) {
				const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
				uni.showModal({
					title: '随机推荐',
					content: `今天试试 ${randomProduct.name} 怎么样？\n${randomProduct.description}`,
					confirmText: '去点餐',
					success: (res) => {
						if (res.confirm) {
							goToOrdering();
						}
					}
				});
			}
		};

		const shareApp = () => {
			uni.showToast({
				title: '分享功能开发中...',
				icon: 'none'
			});
		};

		return {
			isLoggedIn,
			recentOrders,
			recommendProducts,
			getGreeting,
			getSubtitle,
			formatTime,
			goToLogin,
			goToOrdering,
			goToOrders,
			goToOrderDetail,
			goToProduct,
			sendLove,
			randomFood,
			shareApp,
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
.home-container {
	padding: 20rpx;
	background: #f8f9fa;
	min-height: 100vh;
}

.welcome-banner {
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.banner-content {
	flex: 1;
}

.greeting {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.subtitle {
	font-size: 26rpx;
	opacity: 0.9;
	display: block;
}

.login-hint {
	margin-top: 20rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.hint-text {
	font-size: 24rpx;
	opacity: 0.8;
}

.hint-link {
	font-size: 24rpx;
	background: rgba(255, 255, 255, 0.2);
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.3);

	&:active {
		opacity: 0.7;
	}
}

.weather-info {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.weather-text {
	font-size: 22rpx;
	margin-top: 8rpx;
	opacity: 0.8;
}

.quick-actions {
	display: flex;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.action-item {
	flex: 1;
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	text-align: center;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);

	&:active {
		transform: scale(0.98);
	}
}

.action-icon {
	margin-bottom: 15rpx;
}

.action-text {
	font-size: 30rpx;
	font-weight: bold;
	color: #303133;
	display: block;
	margin-bottom: 8rpx;
}

.action-desc {
	font-size: 24rpx;
	color: #909399;
	display: block;
}

.recent-section, .recommend-section, .couple-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #303133;
}

.section-more {
	font-size: 26rpx;
	color: #409EFF;
}

.recent-orders {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.recent-order {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 15rpx;

	&:active {
		background: #e9ecef;
	}
}

.order-info {
	flex: 1;
}

.order-title {
	font-size: 28rpx;
	color: #303133;
	display: block;
	margin-bottom: 8rpx;
}

.order-time {
	font-size: 24rpx;
	color: #909399;
	display: block;
}

.order-summary {
	text-align: right;
}

.order-items {
	font-size: 24rpx;
	color: #909399;
	display: block;
	margin-bottom: 8rpx;
}

.order-price {
	font-size: 28rpx;
	font-weight: bold;
	color: var(--theme-primary, #FF69B4);
	display: block;
}

.recommend-scroll {
	white-space: nowrap;
}

.recommend-item {
	display: inline-block;
	width: 160rpx;
	margin-right: 20rpx;
	text-align: center;

	&:active {
		opacity: 0.8;
	}
}

.recommend-image {
	border-radius: 15rpx;
	margin-bottom: 15rpx;
}

.recommend-name {
	font-size: 26rpx;
	color: #303133;
	display: block;
	margin-bottom: 8rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.recommend-price {
	font-size: 24rpx;
	color: var(--theme-primary, #FF69B4);
	font-weight: bold;
	display: block;
}

.couple-actions {
	display: flex;
	justify-content: space-around;
}

.couple-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;

	&:active {
		opacity: 0.7;
	}
}

.couple-text {
	font-size: 24rpx;
	color: #606266;
	margin-top: 10rpx;
}
</style>