# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... 其他 URL，比如登录和登出
    path('register/', views.register, name='register'),
]