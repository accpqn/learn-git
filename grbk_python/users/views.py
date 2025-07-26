from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
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

            # 生成JWT token
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': '注册成功',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': '注册失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """用户登录API"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)
            if user:
                # 生成JWT token
                refresh = RefreshToken.for_user(user)

                return Response({
                    'message': '登录成功',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_200_OK)

            return Response({
                'message': '用户名或密码错误'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'message': '登录失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """用户登出API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({
                    'message': '缺少 refresh token'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                'message': '登出成功'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': f'登出失败: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """用户资料查看API"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
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
            partial=True       # 允许部分更新
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
        
        return Response({
            'auth_header': auth_header,
            'user': str(user),
            'is_authenticated': is_authenticated,
            'user_id': user.id if is_authenticated else None,
            'username': user.username if is_authenticated else None,
        })