"""
FullFoil Catalog Serializers - DRF Serialization Layer

Handles API input/output transformation for:
- CardProduct with nested listings and market price
- Listings with seller info
- Orders with items
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    CardSet, CardProduct, Seller, Listing,
    Order, OrderItem, SaleHistory,
    Condition, Language, Rarity, GameType,
    ProductPriceHistory, PriceAlert
)


User = get_user_model()


class CardSetSerializer(serializers.ModelSerializer):
    """Serializer for CardSet model."""
    
    class Meta:
        model = CardSet
        fields = [
            'id', 'code', 'name', 'game', 'release_date',
            'total_cards', 'logo_url'
        ]
        read_only_fields = ['id']


class SellerMinimalSerializer(serializers.ModelSerializer):
    """Minimal seller info for listing display."""
    
    class Meta:
        model = Seller
        fields = ['id', 'business_name', 'rating', 'total_sales', 'city', 'state']


class SellerSerializer(serializers.ModelSerializer):
    """Full seller serializer."""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Seller
        fields = [
            'id', 'username', 'business_name', 'description', 'logo_url',
            'rating', 'total_reviews', 'total_sales', 'is_verified',
            'city', 'state', 'country', 'created_at'
        ]
        read_only_fields = ['id', 'rating', 'total_reviews', 'total_sales', 'created_at']


class ListingSerializer(serializers.ModelSerializer):
    """Serializer for Listing model."""
    seller = SellerMinimalSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.URLField(source='product.image_url', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'product', 'seller', 'product_name', 'product_image',
            'condition', 'condition_display', 'language', 'language_display',
            'is_foil', 'sku', 'price', 'quantity', 'status',
            'views', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sku', 'status', 'views', 'created_at', 'updated_at']


class ListingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating listings."""
    
    class Meta:
        model = Listing
        fields = [
            'product', 'condition', 'language', 'is_foil',
            'price', 'quantity'
        ]

    def create(self, validated_data):
        # Seller is set from request user
        request = self.context.get('request')
        if request and hasattr(request.user, 'seller_profile'):
            validated_data['seller'] = request.user.seller_profile
        return super().create(validated_data)


class CardProductListSerializer(serializers.ModelSerializer):
    """Minimal card product info for list views."""
    set_name = serializers.CharField(source='card_set.name', read_only=True, allow_null=True)
    listings_count = serializers.IntegerField(source='total_listings', read_only=True)
    
    class Meta:
        model = CardProduct
        fields = [
            'id', 'external_id', 'name', 'game', 'set_name',
            'number', 'rarity', 'image_url', 'market_price',
            'low_price', 'listings_count'
        ]


class CardProductDetailSerializer(serializers.ModelSerializer):
    """Full card product with nested listings."""
    card_set = CardSetSerializer(read_only=True)
    listings = serializers.SerializerMethodField()
    price_history = serializers.SerializerMethodField()
    
    class Meta:
        model = CardProduct
        fields = [
            'id', 'external_id', 'name', 'game', 'card_set',
            'number', 'rarity', 'card_type', 'image_url', 'image_url_hires',
            'artist', 'text', 'attributes',
            'market_price', 'low_price', 'high_price', 'foil_market_price',
            'price_updated_at', 'total_listings',
            'listings', 'price_history',
            'created_at', 'updated_at'
        ]

    def get_listings(self, obj):
        """Get active listings sorted by price."""
        listings = obj.listings.filter(status='active').select_related('seller').order_by('price')[:20]
        return ListingSerializer(listings, many=True).data

    def get_price_history(self, obj):
        """Get recent sales for price chart."""
        sales = obj.sales.order_by('-sold_at')[:30]
        return [
            {
                'price': float(sale.price),
                'date': sale.sold_at.isoformat(),
                'condition': sale.condition,
                'is_foil': sale.is_foil
            }
            for sale in sales
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'listing', 'product', 'seller',
            'product_name', 'condition', 'price', 'quantity', 'subtotal'
        ]
        read_only_fields = ['id', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display',
            'shipping_name', 'shipping_address', 'shipping_city',
            'shipping_state', 'shipping_zip', 'shipping_country',
            'payment_method', 'subtotal', 'shipping_cost', 'tax', 'total',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'status', 'subtotal',
            'shipping_cost', 'tax', 'total', 'created_at', 'updated_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders from cart."""
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    shipping_name = serializers.CharField(max_length=200)
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=50)
    shipping_zip = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=50, default='Brazil')


class CartOptimizeSerializer(serializers.Serializer):
    """Serializer for cart optimization request."""
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text='List of items: [{product_id, quantity, condition (optional)}]'
    )


class ProductPriceHistorySerializer(serializers.ModelSerializer):
    """Daily price snapshot serializer for charts."""
    class Meta:
        model = ProductPriceHistory
        fields = ['date', 'market_price', 'low_price', 'high_price', 'foil_market_price']


class PriceAlertSerializer(serializers.ModelSerializer):
    """User price alert serializer."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.URLField(source='product.image_url', read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=CardProduct.objects.all(), source='product')
    
    class Meta:
        model = PriceAlert
        fields = ['id', 'product_id', 'product_name', 'product_image', 'target_price', 'condition', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
