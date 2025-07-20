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

		// 页面显示时设置导航栏主题
		onShow(() => {
			try {
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
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-container {
	background: white;
	border-radius: 20rpx;
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
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
	color: #333;
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
	max-height: 60vh;
	overflow-y: auto;
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

.form-input, .form-textarea {
	width: 100%;
	padding: 20rpx;
	border: 1rpx solid #E0E0E0;
	border-radius: 10rpx;
	font-size: 28rpx;
	color: #333;
	background: #F8F9FA;
	box-sizing: border-box;
}

.form-textarea {
	height: 120rpx;
	resize: none;
}

.form-picker {
	width: 100%;
}

.picker-display {
	padding: 20rpx;
	background: #F8F9FA;
	border: 1rpx solid #E0E0E0;
	border-radius: 10rpx;
	font-size: 28rpx;
	color: #333;
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

.upload-image {
	width: 100%;
	height: 100%;
	border-radius: 13rpx;
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

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #F0F0F0;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border: none;
	border-radius: 15rpx;
	font-size: 28rpx;
	font-weight: bold;

	&::after {
		border: none;
	}

	&.cancel {
		background: #F8F9FA;
		color: #666;
	}

	&.confirm {
		background: linear-gradient(135deg, var(--theme-primary, #FF69B4), var(--theme-secondary, #FF1493));
		color: white;
	}

	&:active {
		transform: translateY(2rpx);
	}
}
</style>
