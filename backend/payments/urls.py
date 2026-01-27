"""
Payments URL Configuration
"""

from django.urls import path
from .views import CreatePaymentIntentView, PaymentStatusView, StripeWebhookView

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('status/<str:payment_intent_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
