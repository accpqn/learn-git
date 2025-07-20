<template>
	<view class="menu-manage-container">
		<!-- 功能选项卡 -->
		<view class="tab-section">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
				<text class="tab-text">分类管理</text>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
				<text class="tab-text">商品管理</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-section">
			<!-- 分类管理 -->
			<view v-if="currentTab === 0" class="tab-content">
				<view class="add-section">
					<button class="add-btn" @click="showAddCategoryModal">
						<text class="add-icon">+</text>
						<text class="add-text">添加分类</text>
					</button>
				</view>

				<view class="list-section">
					<view v-for="category in categories" :key="category.id" class="list-item">
						<view class="item-info">
							<view class="item-name">{{ category.name }}</view>
							<view class="item-desc">{{ category.description || '暂无描述' }}</view>
							<view class="item-extra">{{ getCategoryProductCount(category.id) }} 个商品</view>
						</view>
						<view class="item-actions">
							<button class="action-btn edit" @click="editCategory(category)">编辑</button>
							<button class="action-btn delete" @click="deleteCategory(category)">删除</button>
						</view>
					</view>

					<view v-if="categories.length === 0" class="empty-state">
						<text class="empty-icon">📋</text>
						<text class="empty-text">还没有分类，点击上方按钮添加</text>
					</view>
				</view>
			</view>

			<!-- 商品管理 -->
			<view v-if="currentTab === 1" class="tab-content">
				<view class="add-section">
					<button class="add-btn" @click="showAddProductModal">
						<text class="add-icon">+</text>
						<text class="add-text">添加商品</text>
					</button>
				</view>

				<view class="list-section">
					<view v-for="product in products" :key="product.id" class="list-item product-item">
						<view class="product-image">
							<image
								:src="getProductImageUrl(product)"
								class="product-list-image"
								mode="aspectFill"
							></image>
						</view>
						<view class="item-info">
							<view class="item-name">{{ product.name }}</view>
							<view class="item-desc">{{ product.category_name || '未知分类' }}</view>
							<view class="item-extra">¥{{ product.price }}</view>
						</view>
						<view class="item-actions">
							<button class="action-btn edit" @click="editProduct(product)">编辑</button>
							<button class="action-btn delete" @click="deleteProduct(product)">删除</button>
						</view>
					</view>

					<view v-if="products.length === 0" class="empty-state">
						<text class="empty-icon">🍎</text>
						<text class="empty-text">还没有商品，点击上方按钮添加</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 添加/编辑分类弹窗 -->
		<view v-if="showCategoryModal" class="modal-overlay" @click="closeCategoryModal">
			<view class="modal-container" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ categoryForm.id ? '编辑分类' : '添加分类' }}</text>
					<text class="modal-close" @click="closeCategoryModal">×</text>
				</view>
				<view class="modal-content">
					<view class="form-item">
						<text class="form-label">分类名称 *</text>
						<input class="form-input" v-model="categoryForm.name" placeholder="请输入分类名称" />
					</view>
					<view class="form-item">
						<text class="form-label">分类描述</text>
						<textarea class="form-textarea" v-model="categoryForm.description" placeholder="请输入分类描述（可选）"></textarea>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @click="closeCategoryModal">取消</button>
					<button class="modal-btn confirm" @click="saveCategoryModal">确定</button>
				</view>
			</view>
		</view>

		<!-- 添加/编辑商品弹窗 -->
		<view v-if="showProductModal" class="modal-overlay" @click="closeProductModal">
			<view class="modal-container" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ productForm.id ? '编辑商品' : '添加商品' }}</text>
					<text class="modal-close" @click="closeProductModal">×</text>
				</view>
				<view class="modal-content">
					<view class="form-item">
						<text class="form-label">商品名称 *</text>
						<input class="form-input" v-model="productForm.name" placeholder="请输入商品名称" />
					</view>
					<view class="form-item">
						<text class="form-label">商品价格 *</text>
						<input class="form-input" v-model="productForm.price" placeholder="请输入价格" type="number" />
					</view>
					<view class="form-item">
						<text class="form-label">所属分类 *</text>
						<picker class="form-picker" :value="productForm.categoryIndex" :range="categoryOptions" @change="handleCategoryChange">
							<view class="picker-display">
								{{ categoryOptions[productForm.categoryIndex] || '请选择分类' }}
							</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="form-label">商品描述</text>
						<textarea class="form-textarea" v-model="productForm.description" placeholder="请输入商品描述（可选）"></textarea>
					</view>
					<view class="form-item">
						<text class="form-label">商品图片</text>
						<view class="image-upload" @click="chooseImage">
							<image v-if="productForm.imageUrl" :src="productForm.imageUrl" class="upload-image" mode="aspectFill"></image>
							<view v-else class="upload-placeholder">
								<text class="upload-icon">📷</text>
								<text class="upload-text">点击上传图片</text>
							</view>
						</view>
						<view v-if="productForm.imageUrl" class="image-actions">
							<button class="remove-image-btn" @click="removeImage">删除图片</button>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @click="closeProductModal">取消</button>
					<button class="modal-btn confirm" @click="saveProductModal">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { getCategories, addCategory, updateCategory, deleteCategory as deleteCategoryApi } from '@/api/menu';
import { getProducts, addProduct, updateProduct, deleteProduct as deleteProductApi } from '@/api/menu';
import config, { getProductImageUrl as getImageUrl } from '@/config/index';
import { useTheme } from '@/mixins/theme';
import { useThemeStore } from '@/store/theme';
import { onShow } from '@dcloudio/uni-app';

export default {
	name: 'MenuManage',
	setup() {
		// 主题功能
		const { currentTheme, getThemeColor, getButtonStyle, getHeaderStyle } = useTheme();
		const themeStore = useThemeStore();

		// 数据状态
		const categories = ref([]);
		const products = ref([]);
		const loading = ref(false);
		const currentTab = ref(0);

		// 分类弹窗
		const showCategoryModal = ref(false);
		const categoryForm = reactive({
			id: null,
			name: '',
			description: ''
		});

		// 商品弹窗
		const showProductModal = ref(false);
		const productForm = reactive({
			id: null,
			name: '',
			price: '',
			category: null,
			categoryIndex: 0,
			description: '',
			imageUrl: '',
			imageFile: null
		});

		// 计算属性
		const categoryOptions = computed(() => {
			return categories.value.map(cat => cat.name);
		});

		// 页面初始化
		onMounted(() => {
			loadData();
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
			uni.$emit('onPageShow', 'pages/settings/menu-manage');
		});

		// 加载数据
		const loadData = async () => {
			loading.value = true;
			try {
				await Promise.all([
					loadCategories(),
					loadProducts()
				]);
			} catch (error) {
				console.error('加载数据失败:', error);
				uni.showToast({
					title: '加载数据失败',
					icon: 'error'
				});
			} finally {
				loading.value = false;
			}
		};

		// 加载分类
		const loadCategories = async () => {
			try {
				const data = await getCategories();
				categories.value = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
			} catch (error) {
				console.error('加载分类失败:', error);
			}
		};

		// 加载商品
		const loadProducts = async () => {
			try {
				const data = await getProducts();
				products.value = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
			} catch (error) {
				console.error('加载商品失败:', error);
			}
		};

		// 切换选项卡
		const switchTab = (index) => {
			currentTab.value = index;
		};

		// 使用配置文件中的图片URL处理方法
		const getProductImageUrl = getImageUrl;

		// 获取分类下的商品数量
		const getCategoryProductCount = (categoryId) => {
			return products.value.filter(p => p.category === categoryId).length;
		};

		// 获取分类名称
		const getCategoryName = (categoryId) => {
			const category = categories.value.find(cat => cat.id === categoryId);
			return category ? category.name : '未知分类';
		};

		// ==================== 分类管理 ====================

		// 显示添加分类弹窗
		const showAddCategoryModal = () => {
			console.log('显示添加分类弹窗');
			resetCategoryForm();
			showCategoryModal.value = true;
		};

		// 编辑分类
		const editCategory = (category) => {
			categoryForm.id = category.id;
			categoryForm.name = category.name;
			categoryForm.description = category.description || '';
			showCategoryModal.value = true;
		};

		// 重置分类表单
		const resetCategoryForm = () => {
			categoryForm.id = null;
			categoryForm.name = '';
			categoryForm.description = '';
		};

		// 保存分类
		const saveCategoryModal = async () => {
			console.log('保存分类开始', categoryForm);
			if (!categoryForm.name.trim()) {
				uni.showToast({
					title: '请输入分类名称',
					icon: 'error'
				});
				return;
			}

			try {
				const data = {
					name: categoryForm.name.trim(),
					description: categoryForm.description.trim()
				};
				console.log('准备发送的数据:', data);

				if (categoryForm.id) {
					// 编辑
					console.log('编辑分类:', categoryForm.id);
					await updateCategory(categoryForm.id, data);
					uni.showToast({
						title: '分类更新成功',
						icon: 'success'
					});
				} else {
					// 新增
					console.log('新增分类');
					const result = await addCategory(data);
					console.log('新增分类结果:', result);
					uni.showToast({
						title: '分类添加成功',
						icon: 'success'
					});
				}

				showCategoryModal.value = false;
				await loadCategories();
			} catch (error) {
				console.error('保存分类失败:', error);
				uni.showToast({
					title: '保存失败: ' + (error.message || '未知错误'),
					icon: 'error'
				});
			}
		};

		// 关闭分类弹窗
		const closeCategoryModal = () => {
			showCategoryModal.value = false;
			resetCategoryForm();
		};

		// 删除分类
		const deleteCategory = (category) => {
			const productCount = getCategoryProductCount(category.id);
			const message = productCount > 0
				? `分类"${category.name}"下有${productCount}个商品，删除分类将同时删除所有商品，确定要删除吗？`
				: `确定要删除分类"${category.name}"吗？`;

			uni.showModal({
				title: '确认删除',
				content: message,
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteCategoryApi(category.id);
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							await loadData(); // 重新加载所有数据
						} catch (error) {
							console.error('删除分类失败:', error);
							uni.showToast({
								title: '删除失败',
								icon: 'error'
							});
						}
					}
				}
			});
		};

		// ==================== 商品管理 ====================

		// 显示添加商品弹窗
		const showAddProductModal = (categoryId = null) => {
			console.log('显示添加商品弹窗', categoryId);
			if (categories.value.length === 0) {
				uni.showToast({
					title: '请先添加分类',
					icon: 'error'
				});
				return;
			}
			resetProductForm();
			if (categoryId) {
				const categoryIndex = categories.value.findIndex(cat => cat.id === categoryId);
				if (categoryIndex > -1) {
					productForm.category = categoryId;
					productForm.categoryIndex = categoryIndex;
				}
			}
			showProductModal.value = true;
		};

		// 编辑商品
		const editProduct = (product) => {
			productForm.id = product.id;
			productForm.name = product.name;
			productForm.price = product.price.toString();
			productForm.category = product.category;
			productForm.categoryIndex = categories.value.findIndex(cat => cat.id === product.category);
			productForm.description = product.description || '';
			productForm.imageUrl = getProductImageUrl(product);
			showProductModal.value = true;
		};

		// 重置商品表单
		const resetProductForm = () => {
			productForm.id = null;
			productForm.name = '';
			productForm.price = '';
			productForm.category = categories.value.length > 0 ? categories.value[0].id : null;
			productForm.categoryIndex = 0;
			productForm.description = '';
			productForm.imageUrl = '';
			productForm.imageFile = null;
		};

		// 分类选择变化
		const handleCategoryChange = (e) => {
			const index = e.detail ? e.detail.value : e.target.value;
			productForm.categoryIndex = index;
			productForm.category = categories.value[index]?.id;
			console.log('分类选择变化:', index, productForm.category);
		};

		// 选择图片
		const chooseImage = () => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					productForm.imageUrl = res.tempFilePaths[0];
					productForm.imageFile = res.tempFiles[0];
					console.log('选择图片:', res.tempFilePaths[0]);
				},
				fail: (error) => {
					console.error('选择图片失败:', error);
					// 用户取消选择图片时显示友好提示
					if (error.errMsg && error.errMsg.includes('cancel')) {
						uni.showToast({
							title: '图片留着不添加，谁知道长什么样',
							icon: 'none',
							duration: 2000
						});
					} else {
						uni.showToast({
							title: '选择图片失败',
							icon: 'error'
						});
					}
				}
			});
		};

		// 删除图片
		const removeImage = () => {
			productForm.imageUrl = '';
			productForm.imageFile = null;
		};

		// 使用uni.uploadFile上传带图片的商品
		const uploadProductWithImage = (productId, data, imagePath, isUpdate) => {
			return new Promise((resolve, reject) => {
				const url = isUpdate
					? `${config.API_BASE_URL}/api/menus/products/${productId}/`
					: `${config.API_BASE_URL}/api/menus/products/`;

				const token = uni.getStorageSync('token');

				uni.uploadFile({
					url: url,
					filePath: imagePath,
					name: 'image',
					formData: {
						...data,
						_method: isUpdate ? 'PUT' : 'POST'
					},
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						console.log('上传成功:', res);
						if (res.statusCode === 200 || res.statusCode === 201) {
							resolve(JSON.parse(res.data));
						} else {
							reject(new Error(`上传失败: ${res.statusCode}`));
						}
					},
					fail: (error) => {
						console.error('上传失败:', error);
						reject(error);
					}
				});
			});
		};

		// 保存商品
		const saveProductModal = async () => {
			console.log('保存商品开始', productForm);
			if (!productForm.name.trim()) {
				uni.showToast({
					title: '请输入商品名称',
					icon: 'error'
				});
				return;
			}

			if (!productForm.price || parseFloat(productForm.price) <= 0) {
				uni.showToast({
					title: '请输入有效价格',
					icon: 'error'
				});
				return;
			}

			if (!productForm.category) {
				uni.showToast({
					title: '请选择分类',
					icon: 'error'
				});
				return;
			}

			try {
				// 基础数据
				const baseData = {
					name: productForm.name.trim(),
					price: parseFloat(productForm.price),
					category: productForm.category,
					description: productForm.description.trim()
				};

				console.log('准备发送的商品数据:', baseData);

				if (productForm.id) {
					// 编辑商品
					console.log('编辑商品:', productForm.id);

					if (productForm.imageFile) {
						// 有新图片，使用uploadFile
						await uploadProductWithImage(productForm.id, baseData, productForm.imageUrl, true);
					} else {
						// 没有新图片，使用普通API
						await updateProduct(productForm.id, baseData);
					}

					uni.showToast({
						title: '商品更新成功',
						icon: 'success'
					});
				} else {
					// 新增商品
					console.log('新增商品');

					if (productForm.imageFile) {
						// 有图片，使用uploadFile
						await uploadProductWithImage(null, baseData, productForm.imageUrl, false);
					} else {
						// 没有图片，使用普通API
						await addProduct(baseData);
					}

					uni.showToast({
						title: '商品添加成功',
						icon: 'success'
					});
				}

				showProductModal.value = false;
				await loadProducts();
			} catch (error) {
				console.error('保存商品失败:', error);
				uni.showToast({
					title: '保存失败: ' + (error.message || '未知错误'),
					icon: 'error'
				});
			}
		};

		// 关闭商品弹窗
		const closeProductModal = () => {
			showProductModal.value = false;
			resetProductForm();
		};

		// 删除商品
		const deleteProduct = (product) => {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除商品"${product.name}"吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							await deleteProductApi(product.id);
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							await loadProducts();
						} catch (error) {
							console.error('删除商品失败:', error);
							uni.showToast({
								title: '删除失败',
								icon: 'error'
							});
						}
					}
				}
			});
		};

		return {
			categories,
			products,
			loading,
			currentTab,
			showCategoryModal,
			categoryForm,
			showProductModal,
			productForm,
			categoryOptions,
			loadData,
			switchTab,
			getProductImageUrl,
			getCategoryProductCount,
			getCategoryName,
			// 分类管理
			showAddCategoryModal,
			editCategory,
			saveCategoryModal,
			closeCategoryModal,
			deleteCategory,
			// 商品管理
			showAddProductModal,
			editProduct,
			handleCategoryChange,
			chooseImage,
			removeImage,
			uploadProductWithImage,
			saveProductModal,
			closeProductModal,
			deleteProduct,
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
.menu-manage-container {
	min-height: 100vh;
	background: linear-gradient(135deg, var(--theme-background, #FFF5F8) 0%, #F0F8FF 100%);
}



.tab-section {
	display: flex;
	background: white;
	margin: 30rpx;
	border-radius: 15rpx;
	padding: 10rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx;
	border-radius: 10rpx;
	transition: all 0.3s ease;

	&.active {
		background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));

		.tab-text {
			color: white;
		}
	}
}

.tab-text {
	font-size: 28rpx;
	font-weight: 500;
	color: #666;
}

.content-section {
	padding: 20rpx 30rpx 40rpx;
}

.tab-content {
	background: white;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.add-section {
	padding: 30rpx;
	border-bottom: 1rpx solid #F0F0F0;
}

.add-btn {
	width: 100%;
	height: 80rpx;
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
	color: white;
	border: none;
	border-radius: 15rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15rpx;
	font-size: 28rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&:active {
		transform: translateY(2rpx);
	}
}

.add-icon {
	font-size: 32rpx;
}

.list-section {
	padding: 0 30rpx 30rpx;
}

.list-item {
	display: flex;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 1rpx solid #F0F0F0;

	&:last-child {
		border-bottom: none;
	}

	&.product-item {
		.product-image {
			margin-right: 20rpx;
			border-radius: 10rpx;
			overflow: hidden;
			width: 120rpx;
			height: 120rpx;
		}
	}
}

.product-list-image {
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
}

.item-info {
	flex: 1;
}

.item-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.item-desc {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 5rpx;
}

.item-extra {
	font-size: 24rpx;
	color: #999;
}

.item-actions {
	display: flex;
	gap: 15rpx;
}

.action-btn {
	padding: 10rpx 20rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
	border: none;

	&::after {
		border: none;
	}

	&.edit {
		background: #E6F7FF;
		color: #1890FF;
	}

	&.delete {
		background: #FFF2F0;
		color: #FF4D4F;
	}
}

.empty-state {
	text-align: center;
	padding: 80rpx 20rpx;
	color: #999;
}

.empty-icon {
	font-size: 80rpx;
	display: block;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
}

/* 弹窗样式 */
.modal-content {
	padding: 20rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 15rpx;
	font-weight: bold;
}

.picker-display {
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 10rpx;
	font-size: 28rpx;
	color: #333;
	border: 1rpx solid #E0E0E0;
}

.image-upload {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 200rpx;
	height: 200rpx;
	border: 2rpx dashed #D0D0D0;
	border-radius: 15rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		border-color: var(--theme-primary, #FF69B4);
		background: var(--theme-background, #FFF5F8);
	}
}

.upload-placeholder {
	text-align: center;
	color: #999;
}

.upload-icon {
	font-size: 60rpx;
	display: block;
	margin-bottom: 10rpx;
}

.upload-text {
	font-size: 24rpx;
}

.image-actions {
	margin-top: 15rpx;
	text-align: center;
}

.remove-image-btn {
	padding: 8rpx 16rpx;
	background: #FFF2F0;
	color: #FF4D4F;
	border: 1rpx solid #FF4D4F;
	border-radius: 8rpx;
	font-size: 22rpx;

	&::after {
		border: none;
	}

	&:active {
		background: #FFE7E6;
	}
}

/* 自定义弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(10rpx);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: fadeIn 0.3s ease-out;
}

.modal-container {
	background: white;
	border-radius: 30rpx;
	width: 90%;
	max-width: 650rpx;
	max-height: 85vh;
	overflow: hidden;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
	animation: slideUp 0.3s ease-out;
	position: relative;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(100rpx) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.modal-container {
		width: 95%;
		margin: 20rpx;
	}

	.modal-content {
		padding: 30rpx;
	}

	.modal-footer {
		padding: 30rpx;
		flex-direction: column;
		gap: 15rpx;
	}

	.modal-btn {
		height: 80rpx;
	}
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
	.modal-container {
		background: #2C3E50;
		color: white;
	}

	.modal-content {
		background: #34495E;
	}

	.form-input, .form-textarea, .picker-display {
		background: #3A4A5C !important;
		border-color: #4A5A6C !important;
		color: white !important;

		&::placeholder {
			color: #95A5A6 !important;
		}
	}

	.form-label {
		color: #ECF0F1 !important;
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 40rpx 30rpx;
	background: linear-gradient(135deg, var(--theme-primary, #FF69B4) 0%, var(--theme-secondary, #FF1493) 100%);
	position: relative;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1rpx;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
	}
}

.modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: white;
	text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.modal-close {
	font-size: 36rpx;
	color: rgba(255,255,255,0.8);
	cursor: pointer;
	width: 70rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255,255,255,0.1);
	backdrop-filter: blur(10rpx);
	transition: all 0.3s ease;

	&:active {
		background: rgba(255,255,255,0.2);
		transform: scale(0.95);
	}
}

.modal-content {
	padding: 40rpx;
	max-height: 60vh;
	overflow-y: auto;
	background: #FAFBFC;
}

.form-item {
	margin-bottom: 50rpx;
	position: relative;

	&:last-child {
		margin-bottom: 20rpx;
	}
}

.form-label {
	display: block;
	font-size: 30rpx;
	color: #2C3E50;
	margin-bottom: 20rpx;
	font-weight: 600;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		left: -15rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 20rpx;
		background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
		border-radius: 3rpx;
	}
}

.form-input, .form-textarea {
	width: 100%;
	padding: 30rpx 25rpx;
	border: 2rpx solid #E8ECEF;
	border-radius: 15rpx;
	font-size: 32rpx;
	color: #2C3E50 !important;
	background: white !important;
	box-sizing: border-box;
	transition: all 0.3s ease;
	min-height: 90rpx;
	line-height: 1.4;

	&:focus {
		border-color: var(--theme-primary, #FF69B4);
		background: #FEFEFE !important;
		box-shadow: 0 0 0 6rpx rgba(255, 105, 180, 0.1);
		color: #2C3E50 !important;
	}

	&::placeholder {
		color: #BDC3C7 !important;
		opacity: 1;
	}
}

.form-textarea {
	height: 180rpx;
	resize: none;
	line-height: 1.6;
	font-family: inherit;
	min-height: 180rpx;
	padding: 30rpx 25rpx;
}

/* 确保输入框在所有情况下都能正常显示 */
.form-input {
	-webkit-appearance: none;
	appearance: none;
	outline: none;
	font-family: inherit;
}

/* 修复可能的样式冲突 */
.modal-container input.form-input,
.modal-container textarea.form-textarea {
	background-color: white !important;
	color: #2C3E50 !important;
	border: 2rpx solid #E8ECEF !important;
	font-size: 32rpx !important;
	padding: 30rpx 25rpx !important;
	min-height: 90rpx !important;
	line-height: 1.4 !important;

	&::-webkit-input-placeholder {
		color: #BDC3C7 !important;
		opacity: 1 !important;
	}

	&::-moz-placeholder {
		color: #BDC3C7 !important;
		opacity: 1 !important;
	}

	&:-ms-input-placeholder {
		color: #BDC3C7 !important;
		opacity: 1 !important;
	}

	&::placeholder {
		color: #BDC3C7 !important;
		opacity: 1 !important;
	}
}

/* 文本域特殊处理 */
.modal-container textarea.form-textarea {
	min-height: 180rpx !important;
	height: 180rpx !important;
}

/* 选择器样式修复 */
.modal-container .picker-display {
	background-color: white !important;
	color: #2C3E50 !important;
	border: 2rpx solid #E8ECEF !important;
	font-size: 32rpx !important;
	padding: 30rpx 25rpx !important;
	min-height: 90rpx !important;
	line-height: 1.4 !important;
}

/* 确保在小程序环境下也能正常显示 */
.modal-container .form-input,
.modal-container .form-textarea,
.modal-container .picker-display {
	-webkit-text-fill-color: #2C3E50 !important;
	-webkit-opacity: 1 !important;
}

.form-picker {
	width: 100%;
}

.picker-display {
	padding: 30rpx 25rpx;
	background: white !important;
	border: 2rpx solid #E8ECEF;
	border-radius: 15rpx;
	font-size: 32rpx;
	color: #2C3E50 !important;
	transition: all 0.3s ease;
	position: relative;
	min-height: 90rpx;
	line-height: 1.4;
	display: flex;
	align-items: center;

	&::after {
		content: '▼';
		position: absolute;
		right: 25rpx;
		top: 50%;
		transform: translateY(-50%);
		color: #BDC3C7;
		font-size: 24rpx;
	}

	&:active {
		border-color: var(--theme-primary, #FF69B4);
		background: #FEFEFE !important;
	}
}

.image-upload {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 220rpx;
	height: 220rpx;
	border: 3rpx dashed #E8ECEF;
	border-radius: 20rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	background: white;
	position: relative;
	overflow: hidden;

	&:active {
		border-color: var(--theme-primary, #FF69B4);
		background: var(--theme-background, #FFF5F8);
		transform: scale(0.98);
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 30%, rgba(255, 105, 180, 0.05) 50%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	&:hover::before {
		opacity: 1;
	}
}

.upload-image {
	width: 100%;
	height: 100%;
	border-radius: 17rpx;
	object-fit: cover;
}

.upload-placeholder {
	text-align: center;
	color: #95A5A6;
	z-index: 1;
	position: relative;
}

.upload-icon {
	font-size: 70rpx;
	display: block;
	margin-bottom: 15rpx;
	color: var(--theme-primary, #FF69B4);
	opacity: 0.7;
}

.upload-text {
	font-size: 26rpx;
	font-weight: 500;
}

.image-actions {
	margin-top: 20rpx;
	text-align: center;
}

.remove-image-btn {
	padding: 12rpx 24rpx;
	background: linear-gradient(135deg, #FFE5E5, #FFD6D6);
	color: #E74C3C;
	border: 2rpx solid #E74C3C;
	border-radius: 12rpx;
	font-size: 24rpx;
	font-weight: 500;
	transition: all 0.3s ease;

	&::after {
		border: none;
	}

	&:active {
		background: linear-gradient(135deg, #FFD6D6, #FFC7C7);
		transform: scale(0.95);
	}
}

.modal-footer {
	display: flex;
	gap: 25rpx;
	padding: 40rpx;
	background: white;
	border-top: 1rpx solid #F0F2F5;
}

.modal-btn {
	flex: 1;
	height: 90rpx;
	border: none;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;

	&::after {
		border: none;
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
		transition: left 0.5s ease;
	}

	&.cancel {
		background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
		color: #6C757D;
		border: 2rpx solid #E9ECEF;

		&:active {
			background: linear-gradient(135deg, #E9ECEF, #DEE2E6);
			transform: scale(0.98);
		}
	}

	&.confirm {
		background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
		color: white;
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.3);

		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.4);
		}

		&:active::before {
			left: 100%;
		}
	}
}
</style>
