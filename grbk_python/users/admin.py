from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# 注册模型到管理后台
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """自定义用户管理
    UserAdmin 已经包含了用户管理的所有基本功能（密码加密、权限管理等）
    我们只需要添加或修改我们需要的部分
    不用从零开始写用户管理功能
    """
    """
    定义在管理后台用户列表页面显示哪些字段
    这些字段会以表格列的形式显示
    """
    list_display = ('username', 'email', 'is_staff', 'date_joined')
    """
    在管理后台右侧添加过滤器
    可以按这些字段快速筛选用户
    """
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')

    """
    在管理后台顶部添加搜索框
    可以按用户名或邮箱搜索用户
    """
    search_fields = ('username', 'email')
    """
    定义用户编辑页面的字段分组和布局
    UserAdmin.fieldsets 是原有的字段分组
    我们在后面添加了一个新的分组
    """
    fieldsets = UserAdmin.fieldsets + (
        ('额外信息', {'fields': ('avatar', 'bio')}),
    )
    
    """
    定义创建用户时的字段分组和布局
    这个配置用于 /admin/users/customuser/add/ 页面
    """
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        ('额外信息', {
            'classes': ('wide',),
            'fields': ('avatar', 'bio'),
        }),
    )
