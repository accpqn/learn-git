<template>
	<view class="test-container">
		<view class="test-section">
			<text class="section-title">API测试</text>
			
			<button class="test-btn" @click="testGetCategories">测试获取分类</button>
			<button class="test-btn" @click="testAddCategory">测试添加分类</button>
			<button class="test-btn" @click="testGetProducts">测试获取商品</button>
			
			<view class="result-section">
				<text class="result-title">测试结果：</text>
				<text class="result-text">{{ testResult }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { ref } from 'vue';
import { getCategories, addCategory, getProducts } from '@/api/menu';

export default {
	name: 'TestApi',
	setup() {
		const testResult = ref('等待测试...');

		const testGetCategories = async () => {
			try {
				testResult.value = '正在测试获取分类...';
				const result = await getCategories();
				testResult.value = `获取分类成功: ${JSON.stringify(result, null, 2)}`;
			} catch (error) {
				testResult.value = `获取分类失败: ${error.message}`;
				console.error('测试获取分类失败:', error);
			}
		};

		const testAddCategory = async () => {
			try {
				testResult.value = '正在测试添加分类...';
				const data = {
					name: '测试分类' + Date.now(),
					description: '这是一个测试分类'
				};
				const result = await addCategory(data);
				testResult.value = `添加分类成功: ${JSON.stringify(result, null, 2)}`;
			} catch (error) {
				testResult.value = `添加分类失败: ${error.message}`;
				console.error('测试添加分类失败:', error);
			}
		};

		const testGetProducts = async () => {
			try {
				testResult.value = '正在测试获取商品...';
				const result = await getProducts();
				testResult.value = `获取商品成功: ${JSON.stringify(result, null, 2)}`;
			} catch (error) {
				testResult.value = `获取商品失败: ${error.message}`;
				console.error('测试获取商品失败:', error);
			}
		};

		return {
			testResult,
			testGetCategories,
			testAddCategory,
			testGetProducts
		};
	}
};
</script>

<style lang="scss" scoped>
.test-container {
	padding: 30rpx;
}

.test-section {
	background: white;
	padding: 30rpx;
	border-radius: 20rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
	display: block;
}

.test-btn {
	width: 100%;
	height: 80rpx;
	background: #FF69B4;
	color: white;
	border: none;
	border-radius: 15rpx;
	margin-bottom: 20rpx;
	font-size: 28rpx;
	
	&::after {
		border: none;
	}
}

.result-section {
	margin-top: 30rpx;
	padding: 20rpx;
	background: #F8F9FA;
	border-radius: 15rpx;
}

.result-title {
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 15rpx;
}

.result-text {
	font-size: 24rpx;
	color: #666;
	white-space: pre-wrap;
	word-break: break-all;
}
</style>
