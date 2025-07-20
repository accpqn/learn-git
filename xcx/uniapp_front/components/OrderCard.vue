<template>
	<view class="order-card">
		<!-- 订单卡片内容 -->
		<text>订单卡片组件</text>
	</view>
</template>

<script>
	export default {
		name: "OrderCard",
		props: {
			// 订单数据
			orderData: {
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
	.order-card {
		padding: 10px;
		margin: 10px;
		border-radius: 8px;
		background-color: #ffffff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>