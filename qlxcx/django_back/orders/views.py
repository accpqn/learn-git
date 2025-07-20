from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from users.models import CoupleBinding
from .models import DemandOrder, DemandOrderItem, OrderReview
from .serializers import (
    DemandOrderSerializer, 
    OrderCreateSerializer, 
    DemandOrderItemSerializer,
    OrderReviewSerializer
)


class DemandOrderViewSet(viewsets.ModelViewSet):
    """需求订单视图集"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """只返回当前用户所属情侣绑定的订单"""
        user = self.request.user
        try:
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            return DemandOrder.objects.filter(binding=binding)
        except CoupleBinding.DoesNotExist:
            return DemandOrder.objects.none()
    
    def get_serializer_class(self):
        """根据action选择序列化器"""
        if self.action == 'create':
            return OrderCreateSerializer
        return DemandOrderSerializer
    
    def perform_create(self, serializer):
        """创建订单时自动关联到当前用户和绑定关系"""
        user = self.request.user
        binding = get_object_or_404(
            CoupleBinding,
            models.Q(requester=user) | models.Q(receiver=user),
            status='active'
        )
        serializer.save(creator=user, binding=binding)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """获取我发出的订单"""
        user = request.user
        try:
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            orders = DemandOrder.objects.filter(binding=binding, creator=user)
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data)
        except CoupleBinding.DoesNotExist:
            return Response([])

    @action(detail=False, methods=['get'])
    def received(self, request):
        """获取我收到的订单"""
        user = request.user
        try:
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            # 收到的订单是绑定关系中其他人创建的订单
            orders = DemandOrder.objects.filter(binding=binding).exclude(creator=user)
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data)
        except CoupleBinding.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """更新订单状态"""
        order = self.get_object()
        new_status = request.data.get('status')

        if new_status not in [choice[0] for choice in DemandOrder.OrderStatus.choices]:
            return Response(
                {'error': '无效的订单状态'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """添加订单评价"""
        order = self.get_object()
        
        # 检查订单是否已完成
        if order.status != DemandOrder.OrderStatus.COMPLETED:
            return Response(
                {'error': '只能对已完成的订单进行评价'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 检查是否已经评价过
        if hasattr(order, 'review'):
            return Response(
                {'error': '该订单已经评价过了'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = OrderReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order, creator=request.user)
            
            # 更新订单状态为已评价
            order.status = DemandOrder.OrderStatus.RATED
            order.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DemandOrderItemViewSet(viewsets.ModelViewSet):
    """订单项视图集"""
    serializer_class = DemandOrderItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """只返回当前用户所属情侣绑定的订单项"""
        user = self.request.user
        try:
            binding = CoupleBinding.objects.get(
                models.Q(requester=user) | models.Q(receiver=user),
                status='active'
            )
            return DemandOrderItem.objects.filter(order__binding=binding)
        except CoupleBinding.DoesNotExist:
            return DemandOrderItem.objects.none()
    
    def update(self, request, *args, **kwargs):
        """更新订单项（主要用于接收方填写实际价格和备注）"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # 只允许更新actual_price和receiver_notes字段
        allowed_fields = ['actual_price', 'receiver_notes']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(instance, data=filtered_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
