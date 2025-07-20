from django.db import models
from users.models import CoupleBinding


class MenuCategory(models.Model):
    """
    菜单分类 (情侣私有)
    """
    binding = models.ForeignKey(
        CoupleBinding, 
        on_delete=models.CASCADE, 
        related_name='menu_categories', 
        verbose_name="所属情侣绑定"
    )
    name = models.CharField("分类名称", max_length=100)
    description = models.TextField("描述", blank=True, null=True)
    sort_order = models.PositiveIntegerField("排序", default=0)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        verbose_name = "菜单分类"
        verbose_name_plural = verbose_name
        ordering = ['sort_order', 'created_at']
        unique_together = ('binding', 'name')  # 同一情侣不能有同名分类

    def __str__(self):
        return f"{self.binding} - {self.name}"


class Product(models.Model):
    """
    商品 (情侣私有)
    """
    category = models.ForeignKey(
        MenuCategory, 
        related_name='products', 
        on_delete=models.CASCADE, 
        verbose_name="所属分类"
    )
    name = models.CharField("商品名称", max_length=200)
    description = models.TextField("商品描述", blank=True, null=True)
    price = models.DecimalField("价格", max_digits=10, decimal_places=2)
    image_url = models.URLField("商品图片URL", blank=True, null=True)
    image = models.ImageField("商品图片", upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField("是否上架", default=True)
    sort_order = models.PositiveIntegerField("排序", default=0)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        verbose_name = "商品"
        verbose_name_plural = verbose_name
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.category.binding} - {self.name}"

    @property
    def binding(self):
        """获取所属的情侣绑定"""
        return self.category.binding
