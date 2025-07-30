from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'view_count', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at', 'author']
    search_fields = ['title', 'content', 'summary']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'

    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'slug', 'summary', 'content')
        }),
        ('状态设置', {
            'fields': ('status',)
        }),
        ('统计信息', {
            'fields': ('view_count',),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # 创建新文章时
            obj.author = request.user
        super().save_model(request, obj, form, change)
