"""
Reviews Admin Configuration
"""

from django.contrib import admin
from .models import Review, ReviewHelpful


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['order', 'seller', 'buyer', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'is_verified_purchase']
    search_fields = ['buyer__username', 'seller__business_name']
    readonly_fields = ['order', 'buyer', 'created_at']


@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ['review', 'user', 'is_helpful', 'created_at']
