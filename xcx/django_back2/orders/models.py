from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CoupleBinding
from menus.models import Product


class DemandOrder(models.Model):
    """
    需求订单 (情侣私有)
    """
    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', '待处理'
        CONFIRMED = 'CONFIRMED', '已确认'
        ORDERED = 'ORDERED', '已下单'
        COMPLETED = 'COMPLETED', '已完成'
        RATED = 'RATED', '已评价'
        CANCELLED = 'CANCELLED', '已取消'

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_demand_orders', 
        verbose_name="创建人"
    )
    binding = models.ForeignKey(
        CoupleBinding, 
        on_delete=models.CASCADE, 
        related_name='demand_orders', 
        verbose_name="所属情侣绑定"
    )
    status = models.CharField(
        "订单状态", 
        max_length=20, 
        choices=OrderStatus.choices, 
        default=OrderStatus.PENDING
    )
    notes = models.TextField("备注", blank=True, null=True)
    total_price = models.DecimalField("总价", max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    class Meta:
        verbose_name = "需求订单"
        verbose_name_plural = verbose_name
        ordering = ['-created_at']

    def __str__(self):
        return f"订单#{self.id} - {self.creator.username} - {self.get_status_display()}"

    @property
    def created_by_current_user(self):
        """用于前端判断是否为当前用户创建的订单"""
        # 这个属性会在序列化器中动态设置
        return getattr(self, '_created_by_current_user', False)


class DemandOrderItem(models.Model):
    """
    需求订单项
    """
    order = models.ForeignKey(
        DemandOrder, 
        related_name='items', 
        on_delete=models.CASCADE, 
        verbose_name="所属订单"
    )
    product = models.ForeignKey(
        Product, 
        related_name='order_items', 
        on_delete=models.CASCADE, 
        verbose_name="商品"
    )
    quantity = models.PositiveIntegerField("数量", default=1)
    price = models.DecimalField(
        "单价", 
        max_digits=10, 
        decimal_places=2, 
        help_text="下单时的商品单价"
    )
    actual_price = models.DecimalField(
        "实际价格", 
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        help_text="接收方填写的实际单价"
    )
    receiver_notes = models.TextField("接收方备注", blank=True, null=True)

    class Meta:
        verbose_name = "需求订单项"
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.order} - {self.product.name} x{self.quantity}"

    @property
    def total_price(self):
        """计算订单项总价"""
        return self.price * self.quantity

    @property
    def actual_total_price(self):
        """计算实际总价"""
        if self.actual_price:
            return self.actual_price * self.quantity
        return self.total_price


class OrderReview(models.Model):
    """
    订单评价
    """
    order = models.OneToOneField(
        DemandOrder, 
        on_delete=models.CASCADE, 
        related_name='review', 
        verbose_name="关联订单"
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews', 
        verbose_name="评价人"
    )
    rating = models.PositiveSmallIntegerField(
        "评分", 
        validators=[MinValueValidator(1), MaxValueValidator(5)], 
        help_text="1-5分"
    )
    comment = models.TextField("评论内容", blank=True, null=True)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)

    class Meta:
        verbose_name = "订单评价"
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"订单#{self.order.id}的评价 - {self.rating}分"
