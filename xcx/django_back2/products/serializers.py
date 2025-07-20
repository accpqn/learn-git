from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    """
    分类序列化器
    """
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'owner']


class ProductSerializer(serializers.ModelSerializer):
    """
    商品序列化器
    """
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 
            'name', 
            'description', 
            'image', 
            'price', 
            'category', 
            'category_name',
            'is_available'
        ]
        
    def validate_category(self, value):
        """
        验证分类是否属于当前用户
        """
        if value.owner != self.context['request'].user:
            raise serializers.ValidationError("只能选择您自己创建的分类。")
        return value 