from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.utils import timezone
import random
import string


def user_avatar_path(instance, filename):
    """
    用户头像上传路径
    """
    import os
    from django.utils import timezone

    # 获取文件扩展名
    ext = filename.split('.')[-1]
    # 生成新的文件名：用户ID_时间戳.扩展名
    new_filename = f"user_{instance.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    return os.path.join('avatars', new_filename)


class User(AbstractUser):
    """
    自定义用户模型
    """
    email = models.EmailField('邮箱地址', unique=True)
    openid = models.CharField(max_length=128, unique=True, null=True, blank=True, verbose_name='微信用户唯一标识')
    avatar_url = models.URLField(max_length=255, blank=True, verbose_name='头像链接')
    avatar = models.ImageField(upload_to=user_avatar_path, blank=True, null=True, verbose_name='头像文件')
    bio = models.TextField(max_length=500, blank=True, verbose_name='个人简介')

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.username

    @property
    def bindings(self):
        """
        返回用户参与的所有绑定关系 (作为发起者或接收者)
        """
        from .models import CoupleBinding
        return CoupleBinding.objects.filter(Q(requester=self) | Q(receiver=self))


class EmailVerificationCode(models.Model):
    """
    邮箱验证码模型
    用于存储发送的验证码及其状态
    """
    email = models.EmailField('邮箱地址')
    code = models.CharField('验证码', max_length=6)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    expires_at = models.DateTimeField('过期时间')
    is_used = models.BooleanField('是否已使用', default=False)
    
    class Meta:
        verbose_name = '邮箱验证码'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.code}"

    @classmethod
    def generate_code(cls):
        """生成6位随机验证码"""
        return ''.join(random.choices(string.digits, k=6))

    @classmethod
    def create_code_for_email(cls, email):
        """为指定邮箱创建新的验证码"""
        # 设置验证码有效期为10分钟
        expires_at = timezone.now() + timezone.timedelta(minutes=10)
        code = cls.generate_code()
        
        # 创建新的验证码记录
        verification_code = cls.objects.create(
            email=email,
            code=code,
            expires_at=expires_at
        )
        
        return verification_code

    def is_valid(self):
        """检查验证码是否有效"""
        now = timezone.now()
        return not self.is_used and now <= self.expires_at


class CoupleBinding(models.Model):
    """
    情侣绑定模型
    """
    BINDING_STATUS_CHOICES = [
        ('requesting', '请求中'),
        ('active', '绑定成功'),
        ('rejected', '已拒绝'),
        ('unbound', '已解绑'),
    ]

    requester = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='initiated_bindings',
        verbose_name='发起绑定的用户'
    )
    receiver = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='received_bindings',
        verbose_name='接收绑定的用户'
    )
    status = models.CharField(
        max_length=20,
        choices=BINDING_STATUS_CHOICES,
        default='requesting',
        verbose_name='绑定状态'
    )
    binding_token = models.CharField(max_length=255, unique=True, null=True, blank=True, verbose_name='绑定令牌')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    # 解绑相关字段
    unbound_at = models.DateTimeField(null=True, blank=True, verbose_name='解绑时间')
    unbound_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='initiated_unbindings',
        verbose_name='发起解绑的用户'
    )

    class Meta:
        verbose_name = '情侣绑定'
        verbose_name_plural = verbose_name
        # 移除 unique_together 约束，允许重复绑定请求（通过业务逻辑控制）

    def __str__(self):
        return f'{self.requester.username} -> {self.receiver.username} ({self.get_status_display()})'
