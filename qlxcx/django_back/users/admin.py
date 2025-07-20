from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CoupleBinding


# 我们自定义的 UserAdmin，继承自 Django 基础的 UserAdmin
# 这允许我们在保持原有强大功能（如密码修改、权限管理）的基础上，添加自定义的功能
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    用户模型的后台管理界面配置
    """
    # 在后台用户列表页显示的字段
    list_display = ('id', 'username', 'email', 'is_staff', 'avatar_url')
    # 在列表页顶部提供一个搜索框，可以按用户名和邮箱进行搜索
    search_fields = ('username', 'email')
    # 在列表页右侧提供一个过滤器，可以按是否为 staff 或 superuser 进行筛选
    list_filter = ('is_staff', 'is_superuser', 'groups')


@admin.register(CoupleBinding)
class CoupleBindingAdmin(admin.ModelAdmin):
    """
    情侣绑定模型的后台管理界面配置
    """
    # 在后台列表页显示的字段
    list_display = ('id', 'requester', 'receiver', 'status', 'created_at')
    # 允许在列表页直接编辑的字段，方便管理员快速修改状态
    list_editable = ('status',)
    # 在列表页顶部提供一个搜索框，可以按双方的用户名进行搜索
    search_fields = ('requester__username', 'receiver__username')
    # 在列表页右侧提供一个按“状态”筛选的过滤器
    list_filter = ('status', 'created_at')
    # autocomplete_fields 用于在添加/编辑页面提供一个带搜索功能的用户选择下拉框，
    # 避免在用户量大时加载所有用户导致页面卡顿。
    autocomplete_fields = ('requester', 'receiver')
