from django.contrib import admin
from .models import MenuCategory, Product


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'binding', 'product_count', 'sort_order', 'created_at']
    list_filter = ['binding', 'created_at']
    search_fields = ['name', 'binding__requester__username', 'binding__receiver__username']
    ordering = ['binding', 'sort_order', 'created_at']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = '商品数量'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_active', 'sort_order', 'created_at']
    list_filter = ['category__binding', 'category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'category__name']
    ordering = ['category', 'sort_order', 'created_at']
    list_editable = ['price', 'is_active', 'sort_order']
