<template>
	<view class="color-picker-container">
		<!-- 颜色选择器弹窗 -->
		<uni-popup ref="colorPopup" type="bottom" :safe-area="false">
			<view class="color-picker-popup">
				<view class="popup-header">
					<text class="popup-title">选择颜色</text>
					<text class="popup-close" @click="closePopup">×</text>
				</view>
				
				<!-- 当前选中颜色预览 -->
				<view class="current-color-preview">
					<view class="color-preview-large" :style="{ backgroundColor: selectedColor }"></view>
					<text class="color-value">{{ selectedColor }}</text>
				</view>
				
				<!-- 预设颜色 -->
				<view class="preset-colors-section">
					<text class="section-title">预设颜色</text>
					<view class="preset-colors-grid">
						<view v-for="(color, index) in presetColors" :key="index"
							  class="preset-color-item"
							  :class="{ active: selectedColor === color }"
							  :style="{ backgroundColor: color }"
							  @click="selectColor(color)">
						</view>
					</view>
				</view>
				
				<!-- 自定义颜色输入 -->
				<view class="custom-color-section">
					<text class="section-title">自定义颜色</text>
					<view class="color-input-group">
						<input class="color-input" 
							   v-model="customColor" 
							   placeholder="#FF69B4"
							   @input="onCustomColorInput" />
						<button class="apply-btn" @click="applyCustomColor">应用</button>
					</view>
				</view>
				
				<!-- 操作按钮 -->
				<view class="popup-actions">
					<button class="action-btn cancel-btn" @click="closePopup">取消</button>
					<button class="action-btn confirm-btn" @click="confirmColor">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { ref, watch } from 'vue';
import { themeUtils } from '@/mixins/theme';

export default {
	name: 'ColorPicker',
	props: {
		// 当前颜色值
		modelValue: {
			type: String,
			default: '#FF69B4'
		},
		// 预设颜色列表
		presetColors: {
			type: Array,
			default: () => [
				'#FF69B4', '#FF1493', '#DC143C', '#B22222',
				'#FF4500', '#FF8C00', '#FFD700', '#ADFF2F',
				'#32CD32', '#00FA9A', '#00CED1', '#1E90FF',
				'#4169E1', '#8A2BE2', '#9932CC', '#FF00FF',
				'#2C3E50', '#34495E', '#E67E22', '#F39C12'
			]
		}
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const colorPopup = ref(null);
		const selectedColor = ref(props.modelValue);
		const customColor = ref('');

		// 监听外部颜色变化
		watch(() => props.modelValue, (newValue) => {
			selectedColor.value = newValue;
		});

		// 打开颜色选择器
		const openPicker = () => {
			selectedColor.value = props.modelValue;
			customColor.value = props.modelValue;
			colorPopup.value?.open();
		};

		// 关闭颜色选择器
		const closePopup = () => {
			colorPopup.value?.close();
		};

		// 选择预设颜色
		const selectColor = (color) => {
			selectedColor.value = color;
			customColor.value = color;
		};

		// 自定义颜色输入
		const onCustomColorInput = (e) => {
			const value = e.detail.value;
			customColor.value = value;
			
			// 实时验证和预览
			if (themeUtils.isValidColor(value)) {
				selectedColor.value = value;
			}
		};

		// 应用自定义颜色
		const applyCustomColor = () => {
			if (themeUtils.isValidColor(customColor.value)) {
				selectedColor.value = customColor.value;
				uni.showToast({
					title: '颜色已应用',
					icon: 'success'
				});
			} else {
				uni.showToast({
					title: '颜色格式错误',
					icon: 'error'
				});
			}
		};

		// 确认颜色选择
		const confirmColor = () => {
			emit('update:modelValue', selectedColor.value);
			emit('change', selectedColor.value);
			closePopup();
		};

		return {
			colorPopup,
			selectedColor,
			customColor,
			openPicker,
			closePopup,
			selectColor,
			onCustomColorInput,
			applyCustomColor,
			confirmColor
		};
	}
};
</script>

<style lang="scss" scoped>
.color-picker-popup {
	background: white;
	border-radius: 20rpx 20rpx 0 0;
	padding: 40rpx 30rpx;
	max-height: 80vh;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #E0E0E0;
}

.popup-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.popup-close {
	font-size: 50rpx;
	color: #999;
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.current-color-preview {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 40rpx;
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 15rpx;
}

.color-preview-large {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	border: 3rpx solid #E0E0E0;
	box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.color-value {
	font-size: 28rpx;
	color: #333;
	font-family: monospace;
	font-weight: bold;
}

.preset-colors-section, .custom-color-section {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.preset-colors-grid {
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 15rpx;
}

.preset-color-item {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	border: 2rpx solid #E0E0E0;
	cursor: pointer;
	transition: all 0.3s ease;
	position: relative;

	&.active {
		border-color: #333;
		transform: scale(1.1);
		box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.2);
		
		&::after {
			content: '✓';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: white;
			font-size: 24rpx;
			font-weight: bold;
			text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.5);
		}
	}

	&:active {
		transform: scale(0.95);
	}
}

.color-input-group {
	display: flex;
	gap: 20rpx;
	align-items: center;
}

.color-input {
	flex: 1;
	height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid #E0E0E0;
	border-radius: 15rpx;
	font-size: 28rpx;
	background: white;

	&:focus {
		border-color: #FF69B4;
		outline: none;
	}
}

.apply-btn {
	height: 80rpx;
	padding: 0 30rpx;
	background: #FF69B4;
	color: white;
	border: none;
	border-radius: 15rpx;
	font-size: 26rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&:active {
		background: #FF1493;
	}
}

.popup-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 40rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border: none;
	border-radius: 15rpx;
	font-size: 30rpx;
	font-weight: bold;

	&::after {
		border: none;
	}
}

.cancel-btn {
	background: #F5F5F5;
	color: #666;

	&:active {
		background: #E0E0E0;
	}
}

.confirm-btn {
	background: linear-gradient(135deg, #FF69B4, #FF1493);
	color: white;

	&:active {
		opacity: 0.8;
	}
}
</style>
