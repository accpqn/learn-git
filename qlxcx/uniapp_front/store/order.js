import { defineStore } from 'pinia';
import * as orderApi from '@/api/order';
import Storage, { STORAGE_KEYS } from '@/utils/storage';

export const useOrderStore = defineStore('order', {
    state: () => ({
        sentOrders: [],
        receivedOrders: [],
        currentOrderDetail: null,
        status: 'idle',
        error: null
    }),

    getters: {
        allOrders: (state) => [...state.sentOrders, ...state.receivedOrders].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    },

    actions: {
        async createOrder(orderData) {
            this.status = 'loading';
            try {
                console.log('OrderStore createOrder - 原始数据:', orderData);

                // 转换前端购物车数据为后端API格式
                const apiOrderData = {
                    items: orderData.items.map(item => {
                        console.log('处理订单项:', item);
                        // 确保正确获取商品ID
                        const productId = item.product || (item.item && item.item.id);
                        if (!productId) {
                            console.error('无法获取商品ID:', item);
                            throw new Error('商品ID缺失');
                        }
                        return {
                            product: productId,
                            quantity: item.quantity
                        };
                    }),
                    notes: orderData.notes || orderData.note || ''  // 兼容不同的字段名
                };

                console.log('Creating order with data:', apiOrderData);

                // 调用后端API创建订单
                const createdOrder = await orderApi.createOrder(apiOrderData);

                console.log('Order created successfully:', createdOrder);

                // 转换后端数据格式为前端格式
                const normalizedOrder = this.normalizeOrderData(createdOrder);
                normalizedOrder.type = 'sent'; // 标记为发送的订单

                // 添加到发送订单列表
                this.sentOrders.unshift(normalizedOrder);

                // 保存到本地存储
                this.saveOrdersToLocal();

                this.status = 'success';
                return normalizedOrder;
            } catch (err) {
                this.status = 'error';
                this.error = err.message;
                console.error('Failed to create order:', err);
                throw err;
            }
        },

        // 从本地存储加载订单数据
        loadOrdersFromLocal() {
            this.sentOrders = Storage.get(STORAGE_KEYS.SENT_ORDERS, []);
            this.receivedOrders = Storage.get(STORAGE_KEYS.RECEIVED_ORDERS, []);
        },

        // 保存订单数据到本地存储
        saveOrdersToLocal() {
            Storage.set(STORAGE_KEYS.SENT_ORDERS, this.sentOrders);
            Storage.set(STORAGE_KEYS.RECEIVED_ORDERS, this.receivedOrders);
        },

        // 标准化后端订单数据格式
        normalizeOrderData(backendOrder) {
            return {
                id: backendOrder.id,
                creator: backendOrder.creator,
                creator_username: backendOrder.creator_username,
                status: backendOrder.status,
                notes: backendOrder.notes,
                note: backendOrder.notes, // 兼容前端使用note字段
                total_price: backendOrder.total_price,
                totalPrice: backendOrder.total_price, // 兼容前端使用totalPrice字段
                created_at: backendOrder.created_at,
                createTime: backendOrder.created_at, // 兼容前端使用createTime字段
                updated_at: backendOrder.updated_at,
                items: backendOrder.items || [],
                created_by_current_user: backendOrder.created_by_current_user
            };
        },

        // 检查订单是否有变化（新增、删除、状态变化）
        checkOrderChanges(oldOrders, newOrders) {
            // 数量不同
            if (oldOrders.length !== newOrders.length) {
                return true;
            }

            // 检查每个订单的状态和更新时间
            for (const newOrder of newOrders) {
                const oldOrder = oldOrders.find(o => o.id === newOrder.id);
                if (!oldOrder) {
                    // 新订单
                    return true;
                }
                if (oldOrder.status !== newOrder.status) {
                    // 状态变化
                    console.log(`订单 ${newOrder.id} 状态变化: ${oldOrder.status} -> ${newOrder.status}`);
                    return true;
                }
                if (oldOrder.updated_at !== newOrder.updated_at) {
                    // 更新时间变化
                    console.log(`订单 ${newOrder.id} 更新时间变化`);
                    return true;
                }
            }

            return false;
        },

        async fetchSentOrders() {
            this.status = 'loading';
            try {
                console.log('Fetching sent orders...');
                const data = await orderApi.getOrders();

                // 过滤出发送的订单（当前用户是创建者）并标准化数据格式
                const newSentOrders = data
                    .filter(order => order.created_by_current_user)
                    .map(order => {
                        const normalized = this.normalizeOrderData(order);
                        normalized.type = 'sent';
                        return normalized;
                    });

                // 检查是否有新订单或状态变化
                const hasChanges = this.checkOrderChanges(this.sentOrders, newSentOrders);
                if (hasChanges) {
                    console.log('发现发送订单变化，更新数据');
                    this.sentOrders = newSentOrders;
                    this.saveOrdersToLocal();
                }

                console.log('Sent orders fetched:', this.sentOrders.length, '条');
                this.status = 'success';
            } catch (err) {
                this.status = 'error';
                this.error = err.message;
                console.error('Failed to fetch sent orders:', err);
            }
        },

        async fetchReceivedOrders() {
            this.status = 'loading';
            try {
                console.log('Fetching received orders...');
                const data = await orderApi.getOrders();

                // 过滤出接收的订单（当前用户不是创建者）并标准化数据格式
                const newReceivedOrders = data
                    .filter(order => !order.created_by_current_user)
                    .map(order => {
                        const normalized = this.normalizeOrderData(order);
                        normalized.type = 'received';
                        return normalized;
                    });

                // 检查是否有新订单或状态变化
                const hasChanges = this.checkOrderChanges(this.receivedOrders, newReceivedOrders);
                if (hasChanges) {
                    console.log('发现接收订单变化，更新数据');
                    this.receivedOrders = newReceivedOrders;
                    this.saveOrdersToLocal();
                }

                console.log('Received orders fetched:', this.receivedOrders.length, '条');
                this.status = 'success';
            } catch (err) {
                this.status = 'error';
                this.error = err.message;
                console.error('Failed to fetch received orders:', err);
            }
        },

        async fetchOrderDetail(id) {
            this.status = 'loading';
            try {
                // 先从本地查找
                let order = this.sentOrders.find(o => o.id == id) || this.receivedOrders.find(o => o.id == id);

                if (order) {
                    this.currentOrderDetail = order;
                } else {
                    // 从API获取订单详情
                    console.log('Fetching order detail from API for id:', id);
                    const data = await orderApi.getOrderDetail(id);
                    const normalizedOrder = this.normalizeOrderData(data);

                    // 判断订单类型
                    normalizedOrder.type = data.created_by_current_user ? 'sent' : 'received';

                    this.currentOrderDetail = normalizedOrder;
                }

                console.log('Order detail loaded:', this.currentOrderDetail);
                this.status = 'success';
            } catch (err) {
                this.status = 'error';
                this.error = err.message;
                console.error('Failed to fetch order detail:', err);
            }
        },

        async updateOrderItem({ orderId, itemId, data }) {
            try {
                // 更新本地数据
                const order = this.sentOrders.find(o => o.id === orderId) || this.receivedOrders.find(o => o.id === orderId);
                if (order) {
                    const item = order.items.find(i => i.item.id === itemId);
                    if (item) {
                        Object.assign(item, data);
                        this.saveOrdersToLocal();
                    }
                }

                // 如果有API，同步到服务器
                if (orderApi.updateOrderItem) {
                    await orderApi.updateOrderItem(orderId, itemId, data);
                }

                // 重新获取订单详情以同步UI
                await this.fetchOrderDetail(orderId);
            } catch (err) {
                console.error('Failed to update order item:', err);
                throw err;
            }
        },

        // 初始化订单数据
        initOrders() {
            this.loadOrdersFromLocal();
        }
    }
});