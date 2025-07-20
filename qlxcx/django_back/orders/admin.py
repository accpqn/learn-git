from django.contrib import admin
from .models import DemandOrder, DemandOrderItem, OrderReview


class DemandOrderItemInline(admin.TabularInline):
    model = DemandOrderItem
    extra = 0
    readonly_fields = ['total_price', 'actual_total_price']


@admin.register(DemandOrder)
class DemandOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'creator', 'binding', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'binding', 'created_at']
    search_fields = ['creator__username', 'binding__requester__username', 'binding__receiver__username']
    ordering = ['-created_at']
    inlines = [DemandOrderItemInline]
    readonly_fields = ['total_price', 'created_at', 'updated_at']


@admin.register(DemandOrderItem)
class DemandOrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price', 'actual_price', 'total_price']
    list_filter = ['order__status', 'order__binding', 'product__category']
    search_fields = ['product__name', 'order__creator__username']
    readonly_fields = ['total_price', 'actual_total_price']


@admin.register(OrderReview)
class OrderReviewAdmin(admin.ModelAdmin):
    list_display = ['order', 'creator', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['order__creator__username', 'creator__username', 'comment']
    readonly_fields = ['created_at']
