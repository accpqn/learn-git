from rest_framework import serializers
from .models import MenuCategory, Product


class ProductSerializer(serializers.ModelSerializer):
    """商品序列化器"""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image_url', 'image',
            'is_active', 'sort_order', 'category', 'category_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name']


class MenuCategorySerializer(serializers.ModelSerializer):
    """菜单分类序列化器"""
    products = ProductSerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = [
            'id', 'name', 'description', 'sort_order', 
            'created_at', 'updated_at', 'products', 'product_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_product_count(self, obj):
        """获取分类下的商品数量"""
        return obj.products.filter(is_active=True).count()


class MenuCategoryListSerializer(serializers.ModelSerializer):
    """菜单分类列表序列化器（不包含商品详情）"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuCategory
        fields = [
            'id', 'name', 'description', 'sort_order', 
            'created_at', 'updated_at', 'product_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
