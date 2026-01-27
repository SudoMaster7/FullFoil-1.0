"""
Payments Admin Configuration
"""

from django.contrib import admin
from .models import Payment, WebhookEvent


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['stripe_payment_intent_id', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'currency']
    search_fields = ['stripe_payment_intent_id', 'user__username']
    readonly_fields = ['stripe_payment_intent_id', 'created_at', 'paid_at']


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ['stripe_event_id', 'event_type', 'processed', 'created_at']
    list_filter = ['event_type', 'processed']
    readonly_fields = ['stripe_event_id', 'event_type', 'payload', 'created_at']
