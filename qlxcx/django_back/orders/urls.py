from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DemandOrderViewSet, DemandOrderItemViewSet

router = DefaultRouter()
router.register(r'demand-orders', DemandOrderViewSet, basename='demandorder')
router.register(r'demand-order-items', DemandOrderItemViewSet, basename='demandorderitem')

urlpatterns = [
    path('', include(router.urls)),
]
