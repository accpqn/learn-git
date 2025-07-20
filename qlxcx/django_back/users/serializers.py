from rest_framework import serializers
from django.utils import timezone
from django.conf import settings
from .models import User, CoupleBinding, EmailVerificationCode


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_url', 'avatar', 'bio', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'write_only': True}  # 头像文件只用于上传，不在响应中返回
        }

    def get_avatar_url(self, obj):
        """
        获取头像URL，优先返回上传的头像文件URL
        """
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return obj.avatar_url or ''

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSimpleSerializer(serializers.ModelSerializer):
    """
    简化的用户序列化器，用于在其他模型中嵌套显示用户信息
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'avatar_url')


class SendVerificationCodeSerializer(serializers.Serializer):
    """
    发送验证码的序列化器
    """
    email = serializers.EmailField(label="邮箱地址")

    def validate_email(self, value):
        """
        验证邮箱地址，并检查发送频率
        """
        # 检查是否存在未过期的验证码
        last_code = EmailVerificationCode.objects.filter(
            email=value,
            created_at__gt=timezone.now() - timezone.timedelta(seconds=settings.VERIFICATION_CODE_COOLDOWN)
        ).first()
        
        if last_code:
            time_passed = timezone.now() - last_code.created_at
            cooldown_remaining = settings.VERIFICATION_CODE_COOLDOWN - time_passed.seconds
            raise serializers.ValidationError(f"请等待 {cooldown_remaining} 秒后再次发送验证码")
        
        return value


class VerifyCodeAndLoginSerializer(serializers.Serializer):
    """
    验证码登录/注册的序列化器
    """
    email = serializers.EmailField(label="邮箱地址")
    code = serializers.CharField(label="验证码", max_length=6, min_length=6)
    password = serializers.CharField(label="密码", write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        password = attrs.get('password')
        
        # 查找最近的未使用的验证码
        verification = EmailVerificationCode.objects.filter(
            email=email,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        
        if not verification:
            raise serializers.ValidationError("验证码无效或已过期")
        
        # 检查是否为新用户注册，如果是，则密码为必填
        is_new_user = not User.objects.filter(email=email).exists()
        if is_new_user and not password:
            raise serializers.ValidationError({"password": "首次注册需要设置密码。"})

        # 将验证码对象添加到验证后的数据中，以便视图使用
        attrs['verification'] = verification
        return attrs


class PasswordLoginSerializer(serializers.Serializer):
    """
    邮箱密码登录的序列化器
    """
    email = serializers.EmailField(label="邮箱地址")
    password = serializers.CharField(label="密码", style={'input_type': 'password'}, write_only=True)


class CoupleBindingSerializer(serializers.ModelSerializer):
    requester = UserSimpleSerializer(read_only=True)
    receiver = UserSimpleSerializer(read_only=True)

    class Meta:
        model = CoupleBinding
        fields = ['id', 'requester', 'receiver', 'status', 'created_at']


class BindingRequestSerializer(serializers.Serializer):
    """
    用于发起绑定请求的序列化器
    """
    email = serializers.EmailField(label="接收方邮箱")

    def validate_email(self, value):
        # 检查邮箱对应的用户是否存在
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("该邮箱对应的用户不存在。")
        return value


class BindingResponseSerializer(serializers.Serializer):
    """
    用于响应绑定请求的序列化器
    """
    action = serializers.ChoiceField(choices=['accept', 'reject']) 