<template>
	<view class="settings-container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="header-title">全局配置</view>
			<view class="header-subtitle">管理您的菜单、商品和系统设置</view>
		</view>

		<!-- 主要功能卡片 -->
		<view class="main-functions">
			<!-- 菜单商品管理 -->
			<view class="function-card" @click="navigateToMenuManage">
				<view class="card-icon">🍽️</view>
				<view class="card-content">
					<view class="card-title">菜单商品管理</view>
					<view class="card-desc">管理分类、商品、价格等信息</view>
					<view class="card-stats">
						<text class="stats-item">分类管理</text>
						<text class="stats-item">商品管理</text>
					</view>
				</view>
				<view class="card-arrow">
					<text class="arrow-icon">→</text>
				</view>
			</view>

			<!-- 主题样式配置 -->
			<view class="function-card" @click="navigateToThemeConfig">
				<view class="card-icon">🎨</view>
				<view class="card-content">
					<view class="card-title">主题样式配置</view>
					<view class="card-desc">自定义应用颜色和主题风格</view>
					<view class="card-preview">
						<view class="color-dot" :style="{ backgroundColor: themeConfig.primaryColor }"></view>
						<view class="color-dot" :style="{ backgroundColor: themeConfig.secondaryColor }"></view>
						<view class="color-dot" :style="{ backgroundColor: themeConfig.backgroundColor }"></view>
					</view>
				</view>
				<view class="card-arrow">
					<text class="arrow-icon">→</text>
				</view>
			</view>
		</view>




	</view>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useTheme } from '@/mixins/theme';
import { useThemeStore } from '@/store/theme';
import { onShow } from '@dcloudio/uni-app';

export default {
	name: 'Settings',
	setup() {
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const themeStore = useThemeStore();

		// 主题配置（从Store获取）
		const themeConfig = computed(() => currentTheme.value);

		// 页面显示时立即设置导航栏主题
		onShow(() => {
			// 立即设置导航栏主题，避免颜色过渡
			try {
				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: themeStore.currentTheme.primaryColor,
					animation: {
						duration: 0,  // 立即生效
						timingFunc: 'linear'
					}
				});
			} catch (error) {
				console.log('设置导航栏主题失败:', error);
			}

			// 同时通知App.vue
			uni.$emit('onPageShow', 'pages/settings/index');
		});



		// 导航到菜单管理页面
		const navigateToMenuManage = () => {
			uni.navigateTo({
				url: '/pages/settings/menu-manage'
			});
		};

		// 导航到主题配置页面
		const navigateToThemeConfig = () => {
			uni.navigateTo({
				url: '/pages/settings/theme-config'
			});
		};

		return {
			themeConfig,
			navigateToMenuManage,
			navigateToThemeConfig,
			// 主题相关
			currentTheme,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle
		};
	}
};
</script>

<style lang="scss" scoped>
.settings-container {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--theme-background, #FFF5F8) 0%, #F0F8FF 100%);
	padding: 0 30rpx 40rpx;
}

.header {
	padding: 40rpx 0 30rpx;
	text-align: center;
}

.header-title {
	font-size: 48rpx;
	font-weight: bold;
	color: var(--theme-primary, #FF69B4);
	margin-bottom: 10rpx;
}

.header-subtitle {
	font-size: 28rpx;
	color: #666;
}

.main-functions {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.function-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;

	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
}

.card-icon {
	font-size: 60rpx;
	margin-right: 25rpx;
}

.card-content {
	flex: 1;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.card-desc {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 15rpx;
}

.card-stats {
	display: flex;
	gap: 20rpx;
}

.stats-item {
	font-size: 24rpx;
	color: #999;
	background: #F8F9FA;
	padding: 8rpx 15rpx;
	border-radius: 12rpx;
}

.card-preview {
	display: flex;
	gap: 8rpx;
}

.color-dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 12rpx;
	border: 1rpx solid #E0E0E0;
}

.card-arrow {
	margin-left: 15rpx;
}

.arrow-icon {
	font-size: 32rpx;
	color: #C0C4CC;
}




</style>
