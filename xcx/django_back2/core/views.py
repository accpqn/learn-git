from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import CoupleTheme
from .serializers import CoupleThemeSerializer
from users.models import CoupleBinding

def get_user_binding(user):
    try:
        return CoupleBinding.objects.get(
            Q(requester=user) | Q(receiver=user),
            status='active'
        )
    except CoupleBinding.DoesNotExist:
        return None
    except CoupleBinding.MultipleObjectsReturned:
        raise ValidationError("数据错误：用户存在多个激活的绑定关系。")



class CoupleThemeViewSet(viewsets.ViewSet):
    """
    管理情侣空间的主题。
    每个绑定关系只有一个主题，因此不使用pk，而是通过当前用户定位。
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user_binding = get_user_binding(self.request.user)
        if not user_binding:
            raise PermissionDenied("您没有激活的绑定关系。")
        # 获取或创建主题对象
        theme, created = CoupleTheme.objects.get_or_create(binding=user_binding)
        return theme

    def retrieve(self, request):
        theme = self.get_object()
        serializer = CoupleThemeSerializer(theme)
        return Response(serializer.data)

    def partial_update(self, request):
        theme = self.get_object()
        serializer = CoupleThemeSerializer(theme, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
