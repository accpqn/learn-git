from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from users.models import CoupleBinding
from .models import MenuCategory, Product
from .serializers import (
    MenuCategorySerializer, 
    MenuCategoryListSerializer, 
    ProductSerializer
)


class MenuCategoryViewSet(viewsets.ModelViewSet):
    """菜单分类视图集"""
    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """只返回当前用户所属情侣绑定的分类"""
        user = self.request.user
        try:
            # 获取用户的活跃绑定关系
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            return MenuCategory.objects.filter(binding=binding)
        except CoupleBinding.DoesNotExist:
            return MenuCategory.objects.none()
    
    def get_serializer_class(self):
        """根据action选择序列化器"""
        if self.action == 'list':
            return MenuCategoryListSerializer
        return MenuCategorySerializer
    
    def perform_create(self, serializer):
        """创建分类时自动关联到当前用户的绑定关系"""
        user = self.request.user
        binding = get_object_or_404(
            CoupleBinding,
            models.Q(requester=user) | models.Q(receiver=user),
            status='active'
        )
        serializer.save(binding=binding)


class ProductViewSet(viewsets.ModelViewSet):
    """商品视图集"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """只返回当前用户所属情侣绑定的商品"""
        user = self.request.user
        try:
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            return Product.objects.filter(category__binding=binding)
        except CoupleBinding.DoesNotExist:
            return Product.objects.none()
    
    def perform_create(self, serializer):
        """创建商品时验证分类归属"""
        category_id = self.request.data.get('category')
        user = self.request.user

        # 验证分类是否属于当前用户的绑定关系
        category = get_object_or_404(
            MenuCategory,
            id=category_id,
            binding__in=CoupleBinding.objects.filter(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
        )
        serializer.save(category=category)

    def create(self, request, *args, **kwargs):
        """处理创建请求，支持_method字段"""
        # 检查是否是通过_method字段指定的PUT请求
        if request.data.get('_method') == 'PUT':
            # 这是一个更新请求，但通过POST发送
            return self.update(request, *args, **kwargs)
        return super().create(request, *args, **kwargs)

    def perform_update(self, serializer):
        """更新商品时验证分类归属"""
        category_id = self.request.data.get('category')
        if category_id:
            user = self.request.user

            # 验证分类是否属于当前用户的绑定关系
            category = get_object_or_404(
                MenuCategory,
                id=category_id,
                binding__in=CoupleBinding.objects.filter(
                    models.Q(requester=user) | models.Q(receiver=user),
                    status='active'
                )
            )
            serializer.save(category=category)
        else:
            serializer.save()
