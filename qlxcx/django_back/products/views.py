from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    """
    一个允许用户管理自己商品分类的视图集
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        此视图应仅返回经过身份验证的用户的分类。
        """
        return self.request.user.categories.all()

    def perform_create(self, serializer):
        """
        创建新分类时自动将所有者设置为当前用户。
        """
        serializer.save(owner=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    """
    一个允许用户管理自己商品的视图集
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        此视图应仅返回属于当前用户分类的商品。
        """
        return Product.objects.filter(category__owner=self.request.user)

    def get_serializer_context(self):
        """
        将 request 对象传递给序列化器上下文，以便在序列化器中进行验证。
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
