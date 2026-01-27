"""
FullFoil Catalog Views - DRF ViewSets and API Views

Exposes REST API endpoints for:
- Card catalog (read-only for users)
- Listings (CRUD for sellers)
- Orders (purchase flow)
- Cart optimization
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from decimal import Decimal
from collections import defaultdict
from django.utils import timezone

from .models import (
    CardSet, CardProduct, Seller, Listing, Order, OrderItem, PriceAlert
)
from .serializers import (
    CardSetSerializer,
    CardProductListSerializer, CardProductDetailSerializer,
    SellerSerializer, ListingSerializer, ListingCreateSerializer,
    OrderSerializer, OrderCreateSerializer, CartOptimizeSerializer,
    ProductPriceHistorySerializer, PriceAlertSerializer
)
from .services import (
    optimize_cart, record_sales_for_order, get_listings_for_product
)


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Allow read for anyone, write only for sellers.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'seller_profile')
        )


class CardSetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for card sets/expansions.
    
    GET /api/catalog/sets/
    GET /api/catalog/sets/{id}/
    """
    queryset = CardSet.objects.all()
    serializer_class = CardSetSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        game = self.request.query_params.get('game')
        if game:
            queryset = queryset.filter(game=game)
        return queryset


class CardProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for the canonical card catalog.
    
    GET /api/catalog/cards/          - List all cards with market prices
    GET /api/catalog/cards/{id}/     - Card detail with listings
    GET /api/catalog/cards/{id}/listings/  - All listings for a card
    """
    queryset = CardProduct.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CardProductDetailSerializer
        return CardProductListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        
        # Filter by game
        game = params.get('game')
        if game:
            queryset = queryset.filter(game=game)
        
        # Filter by set
        set_code = params.get('set')
        if set_code:
            queryset = queryset.filter(card_set__code__iexact=set_code)
        
        # Filter by rarity
        rarity = params.get('rarity')
        if rarity:
            queryset = queryset.filter(rarity=rarity)
        
        # Search by name
        search = params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Sort
        sort = params.get('sort', 'name')
        if sort == 'price':
            queryset = queryset.order_by('market_price')
        elif sort == '-price':
            queryset = queryset.order_by('-market_price')
        elif sort == 'name':
            queryset = queryset.order_by('name')
        
        return queryset

    @action(detail=True, methods=['get'])
    def listings(self, request, pk=None):
        """
        GET /api/catalog/cards/{id}/listings/
        
        Returns all active listings for this card, sorted by price.
        """
        card = self.get_object()
        
        filters = {
            'condition': request.query_params.get('condition'),
            'language': request.query_params.get('language'),
        }
        is_foil = request.query_params.get('foil')
        if is_foil is not None:
            filters['is_foil'] = is_foil.lower() == 'true'
        
        listings = get_listings_for_product(card.id, filters)
        serializer = ListingSerializer(listings, many=True)
        
        return Response({
            'card_id': card.id,
            'card_name': card.name,
            'total_listings': len(serializer.data),
            'listings': serializer.data
        })

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        GET /api/catalog/cards/{id}/history/
        Get daily price history for charts.
        """
        card = self.get_object()
        # Return last 90 days for chart
        history = card.price_history_points.all().order_by('date')[:90]
        serializer = ProductPriceHistorySerializer(history, many=True)
        return Response(serializer.data)


class ListingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for marketplace listings.
    
    GET /api/catalog/listings/       - All active listings
    POST /api/catalog/listings/      - Create listing (sellers only)
    GET /api/catalog/listings/{id}/  - Listing detail
    PUT /api/catalog/listings/{id}/  - Update listing (owner only)
    DELETE /api/catalog/listings/{id}/ - Delete listing (owner only)
    """
    queryset = Listing.objects.filter(status='active')
    permission_classes = [IsSellerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ListingCreateSerializer
        return ListingSerializer

    def get_queryset(self):
        queryset = super().get_queryset().select_related('product', 'seller')
        params = self.request.query_params
        
        # Filter by seller
        seller_id = params.get('seller')
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        
        # Filter by product
        product_id = params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filter by condition
        condition = params.get('condition')
        if condition:
            queryset = queryset.filter(condition=condition)
        
        # Filter by game
        game = params.get('game')
        if game:
            queryset = queryset.filter(product__game=game)
        
        return queryset.order_by('price')

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user.seller_profile)


class SellerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for sellers.
    
    GET /api/catalog/sellers/
    GET /api/catalog/sellers/{id}/
    GET /api/catalog/sellers/{id}/listings/
    """
    queryset = Seller.objects.filter(is_active=True)
    serializer_class = SellerSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def listings(self, request, pk=None):
        """Get all listings for a seller."""
        seller = self.get_object()
        listings = seller.listings.filter(status='active').order_by('-created_at')
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders.
    
    GET /api/catalog/orders/         - User's orders
    POST /api/catalog/orders/        - Create new order
    GET /api/catalog/orders/{id}/    - Order detail
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items')

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        items_data = data['items']
        
        # 1. Validate all items and Group by Seller
        seller_groups = defaultdict(list)
        
        for item_data in items_data:
            try:
                listing = Listing.objects.get(
                    id=item_data['listing_id'],
                    status='active'
                )
            except Listing.DoesNotExist:
                return Response(
                    {'error': f"Listing {item_data.get('listing_id')} not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            quantity = item_data.get('quantity', 1)
            if listing.quantity < quantity:
                return Response(
                    {'error': f"Insufficient quantity for {listing.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            seller_groups[listing.seller_id].append({
                'listing': listing,
                'quantity': quantity
            })

        # 2. Create Orders per Seller
        created_orders = []
        payment_group_id = timezone.now().strftime('%Y%m%d%H%M%S%f') # Simple grouping ID
        
        for seller_id, group_items in seller_groups.items():
            subtotal = Decimal('0.00')
            order_items_to_create = []
            
            for item in group_items:
                listing = item['listing']
                quantity = item['quantity']
                price = listing.price
                
                item_subtotal = price * quantity
                subtotal += item_subtotal
                
                order_items_to_create.append({
                    'listing': listing,
                    'product': listing.product,
                    'seller': listing.seller,
                    'product_name': listing.product.name,
                    'condition': listing.condition,
                    'price': price,
                    'quantity': quantity
                })

            shipping_cost = Decimal('15.00') # Fixed shipping per seller for now
            total = subtotal + shipping_cost
            
            # Create Order
            order = Order.objects.create(
                customer=request.user,
                shipping_name=data['shipping_name'],
                shipping_address=data['shipping_address'],
                shipping_city=data['shipping_city'],
                shipping_state=data['shipping_state'],
                shipping_zip=data['shipping_zip'],
                shipping_country=data.get('shipping_country', 'Brazil'),
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                total=total,
                payment_intent_id=payment_group_id # Using this to link them for now
            )
            
            # Create Order Items
            for item_dict in order_items_to_create:
                listing = item_dict.pop('listing')
                OrderItem.objects.create(order=order, listing=listing, **item_dict)
                
                # Decrement inventory
                listing.quantity -= item_dict['quantity']
                listing.save()
                
            created_orders.append(order)

        # 3. Return all created orders
        return Response(
            OrderSerializer(created_orders, many=True).data,
            status=status.HTTP_201_CREATED
        )


class CartOptimizeView(APIView):
    """
    POST /api/catalog/cart/optimize/
    
    Optimizes cart to minimize shipping by consolidating sellers.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CartOptimizeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        items = serializer.validated_data['items']
        result = optimize_cart(items)
        
        result = optimize_cart(items)
        
        return Response(result)


class PriceAlertViewSet(viewsets.ModelViewSet):
    """
    CRUD for price alerts.
    """
    serializer_class = PriceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
