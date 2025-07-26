from django.db import models
from django.contrib.auth.models import AbstractUser
from django.urls import reverse

class CustomUser(AbstractUser):
    """自定义用户模型"""
    email = models.EmailField(verbose_name='邮箱',unique=True,blank=False,help_text='请输入有效的邮箱地址')
    avatar = models.ImageField(verbose_name='头像',upload_to='avatars/',blank=True,null=True,help_text='上传用户头像')
    bio = models.TextField(verbose_name='个人简介',max_length=500,blank=True,help_text='简单介绍一下自己')

    """
    Meta 类的作用：
        Meta 类是 Django 模型的内部类，用来定义模型的元数据（metadata）
        它不会影响数据库结构，主要是给 Django 管理后台和其他地方使用
    """
    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
    
    def __str__(self):
        return self.username
    
    def get_absolute_url(self):
        return reverse('users:profile')

