<template>
	<view class="theme-test-container">
		<view class="header" :style="getHeaderStyle()">
			<text class="header-title">主题测试页面</text>
		</view>
		
		<view class="content">
			<view class="theme-info">
				<text class="info-title">当前主题信息</text>
				<text class="info-item">主色调: {{ currentTheme.primaryColor }}</text>
				<text class="info-item">辅助色: {{ currentTheme.secondaryColor }}</text>
				<text class="info-item">背景色: {{ currentTheme.backgroundColor }}</text>
				<text class="info-item">主题名: {{ currentTheme.themeName }}</text>
			</view>
			
			<view class="button-test">
				<text class="section-title">按钮测试</text>
				<button class="test-btn" :style="getButtonStyle('primary')">主要按钮</button>
				<button class="test-btn" :style="getButtonStyle('secondary')">次要按钮</button>
				<button class="test-btn" :style="getButtonStyle('outline')">轮廓按钮</button>
			</view>
			
			<view class="color-test">
				<text class="section-title">颜色测试</text>
				<view class="color-samples">
					<view class="color-sample" :style="{ backgroundColor: currentTheme.primaryColor }">
						<text class="sample-text">主色调</text>
					</view>
					<view class="color-sample" :style="{ backgroundColor: currentTheme.secondaryColor }">
						<text class="sample-text">辅助色</text>
					</view>
					<view class="color-sample" :style="{ backgroundColor: currentTheme.backgroundColor }">
						<text class="sample-text" style="color: #333;">背景色</text>
					</view>
				</view>
			</view>
			
			<view class="quick-theme-switch">
				<text class="section-title">快速切换主题</text>
				<view class="theme-buttons">
					<button class="theme-btn" @click="switchTheme('粉色恋人')">粉色恋人</button>
					<button class="theme-btn" @click="switchTheme('蓝色海洋')">蓝色海洋</button>
					<button class="theme-btn" @click="switchTheme('绿色清新')">绿色清新</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { useTheme } from '@/mixins/theme';
import { useThemeStore } from '@/store/theme';

export default {
	name: 'ThemeTest',
	setup() {
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const themeStore = useThemeStore();
		
		// 快速切换主题
		const switchTheme = (themeName) => {
			const preset = themeStore.presetThemes.find(theme => theme.name === themeName);
			if (preset) {
				themeStore.applyPresetTheme(preset);
				uni.showToast({
					title: `已切换到${themeName}`,
					icon: 'success'
				});
			}
		};
		
		return {
			currentTheme,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle,
			switchTheme
		};
	}
};
</script>

<style lang="scss" scoped>
.theme-test-container {
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

.theme-info, .button-test, .color-test, .quick-theme-switch {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.info-title, .section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.info-item {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
	font-family: monospace;
}

.test-btn {
	width: 100%;
	height: 80rpx;
	border: none;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 20rpx;

	&::after {
		border: none;
	}

	&:active {
		transform: translateY(2rpx);
		opacity: 0.8;
	}
}

.color-samples {
	display: flex;
	gap: 20rpx;
}

.color-sample {
	flex: 1;
	height: 120rpx;
	border-radius: 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sample-text {
	color: white;
	font-size: 24rpx;
	font-weight: bold;
	text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

.theme-buttons {
	display: flex;
	gap: 15rpx;
}

.theme-btn {
	flex: 1;
	height: 70rpx;
	background: #f5f5f5;
	border: none;
	border-radius: 35rpx;
	font-size: 26rpx;
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
