from django.db import models
from users.models import CoupleBinding

# 商品和订单相关模型已迁移到 menus 和 orders 应用
# 这里只保留核心功能模型


class CoupleTheme(models.Model):
    """
    情侣空间个性化主题
    """
    binding = models.OneToOneField(CoupleBinding, on_delete=models.CASCADE, related_name='theme', verbose_name="所属情侣绑定")

    # 主题颜色配置
    primary_color = models.CharField("主色调", max_length=7, default='#FF69B4', help_text="十六进制颜色代码, e.g., #FF69B4")
    secondary_color = models.CharField("辅助色", max_length=7, default='#FF1493', help_text="十六进制颜色代码, e.g., #FF1493")
    background_color = models.CharField("背景色", max_length=7, default='#FFF5F8', help_text="十六进制颜色代码, e.g., #FFF5F8")

    # 主题名称
    theme_name = models.CharField("主题名称", max_length=50, default='粉色恋人')

    # 背景图片（可选）
    background_image = models.ImageField("背景图片", upload_to='themes/backgrounds/', blank=True, null=True)

    # 时间戳
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)

    def __str__(self):
        return f"情侣绑定 #{self.binding.id} 的主题 - {self.theme_name}"

    class Meta:
        verbose_name = "情侣主题"
        verbose_name_plural = verbose_name
