from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # 用户认证相关
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.UserLoginView.as_view(), name='login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 用户资料相关
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='profile_update'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    
    # 额外的用户信息接口
    path('info/', views.user_info, name='user_info'),
    
    # 调试接口
    path('debug/', views.DebugAuthView.as_view(), name='debug_auth'),
]
