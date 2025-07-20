<template>
	<view class="container">
		<!-- 未登录状态提示 -->
		<view v-if="!isLoggedIn" class="demo-notice">
			<text class="notice-text">当前为演示模式，</text>
			<text class="login-link" @click="goToLogin">点击登录</text>
			<text class="notice-text">查看真实数据</text>
		</view>

		<!-- 订单内容 -->
			<!-- 自定义Tab -->
			<view class="custom-tabs">
				<view
					v-for="(tab, index) in tabList"
					:key="index"
					class="tab-item"
					:class="{ active: currentTab === index }"
					:style="currentTab === index ? tabActiveStyle : {}"
					@click="handleTabClick({ index })"
				>
					{{ tab.name }}
				</view>
				<view class="refresh-btn" @click="handleRefresh">
					🔄
				</view>
			</view>

			<swiper class="swiper" :current="currentTab" @change="handleSwiperChange">
			<swiper-item>
				<scroll-view scroll-y class="scroll-view">
					<view v-if="isLoggedIn && orderStore.status === 'loading'" class="loading-container">
						<view class="loading-text">加载中...</view>
					</view>
					<view v-else>
						<view v-for="order in displaySentOrders" :key="order.id" @click="navigateToDetail(order.id)" class="order-card">
							<view class="order-header">
								<text class="order-title">发给TA的订单 #{{ order.id }}</text>
								<text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
							</view>
							<view class="order-info">
								<text class="order-time">{{ formatDate(order.created_at || order.createTime) }}</text>
								<text class="order-count">{{ order.items.length }}件商品</text>
							</view>
							<view class="order-total">
								<text class="total-text" :style="totalPriceStyle">总计：¥{{ order.total_price || order.totalPrice }}</text>
							</view>
							<view v-if="order.notes || order.note" class="order-note">
								<text class="note-text">{{ order.notes || order.note }}</text>
							</view>
						</view>
						<view v-if="displaySentOrders.length === 0" class="empty-state">
							<view class="empty-icon">📋</view>
							<view class="empty-text">暂无发出的订单</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<scroll-view scroll-y class="scroll-view">
					<view v-if="isLoggedIn && orderStore.status === 'loading'" class="loading-container">
						<view class="loading-text">加载中...</view>
					</view>
					<view v-else>
						<view v-for="order in displayReceivedOrders" :key="order.id" @click="navigateToDetail(order.id)" class="order-card">
							<view class="order-header">
								<text class="order-title">来自TA的订单 #{{ order.id }}</text>
								<text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
							</view>
							<view class="order-info">
								<text class="order-time">{{ formatDate(order.created_at || order.createTime) }}</text>
								<text class="order-count">{{ order.items.length }}件商品</text>
							</view>
							<view class="order-total">
								<text class="total-text" :style="totalPriceStyle">总计：¥{{ order.total_price || order.totalPrice }}</text>
							</view>
							<view v-if="order.notes || order.note" class="order-note">
								<text class="note-text">{{ order.notes || order.note }}</text>
							</view>
						</view>
						<view v-if="displayReceivedOrders.length === 0" class="empty-state">
							<view class="empty-icon">📨</view>
							<view class="empty-text">暂无收到的订单</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
import { useOrderStore } from '@/store/order';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/mixins/theme';
import { onMounted, ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

export default {
	setup() {
		const orderStore = useOrderStore();
		const userStore = useUserStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const currentTab = ref(0);
		const tabList = [{ name: '我发出的' }, { name: '我收到的' }];

		// 登录状态
		const isLoggedIn = computed(() => userStore.isLoggedIn);

		// 模拟订单数据
		const mockSentOrders = [
			{
				id: 'demo-1',
				creator: 'demo',
				creator_username: '演示用户',
				status: 'PENDING',
				notes: '这是一个演示订单，登录后查看真实数据',
				total_price: '45.00',
				created_at: '2024-06-22T10:30:00Z',
				items: [
					{ product: { name: '宫保鸡丁', price: '25.00' }, quantity: 1 },
					{ product: { name: '米饭', price: '3.00' }, quantity: 2 }
				]
			},
			{
				id: 'demo-2',
				creator: 'demo',
				creator_username: '演示用户',
				status: 'COMPLETED',
				notes: '美味的午餐',
				total_price: '32.00',
				created_at: '2024-06-21T12:15:00Z',
				items: [
					{ product: { name: '红烧肉', price: '28.00' }, quantity: 1 },
					{ product: { name: '汤', price: '4.00' }, quantity: 1 }
				]
			}
		];

		const mockReceivedOrders = [
			{
				id: 'demo-3',
				creator: 'demo-partner',
				creator_username: 'TA',
				status: 'CONFIRMED',
				notes: 'TA为你点的爱心餐',
				total_price: '38.00',
				created_at: '2024-06-22T11:00:00Z',
				items: [
					{ product: { name: '糖醋里脊', price: '26.00' }, quantity: 1 },
					{ product: { name: '蛋花汤', price: '6.00' }, quantity: 2 }
				]
			}
		];

		// 显示的订单数据（根据登录状态选择真实数据或模拟数据）
		const displaySentOrders = computed(() => {
			return isLoggedIn.value ? orderStore.sentOrders : mockSentOrders;
		});

		const displayReceivedOrders = computed(() => {
			return isLoggedIn.value ? orderStore.receivedOrders : mockReceivedOrders;
		});

		// 刷新订单数据
		const refreshOrders = async () => {
			if (userStore.isLoggedIn) {
				console.log('刷新订单数据...');
				try {
					await Promise.all([
						orderStore.fetchSentOrders(),
						orderStore.fetchReceivedOrders()
					]);
					console.log('订单数据刷新完成');
				} catch (error) {
					console.error('刷新订单数据失败:', error);
				}
			}
		};

		onMounted(() => {
			// 只有登录后才获取真实订单数据
			if (userStore.isLoggedIn) {
				orderStore.initOrders();
				refreshOrders();
			}
			// 未登录时显示模拟数据，不需要额外操作
		});

		// 页面显示时只刷新一次数据，不设置定时器
		onShow(() => {
			console.log('订单页面显示');
			if (userStore.isLoggedIn) {
				refreshOrders();
			}
		});

		// 跳转到登录页面
		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		};

		const handleTabClick = (item) => {
			currentTab.value = item.index;
		};

		const handleSwiperChange = (e) => {
			currentTab.value = e.detail.current;
		};

		const formatDate = (date) => {
			return dayjs(date).format('MM-DD HH:mm');
		};

		const getStatusText = (status) => {
			const statusMap = {
				'PENDING': '待处理',
				'CONFIRMED': '已确认',
				'ORDERED': '已下单',
				'COMPLETED': '已完成',
				'RATED': '已评价',
				'CANCELLED': '已取消',
				// 兼容旧格式
				'pending': '待处理',
				'accepted': '已接收',
				'completed': '已完成'
			};
			return statusMap[status] || '未知';
		};

		const getStatusClass = (status) => {
			return `status-${status}`;
		};

		const navigateToDetail = (id) => {
			if (!isLoggedIn.value && id.startsWith('demo-')) {
				uni.showToast({
					title: '请登录查看订单详情',
					icon: 'none'
				});
				return;
			}

			uni.navigateTo({
				url: `/pages/order/detail?id=${id}`
			});
		};

		// 手动刷新
		const handleRefresh = () => {
			uni.showToast({
				title: '刷新中...',
				icon: 'loading'
			});
			refreshOrders().then(() => {
				uni.hideToast();
				uni.showToast({
					title: '刷新完成',
					icon: 'success',
					duration: 1000
				});
			});
		};

		// 动态样式计算属性
		const tabActiveStyle = computed(() => ({
			color: currentTheme.value.primaryColor
		}));

		const totalPriceStyle = computed(() => ({
			color: currentTheme.value.primaryColor
		}));

		return {
			isLoggedIn,
			orderStore,
			currentTab,
			tabList,
			displaySentOrders,
			displayReceivedOrders,
			goToLogin,
			handleTabClick,
			handleSwiperChange,
			formatDate,
			getStatusText,
			getStatusClass,
			navigateToDetail,
			handleRefresh,
			refreshOrders,
			// 主题相关
			currentTheme,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle,
			// 动态样式
			tabActiveStyle,
			totalPriceStyle
		};
	}
}
</script>

<style lang="scss">
.container {
	height: 100vh;
}

/* 演示模式提示 */
.demo-notice {
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
	color: white;
	padding: 20rpx 30rpx;
	text-align: center;
	font-size: 24rpx;
}

.notice-text {
	opacity: 0.9;
}

.login-link {
	color: white;
	font-weight: bold;
	text-decoration: underline;
	margin: 0 8rpx;

	&:active {
		opacity: 0.8;
	}
}

/* 未登录状态样式 */
.login-prompt {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
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
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
	border: none;
	border-radius: 50rpx;
	color: white;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.4);

	.btn-text {
		display: block;
	}

	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 5rpx 15rpx rgba(255, 105, 180, 0.4);
	}

	&::after {
		border: none;
	}
}

/* 自定义Tab样式 */
.custom-tabs {
	display: flex;
	background: #fff;
	border-bottom: 1rpx solid #e0e0e0;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 30rpx 0;
	font-size: 28rpx;
	color: #666;
	position: relative;

	&.active {
		color: var(--theme-primary, #FF69B4);
		font-weight: bold;

		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 60rpx;
			height: 4rpx;
			background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
			border-radius: 2rpx;
		}
	}
}

.refresh-btn {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #666;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 50%;

	&:active {
		background: rgba(0, 0, 0, 0.1);
		transform: translateY(-50%) scale(0.95);
	}
}

.swiper {
	height: calc(100vh - 88rpx); /* 减去自定义tabs的高度 */
}

.scroll-view {
	height: 100%;
	padding: 20rpx;
}

.order-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.order-title {
	font-size: 32rpx;
	font-weight: bold;
}

.order-status {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;

	&.status-PENDING, &.status-pending {
		background: #fff3cd;
		color: #856404;
	}

	&.status-CONFIRMED {
		background: #e2e3ff;
		color: #3c4fe0;
	}

	&.status-ORDERED {
		background: #fff0e6;
		color: #d46b08;
	}

	&.status-COMPLETED, &.status-completed {
		background: #d4edda;
		color: #155724;
	}

	&.status-RATED {
		background: #cce5ff;
		color: #004085;
	}

	&.status-CANCELLED {
		background: #f5f5f5;
		color: #999;
	}

	&.status-accepted {
		background: #d4edda;
		color: #155724;
	}
}

.order-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.order-time {
	font-size: 26rpx;
	color: #909399;
}

.order-count {
	font-size: 26rpx;
	color: #909399;
}

.order-total {
	margin-bottom: 15rpx;
}

.total-text {
	font-size: 30rpx;
	font-weight: bold;
	color: var(--theme-primary, #FF69B4);
}

.order-note {
	padding: 15rpx;
	background: #f8f9fa;
	border-radius: 10rpx;
}

.note-text {
	font-size: 26rpx;
	color: #666;
}

.empty-state {
	padding: 150rpx 0;
	text-align: center;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
	opacity: 0.6;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.loading-container {
	padding: 150rpx 0;
	text-align: center;
}

.loading-text {
	font-size: 28rpx;
	color: #999;
}
</style>