<template>
	<view class="theme-test-page">
		<view class="header" :style="getHeaderStyle()">
			<text class="header-title">主题测试页面</text>
		</view>
		
		<view class="content">
			<view class="theme-info-card">
				<text class="card-title">当前主题信息</text>
				<view class="theme-details">
					<view class="detail-item">
						<text class="detail-label">主题名称:</text>
						<text class="detail-value">{{ currentTheme.themeName || '自定义主题' }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">主色调:</text>
						<text class="detail-value">{{ currentTheme.primaryColor }}</text>
						<view class="color-preview" :style="{ backgroundColor: currentTheme.primaryColor }"></view>
					</view>
					<view class="detail-item">
						<text class="detail-label">辅助色:</text>
						<text class="detail-value">{{ currentTheme.secondaryColor }}</text>
						<view class="color-preview" :style="{ backgroundColor: currentTheme.secondaryColor }"></view>
					</view>
					<view class="detail-item">
						<text class="detail-label">背景色:</text>
						<text class="detail-value">{{ currentTheme.backgroundColor }}</text>
						<view class="color-preview" :style="{ backgroundColor: currentTheme.backgroundColor }"></view>
					</view>
				</view>
			</view>
			
			<view class="button-test-card">
				<text class="card-title">按钮样式测试</text>
				<view class="button-group">
					<button class="test-button" :style="getButtonStyle('primary')">主要按钮</button>
					<button class="test-button" :style="getButtonStyle('secondary')">次要按钮</button>
					<button class="test-button" :style="getButtonStyle('outline')">轮廓按钮</button>
				</view>
			</view>
			
			<view class="quick-switch-card">
				<text class="card-title">快速切换主题</text>
				<view class="theme-grid">
					<view v-for="theme in presetThemes" :key="theme.name" 
						  class="theme-item" 
						  :class="{ active: isCurrentTheme(theme) }"
						  @click="switchTheme(theme)">
						<view class="theme-colors">
							<view class="color-dot" :style="{ backgroundColor: theme.primaryColor }"></view>
							<view class="color-dot" :style="{ backgroundColor: theme.secondaryColor }"></view>
							<view class="color-dot" :style="{ backgroundColor: theme.backgroundColor }"></view>
						</view>
						<text class="theme-name">{{ theme.name }}</text>
					</view>
				</view>
			</view>
			
			<view class="demo-section">
				<text class="card-title">主题效果演示</text>
				<view class="demo-content">
					<view class="demo-card" :style="getThemeStyle('gradient')">
						<text class="demo-text">渐变背景卡片</text>
						<text class="demo-desc">使用主色调到辅助色的渐变</text>
					</view>

					<view class="demo-card" :style="getThemeStyle('primary')">
						<text class="demo-text">主色调卡片</text>
						<text class="demo-desc">使用主色调作为背景</text>
					</view>

					<view class="demo-card" :style="getThemeStyle('outline')">
						<text class="demo-text">轮廓卡片</text>
						<text class="demo-desc">使用主色调作为边框</text>
					</view>
				</view>
			</view>

			<view class="action-buttons">
				<button class="action-btn" @click="goToThemeConfig">
					打开主题配置
				</button>
				<button class="action-btn" @click="goBack">
					返回
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { useTheme } from '@/mixins/theme';
import { useThemeStore } from '@/store/theme';
import { getThemeStyle } from '@/utils/theme-helper';

export default {
	name: 'ThemeTest',
	setup() {
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const themeStore = useThemeStore();
		
		// 预设主题
		const presetThemes = themeStore.presetThemes;
		
		// 判断是否为当前主题
		const isCurrentTheme = (theme) => {
			return theme.primaryColor === currentTheme.value.primaryColor &&
				   theme.secondaryColor === currentTheme.value.secondaryColor &&
				   theme.backgroundColor === currentTheme.value.backgroundColor;
		};
		
		// 切换主题
		const switchTheme = (theme) => {
			themeStore.applyPresetTheme(theme);
			uni.showToast({
				title: `已切换到${theme.name}`,
				icon: 'success'
			});
		};
		
		// 打开主题配置页面
		const goToThemeConfig = () => {
			uni.navigateTo({
				url: '/pages/settings/theme-config'
			});
		};
		
		// 返回
		const goBack = () => {
			uni.navigateBack();
		};
		
		return {
			currentTheme,
			presetThemes,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle,
			getThemeStyle,
			isCurrentTheme,
			switchTheme,
			goToThemeConfig,
			goBack
		};
	}
};
</script>

<style lang="scss" scoped>
.theme-test-page {
	min-height: 100vh;
	background: #f8f9fa;
}

.header {
	padding: 40rpx 30rpx;
	text-align: center;
	color: white;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
}

.content {
	padding: 30rpx;
}

.theme-info-card, .button-test-card, .quick-switch-card, .demo-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.theme-details {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.detail-item {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.detail-label {
	font-size: 28rpx;
	color: #666;
	width: 120rpx;
}

.detail-value {
	font-size: 26rpx;
	color: #333;
	font-family: monospace;
	flex: 1;
}

.color-preview {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	border: 2rpx solid #e0e0e0;
}

.button-group {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.test-button {
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

.theme-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.theme-item {
	padding: 20rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 15rpx;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;

	&.active {
		border-color: var(--theme-primary, #FF69B4);
		background: var(--theme-primary-light, #FF69B420);
	}

	&:active {
		transform: scale(0.98);
	}
}

.theme-colors {
	display: flex;
	justify-content: center;
	gap: 8rpx;
	margin-bottom: 15rpx;
}

.color-dot {
	width: 30rpx;
	height: 30rpx;
	border-radius: 15rpx;
	border: 1rpx solid #e0e0e0;
}

.theme-name {
	font-size: 24rpx;
	color: #333;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
}

.demo-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.demo-card {
	padding: 30rpx;
	border-radius: 15rpx;
	text-align: center;
}

.demo-text {
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.demo-desc {
	font-size: 24rpx;
	opacity: 0.8;
	display: block;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	background: #f5f5f5;
	border: none;
	border-radius: 40rpx;
	font-size: 28rpx;
	color: #666;

	&::after {
		border: none;
	}

	&:active {
		background: #e0e0e0;
		transform: translateY(2rpx);
	}
}
</style>
