"""
Reviews Serializers
"""

from rest_framework import serializers
from .models import Review, ReviewHelpful


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reading reviews."""
    buyer_name = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    helpful_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'order', 'seller', 'buyer',
            'rating', 'title', 'comment',
            'is_verified_purchase',
            'seller_response', 'seller_response_at',
            'created_at', 'buyer_name', 'seller_name',
            'helpful_count'
        ]
        read_only_fields = [
            'id', 'seller', 'buyer', 'is_verified_purchase',
            'seller_response', 'seller_response_at', 'created_at'
        ]
    
    def get_buyer_name(self, obj):
        # Show partial name for privacy
        name = obj.buyer.first_name or obj.buyer.username
        if len(name) > 2:
            return f"{name[0]}***{name[-1]}"
        return name
    
    def get_helpful_count(self, obj):
        return obj.helpful_votes.filter(is_helpful=True).count()


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""
    
    class Meta:
        model = Review
        fields = ['order', 'rating', 'title', 'comment']
    
    def validate_order(self, order):
        user = self.context['request'].user
        
        # Must be the buyer
        if order.customer != user:
            raise serializers.ValidationError("You can only review your own orders")
        
        # Check if can review
        if not Review.can_review(order):
            raise serializers.ValidationError(
                "Cannot review this order. It must be delivered and not already reviewed."
            )
        
        return order
    
    def create(self, validated_data):
        order = validated_data['order']
        user = self.context['request'].user
        
        # Get seller from order (first seller in order items)
        from catalog.models import Seller
        
        seller = None
        first_item = order.items.first()
        if first_item and first_item.seller:
            seller = first_item.seller
        else:
            # Fallback: try to get from listing
            if first_item and first_item.listing:
                seller = first_item.listing.seller
        
        if not seller:
            raise serializers.ValidationError("Could not determine seller for this order")
        
        return Review.objects.create(
            order=order,
            seller=seller,
            buyer=user,
            is_verified_purchase=True,
            **validated_data
        )


class SellerResponseSerializer(serializers.Serializer):
    """Serializer for seller response to review."""
    response = serializers.CharField(max_length=2000)


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewHelpful
        fields = ['review', 'is_helpful']
