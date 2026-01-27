"""
Reviews Models - Rating and Review System
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

User = get_user_model()


class Review(models.Model):
    """
    Customer review for a completed order/seller.
    
    Features:
    - Verified purchase badge
    - 1-5 star rating
    - Seller can respond
    """
    
    # Relationships
    order = models.OneToOneField(
        'catalog.Order',
        on_delete=models.CASCADE,
        related_name='review'
    )
    seller = models.ForeignKey(
        'catalog.Seller',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    
    # Review content
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    
    # Verification
    is_verified_purchase = models.BooleanField(default=True)
    
    # Seller response
    seller_response = models.TextField(blank=True)
    seller_response_at = models.DateTimeField(null=True, blank=True)
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_reported = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        # One review per order
        unique_together = ['order', 'buyer']
    
    def __str__(self):
        return f"{self.rating}★ - {self.buyer.username} → {self.seller.business_name}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update seller's average rating
        self._update_seller_rating()
    
    def _update_seller_rating(self):
        """Recalculate seller's average rating."""
        avg = Review.objects.filter(
            seller=self.seller,
            is_approved=True
        ).aggregate(avg_rating=Avg('rating'))['avg_rating']
        
        if avg:
            self.seller.rating = round(avg, 2)
            self.seller.save(update_fields=['rating'])
    
    @classmethod
    def can_review(cls, order):
        """Check if an order can be reviewed."""
        from catalog.models import Order
        
        # Must be delivered
        if order.status != Order.Status.DELIVERED:
            return False
        
        # Must not have existing review
        if cls.objects.filter(order=order).exists():
            return False
        
        return True


class ReviewHelpful(models.Model):
    """
    Track helpful votes on reviews.
    """
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpful_votes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    is_helpful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['review', 'user']
