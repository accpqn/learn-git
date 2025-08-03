from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.utils import timezone
from .token_manager import TokenManager
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer
)

User = get_user_model()

class UserRegistrationView(APIView):
    """用户注册API"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            return Response({
                'message': '注册成功，请登录获取访问权限',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': '注册失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    用户登录API
        验证 用户名/密码
        清理用户的所有旧token
        生成新的JWT token对
    """
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # 使用Django内置认证验证用户凭据
            user = authenticate(username=username, password=password)
            if user:
                # 更新最后登录时间
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                
                # 登录前清理用户的所有旧token
                cleaned_count = TokenManager.cleanup_user_tokens(user)
                
                # 生成新的token对并自动追踪
                tokens = TokenManager.generate_tokens_for_user(user)

                response_data = {
                    'message': '登录成功',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                    },
                    'tokens': tokens
                }
                
                # 如果清理了旧token，在响应中提示用户
                if cleaned_count > 0:
                    response_data['info'] = f'已清理 {cleaned_count} 个旧的登录会话'

                return Response(response_data, status=status.HTTP_200_OK)

            return Response({
                'message': '用户名或密码错误'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'message': '登录失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """
    用户登出API
        将用户的refresh token加入官方黑名单（数据库存储）
        将用户的access token加入自定义黑名单（缓存存储）
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # 使用 TokenManager 将两个token加入黑名单
        result = TokenManager.logout_user(request)
        
        if result['success']:
            return Response({
                'message': result['message']
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': result['message']
            }, status=status.HTTP_400_BAD_REQUEST)
    

class CustomTokenRefreshView(BaseTokenRefreshView):
    """
    自定义Token刷新视图
        使用refresh token生成新的access token
        将旧的access token加入黑名单
        追踪新生成的access token
    """
    
    def post(self, request, *args, **kwargs):
        # 调用父类方法生成新的access token
        response = super().post(request, *args, **kwargs)
        
        # 如果刷新成功，进行安全处理
        if response.status_code == 200:
            response_data = response.data
            
            # 使用TokenManager统一处理token刷新逻辑
            # 1. 将旧的access token加入黑名单
            # 2. 追踪新生成的access token
            new_access_token = response_data.get('access')
            refresh_token_string = request.data.get('refresh')
            
            success = TokenManager.refresh_user_token(
                request, 
                new_access_token, 
                refresh_token_string
            )
            
            if success:
                response_data['info'] = '已刷新token，旧的access token已失效'
            else:
                response_data['info'] = '已刷新token'
                
            response.data = response_data
        
        return response


class UserProfileView(APIView):
    """用户资料查看API"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response({
            'message': '获取用户资料成功',
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class UserProfileUpdateView(APIView):
    """用户资料更新API"""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user,      # 第一个参数是要更新的对象实例
            data=request.data, # 新的数据
            partial=True,      # 允许部分更新
            context={'request': request}  # 传递request上下文
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': '资料更新成功',
                'user': serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            'message': '资料更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """密码修改API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                'message': '密码修改成功'
            }, status=status.HTTP_200_OK)

        return Response({
            'message': '密码修改失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# 可选：使用函数式视图
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """获取当前用户信息"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar': user.avatar.url if user.avatar else None,
        'bio': user.bio,
        'date_joined': user.date_joined,
    })

# 调试视图（仅开发环境使用）
class DebugAuthView(APIView):
    """调试认证问题 - 仅用于开发调试"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # 检查认证信息
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'No Authorization header')
        user = request.user
        is_authenticated = user.is_authenticated
        
        # 获取token统计信息
        token_stats = TokenManager.get_token_stats()
        if is_authenticated:
            user_token_stats = TokenManager.get_token_stats(user)
        else:
            user_token_stats = None
        
        return Response({
            'auth_header': auth_header,
            'user': str(user),
            'is_authenticated': is_authenticated,
            'user_id': user.id if is_authenticated else None,
            'username': user.username if is_authenticated else None,
            'global_token_stats': token_stats,
            'user_token_stats': user_token_stats,
        })