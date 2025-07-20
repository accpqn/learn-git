from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'description')
    list_filter = ('owner',)
    search_fields = ('name', 'owner__username')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available')
    list_filter = ('is_available', 'category__owner')
    search_fields = ('name', 'category__name', 'category__owner__username')
