<template>
	<view class="quick-access-container">
		<!-- 快速访问按钮 -->
		<view class="quick-btn" @click="toggleMenu" :class="{ active: showMenu }">
			<text class="quick-icon">⚙️</text>
		</view>

		<!-- 快速菜单 -->
		<view v-if="showMenu" class="quick-menu" @click.stop>
			<view class="menu-item" @click="navigateToSettings">
				<text class="menu-icon">🎨</text>
				<text class="menu-text">全局配置</text>
			</view>
			<view class="menu-item" @click="navigateToMenuManage">
				<text class="menu-icon">📋</text>
				<text class="menu-text">菜单管理</text>
			</view>
			<view class="menu-item" @click="navigateToOrdering">
				<text class="menu-icon">🛒</text>
				<text class="menu-text">点餐页面</text>
			</view>
			<view class="menu-item" @click="navigateToOrders">
				<text class="menu-icon">📦</text>
				<text class="menu-text">订单列表</text>
			</view>
		</view>

		<!-- 遮罩层 -->
		<view v-if="showMenu" class="overlay" @click="closeMenu"></view>
	</view>
</template>

<script>
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

export default {
	name: 'QuickMenuAccess',
	setup() {
		const userStore = useUserStore();
		const showMenu = ref(false);

		// 切换菜单显示
		const toggleMenu = () => {
			showMenu.value = !showMenu.value;
		};

		// 关闭菜单
		const closeMenu = () => {
			showMenu.value = false;
		};

		// 导航到全局配置
		const navigateToSettings = () => {
			closeMenu();
			uni.navigateTo({
				url: '/pages/settings/index'
			});
		};

		// 导航到菜单管理
		const navigateToMenuManage = () => {
			closeMenu();
			uni.navigateTo({
				url: '/pages/settings/menu-manage'
			});
		};

		// 导航到点餐页面
		const navigateToOrdering = () => {
			closeMenu();
			uni.switchTab({
				url: '/pages/ordering/index'
			});
		};

		// 导航到订单列表
		const navigateToOrders = () => {
			closeMenu();
			uni.switchTab({
				url: '/pages/order/list'
			});
		};

		return {
			showMenu,
			toggleMenu,
			closeMenu,
			navigateToSettings,
			navigateToMenuManage,
			navigateToOrdering,
			navigateToOrders
		};
	}
};
</script>

<style lang="scss" scoped>
.quick-access-container {
	position: fixed;
	top: 200rpx;
	right: 30rpx;
	z-index: 1000;
}

.quick-btn {
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #FF69B4, #FF1493);
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.4);
	cursor: pointer;
	transition: all 0.3s ease;
	
	&.active {
		transform: rotate(45deg);
		background: linear-gradient(135deg, #FF1493, #C41E3A);
	}
	
	&:active {
		transform: scale(0.95);
	}
}

.quick-icon {
	font-size: 40rpx;
	color: white;
}

.quick-menu {
	position: absolute;
	top: 120rpx;
	right: 0;
	background: white;
	border-radius: 20rpx;
	padding: 20rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
	min-width: 200rpx;
	animation: slideIn 0.3s ease;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-radius: 15rpx;
	cursor: pointer;
	transition: all 0.2s ease;
	
	&:hover {
		background: #F8F9FA;
	}
	
	&:active {
		background: #E9ECEF;
		transform: scale(0.98);
	}
}

.menu-icon {
	font-size: 32rpx;
	margin-right: 15rpx;
}

.menu-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.1);
	z-index: -1;
}
</style>
