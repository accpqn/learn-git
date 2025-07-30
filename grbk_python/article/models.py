from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils.text import slugify
from django.utils import timezone
from pypinyin import lazy_pinyin, Style
import re

User = get_user_model()

class Article(models.Model):
    """文章模型"""
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
    ]
    
    # 基本字段
    title = models.CharField(max_length=200, verbose_name='文章标题')
    # slug字段可以在url中友好的标识资源
    slug = models.SlugField(max_length=200, unique=True, verbose_name='URL别名', blank=True)
    summary = models.TextField(max_length=500, blank=True, verbose_name='文章摘要')
    content = models.TextField(verbose_name='文章内容')
    
    # 关联信息
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='articles',
        verbose_name='作者'
    )
    
    # 状态
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='状态'
    )
    
    # 统计字段
    view_count = models.PositiveIntegerField(default=0, verbose_name='浏览量')
    
    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='发布时间')
    
    class Meta:
        verbose_name = '文章'
        verbose_name_plural = '文章'
        ordering = ['-created_at']
    # tostring()
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # 自动生成 slug
        if not self.slug:
            # 处理中文标题，转换为拼音
            if re.search(r'[\u4e00-\u9fff]', self.title):  # 检测是否包含中文
                # 将中文转换为拼音，用连字符连接
                pinyin_list = lazy_pinyin(self.title, style=Style.NORMAL)
                slug_text = '-'.join(pinyin_list)
                # 清理特殊字符，只保留字母、数字和连字符
                slug_text = re.sub(r'[^\w\s-]', '', slug_text)
                slug_text = re.sub(r'[-\s]+', '-', slug_text)
                self.slug = slug_text.lower().strip('-')
            else:
                # 英文标题直接使用 Django 的 slugify
                self.slug = slugify(self.title)
            
            # 确保 slug 唯一
            original_slug = self.slug
            counter = 1
            while Article.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        # 设置发布时间
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        elif self.status != 'published':
            self.published_at = None
            
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('article:detail', kwargs={'slug': self.slug})
    
    @property
    def is_published(self):
        return self.status == 'published'
