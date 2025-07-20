<template>
	<view class="product-item">
		<!-- 商品项内容 -->
		<text>商品项组件</text>
	</view>
</template>

<script>
	export default {
		name: "ProductItem",
		props: {
			// 商品数据
			productData: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style scoped>
	.product-item {
		display: flex;
		padding: 8px;
		background-color: #fff;
		border-bottom: 1px solid #f5f5f5;
	}
</style>