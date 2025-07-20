<script>
	import { useUserStore } from '@/store/user'
	import { useOrderStore } from '@/store/order'
	import { useThemeStore } from '@/store/theme'

	export default {
		onLaunch: function() {
			console.log('App Launch')

			// 初始化用户状态
			const userStore = useUserStore()
			const orderStore = useOrderStore()
			const themeStore = useThemeStore()

			// 初始化主题（优先级最高，影响整体UI）
			themeStore.initTheme().then(() => {
				// 初始化完成后立即应用主题
				this.updateCSSVariables(themeStore.currentTheme)
			}).catch(err => {
				console.error('主题初始化失败:', err)
				// 即使初始化失败，也应用默认主题
				this.updateCSSVariables(themeStore.currentTheme)
			})

			// 立即应用当前主题（不等待异步初始化）
			this.updateCSSVariables(themeStore.currentTheme)
			this.updateTabBarTheme(themeStore.currentTheme)
		this.updateNavigationBarTheme(themeStore.currentTheme)

			// 监听主题变化，更新CSS变量、TabBar和导航栏
			uni.$on('themeChanged', (theme) => {
				this.updateCSSVariables(theme)
				this.updateTabBarTheme(theme)
				this.updateNavigationBarTheme(theme)
			})

		// 监听页面显示，立即设置导航栏主题（无动画）
		uni.$on('onPageShow', (route) => {
			// 立即设置，无延迟
			setTimeout(() => {
				this.updateNavigationBarTheme(themeStore.currentTheme, route)
			}, 0)
		})

			// 从本地存储恢复用户登录状态
			if (userStore.initFromStorage()) {
				// 如果有token，尝试获取用户信息
				userStore.fetchCurrentUser().catch(err => {
					console.error('Failed to fetch current user:', err)
					// 如果获取用户信息失败，清除本地状态
					userStore.clearUserState()
				})
			}

			// 初始化订单数据
			orderStore.initOrders()
		},

		methods: {
			// 更新CSS变量
			updateCSSVariables(theme) {
				try {
					console.log('正在更新CSS变量:', theme)

					// 在H5环境中更新CSS变量
					// #ifdef H5
					const style = document.documentElement.style
					if (style) {
						style.setProperty('--theme-primary', theme.primaryColor)
						style.setProperty('--theme-secondary', theme.secondaryColor)
						style.setProperty('--theme-background', theme.backgroundColor)
						style.setProperty('--theme-primary-light', theme.primaryColor + '20')
						style.setProperty('--theme-secondary-light', theme.secondaryColor + '20')
						console.log('H5环境CSS变量已更新')
					}
					// #endif

					// 在小程序环境中，主要通过动态样式绑定实现
					// #ifndef H5
					console.log('小程序环境，通过动态样式绑定实现主题')
					// #endif

				} catch (error) {
					console.log('CSS变量更新失败:', error)
				}
			},

			// 更新TabBar主题
			updateTabBarTheme(theme) {
				try {
					// 检查当前页面是否为TabBar页面
					const pages = uni.getCurrentPages ? uni.getCurrentPages() : []
					if (pages.length === 0) return

					const currentPage = pages[pages.length - 1]
					const route = currentPage.route

					// 定义TabBar页面路径
					const tabBarPages = [
						'pages/home/index',
						'pages/ordering/index',
						'pages/order/list',
						'pages/user/index'
					]

					// 只在TabBar页面设置TabBar样式
					if (tabBarPages.includes(route)) {
						console.log('正在更新TabBar主题:', theme)

						uni.setTabBarStyle({
							color: '#909399',
							selectedColor: theme.primaryColor,
							backgroundColor: '#ffffff',
							borderStyle: 'white'
						})

						console.log('TabBar主题已更新')
					}
				} catch (error) {
					console.log('TabBar主题更新失败:', error)
				}
			},

			// 更新导航栏主题
			updateNavigationBarTheme(theme, targetRoute = null) {
				try {
					// 获取目标路由
					let route = targetRoute
					if (!route) {
						// 使用uni.getCurrentPages()获取当前页面
						const pages = uni.getCurrentPages ? uni.getCurrentPages() : []
						if (pages.length === 0) return
						const currentPage = pages[pages.length - 1]
						route = currentPage.route
					}

					// 定义需要主题导航栏的页面
					const themePages = [
						'pages/settings/index',
						'pages/settings/menu-manage',
						'pages/settings/theme-config'
						// 移除 'pages/user/profile' - 使用默认白色导航栏
					]

					// 只在指定页面设置导航栏主题
					if (themePages.includes(route)) {
						console.log('设置导航栏主题:', route, theme.primaryColor)

						// 立即设置导航栏颜色，无动画
						uni.setNavigationBarColor({
							frontColor: '#ffffff',
							backgroundColor: theme.primaryColor,
							animation: {
								duration: 0,  // 立即生效，无动画
								timingFunc: 'linear'
							}
						})
					}
				} catch (error) {
					console.log('导航栏主题更新失败:', error)
				}
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "uview-plus/index.scss";

	/* 主题CSS变量定义 */
	:root {
		--theme-primary: #FF69B4;
		--theme-secondary: #FF1493;
		--theme-background: #FFF5F8;
		--theme-primary-light: #FF69B420;
		--theme-secondary-light: #FF149320;
	}

	/* 全局样式优化 */
	page {
		background-color: #f8f9fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
	}

	/* 通用动画 */
	.fade-in {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.scale-in {
		animation: scaleIn 0.2s ease-out;
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* 通用卡片样式 */
	.card {
		background: white;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
		overflow: hidden;
	}

	/* 通用按钮样式 */
	.btn-primary {
		background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
		border: none;
		border-radius: 50rpx;
		color: white;
		font-weight: bold;
	}

	.btn-secondary {
		background: #f8f9fa;
		border: 2rpx solid #e9ecef;
		border-radius: 50rpx;
		color: #6c757d;
	}

	/* 通用文本样式 */
	.text-primary {
		color: var(--theme-primary);
	}

	.text-secondary {
		color: #6c757d;
	}

	.text-success {
		color: #28a745;
	}

	.text-warning {
		color: #ffc107;
	}

	.text-danger {
		color: #dc3545;
	}

	/* 通用间距 */
	.mt-10 { margin-top: 10rpx; }
	.mt-20 { margin-top: 20rpx; }
	.mt-30 { margin-top: 30rpx; }
	.mb-10 { margin-bottom: 10rpx; }
	.mb-20 { margin-bottom: 20rpx; }
	.mb-30 { margin-bottom: 30rpx; }
	.p-20 { padding: 20rpx; }
	.p-30 { padding: 30rpx; }

	/* 通用布局 */
	.flex {
		display: flex;
	}

	.flex-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.flex-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	/* 响应式字体 */
	.text-xs { font-size: 20rpx; }
	.text-sm { font-size: 24rpx; }
	.text-base { font-size: 28rpx; }
	.text-lg { font-size: 32rpx; }
	.text-xl { font-size: 36rpx; }
	.text-2xl { font-size: 40rpx; }

	/* 圆角 */
	.rounded-sm { border-radius: 8rpx; }
	.rounded { border-radius: 12rpx; }
	.rounded-lg { border-radius: 20rpx; }
	.rounded-full { border-radius: 50%; }
</style>
