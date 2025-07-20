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
        import logging
        import smtplib
        logger = logging.getLogger('users')

        logger.info(f"收到发送验证码请求: {request.data}")
        logger.info(f"当前邮件配置 - HOST: {settings.EMAIL_HOST}, PORT: {settings.EMAIL_PORT}, USER: {settings.EMAIL_HOST_USER}")

        try:
            # 验证请求数据
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"请求数据验证失败: {serializer.errors}")
                return Response({'error': '请求数据无效', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data['email']
            logger.info(f"开始为邮箱 {email} 生成验证码")

            # 生成验证码
            try:
                verification = EmailVerificationCode.create_code_for_email(email)
                logger.info(f"验证码生成成功: {verification.code}")
            except Exception as e:
                logger.error(f"验证码生成失败: {e}")
                return Response({'error': '验证码生成失败'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 准备邮件内容
            try:
                html_message = render_to_string('email/verification_code.html', {
                    'code': verification.code
                })
                logger.info(f"邮件模板渲染成功")
            except Exception as e:
                logger.warning(f"邮件模板渲染失败，使用简单格式: {e}")
                html_message = f"""
                <html><body>
                <h2>验证码</h2>
                <p>您的验证码是：<strong style="color: #007bff; font-size: 18px;">{verification.code}</strong></p>
                <p>验证码有效期为10分钟，请尽快完成验证。</p>
                </body></html>
                """

            # 发送邮件
            try:
                logger.info(f"开始发送邮件到 {email}")

                send_mail(
                    subject='验证码 - 情侣点餐小程序',
                    message=f'您的验证码是：{verification.code}，10分钟内有效。',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False
                )
                logger.info(f"邮件发送成功到 {email}")
                return Response({'message': '验证码已发送，请查收邮件'})

            except smtplib.SMTPAuthenticationError as e:
                logger.error(f"SMTP认证失败: {e}")
                # 临时方案：记录验证码到日志
                logger.warning(f"🔑 临时验证码记录 - 邮箱: {email}, 验证码: {verification.code}")
                return Response({'message': '验证码已生成，请查看服务器日志获取验证码（临时方案）'})

            except smtplib.SMTPConnectError as e:
                logger.error(f"SMTP连接失败: {e}")
                # 临时方案：记录验证码到日志
                logger.warning(f"🔑 临时验证码记录 - 邮箱: {email}, 验证码: {verification.code}")
                return Response({'message': '验证码已生成，请查看服务器日志获取验证码（临时方案）'})

            except smtplib.SMTPException as e:
                logger.error(f"SMTP错误: {e}")
                # 临时方案：记录验证码到日志
                logger.warning(f"🔑 临时验证码记录 - 邮箱: {email}, 验证码: {verification.code}")
                return Response({'message': '验证码已生成，请查看服务器日志获取验证码（临时方案）'})

            except Exception as e:
                logger.error(f"邮件发送失败: {e}")
                # 临时方案：记录验证码到日志
                logger.warning(f"🔑 临时验证码记录 - 邮箱: {email}, 验证码: {verification.code}")
                return Response({'message': '验证码已生成，请查看服务器日志获取验证码（临时方案）'})

        except Exception as e:
            logger.error(f"发送验证码过程中出现未预期错误: {e}")
            import traceback
            logger.error(f"错误详情: {traceback.format_exc()}")
            return Response({'error': '服务器内部错误，请稍后重试'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        # 检查是否已有激活的绑定关系
        if CoupleBinding.objects.filter(
            (Q(requester=requester) | Q(receiver=requester)) &
            (Q(requester=receiver) | Q(receiver=receiver)),
            status='active'
        ).exists():
            raise ValidationError("你们已经绑定了。")

        # 检查发起者是否已有其他激活的绑定
        if CoupleBinding.objects.filter(
            Q(requester=requester) | Q(receiver=requester),
            status='active'
        ).exists():
            raise ValidationError("您已经处于一个激活的绑定关系中，无法发起新请求。")

        # 检查接收者是否已有其他激活的绑定
        if CoupleBinding.objects.filter(
            Q(requester=receiver) | Q(receiver=receiver),
            status='active'
        ).exists():
            raise ValidationError("对方已经处于一个激活的绑定关系中。")

        # 检查是否已有待处理的请求
        existing_request = CoupleBinding.objects.filter(
            requester=requester,
            receiver=receiver,
            status='requesting'
        ).first()

        if existing_request:
            raise ValidationError("您已向该用户发起过绑定请求，请等待对方回应。")

        # 检查是否有被拒绝的请求，如果有，可以重新发起
        rejected_request = CoupleBinding.objects.filter(
            requester=requester,
            receiver=receiver,
            status='rejected'
        ).first()

        if rejected_request:
            # 重新激活被拒绝的请求
            rejected_request.status = 'requesting'
            rejected_request.created_at = timezone.now()
            rejected_request.updated_at = timezone.now()
            rejected_request.save()
            return Response(CoupleBindingSerializer(rejected_request).data, status=status.HTTP_201_CREATED)

        # 创建新的绑定请求
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

    @action(detail=False, methods=['get'], url_path='binding-info', serializer_class=CoupleBindingSerializer)
    def get_binding_info(self, request):
        """
        获取当前用户的绑定信息
        """
        user = request.user

        # 查找用户当前的绑定关系（包括请求中和已激活的）
        binding = CoupleBinding.objects.filter(
            Q(requester=user) | Q(receiver=user),
            status__in=['requesting', 'active']
        ).first()

        if binding:
            serializer = self.get_serializer(binding)
            return Response(serializer.data)
        else:
            return Response(None)

    @action(detail=False, methods=['get'], url_path='binding-history', serializer_class=CoupleBindingSerializer)
    def get_binding_history(self, request):
        """
        获取当前用户的绑定历史记录（包括已解绑的）
        """
        user = request.user

        # 获取用户所有的绑定记录
        bindings = CoupleBinding.objects.filter(
            Q(requester=user) | Q(receiver=user)
        ).order_by('-created_at')

        serializer = self.get_serializer(bindings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='cancel-binding-request')
    def cancel_binding_request(self, request):
        """
        取消当前用户发起的绑定请求
        """
        user = request.user

        # 查找用户发起的待处理绑定请求
        binding = CoupleBinding.objects.filter(
            requester=user,
            status='requesting'
        ).first()

        if not binding:
            raise ValidationError("没有找到待处理的绑定请求。")

        # 删除绑定请求
        binding.delete()

        return Response({
            'message': '绑定请求已取消'
        }, status=status.HTTP_200_OK)

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
