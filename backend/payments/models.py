"""
Payments Models - Stripe Integration
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class PaymentStatus(models.TextChoices):
    """Payment status options."""
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    SUCCEEDED = 'succeeded', 'Succeeded'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'
    REFUNDED = 'refunded', 'Refunded'


class Payment(models.Model):
    """
    Payment record linked to Stripe PaymentIntent.
    """
    # Stripe identifiers
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, db_index=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    
    # User and order
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='payments'
    )
    order = models.OneToOneField(
        'catalog.Order',
        on_delete=models.CASCADE,
        related_name='payment',
        null=True,
        blank=True
    )
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='brl')
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    
    # Metadata
    description = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)
    failure_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
    
    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.status}"
    
    def mark_as_paid(self):
        """Mark payment as succeeded."""
        self.status = PaymentStatus.SUCCEEDED
        self.paid_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, message=''):
        """Mark payment as failed."""
        self.status = PaymentStatus.FAILED
        self.failure_message = message
        self.save()


class WebhookEvent(models.Model):
    """
    Log of Stripe webhook events for debugging and idempotency.
    """
    stripe_event_id = models.CharField(max_length=255, unique=True, db_index=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"
