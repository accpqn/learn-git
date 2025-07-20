from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, CoupleBinding, EmailVerificationCode
from .serializers import (
    UserSerializer, 
    CoupleBindingSerializer, 
    BindingRequestSerializer, 
    BindingResponseSerializer,
    SendVerificationCodeSerializer,
    VerifyCodeAndLoginSerializer,
    PasswordLoginSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    用户视图集
    提供用户注册、信息获取以及情侣绑定全周期管理。
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """根据操作设置权限"""
        if self.action in ['create', 'send_verification_code', 'verify_code_and_login', 'login']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        禁用标准的创建用户方法，引导用户使用验证码注册。
        """
        return Response(
            {'detail': '不支持此方法。请使用 /api/users/send-code/ 和 /api/users/verify-and-login/ 进行注册。'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=False, methods=['post'], url_path='login', serializer_class=PasswordLoginSerializer, permission_classes=[AllowAny])
    def login(self, request):
        """
        邮箱密码登录
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': '邮箱或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.check_password(password):
            if not user.is_active:
                return Response({'error': '用户已被禁用'}, status=status.HTTP_403_FORBIDDEN)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': UserSerializer(user).data
            })
        
        return Response({'error': '邮箱或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], url_path='send-code', serializer_class=SendVerificationCodeSerializer, permission_classes=[AllowAny])
    def send_verification_code(self, request):
        """
        发送邮箱验证码
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        # 生成验证码
        verification = EmailVerificationCode.create_code_for_email(email)
        
        # 发送邮件
        html_message = render_to_string('email/verification_code.html', {
            'code': verification.code
        })
        
        try:
            send_mail(
                subject='验证码 - 情侣点餐小程序',
                message=f'您的验证码是：{verification.code}，10分钟内有效。',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                html_message=html_message
            )
        except Exception as e:
            verification.delete()  # 发送失败，删除验证码记录
            return Response({'error': '验证码发送失败，请稍后重试'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': '验证码已发送，请查收邮件'})

    @action(detail=False, methods=['post'], url_path='verify-and-login', serializer_class=VerifyCodeAndLoginSerializer, permission_classes=[AllowAny])
    def verify_code_and_login(self, request):
        """
        验证码登录或注册
        - 验证邮箱和验证码
        - 如果用户不存在则创建新用户（此时需要密码）
        - 返回JWT token
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data.get('password') # 获取密码
        verification = serializer.validated_data['verification']
        
        # 标记验证码为已使用
        verification.is_used = True
        verification.save()
        
        try:
            # 尝试获取用户
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # 用户不存在，创建新用户
            username = email.split('@')[0]
            # 确保用户名唯一
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password, # 设置密码
                is_active=True
            )
        except User.MultipleObjectsReturned:
            # 处理重复邮箱的情况
            users = User.objects.filter(email=email)
            # 使用第一个用户，删除其他用户
            user = users.first()
            users.exclude(id=user.id).delete()
        
        # 生成JWT token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'token': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': UserSerializer(user).data
        })

    @action(detail=False, methods=['get'], url_path='me', serializer_class=UserSerializer)
    def me(self, request):
        """
        获取当前登录用户的详细信息，并附带其当前绑定关系的状态。
        """
        user = request.user
        serializer = self.get_serializer(user)
        data = serializer.data

        # 查找用户有效的绑定关系 (请求中或已激活)
        binding = CoupleBinding.objects.filter(
            Q(requester=user) | Q(receiver=user),
            status__in=['requesting', 'active']
        ).first()

        data['binding'] = CoupleBindingSerializer(binding).data if binding else None
        return Response(data)

    @action(detail=False, methods=['put', 'patch'], url_path='update-profile', serializer_class=UserSerializer)
    def update_profile(self, request):
        """
        更新当前用户的个人信息
        """
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='upload-avatar')
    def upload_avatar(self, request):
        """
        上传用户头像
        """
        user = request.user

        if 'avatar' not in request.FILES:
            return Response(
                {'detail': '请选择要上传的头像文件'},
                status=status.HTTP_400_BAD_REQUEST
            )

        avatar_file = request.FILES['avatar']

        # 验证文件类型
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {'detail': '只支持 JPEG、PNG、GIF 格式的图片'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 验证文件大小 (5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'detail': '头像文件大小不能超过 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 删除旧头像文件
        if user.avatar and hasattr(user.avatar, 'path'):
            try:
                import os
                if os.path.exists(user.avatar.path):
                    os.remove(user.avatar.path)
            except Exception as e:
                print(f"删除旧头像失败: {e}")

        # 保存新头像
        user.avatar = avatar_file
        user.save()

        serializer = self.get_serializer(user)
        return Response({
            'detail': '头像上传成功',
            'user': serializer.data
        })

    @action(detail=False, methods=['post'], url_path='send-binding-request', serializer_class=BindingRequestSerializer)
    def send_binding_request(self, request):
        """
        向指定邮箱的用户发起一个绑定请求。
        """
        requester = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            receiver = User.objects.get(email=email)
        except User.DoesNotExist:
             raise ValidationError("该邮箱对应的用户不存在。")

        if requester == receiver:
            raise ValidationError("不能向自己发起绑定请求。")

        # 检查双方是否已有绑定或请求
        if CoupleBinding.objects.filter(
            (Q(requester=requester) & Q(receiver=receiver)) | (Q(requester=receiver) & Q(receiver=requester))
        ).exists():
            raise ValidationError("你们之间已存在一个绑定或请求。")
            
        if requester.bindings.filter(status='active').exists():
            raise ValidationError("您已经处于一个激活的绑定关系中，无法发起新请求。")
            
        if receiver.bindings.filter(status='active').exists():
            raise ValidationError("对方已经处于一个激活的绑定关系中。")

        binding = CoupleBinding.objects.create(requester=requester, receiver=receiver)
        return Response(CoupleBindingSerializer(binding).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='pending-bindings', serializer_class=CoupleBindingSerializer)
    def list_pending_bindings(self, request):
        """
        列出当前用户收到的、等待处理的绑定请求。
        """
        pending_requests = CoupleBinding.objects.filter(receiver=request.user, status='requesting')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='respond-binding', serializer_class=BindingResponseSerializer)
    def respond_binding_request(self, request, pk=None):
        """
        响应一个绑定请求（接受或拒绝）。URL中的pk是CoupleBinding的id。
        """
        binding = get_object_or_404(CoupleBinding, pk=pk)
        
        if binding.receiver != request.user:
            raise PermissionDenied("您无权响应此绑定请求。")
        
        if binding.status != 'requesting':
            raise ValidationError("该请求已被处理或已失效。")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action_type = serializer.validated_data['action']

        if action_type == 'accept':
            # 接受前再次检查双方是否已有其他激活的绑定
            if binding.requester.bindings.filter(status='active').exists() or binding.receiver.bindings.filter(status='active').exists():
                binding.status = 'rejected'
                binding.save()
                raise ValidationError("操作失败，对方或您已与其他用户绑定。该请求已自动拒绝。")
            binding.status = 'active'
            binding.save()
        else: # 'reject'
            binding.status = 'rejected'
            binding.save()

        return Response(CoupleBindingSerializer(binding).data)

    @action(detail=True, methods=['post'], url_path='unbind')
    def unbind(self, request, pk=None):
        """
        解除一个已激活的绑定关系。URL中的pk是CoupleBinding的id。
        注意：解绑不会删除历史数据，只是将绑定状态设为已解除。
        """
        binding = get_object_or_404(CoupleBinding, pk=pk)
        user = request.user

        if user not in [binding.requester, binding.receiver]:
            raise PermissionDenied("您不在此绑定关系中，无法操作。")

        if binding.status != 'active':
            raise ValidationError("该绑定关系不处于激活状态，无法解除。")

        # 不删除绑定记录，而是将状态设为已解除
        # 这样可以保留历史数据（菜单、商品、订单等）
        binding.status = 'unbound'  # 需要在模型中添加这个状态
        binding.unbound_at = timezone.now()  # 需要在模型中添加这个字段
        binding.unbound_by = user  # 记录是谁发起的解绑
        binding.save()

        return Response({
            'message': '解绑成功，历史数据已保留',
            'binding_id': binding.id,
            'unbound_at': binding.unbound_at
        }, status=status.HTTP_200_OK)
