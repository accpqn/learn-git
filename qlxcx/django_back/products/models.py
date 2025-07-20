from django.db import models
from django.conf import settings

# Create your models here.

class Category(models.Model):
    """
    商品分类
    """
    name = models.CharField(max_length=100, verbose_name="分类名称")
    description = models.TextField(blank=True, null=True, verbose_name="分类描述")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories', verbose_name="所有者")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "商品分类"
        verbose_name_plural = verbose_name
        unique_together = ('name', 'owner') # 同一个用户不能有同名分类

class Product(models.Model):
    """
    商品信息
    """
    name = models.CharField(max_length=200, verbose_name="商品名称")
    description = models.TextField(verbose_name="商品描述")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="商品图片")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="商品价格")
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE, verbose_name="所属分类")
    is_available = models.BooleanField(default=True, verbose_name="是否上架")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "商品"
        verbose_name_plural = verbose_name
