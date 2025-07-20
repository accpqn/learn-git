<template>
	<view class="container">
		<view v-if="orderStore.status === 'loading'">
			<u-loading-page loading-text="正在加载订单详情..."></u-loading-page>
		</view>
		<view v-else-if="orderStore.currentOrderDetail">
			<!-- 订单头部信息 -->
			<view class="order-header">
				<view class="header-info">
					<view class="order-title-section">
						<text class="order-number">订单 #{{ orderStore.currentOrderDetail.id }}</text>
						<text class="order-type">{{ orderStore.currentOrderDetail.type === 'sent' ? '发给TA的订单' : '来自TA的订单' }}</text>
					</view>
					<text class="order-status" :class="getStatusClass(orderStore.currentOrderDetail.status)">
						{{ getStatusText(orderStore.currentOrderDetail.status) }}
					</text>
				</view>
				<view class="order-meta">
					<view class="meta-item">
						<text class="meta-label">创建时间</text>
						<text class="meta-value">{{ formatDate(orderStore.currentOrderDetail.created_at || orderStore.currentOrderDetail.createTime) }}</text>
					</view>
					<view class="meta-item">
						<text class="meta-label">创建人</text>
						<text class="meta-value">{{ orderStore.currentOrderDetail.creator_username || '未知' }}</text>
					</view>
					<view class="meta-item">
						<text class="meta-label">订单总额</text>
						<text class="meta-value total-price">¥{{ orderStore.currentOrderDetail.total_price || orderStore.currentOrderDetail.totalPrice }}</text>
					</view>
				</view>
				<view v-if="orderStore.currentOrderDetail.notes || orderStore.currentOrderDetail.note" class="order-note">
					<text class="note-label">订单备注</text>
					<text class="note-content">{{ orderStore.currentOrderDetail.notes || orderStore.currentOrderDetail.note }}</text>
				</view>
			</view>

			<!-- 商品列表 -->
			<view class="products-section">
				<view class="section-title">
					<text class="title-text">商品详情</text>
					<text class="item-count">共{{ orderStore.currentOrderDetail.items.length }}件商品</text>
				</view>
				<view v-for="(item, index) in orderStore.currentOrderDetail.items" :key="index" class="product-item">
					<image
						class="product-image"
						:src="getProductImageUrl(item.product || item.item)"
						mode="aspectFill"
					></image>
					<view class="product-info">
						<text class="product-name">{{ (item.product || item.item).name }}</text>
						<text class="product-desc">{{ (item.product || item.item).description }}</text>
						<view class="product-price-info">
							<view class="price-row">
								<text class="price-label">单价：</text>
								<text class="price-value">¥{{ item.price || (item.product || item.item).price }}</text>
							</view>
							<view class="quantity-row">
								<text class="quantity-label">数量：</text>
								<text class="quantity-value">{{ item.quantity }}</text>
							</view>
							<view class="total-row">
								<text class="total-label">小计：</text>
								<text class="total-value">¥{{ ((item.price || (item.product || item.item).price) * item.quantity).toFixed(2) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 订单操作 -->
			<view v-if="showOrderActions" class="order-actions">
				<view class="actions-title">订单操作</view>
				<view class="actions-buttons">
					<button
						v-if="orderStore.currentOrderDetail.type === 'received' && orderStore.currentOrderDetail.status === 'PENDING'"
						class="action-btn primary"
						@click="acceptOrder"
						:disabled="accepting"
					>
						{{ accepting ? '处理中...' : '接受订单' }}
					</button>
					<button
						v-if="canUpdateStatus"
						class="action-btn secondary"
						@click="showStatusOptions"
					>
						更新状态
					</button>
				</view>
			</view>
		</view>
		<view v-else class="empty-state">
			<u-empty text="订单不存在" mode="data"></u-empty>
		</view>
	</view>
</template>

<script>
import { useOrderStore } from '@/store/order';
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { getProductImageUrl as getImageUrl } from '@/config/index';
import { updateOrderStatus } from '@/api/order';

export default {
	setup() {
		const orderStore = useOrderStore();
		const accepting = ref(false);

		onLoad((options) => {
			if (options.id) {
				console.log('Loading order detail for ID:', options.id);
				orderStore.fetchOrderDetail(options.id);
			}
		});

		// 使用配置文件中的图片URL处理方法
		const getProductImageUrl = getImageUrl;

		// 计算属性
		const showOrderActions = computed(() => {
			const order = orderStore.currentOrderDetail;
			if (!order) return false;

			// 收到的待处理订单可以接受
			if (order.type === 'received' && order.status === 'PENDING') return true;

			// 其他可操作的状态
			return ['PENDING', 'CONFIRMED', 'ORDERED'].includes(order.status);
		});

		const canUpdateStatus = computed(() => {
			const order = orderStore.currentOrderDetail;
			return order && ['PENDING', 'CONFIRMED', 'ORDERED'].includes(order.status);
		});

		const formatDate = (date) => {
			if (!date) return '未知';
			return dayjs(date).format('YYYY-MM-DD HH:mm');
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

		const acceptOrder = async () => {
			accepting.value = true;
			try {
				console.log('Accepting order:', orderStore.currentOrderDetail.id);

				// 调用后端API更新订单状态
				await updateOrderStatus(orderStore.currentOrderDetail.id, { status: 'CONFIRMED' });

				// 更新本地状态
				orderStore.currentOrderDetail.status = 'CONFIRMED';

				// 更新对应的订单列表
				const orderIndex = orderStore.receivedOrders.findIndex(o => o.id === orderStore.currentOrderDetail.id);
				if (orderIndex !== -1) {
					orderStore.receivedOrders[orderIndex].status = 'CONFIRMED';
				}

				orderStore.saveOrdersToLocal();

				uni.showToast({
					title: '订单已接受',
					icon: 'success'
				});
			} catch (error) {
				console.error('Accept order failed:', error);
				uni.showToast({
					title: '接受失败: ' + (error.message || '网络错误'),
					icon: 'none'
				});
			} finally {
				accepting.value = false;
			}
		};

		const showStatusOptions = () => {
			const statusOptions = [
				{ text: '已确认', value: 'CONFIRMED' },
				{ text: '已下单', value: 'ORDERED' },
				{ text: '已完成', value: 'COMPLETED' },
				{ text: '取消订单', value: 'CANCELLED' }
			];

			uni.showActionSheet({
				itemList: statusOptions.map(item => item.text),
				success: (res) => {
					const selectedStatus = statusOptions[res.tapIndex];
					updateOrderStatusLocal(selectedStatus.value);
				}
			});
		};

		const updateOrderStatusLocal = async (newStatus) => {
			try {
				console.log('Updating order status to:', newStatus);

				// 调用后端API更新订单状态
				await updateOrderStatus(orderStore.currentOrderDetail.id, { status: newStatus });

				// 更新本地状态
				orderStore.currentOrderDetail.status = newStatus;

				// 更新对应的订单列表
				const sentIndex = orderStore.sentOrders.findIndex(o => o.id === orderStore.currentOrderDetail.id);
				const receivedIndex = orderStore.receivedOrders.findIndex(o => o.id === orderStore.currentOrderDetail.id);

				if (sentIndex !== -1) {
					orderStore.sentOrders[sentIndex].status = newStatus;
				}
				if (receivedIndex !== -1) {
					orderStore.receivedOrders[receivedIndex].status = newStatus;
				}

				orderStore.saveOrdersToLocal();

				uni.showToast({
					title: '状态更新成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('Update status failed:', error);
				uni.showToast({
					title: '更新失败: ' + (error.message || '网络错误'),
					icon: 'none'
				});
			}
		};

		return {
			orderStore,
			accepting,
			showOrderActions,
			canUpdateStatus,
			formatDate,
			getStatusText,
			getStatusClass,
			getProductImageUrl,
			acceptOrder,
			showStatusOptions,
			updateOrderStatusLocal
		};
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	padding-bottom: 200rpx;
}

.order-header {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.header-info {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 30rpx;
}

.order-title-section {
	flex: 1;
}

.order-number {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.order-type {
	font-size: 26rpx;
	color: #666;
	display: block;
}

.order-status {
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	white-space: nowrap;

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

.order-meta {
	margin-bottom: 20rpx;
}

.meta-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
}

.meta-label {
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
}

.meta-value {
	font-size: 28rpx;
	color: #333;

	&.total-price {
		font-weight: bold;
		color: #fa3534;
		font-size: 32rpx;
	}
}

.order-note {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	border-left: 4rpx solid #FF69B4;
}

.note-label {
	font-size: 26rpx;
	color: #666;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.note-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
}

.products-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.section-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.item-count {
	font-size: 24rpx;
	color: #999;
	background: #f5f5f5;
	padding: 6rpx 12rpx;
	border-radius: 12rpx;
}

.product-item {
	display: flex;
	padding: 25rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}
}

.product-image {
	flex-shrink: 0;
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	background: #f5f5f5;
}

.product-info {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
}

.product-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.product-desc {
	font-size: 24rpx;
	color: #909399;
	margin-bottom: 15rpx;
	line-height: 1.4;
}

.product-price-info {
	margin-top: auto;
}

.price-row, .quantity-row, .total-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.price-label, .quantity-label, .total-label {
	font-size: 24rpx;
	color: #666;
}

.price-value, .quantity-value {
	font-size: 24rpx;
	color: #333;
}

.total-value {
	font-size: 26rpx;
	font-weight: bold;
	color: #fa3534;
}

.order-actions {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.actions-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.actions-buttons {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border: none;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&.primary {
		background: linear-gradient(135deg, #FF69B4, #FF1493);
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

	&.secondary {
		background: #f8f9fa;
		color: #666;
		border: 1rpx solid #e0e0e0;

		&:active {
			background: #e9ecef;
		}
	}
}

.empty-state {
	padding: 200rpx 0;
	text-align: center;
}
</style>