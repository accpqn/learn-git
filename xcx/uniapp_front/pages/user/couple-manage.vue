<template>
	<view class="container">
		<!-- 页面头部 -->
		<view class="header" :style="getHeaderStyle()">
			<text class="header-title">情侣管理</text>
			<text class="header-subtitle">管理你们的甜蜜关系</text>
		</view>

		<!-- 当前绑定状态 -->
		<view class="status-section">
			<view class="status-card" v-if="bindingInfo && bindingInfo.status === 'active'">
				<view class="status-header">
					<text class="status-icon">💕</text>
					<text class="status-title">已绑定情侣</text>
				</view>
				<view class="couple-info">
					<view class="partner-info">
						<image class="partner-avatar" :src="getPartnerAvatar()" mode="aspectFill"></image>
						<view class="partner-details">
							<text class="partner-name">{{ partnerName }}</text>
							<text class="partner-email">{{ partnerEmail }}</text>
							<text class="bind-time">绑定时间：{{ formatDate(bindingInfo.created_at) }}</text>
						</view>
					</view>
				</view>
				<view class="status-actions">
					<button class="action-btn info-btn" :style="getButtonStyle('outline')" @click="showPartnerInfo">
						查看详情
					</button>
					<button class="action-btn unbind-btn" :style="getButtonStyle('danger')" @click="confirmUnbind">
						解除绑定
					</button>
				</view>
			</view>

			<view class="status-card" v-else-if="bindingInfo && bindingInfo.status === 'pending'">
				<view class="status-header">
					<text class="status-icon">⏳</text>
					<text class="status-title">等待对方确认</text>
				</view>
				<view class="pending-info">
					<text class="pending-text">已向 {{ bindingInfo.receiver?.email || bindingInfo.requester?.email }} 发送绑定请求</text>
					<text class="pending-time">发送时间：{{ formatDate(bindingInfo.created_at) }}</text>
				</view>
				<view class="status-actions">
					<button class="action-btn cancel-btn" :style="getButtonStyle('outline')" @click="cancelRequest">
						取消请求
					</button>
				</view>
			</view>

			<view class="status-card" v-else>
				<view class="status-header">
					<text class="status-icon">💔</text>
					<text class="status-title">未绑定情侣</text>
				</view>
				<view class="unbind-info">
					<text class="unbind-text">还没有绑定情侣，快来找到你的另一半吧！</text>
				</view>
				<view class="status-actions">
					<button class="action-btn bind-btn" :style="getButtonStyle('primary')" @click="showBindDialog">
						绑定情侣
					</button>
				</view>
			</view>
		</view>

		<!-- 待处理请求 -->
		<view class="requests-section" v-if="pendingRequests.length > 0">
			<view class="section-title">
				<text class="title-text">待处理请求</text>
				<view class="title-badge" :style="getBadgeStyle('count')">{{ pendingRequests.length }}</view>
			</view>
			<view class="request-list">
				<view v-for="request in pendingRequests" :key="request.id" class="request-item">
					<view class="request-info">
						<image class="requester-avatar" :src="getRequesterAvatar(request)" mode="aspectFill"></image>
						<view class="request-details">
							<text class="requester-name">{{ request.requester.username }}</text>
							<text class="requester-email">{{ request.requester.email }}</text>
							<text class="request-time">{{ formatDate(request.created_at) }}</text>
						</view>
					</view>
					<view class="request-actions">
						<button class="mini-btn accept-btn" :style="getButtonStyle('primary')" @click="acceptRequest(request)">
							接受
						</button>
						<button class="mini-btn reject-btn" :style="getButtonStyle('outline')" @click="rejectRequest(request)">
							拒绝
						</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 历史记录 -->
		<view class="history-section">
			<view class="section-title">
				<text class="title-text">绑定历史</text>
			</view>
			<view class="history-list" v-if="bindingHistory.length > 0">
				<view v-for="record in bindingHistory" :key="record.id" class="history-item">
					<view class="history-info">
						<text class="history-partner">{{ getHistoryPartnerName(record) }}</text>
						<text class="history-period">{{ formatDateRange(record.created_at, record.deleted_at) }}</text>
						<text class="history-status" :class="getHistoryStatusClass(record)">
							{{ getHistoryStatusText(record) }}
						</text>
					</view>
				</view>
			</view>
			<view v-else class="empty-history">
				<text class="empty-text">暂无绑定历史</text>
			</view>
		</view>

		<!-- 绑定对话框 -->
		<view v-if="showBindModal" class="modal-overlay" @click="closeBindDialog">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">绑定情侣</text>
					<text class="modal-close" @click="closeBindDialog">×</text>
				</view>
				<view class="bind-form">
					<view class="form-item">
						<text class="form-label">对方邮箱</text>
						<input class="form-input" v-model="bindForm.email" placeholder="请输入对方的邮箱地址" />
					</view>
					<view class="form-item">
						<text class="form-label">绑定留言</text>
						<textarea class="form-textarea" v-model="bindForm.message" placeholder="写点什么给TA吧~（可选）" maxlength="100"></textarea>
					</view>
				</view>
				<view class="modal-actions">
					<button class="modal-btn cancel-btn" @click="closeBindDialog">取消</button>
					<button class="modal-btn confirm-btn" :style="getButtonStyle('primary')" @click="sendBindRequest">确认</button>
				</view>
			</view>
		</view>

		<!-- 详情对话框 -->
		<view v-if="showInfoModal" class="modal-overlay" @click="showInfoModal = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">情侣信息</text>
					<text class="modal-close" @click="showInfoModal = false">×</text>
				</view>
				<view class="info-content" v-if="bindingInfo">
					<view class="info-item">
						<text class="info-label">对方姓名：</text>
						<text class="info-value">{{ partnerName }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">邮箱地址：</text>
						<text class="info-value">{{ partnerEmail }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">绑定时间：</text>
						<text class="info-value">{{ formatDate(bindingInfo.created_at) }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">绑定天数：</text>
						<text class="info-value">{{ getBindingDays() }} 天</text>
					</view>
				</view>
				<view class="modal-actions">
					<button class="modal-btn confirm-btn" :style="getButtonStyle('primary')" @click="showInfoModal = false">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { useCoupleStore } from '@/store/couple';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/mixins/theme';
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

export default {
	setup() {
		const coupleStore = useCoupleStore();
		const userStore = useUserStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle, getBadgeStyle } = useTheme();

		// 响应式数据
		const showBindModal = ref(false);
		const showInfoModal = ref(false);
		const bindForm = ref({
			email: '',
			message: ''
		});

		// 计算属性
		const bindingInfo = computed(() => coupleStore.bindingInfo);
		const pendingRequests = computed(() => coupleStore.pendingRequests || []);
		const bindingHistory = computed(() => coupleStore.bindingHistory || []);
		const currentUser = computed(() => userStore.userInfo);

		const partnerName = computed(() => {
			if (!bindingInfo.value || bindingInfo.value.status !== 'active') return '';
			const currentUserId = currentUser.value?.id;
			if (!currentUserId) return '';

			if (bindingInfo.value.requester.id === currentUserId) {
				return bindingInfo.value.receiver.username;
			} else {
				return bindingInfo.value.requester.username;
			}
		});

		const partnerEmail = computed(() => {
			if (!bindingInfo.value || bindingInfo.value.status !== 'active') return '';
			const currentUserId = currentUser.value?.id;
			if (!currentUserId) return '';

			if (bindingInfo.value.requester.id === currentUserId) {
				return bindingInfo.value.receiver.email;
			} else {
				return bindingInfo.value.requester.email;
			}
		});

		// 生命周期
		onMounted(() => {
			loadCoupleData();
		});

		onShow(() => {
			loadCoupleData();
		});

		// 方法
		const loadCoupleData = async () => {
			try {
				await Promise.all([
					coupleStore.fetchBindingInfo(),
					coupleStore.fetchPendingRequests(),
					coupleStore.fetchBindingHistory()
				]);
			} catch (error) {
				console.error('加载情侣数据失败:', error);
			}
		};

		const showBindDialog = () => {
			bindForm.value = { email: '', message: '' };
			showBindModal.value = true;
		};

		const closeBindDialog = () => {
			showBindModal.value = false;
		};

		const sendBindRequest = async () => {
			if (!bindForm.value.email) {
				uni.showToast({
					title: '请输入对方邮箱',
					icon: 'none'
				});
				return;
			}

			try {
				const success = await coupleStore.sendBindingRequest(bindForm.value.email, bindForm.value.message);
				if (success) {
					uni.showToast({
						title: '绑定请求已发送',
						icon: 'success'
					});
					showBindModal.value = false;
					loadCoupleData();
				}
			} catch (error) {
				let errorMessage = error.message || '网络错误';
				// 优化错误信息显示
				if (errorMessage.includes('您已向该用户发起过绑定请求')) {
					errorMessage = '请等待对方回应，不要重复发送请求';
				} else if (errorMessage.includes('已经处于一个激活的绑定关系')) {
					errorMessage = '您或对方已有绑定关系';
				} else if (errorMessage.includes('该邮箱对应的用户不存在')) {
					errorMessage = '该邮箱用户不存在';
				}

				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				});
			}
		};

		const acceptRequest = async (request) => {
			try {
				const success = await coupleStore.acceptBindingRequest(request.id);
				if (success) {
					uni.showToast({
						title: '已接受绑定请求',
						icon: 'success'
					});
					loadCoupleData();
				}
			} catch (error) {
				uni.showToast({
					title: '操作失败: ' + (error.message || '网络错误'),
					icon: 'none'
				});
			}
		};

		const rejectRequest = async (request) => {
			uni.showModal({
				title: '拒绝绑定',
				content: `确定要拒绝来自 ${request.requester.username} 的绑定请求吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const success = await coupleStore.rejectBindingRequest(request.id);
							if (success) {
								uni.showToast({
									title: '已拒绝绑定请求',
									icon: 'success'
								});
								loadCoupleData();
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败: ' + (error.message || '网络错误'),
								icon: 'none'
							});
						}
					}
				}
			});
		};

		const cancelRequest = async () => {
			uni.showModal({
				title: '取消请求',
				content: '确定要取消绑定请求吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const success = await coupleStore.cancelBindingRequest();
							if (success) {
								uni.showToast({
									title: '已取消绑定请求',
									icon: 'success'
								});
								loadCoupleData();
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败: ' + (error.message || '网络错误'),
								icon: 'none'
							});
						}
					}
				}
			});
		};

		const confirmUnbind = () => {
			uni.showModal({
				title: '解除绑定',
				content: `确定要与 ${partnerName.value} 解除绑定吗？\n\n解绑后：\n• 历史数据将保留\n• 可以重新绑定其他用户\n• 对方也会收到解绑通知`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const success = await coupleStore.unbind();
							if (success) {
								uni.showToast({
									title: '已解除绑定',
									icon: 'success'
								});
								loadCoupleData();
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败: ' + (error.message || '网络错误'),
								icon: 'none'
							});
						}
					}
				}
			});
		};

		const showPartnerInfo = () => {
			showInfoModal.value = true;
		};

		// 工具方法
		const formatDate = (date) => {
			return dayjs(date).format('YYYY-MM-DD HH:mm');
		};

		const formatDateRange = (startDate, endDate) => {
			const start = dayjs(startDate).format('YYYY-MM-DD');
			const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : '至今';
			return `${start} ~ ${end}`;
		};

		const getBindingDays = () => {
			if (!bindingInfo.value?.created_at) return 0;
			return dayjs().diff(dayjs(bindingInfo.value.created_at), 'day');
		};

		const getPartnerAvatar = () => {
			// 获取对方头像的逻辑
			return '/static/images/default-avatar.png';
		};

		const getRequesterAvatar = (requestData) => {
			// 获取请求者头像的逻辑
			return '/static/images/default-avatar.png';
		};

		const getHistoryPartnerName = (record) => {
			const currentUserId = currentUser.value?.id;
			if (record.requester.id === currentUserId) {
				return record.receiver.username;
			} else {
				return record.requester.username;
			}
		};

		const getHistoryStatusText = (record) => {
			if (record.deleted_at || record.status === 'unbound') {
				return '已解绑';
			} else if (record.status === 'active') {
				return '已绑定';
			} else if (record.status === 'requesting') {
				return '等待回应';
			} else if (record.status === 'rejected') {
				return '已拒绝';
			} else {
				return '未知状态';
			}
		};

		const getHistoryStatusClass = (record) => {
			if (record.deleted_at || record.status === 'unbound') {
				return 'status-unbound';
			} else if (record.status === 'active') {
				return 'status-active';
			} else if (record.status === 'requesting') {
				return 'status-requesting';
			} else if (record.status === 'rejected') {
				return 'status-rejected';
			} else {
				return 'status-unknown';
			}
		};

		return {
			// 数据
			showBindModal,
			showInfoModal,
			bindForm,
			bindingInfo,
			pendingRequests,
			bindingHistory,
			partnerName,
			partnerEmail,
			
			// 方法
			showBindDialog,
			closeBindDialog,
			sendBindRequest,
			acceptRequest,
			rejectRequest,
			cancelRequest,
			confirmUnbind,
			showPartnerInfo,
			formatDate,
			formatDateRange,
			getBindingDays,
			getPartnerAvatar,
			getRequesterAvatar,
			getHistoryPartnerName,
			getHistoryStatusText,
			getHistoryStatusClass,
			
			// 主题
			currentTheme,
			getThemeColor,
			getButtonStyle,
			getHeaderStyle,
			getBadgeStyle
		};
	}
};
</script>

<style lang="scss" scoped>
.container {
	background: #f8f9fa;
	min-height: 100vh;
}

.header {
	padding: 40rpx 30rpx;
	color: white;
	text-align: center;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.header-subtitle {
	font-size: 24rpx;
	opacity: 0.9;
	display: block;
}

.status-section {
	padding: 30rpx;
}

.status-card {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.status-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.status-icon {
	font-size: 48rpx;
	margin-right: 20rpx;
}

.status-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.couple-info {
	margin-bottom: 30rpx;
}

.partner-info {
	display: flex;
	align-items: center;
}

.partner-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50rpx;
	margin-right: 30rpx;
	border: 4rpx solid var(--theme-primary, #FF69B4);
}

.partner-details {
	flex: 1;
}

.partner-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.partner-email {
	font-size: 26rpx;
	color: #666;
	display: block;
	margin-bottom: 10rpx;
}

.bind-time {
	font-size: 24rpx;
	color: #999;
	display: block;
}

.pending-info, .unbind-info {
	margin-bottom: 30rpx;
	text-align: center;
}

.pending-text, .unbind-text {
	font-size: 28rpx;
	color: #666;
	display: block;
	margin-bottom: 10rpx;
}

.pending-time {
	font-size: 24rpx;
	color: #999;
	display: block;
}

.status-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;

	&::after {
		border: none;
	}
}

.requests-section, .history-section {
	padding: 0 30rpx 30rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.title-text {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-right: 15rpx;
}

.title-badge {
	min-width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	color: white;
	font-weight: bold;
}

.request-list, .history-list {
	background: white;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.request-item, .history-item {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
}

.request-info {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.requester-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	margin-right: 20rpx;
}

.request-details {
	flex: 1;
}

.requester-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.requester-email {
	font-size: 24rpx;
	color: #666;
	display: block;
	margin-bottom: 8rpx;
}

.request-time {
	font-size: 22rpx;
	color: #999;
	display: block;
}

.request-actions {
	display: flex;
	gap: 15rpx;
}

.mini-btn {
	height: 60rpx;
	padding: 0 30rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	border: none;

	&::after {
		border: none;
	}
}

.history-info {
	display: flex;
	flex-direction: column;
}

.history-partner {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.history-period {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.history-status {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	align-self: flex-start;

	&.status-active {
		background: #d4edda;
		color: #155724;
	}

	&.status-unbound {
		background: #f8d7da;
		color: #721c24;
	}

	&.status-requesting {
		background: #fff3cd;
		color: #856404;
	}

	&.status-rejected {
		background: #f5f5f5;
		color: #999;
	}

	&.status-unknown {
		background: #e2e3e5;
		color: #6c757d;
	}
}

.empty-history {
	background: white;
	border-radius: 20rpx;
	padding: 80rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.bind-form {
	padding: 20rpx 0;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 15rpx;
}

.form-input, .form-textarea {
	width: 100%;
	padding: 20rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 10rpx;
	font-size: 26rpx;
	background: #f8f9fa;

	&:focus {
		border-color: var(--theme-primary, #FF69B4);
		background: white;
	}
}

.form-textarea {
	height: 120rpx;
	resize: none;
}

.info-content {
	padding: 20rpx 0;
}

.info-item {
	display: flex;
	margin-bottom: 20rpx;
}

.info-label {
	font-size: 26rpx;
	color: #666;
	width: 160rpx;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	flex: 1;
}

// 模态框样式
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: white;
	border-radius: 20rpx;
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.modal-close {
	font-size: 40rpx;
	color: #999;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 30rpx;

	&:active {
		background: #f0f0f0;
	}
}

.modal-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	border: none;

	&::after {
		border: none;
	}

	&.cancel-btn {
		background: #f5f5f5;
		color: #666;
	}
}
</style>
