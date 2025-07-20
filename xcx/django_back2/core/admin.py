from django.contrib import admin
from .models import CoupleTheme

@admin.register(CoupleTheme)
class CoupleThemeAdmin(admin.ModelAdmin):
    list_display = ('binding', 'theme_name', 'primary_color', 'secondary_color', 'background_color', 'updated_at')
    list_filter = ('theme_name', 'created_at', 'updated_at')
    search_fields = ('binding__id', 'theme_name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('binding',)

    fieldsets = (
        ('基本信息', {
            'fields': ('binding', 'theme_name')
        }),
        ('颜色配置', {
            'fields': ('primary_color', 'secondary_color', 'background_color')
        }),
        ('背景图片', {
            'fields': ('background_image',),
            'classes': ('collapse',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
