<template>
	<view class="ordering-container">
		<!-- 顶部工具栏 -->
		<view class="header-toolbar" :style="getHeaderStyle()">
			<view class="toolbar-left">
				<text class="page-title">为TA点餐</text>
				<text class="page-subtitle">{{ getGreeting() }}</text>
			</view>
			<view class="toolbar-right">
				<view class="login-status">
					<text class="status-text">{{ isLoggedIn ? '真实数据' : '模拟数据' }}</text>
					<text v-if="!isLoggedIn" class="login-hint" @click="goToLogin">点击登录</text>
				</view>
			</view>
		</view>

		<view class="content-wrapper">
			<!-- 左侧分类 -->
			<view class="sidebar-wrapper">
				<scroll-view scroll-y class="category-scroll">
					<view
						v-for="(category, index) in menuStore.categories"
						:key="category.id"
						:class="['category-item', { active: category.id === menuStore.currentCategoryId }]"
						@click="handleCategoryChange(category.id)"
					>
						<text class="category-name">{{ category.name }}</text>
						<view v-if="getCategoryProductCount(category.id) > 0" class="product-count">
							{{ getCategoryProductCount(category.id) }}
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 右侧商品 -->
			<scroll-view scroll-y class="product-scroll-view">
				<view v-if="menuStore.status === 'loading'" class="loading-container">
					<u-loading-icon text="正在加载菜单..." size="24"></u-loading-icon>
				</view>
				<view v-else-if="menuStore.status === 'error'" class="error-container">
					<u-empty text="加载失败" mode="error">
						<template #bottom>
							<u-button text="重新加载" type="primary" size="small" @click="reloadMenu"></u-button>
						</template>
					</u-empty>
				</view>
				<view v-else class="product-list">
					<view class="category-header">
						<text class="category-title">{{ currentCategoryName }}</text>
						<text class="category-desc">{{ currentCategoryDesc }}</text>
					</view>

					<view v-if="menuStore.currentProducts.length === 0" class="empty-category">
						<u-empty text="该分类暂无商品" mode="data"></u-empty>
					</view>

					<view v-else class="products-list">
						<view
							v-for="product in menuStore.currentProducts"
							:key="product.id"
							class="product-card"
						>
							<view class="product-left" @click="showProductDetail(product)">
								<image
									class="product-image"
									:src="getProductImageUrl(product)"
									mode="aspectFill"
								></image>
							</view>
							<view class="product-right">
								<view class="product-info" @click="showProductDetail(product)">
									<text class="product-name">{{ product.name }}</text>
									<text class="product-desc">{{ product.description }}</text>
									<text class="product-price">¥{{ product.price }}</text>
								</view>
								<view class="product-actions">
									<view v-if="cartStore.getItemQuantity(product.id) > 0" class="quantity-controls">
										<button class="quantity-btn minus" @click="decreaseProductQuantity(product)">-</button>
										<text class="quantity-text">{{ cartStore.getItemQuantity(product.id) }}</text>
										<button class="quantity-btn plus" @click="increaseProductQuantity(product)">+</button>
									</view>
									<button v-else class="add-btn" @click.stop="addProductToCart(product)">
										<text class="add-icon">+</text>
									</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部购物车 -->
		<u-transition :show="cartStore.totalItems > 0" mode="slide-up">
			<view class="cart-bar">
				<view class="cart-left" @click="showCartDetail">
					<view class="cart-icon-wrapper">
						<text class="cart-icon">🛒</text>
						<view class="cart-badge">{{ cartStore.totalItems }}</view>
					</view>
					<view class="cart-info">
						<text class="cart-text">{{ cartStore.totalItems }}件商品</text>
						<text class="total-price">¥{{ cartStore.totalPrice }}</text>
					</view>
				</view>
				<view class="cart-right">
					<button
						class="checkout-btn"
						@click="goToConfirm"
						:disabled="cartStore.totalItems === 0"
					>
						去结算
					</button>
				</view>
			</view>
		</u-transition>

		<!-- 商品详情弹窗 -->
		<view v-if="showProductModal" class="product-modal-overlay" @click="showProductModal = false">
			<view class="product-modal" v-if="selectedProduct" @click.stop>
				<view class="modal-header">
					<text class="modal-title">商品详情</text>
					<text class="modal-close" @click="showProductModal = false">×</text>
				</view>
				<view class="modal-content">
					<image
						:src="getProductImageUrl(selectedProduct)"
						class="product-detail-image"
						mode="aspectFill"
					></image>
					<view class="product-detail">
						<text class="detail-name">{{ selectedProduct.name }}</text>
						<text class="detail-desc">{{ selectedProduct.description }}</text>
						<text class="detail-price">¥{{ selectedProduct.price }}</text>
					</view>
				</view>
				<view class="modal-footer">
					<view class="quantity-section">
						<text class="quantity-label">数量：</text>
						<view class="quantity-controls">
							<button class="quantity-btn" @click.stop="decreaseQuantity" :disabled="currentQuantity <= 1">-</button>
							<text class="quantity-display">{{ currentQuantity }}</text>
							<button class="quantity-btn" @click.stop="increaseQuantity">+</button>
						</view>
					</view>
					<button
						class="add-to-cart-btn"
						@click.stop="addToCart"
						:disabled="currentQuantity <= 0"
					>
						加入购物车
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { useMenuStore } from '@/store/menu';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/mixins/theme';
import { onMounted, computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getProductImageUrl as getImageUrl } from '@/config/index';

export default {
	setup() {
		const menuStore = useMenuStore();
		const cartStore = useCartStore();
		const userStore = useUserStore();
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const showProductModal = ref(false);
		const selectedProduct = ref(null);
		const currentQuantity = ref(0);

		// 登录状态
		const isLoggedIn = computed(() => userStore.isLoggedIn);

		// 检查并设置数据源模式
		const checkAndSetDataMode = () => {
			const wasUsingRealApi = menuStore.useRealApi;
			const shouldUseRealApi = userStore.isLoggedIn;

			if (shouldUseRealApi !== wasUsingRealApi) {
				console.log(`数据源切换: ${wasUsingRealApi ? '真实' : '模拟'} -> ${shouldUseRealApi ? '真实' : '模拟'}`);
				menuStore.setApiMode(shouldUseRealApi);
				// 数据源变化时重新获取数据
				menuStore.fetchMenuData();
			} else if (shouldUseRealApi) {
				console.log('用户已登录，使用真实API数据');
			} else {
				console.log('用户未登录，使用模拟数据');
			}
		};

		onMounted(() => {
			checkAndSetDataMode();
			cartStore.initCart();
		});

		// 页面显示时检查登录状态变化
		onShow(() => {
			console.log('点餐页面显示，检查登录状态');
			checkAndSetDataMode();
		});

		const currentCategoryName = computed(() => {
			return menuStore.categories.find(c => c.id === menuStore.currentCategoryId)?.name || '';
		});

		const currentCategoryDesc = computed(() => {
			const category = menuStore.categories.find(cat => cat.id === menuStore.currentCategoryId);
			return category ? category.description : '';
		});

		const getGreeting = () => {
			const hour = new Date().getHours();
			if (hour < 12) return '早餐时光，为TA准备营养早餐吧';
			if (hour < 14) return '午餐时间，来点什么好呢？';
			if (hour < 18) return '下午茶时光，甜蜜一下';
			return '晚餐时间，和TA一起享受美食';
		};

		const getCategoryProductCount = (categoryId) => {
			return menuStore.products[categoryId]?.length || 0;
		};

		const handleCategoryChange = (categoryId) => {
			menuStore.setCurrentCategory(categoryId);
		};

		const handleQuantityChange = (e, product) => {
			cartStore.setItemQuantity(product, e.value);
		};

		const showProductDetail = (product) => {
			selectedProduct.value = product;
			// 初始数量为购物车中的数量，如果没有则为1
			const cartQuantity = cartStore.getItemQuantity(product.id);
			currentQuantity.value = cartQuantity > 0 ? cartQuantity : 1;
			showProductModal.value = true;
		};

		const increaseQuantity = () => {
			console.log('点击增加按钮，当前商品:', selectedProduct.value);
			if (selectedProduct.value) {
				currentQuantity.value++;
				console.log('数量增加到:', currentQuantity.value);
			} else {
				console.log('商品未选择');
			}
		};

		const decreaseQuantity = () => {
			console.log('点击减少按钮，当前数量:', currentQuantity.value);
			if (currentQuantity.value > 1) {
				currentQuantity.value--;
				console.log('数量减少到:', currentQuantity.value);
			} else {
				console.log('数量已经是最小值');
			}
		};

		const addToCart = () => {
			if (selectedProduct.value && currentQuantity.value > 0) {
				console.log('加入购物车:', selectedProduct.value, currentQuantity.value);
				// 设置购物车中的数量
				cartStore.setItemQuantity(selectedProduct.value, currentQuantity.value);
				showProductModal.value = false;
				uni.showToast({
					title: `已加入购物车`,
					icon: 'success'
				});
			}
		};

		// 商品列表中的快速添加到购物车
		const addProductToCart = (product) => {
			console.log('=== 点击加号按钮 ===');
			console.log('商品信息:', product);
			console.log('商品ID:', product?.id);
			console.log('商品名称:', product?.name);

			if (product) {
				console.log('添加到购物车');
				try {
					cartStore.setItemQuantity(product, 1);
					console.log('购物车操作完成');
					uni.showToast({
						title: '已加入购物车',
						icon: 'success'
					});
				} catch (error) {
					console.error('购物车操作失败:', error);
					uni.showToast({
						title: '添加失败',
						icon: 'error'
					});
				}
			} else {
				console.log('商品信息无效');
				uni.showToast({
					title: '商品信息无效',
					icon: 'none'
				});
			}
		};

		// 商品列表中的增加数量
		const increaseProductQuantity = (product) => {
			const currentQty = cartStore.getItemQuantity(product.id);
			cartStore.setItemQuantity(product, currentQty + 1);
		};

		// 商品列表中的减少数量
		const decreaseProductQuantity = (product) => {
			const currentQty = cartStore.getItemQuantity(product.id);
			if (currentQty > 1) {
				cartStore.setItemQuantity(product, currentQty - 1);
			} else if (currentQty === 1) {
				cartStore.setItemQuantity(product, 0);
			}
		};

		const showCartDetail = () => {
			uni.showToast({
				title: `购物车中有${cartStore.totalItems}件商品`,
				icon: 'none'
			});
		};

		const goToConfirm = () => {
			if (cartStore.totalItems === 0) {
				uni.showToast({
					title: '请先选择商品',
					icon: 'none'
				});
				return;
			}

			uni.navigateTo({
				url: '/pages/order/confirm'
			});
		};

		const goToLogin = () => {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		};

		const reloadMenu = () => {
			menuStore.fetchMenuData();
		};



		// 使用配置文件中的图片URL处理方法
		const getProductImageUrl = getImageUrl;

		return {
			menuStore,
			cartStore,
			isLoggedIn,
			showProductModal,
			selectedProduct,
			currentQuantity,
			currentCategoryName,
			currentCategoryDesc,
			getGreeting,
			getCategoryProductCount,
			handleCategoryChange,
			handleQuantityChange,
			showProductDetail,
			increaseQuantity,
			decreaseQuantity,
			addToCart,
			addProductToCart,
			increaseProductQuantity,
			decreaseProductQuantity,
			showCartDetail,
			goToConfirm,
			goToLogin,
			reloadMenu,
			getProductImageUrl,
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
.ordering-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f8f9fa;
}

.header-toolbar {
	padding: 20rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: white;
}

.toolbar-left {
	flex: 1;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.page-subtitle {
	font-size: 24rpx;
	opacity: 0.9;
	display: block;
}

.toolbar-right {
	display: flex;
	align-items: center;
}

.login-status {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.status-text {
	font-size: 22rpx;
	opacity: 0.9;
}

.login-hint {
	font-size: 20rpx;
	opacity: 0.8;
	margin-top: 4rpx;
	padding: 4rpx 8rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 10rpx;

	&:active {
		opacity: 1;
		background: rgba(255, 255, 255, 0.3);
	}
}

.content-wrapper {
	flex: 1;
	display: flex;
	overflow: hidden;
}

.sidebar-wrapper {
	width: 200rpx;
	background: white;
	border-right: 1rpx solid #f0f0f0;
}

.category-scroll {
	height: 100%;
}

.category-item {
	position: relative;
	padding: 30rpx 20rpx;
	border-bottom: 1rpx solid #f8f9fa;
	display: flex;
	flex-direction: column;
	align-items: center;

	&.active {
		background: #fff5f5;
		border-right: 4rpx solid var(--theme-primary, #FF69B4);

		.category-name {
			color: var(--theme-primary, #FF69B4);
			font-weight: bold;
		}
	}

	&:active {
		background: #f8f9fa;
	}
}

.category-name {
	font-size: 26rpx;
	color: #303133;
	text-align: center;
	line-height: 1.4;
	margin-bottom: 8rpx;
}

.product-count {
	background: var(--theme-primary, #FF69B4);
	color: white;
	font-size: 20rpx;
	padding: 4rpx 8rpx;
	border-radius: 10rpx;
	min-width: 32rpx;
	text-align: center;
}

.product-scroll-view {
	flex: 1;
	height: 100%;
	background: white;
}

.loading-container, .error-container {
	padding: 100rpx 0;
	text-align: center;
}

.product-list {
	padding: 20rpx;
}

.category-header {
	margin-bottom: 30rpx;
	text-align: center;
}

.category-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #303133;
	margin-bottom: 10rpx;
}

.category-desc {
	font-size: 24rpx;
	color: #909399;
}

.empty-category {
	padding: 100rpx 0;
}

.products-list {
	padding: 0 20rpx;
}

.product-card {
	display: flex;
	background: white;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.08);

	&:last-child {
		margin-bottom: 0;
	}
}

.product-left {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	margin-right: 20rpx;
	border-radius: 15rpx;
	overflow: hidden;
}

.product-image {
	width: 100%;
	height: 100%;
	border-radius: 15rpx;
}

.product-right {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.unavailable-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 20rpx 20rpx 0 0;
}

.unavailable-text {
	color: white;
	font-size: 24rpx;
}

.product-info {
	flex: 1;
}

.product-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #303133;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.product-desc {
	font-size: 22rpx;
	color: #909399;
	margin-bottom: 15rpx;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.4;
}

.product-price {
	font-size: 36rpx;
	color: var(--theme-primary, #FF69B4);
	font-weight: bold;
	margin-bottom: 10rpx;
}

.product-actions {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.add-btn {
	width: 60rpx;
	height: 60rpx;
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
	border: none;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.3);
	position: relative;
	z-index: 1;

	&::after {
		border: none;
	}

	&:disabled {
		background: #CCC;
		box-shadow: none;
	}

	&:not(:disabled):active {
		transform: scale(0.95);
	}
}

.add-icon {
	font-size: 32rpx;
	color: white;
	font-weight: bold;
}

.quantity-text {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	min-width: 40rpx;
	text-align: center;
}

.minus {
	border-color: var(--theme-primary, #FF69B4) !important;
	color: var(--theme-primary, #FF69B4) !important;
}

.plus {
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493)) !important;
	color: white !important;
	border: none !important;
}

.cart-bar {
	height: 120rpx;
	background: white;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
}

.cart-left {
	flex: 1;
	display: flex;
	align-items: center;
}

.cart-icon-wrapper {
	position: relative;
	width: 60rpx;
	height: 60rpx;
	background: var(--theme-primary, #FF69B4);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.cart-icon {
	font-size: 24rpx;
	color: white;
}

.cart-badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	background: var(--theme-secondary, #FF1493);
	color: white;
	font-size: 20rpx;
	padding: 4rpx 8rpx;
	border-radius: 20rpx;
	min-width: 32rpx;
	text-align: center;
}

.cart-info {
	display: flex;
	flex-direction: column;
}

.cart-text {
	font-size: 24rpx;
	color: #909399;
	margin-bottom: 4rpx;
}

.total-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #FF69B4;
}

.cart-right {
	margin-left: 20rpx;
}

.checkout-btn {
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

/* 商品详情弹窗样式 */
.product-modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	justify-content: center;
	z-index: 2000;
}

.product-modal {
	background: white;
	border-radius: 20rpx 20rpx 0 0;
	width: 100%;
	max-height: 80vh;
	overflow-y: auto;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #303133;
}

.modal-close {
	font-size: 40rpx;
	color: #999;
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	padding: 30rpx;
}

.product-detail-image {
	width: 100%;
	height: 400rpx;
	border-radius: 15rpx;
	margin-bottom: 30rpx;
}

.product-detail {
	padding: 20rpx 0;
}

.detail-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #303133;
	margin-bottom: 15rpx;
	display: block;
}

.detail-desc {
	font-size: 28rpx;
	color: #606266;
	margin-bottom: 20rpx;
	display: block;
	line-height: 1.6;
}

.detail-price {
	font-size: 40rpx;
	font-weight: bold;
	color: #FF69B4;
	display: block;
}

.modal-footer {
	padding: 30rpx;
	border-top: 1rpx solid #F0F0F0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 30rpx;
}

.quantity-section {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.quantity-label {
	font-size: 28rpx;
	color: #333;
}

.quantity-controls {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.quantity-btn {
	width: 60rpx;
	height: 60rpx;
	border: 1rpx solid #E0E0E0;
	border-radius: 30rpx;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #333;
	position: relative;
	z-index: 1;

	&::after {
		border: none;
	}

	&:disabled {
		background: #F5F5F5;
		color: #CCC;
	}

	&:not(:disabled):active {
		background: #F0F0F0;
	}
}

.quantity-display {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	min-width: 60rpx;
	text-align: center;
}

.add-to-cart-btn {
	flex: 1;
	height: 80rpx;
	background: linear-gradient(135deg, #FF69B4, #FF1493);
	color: white;
	border: none;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-weight: bold;
	position: relative;
	z-index: 1;

	&::after {
		border: none;
	}

	&:disabled {
		background: #CCC;
	}

	&:not(:disabled):active {
		transform: translateY(2rpx);
	}
}
</style>
