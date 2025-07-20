<template>
	<view class="confirm-container">
		<view class="header-section">
			<text class="subtitle">请确认您要发送给TA的订单</text>
		</view>

		<view class="order-section">
			<view class="section-title">订单详情</view>
			<view class="order-list">
				<view v-for="(item, index) in cartItems" :key="index" class="order-item">
					<image class="item-image" :src="getProductImageUrl(item.item)" mode="aspectFill"></image>
					<view class="item-info">
						<text class="item-name">{{ item.item.name }}</text>
						<text class="item-desc">{{ item.item.description }}</text>
						<view class="item-bottom">
							<text class="item-price">¥{{ item.item.price }}</text>
							<text class="item-quantity">x{{ item.quantity }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="total-section">
			<view class="total-row final">
				<text class="total-label">订单总额</text>
				<text class="total-value">¥{{ cartStore.totalPrice }}</text>
			</view>
		</view>

		<view class="note-section">
			<view class="section-title">订单备注</view>
			<textarea
				v-model="orderNote"
				placeholder="给TA留个小纸条吧~"
				maxlength="100"
				class="note-textarea"
				auto-height
			></textarea>
			<view class="char-count">{{ orderNote.length }}/100</view>
		</view>

		<view class="bottom-bar">
			<view class="price-info">
				<text class="total-text">总计：¥{{ cartStore.totalPrice }}</text>
			</view>
			<button
				class="submit-btn"
				@click="submitOrder"
				:disabled="submitting || cartItems.length === 0"
			>
				{{ submitting ? '发送中...' : '发送订单' }}
			</button>
		</view>
	</view>
</template>

<script>
import { useCartStore } from '@/store/cart';
import { useOrderStore } from '@/store/order';
import { computed, ref } from 'vue';
import { getProductImageUrl as getImageUrl } from '@/config/index';
import { createOrder } from '@/api/order';

export default {
	setup() {
		const cartStore = useCartStore();
		const orderStore = useOrderStore();

		const orderNote = ref('');
		const submitting = ref(false);

		const cartItems = computed(() => {
			return Object.values(cartStore.items);
		});

		// 使用配置文件中的图片URL处理方法
		const getProductImageUrl = getImageUrl;

		const submitOrder = async () => {
			if (cartItems.value.length === 0) {
				uni.showToast({
					title: '购物车为空',
					icon: 'none'
				});
				return;
			}

			submitting.value = true;

			try {
				console.log('购物车原始数据:', cartItems.value);

				// 检查每个购物车项的数据结构
				cartItems.value.forEach((item, index) => {
					console.log(`购物车项 ${index}:`, item);
					console.log(`- item.item:`, item.item);
					console.log(`- item.item.id:`, item.item?.id);
					console.log(`- item.quantity:`, item.quantity);
				});

				const orderData = {
					notes: orderNote.value.trim(),
					items: cartItems.value.map(item => {
						if (!item.item || !item.item.id) {
							console.error('购物车项数据异常:', item);
							throw new Error('购物车数据异常，请重新添加商品');
						}
						return {
							product: item.item.id,
							quantity: item.quantity
						};
					})
				};

				console.log('提交订单数据:', orderData);

				// 使用OrderStore创建订单，它会处理API调用和数据同步
				const result = await orderStore.createOrder(orderData);
				console.log('订单创建结果:', result);

				// 清空购物车
				cartStore.clearCart();

				uni.showToast({
					title: '订单发送成功',
					icon: 'success'
				});

				// 跳转到订单列表并刷新数据
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/order/list'
					});
				}, 1500);

			} catch (error) {
				console.error('提交订单失败:', error);
				uni.showToast({
					title: '发送失败: ' + (error.message || '未知错误'),
					icon: 'none'
				});
			} finally {
				submitting.value = false;
			}
		};

		return {
			cartStore,
			cartItems,
			orderNote,
			submitting,
			getProductImageUrl,
			submitOrder
		};
	}
}
</script>

<style lang="scss">
.confirm-container {
	padding: 20rpx;
	padding-bottom: 200rpx;
}

.header-section {
	text-align: center;
	margin-bottom: 40rpx;
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		display: block;
	}
	
	.subtitle {
		font-size: 28rpx;
		color: #909399;
		margin-top: 10rpx;
		display: block;
	}
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.order-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.order-item {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
}

.item-image {
	flex-shrink: 0;
	border-radius: 10rpx;
	width: 120rpx;
	height: 120rpx;
}

.item-info {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
}

.item-name {
	font-size: 30rpx;
	font-weight: bold;
}

.item-desc {
	font-size: 24rpx;
	color: #909399;
	margin: 10rpx 0;
}

.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
}

.item-price {
	font-size: 28rpx;
	color: #fa3534;
	font-weight: bold;
}

.item-quantity {
	font-size: 28rpx;
	color: #909399;
}

.total-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.total-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10rpx 0;
	
	&.final {
		border-top: 1rpx solid #f0f0f0;
		margin-top: 20rpx;
		padding-top: 20rpx;
		font-weight: bold;
		font-size: 32rpx;
	}
}

.total-label {
	font-size: 28rpx;
}

.total-value {
	font-size: 28rpx;
	color: #fa3534;
}

.note-section {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
}

.note-textarea {
	width: 100%;
	min-height: 120rpx;
	padding: 20rpx;
	border: 1rpx solid #E0E0E0;
	border-radius: 10rpx;
	font-size: 28rpx;
	line-height: 1.5;
	background: #F8F9FA;

	&:focus {
		border-color: #FF69B4;
		background: #FFF;
	}
}

.char-count {
	text-align: right;
	font-size: 24rpx;
	color: #909399;
	margin-top: 10rpx;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 120rpx;
	background: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
}

.price-info {
	flex: 1;
}

.total-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #fa3534;
}

.submit-btn {
	background: linear-gradient(135deg, #FF69B4, #FF1493);
	color: white;
	border: none;
	border-radius: 50rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.3);

	&::after {
		border: none;
	}

	&:disabled {
		background: #CCC;
		box-shadow: none;
	}

	&:not(:disabled):active {
		transform: translateY(2rpx);
	}
}
</style>
