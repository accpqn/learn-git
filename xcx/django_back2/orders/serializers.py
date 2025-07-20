from rest_framework import serializers
from .models import DemandOrder, DemandOrderItem, OrderReview
from menus.serializers import ProductSerializer


class DemandOrderItemSerializer(serializers.ModelSerializer):
    """订单项序列化器"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, source='product.id')
    total_price = serializers.ReadOnlyField()
    actual_total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = DemandOrderItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'price', 
            'actual_price', 'receiver_notes', 'total_price', 'actual_total_price'
        ]
        read_only_fields = ['id', 'price']  # price从商品自动获取


class DemandOrderSerializer(serializers.ModelSerializer):
    """订单序列化器"""
    items = DemandOrderItemSerializer(many=True, read_only=True)
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    created_by_current_user = serializers.SerializerMethodField()
    
    class Meta:
        model = DemandOrder
        fields = [
            'id', 'creator', 'creator_username', 'status', 'notes', 
            'total_price', 'created_at', 'updated_at', 'items', 'created_by_current_user'
        ]
        read_only_fields = ['id', 'creator', 'total_price', 'created_at', 'updated_at']
    
    def get_created_by_current_user(self, obj):
        """判断是否为当前用户创建的订单"""
        request = self.context.get('request')
        if request and request.user:
            return obj.creator == request.user
        return False


class OrderCreateSerializer(serializers.ModelSerializer):
    """创建订单序列化器"""
    items = serializers.ListField(write_only=True)
    
    class Meta:
        model = DemandOrder
        fields = ['notes', 'items']
    
    def validate_items(self, value):
        """验证订单项数据"""
        if not value:
            raise serializers.ValidationError("订单项不能为空")
        
        for item in value:
            if 'product' not in item or 'quantity' not in item:
                raise serializers.ValidationError("订单项必须包含product和quantity字段")
            
            if item['quantity'] <= 0:
                raise serializers.ValidationError("商品数量必须大于0")
        
        return value
    
    def create(self, validated_data):
        """创建订单和订单项"""
        items_data = validated_data.pop('items')
        order = DemandOrder.objects.create(**validated_data)
        
        total_price = 0
        for item_data in items_data:
            from menus.models import Product
            product = Product.objects.get(id=item_data['product'])
            
            # 验证商品是否属于当前用户的绑定关系
            if product.binding != order.binding:
                raise serializers.ValidationError(f"商品 {product.name} 不属于当前情侣绑定")
            
            order_item = DemandOrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price
            )
            total_price += order_item.total_price
        
        order.total_price = total_price
        order.save()
        
        return order


class OrderReviewSerializer(serializers.ModelSerializer):
    """订单评价序列化器"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    
    class Meta:
        model = OrderReview
        fields = ['id', 'rating', 'comment', 'creator', 'creator_username', 'created_at']
        read_only_fields = ['id', 'creator', 'created_at']
