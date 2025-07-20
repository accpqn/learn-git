<template>
	<view class="theme-config-container" :style="{ '--theme-primary': themeConfig.primaryColor, '--theme-secondary': themeConfig.secondaryColor, '--theme-background': themeConfig.backgroundColor }">
		<!-- 当前主题预览 -->
		<view class="current-theme-preview">
			<view class="preview-title">当前主题</view>
			<view class="preview-colors">
				<view class="preview-color-item">
					<view class="color-circle" :style="{ backgroundColor: themeConfig.primaryColor }"></view>
					<text class="color-name">主色调</text>
				</view>
				<view class="preview-color-item">
					<view class="color-circle" :style="{ backgroundColor: themeConfig.secondaryColor }"></view>
					<text class="color-name">辅助色</text>
				</view>
				<view class="preview-color-item">
					<view class="color-circle" :style="{ backgroundColor: themeConfig.backgroundColor }"></view>
					<text class="color-name">背景色</text>
				</view>
			</view>
		</view>

		<!-- 颜色配置 -->
		<view class="config-section">
			<view class="section-title">自定义颜色</view>
			<view class="color-config">
				<view class="color-item">
					<view class="color-label">主色调</view>
					<view class="color-picker" @click="showColorPicker('primary')">
						<view class="color-preview" :style="{ backgroundColor: themeConfig.primaryColor }"></view>
						<text class="color-value">{{ themeConfig.primaryColor }}</text>
					</view>
				</view>
				
				<view class="color-item">
					<view class="color-label">辅助色</view>
					<view class="color-picker" @click="showColorPicker('secondary')">
						<view class="color-preview" :style="{ backgroundColor: themeConfig.secondaryColor }"></view>
						<text class="color-value">{{ themeConfig.secondaryColor }}</text>
					</view>
				</view>
				
				<view class="color-item">
					<view class="color-label">背景色</view>
					<view class="color-picker" @click="showColorPicker('background')">
						<view class="color-preview" :style="{ backgroundColor: themeConfig.backgroundColor }"></view>
						<text class="color-value">{{ themeConfig.backgroundColor }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 预设主题 -->
		<view class="config-section">
			<view class="section-title">预设主题</view>
			<view class="preset-themes">
				<view v-for="(preset, index) in presetThemes" :key="index" 
					  class="preset-item" 
					  :class="{ active: isCurrentTheme(preset) }"
					  @click="applyPresetTheme(preset)">
					<view class="preset-colors">
						<view class="preset-color" :style="{ backgroundColor: preset.primaryColor }"></view>
						<view class="preset-color" :style="{ backgroundColor: preset.secondaryColor }"></view>
						<view class="preset-color" :style="{ backgroundColor: preset.backgroundColor }"></view>
					</view>
					<text class="preset-name">{{ preset.name }}</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="reset-btn" @click="resetTheme">
				重置默认
			</button>
			<button class="save-btn" :style="getButtonStyle('primary')" @click="saveThemeConfig" :loading="saving">
				保存配置
			</button>
		</view>
	</view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/store/theme';
import { useTheme, themeUtils } from '@/mixins/theme';
import { onShow } from '@dcloudio/uni-app';

export default {
	name: 'ThemeConfig',
	setup() {
		const themeStore = useThemeStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const saving = ref(false);

		// 页面初始化
		onMounted(() => {
			// 确保主题已初始化
			if (!themeStore.initialized) {
				themeStore.initTheme();
			}
		});

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
			uni.$emit('onPageShow', 'pages/settings/theme-config');
		});

		// 计算属性
		const themeConfig = computed(() => currentTheme.value);
		const presetThemes = computed(() => themeStore.presetThemes);



		// 显示颜色选择器
		const showColorPicker = (type) => {
			const currentColor = getThemeColor(type);

			uni.showModal({
				title: '输入颜色值',
				content: '请输入十六进制颜色值（如：#FF69B4）',
				editable: true,
				placeholderText: currentColor,
				success: (res) => {
					if (res.confirm && res.content) {
						const color = res.content.trim();
						if (themeUtils.isValidColor(color)) {
							themeStore.updateThemeColor(type, color);
							uni.showToast({
								title: '颜色已更新',
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: '颜色格式错误，请输入如 #FF69B4 格式',
								icon: 'error'
							});
						}
					}
				}
			});
		};

		// 判断是否为当前主题
		const isCurrentTheme = (preset) => {
			return preset.primaryColor === themeConfig.value.primaryColor &&
				   preset.secondaryColor === themeConfig.value.secondaryColor &&
				   preset.backgroundColor === themeConfig.value.backgroundColor;
		};

		// 应用预设主题
		const applyPresetTheme = (preset) => {
			themeStore.applyPresetTheme(preset);
			uni.showToast({
				title: `已应用${preset.name}主题`,
				icon: 'success'
			});
		};

		// 保存主题配置
		const saveThemeConfigData = async () => {
			saving.value = true;
			try {
				await themeStore.saveThemeToServer();
				uni.showToast({
					title: '主题保存成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('保存主题失败:', error);
				uni.showToast({
					title: '主题已保存到本地',
					icon: 'success'
				});
			} finally {
				saving.value = false;
			}
		};

		// 重置主题
		const resetTheme = () => {
			uni.showModal({
				title: '重置主题',
				content: '确定要重置为默认主题吗？',
				success: (res) => {
					if (res.confirm) {
						themeStore.resetToDefault();
						uni.showToast({
							title: '已重置为默认主题',
							icon: 'success'
						});
					}
				}
			});
		};

		return {
			saving,
			themeConfig,
			presetThemes,
			showColorPicker,
			isCurrentTheme,
			applyPresetTheme,
			resetTheme,
			saveThemeConfig: saveThemeConfigData,
			getButtonStyle,
			getHeaderStyle,
			getThemeColor
		};
	}
};
</script>

<style lang="scss" scoped>
.theme-config-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #FFF5F8 0%, #F0F8FF 100%);
}

.current-theme-preview {
	margin: 30rpx;
	padding: 30rpx;
	background: white;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.preview-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	text-align: center;
}

.preview-colors {
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.preview-color-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15rpx;
}

.color-circle {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	border: 3rpx solid #E0E0E0;
	box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.color-name {
	font-size: 24rpx;
	color: #666;
}

.config-section {
	margin: 30rpx;
	padding: 30rpx;
	background: white;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 25rpx;
}

.color-config {
	.color-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}
	}

	.color-label {
		font-size: 30rpx;
		color: #333;
	}

	.color-picker {
		display: flex;
		align-items: center;
		gap: 15rpx;
		cursor: pointer;
		padding: 10rpx;
		border-radius: 10rpx;
		transition: all 0.3s ease;

		&:active {
			background: #F8F9FA;
		}
	}

	.color-preview {
		width: 60rpx;
		height: 60rpx;
		border-radius: 30rpx;
		border: 2rpx solid #E0E0E0;
	}

	.color-value {
		font-size: 26rpx;
		color: #666;
		font-family: monospace;
	}
}

.preset-themes {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.preset-item {
	padding: 25rpx;
	border-radius: 15rpx;
	border: 2rpx solid #E0E0E0;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s ease;

	&.active {
		border-color: #FF69B4;
		background: #FFF5F8;
		box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.2);
	}

	&:active {
		transform: scale(0.95);
	}
}

.preset-colors {
	display: flex;
	justify-content: center;
	gap: 10rpx;
	margin-bottom: 15rpx;
}

.preset-color {
	width: 30rpx;
	height: 30rpx;
	border-radius: 15rpx;
	border: 1rpx solid #E0E0E0;
}

.preset-name {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.action-section {
	padding: 30rpx;
	display: flex;
	gap: 20rpx;
}

.reset-btn {
	flex: 1;
	height: 100rpx;
	background: #F5F5F5;
	color: #666;
	border: none;
	border-radius: 50rpx;
	font-size: 30rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&:active {
		background: #E0E0E0;
		transform: translateY(2rpx);
	}
}

.save-btn {
	flex: 2;
	height: 100rpx;
	border: none;
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&:active {
		transform: translateY(2rpx);
	}
}
</style>
