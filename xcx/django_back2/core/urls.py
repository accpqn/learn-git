from django.urls import path, include
from .views import CoupleThemeViewSet


urlpatterns = [
    # 用于管理情侣主题 (单例路由)
    path('theme/', CoupleThemeViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'}), name='couple-theme'),

]