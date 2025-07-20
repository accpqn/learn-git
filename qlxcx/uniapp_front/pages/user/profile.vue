<template>
	<view class="container">
		<!-- 头像部分 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="changeAvatar">
				<image 
					class="avatar-image" 
					:src="getUserAvatarUrl()" 
					mode="aspectFill"
				></image>
				<view class="avatar-overlay">
					<text class="camera-icon">📷</text>
					<text class="change-text">更换头像</text>
				</view>
			</view>
		</view>

		<!-- 表单部分 -->
		<view class="form-section">
			<view class="form-group">
				<text class="form-label">用户名</text>
				<input 
					class="form-input" 
					v-model="formData.username" 
					placeholder="请输入用户名"
					maxlength="20"
				/>
			</view>

			<view class="form-group">
				<text class="form-label">邮箱</text>
				<input 
					class="form-input" 
					v-model="formData.email" 
					placeholder="请输入邮箱地址"
					type="email"
				/>
			</view>

			<view class="form-group">
				<text class="form-label">个人简介</text>
				<textarea
					class="form-textarea"
					v-model="formData.bio"
					placeholder="介绍一下自己吧~"
					maxlength="100"
				></textarea>
				<text class="char-count">{{ formData.bio.length }}/100</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="save-btn" @click="saveProfile" :disabled="saving">
				<text class="btn-text">{{ saving ? '保存中...' : '保存修改' }}</text>
			</button>
			<button class="cancel-btn" @click="goBack">
				<text class="btn-text">取消</text>
			</button>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/store/user';
import { useTheme } from '@/mixins/theme';
import { useThemeStore } from '@/store/theme';
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

export default {
	setup() {
		const userStore = useUserStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const saving = ref(false);

		// 表单数据
		const formData = ref({
			username: '',
			email: '',
			bio: ''
		});

		// 计算属性
		const userInfo = computed(() => userStore.userInfo);

		// 获取用户头像URL
		const getUserAvatarUrl = () => {
			if (userInfo.value?.avatar_url) {
				if (userInfo.value.avatar_url.startsWith('http')) {
					return userInfo.value.avatar_url;
				}
				return `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${userInfo.value.avatar_url}`;
			}
			return '/static/images/default-avatar.png';
		};

		// 初始化表单数据
		const initFormData = () => {
			if (userInfo.value) {
				formData.value = {
					username: userInfo.value.username || '',
					email: userInfo.value.email || '',
					bio: userInfo.value.bio || ''
				};
			}
		};

		onMounted(() => {
			initFormData();
		});

		// 页面显示时设置导航栏主题
		onShow(() => {
			try {
				const themeStore = useThemeStore();
				uni.setNavigationBarColor({
					frontColor: '#ffffff',
					backgroundColor: themeStore.currentTheme.primaryColor,
					animation: {
						duration: 300,
						timingFunc: 'easeIn'
					}
				});
			} catch (error) {
				console.log('设置导航栏主题失败:', error);
			}
		});

		// 更换头像
		const changeAvatar = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const tempFilePath = res.tempFilePaths[0];
					console.log('选择的头像:', tempFilePath);

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

		// 保存个人信息
		const saveProfile = async () => {
			// 表单验证
			if (!formData.value.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				});
				return;
			}

			if (!formData.value.email.trim()) {
				uni.showToast({
					title: '请输入邮箱地址',
					icon: 'none'
				});
				return;
			}

			// 邮箱格式验证
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.value.email)) {
				uni.showToast({
					title: '邮箱格式不正确',
					icon: 'none'
				});
				return;
			}

			saving.value = true;

			try {
				// 调用API更新用户信息
				console.log('保存用户信息:', formData.value);

				const { updateUserProfile } = await import('@/api/user');
				const result = await updateUserProfile(formData.value);

				console.log('用户信息更新成功:', result);

				// 更新本地用户信息
				userStore.userInfo = {
					...userStore.userInfo,
					...result
				};
				userStore.saveUserToLocal();

				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});

				// 延迟返回
				setTimeout(() => {
					goBack();
				}, 1500);

			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({
					title: '保存失败: ' + (error.message || '网络错误'),
					icon: 'none'
				});
			} finally {
				saving.value = false;
			}
		};

		// 返回上一页
		const goBack = () => {
			uni.navigateBack();
		};

		return {
			formData,
			saving,
			getUserAvatarUrl,
			changeAvatar,
			saveProfile,
			goBack,
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
	min-height: 100vh;
	background: #f8f9fa;
}

.avatar-section {
	padding: 60rpx 0;
	display: flex;
	justify-content: center;
	background: white;
	margin-bottom: 30rpx;
}

.avatar-container {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	
	&:active {
		opacity: 0.8;
	}
}

.avatar-image {
	width: 200rpx;
	height: 200rpx;
	border-radius: 100rpx;
	border: 6rpx solid var(--theme-primary, #FF69B4);
}

.avatar-overlay {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 60rpx;
	height: 60rpx;
	background: var(--theme-primary, #FF69B4);
	border-radius: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 4rpx solid white;
}

.camera-icon {
	font-size: 20rpx;
	color: white;
}

.change-text {
	font-size: 16rpx;
	color: white;
	margin-top: 2rpx;
}

.form-section {
	background: white;
	border-radius: 20rpx;
	margin: 0 30rpx 30rpx;
	padding: 40rpx 30rpx;
}

.form-group {
	margin-bottom: 40rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.form-label {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 15rpx;
}

.form-input {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background: #fafafa;
	
	&:focus {
		border-color: var(--theme-primary, #FF69B4);
		background: white;
	}
}

.form-textarea {
	width: 100%;
	min-height: 120rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 20rpx;
	font-size: 28rpx;
	background: #fafafa;
	
	&:focus {
		border-color: var(--theme-primary, #FF69B4);
		background: white;
	}
}

.char-count {
	font-size: 22rpx;
	color: #999;
	text-align: right;
	display: block;
	margin-top: 10rpx;
}

.action-section {
	padding: 0 30rpx 60rpx;
}

.save-btn, .cancel-btn {
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
}

.save-btn {
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
	color: white;
	box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.3);
	
	&:disabled {
		background: #CCC;
		box-shadow: none;
	}
	
	&:not(:disabled):active {
		transform: translateY(2rpx);
	}
}

.cancel-btn {
	background: #f8f9fa;
	color: #666;
	border: 2rpx solid #e0e0e0;
	
	&:active {
		background: #e9ecef;
	}
}

.btn-text {
	display: block;
}
</style>
