"""
FullFoil Catalog Admin Configuration
"""

from django.contrib import admin
from .models import (
    CardSet, CardProduct, Seller, Listing,
    Order, OrderItem, SaleHistory
)


@admin.register(CardSet)
class CardSetAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'game', 'release_date', 'total_cards']
    list_filter = ['game']
    search_fields = ['code', 'name']
    ordering = ['-release_date']


@admin.register(CardProduct)
class CardProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'game', 'card_set', 'rarity', 'market_price', 'total_listings']
    list_filter = ['game', 'rarity', 'card_set']
    search_fields = ['name', 'external_id']
    ordering = ['name']
    readonly_fields = ['market_price', 'low_price', 'high_price', 'price_updated_at', 'total_listings']


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'rating', 'total_sales', 'is_verified', 'is_active']
    list_filter = ['is_verified', 'is_active']
    search_fields = ['business_name', 'user__username']


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['product', 'seller', 'condition', 'price', 'quantity', 'status']
    list_filter = ['status', 'condition', 'is_foil']
    search_fields = ['product__name', 'seller__business_name', 'sku']
    ordering = ['-created_at']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'price', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'status', 'total', 'created_at']
    list_filter = ['status']
    search_fields = ['order_number', 'customer__username']
    readonly_fields = ['order_number', 'subtotal', 'shipping_cost', 'total']
    inlines = [OrderItemInline]


@admin.register(SaleHistory)
class SaleHistoryAdmin(admin.ModelAdmin):
    list_display = ['product', 'price', 'condition', 'is_foil', 'sold_at']
    list_filter = ['condition', 'is_foil']
    search_fields = ['product__name']
    ordering = ['-sold_at']
