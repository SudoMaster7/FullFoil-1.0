"""
FullFoil Catalog Services - Business Logic Layer

Contains core business logic for:
- Market Price Intelligence (7-day rolling average)
- Cart Optimization (seller consolidation)
- Sale Recording (hooks into order completion)
"""

from django.db.models import Avg, Min, Max, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from collections import defaultdict

from .models import CardProduct, Listing, SaleHistory, Order, OrderItem, ProductPriceHistory, PriceAlert


def calculate_market_price(product_id: int) -> dict:
    """
    Calculate market price for a CardProduct based on 7-day sales average.
    
    Args:
        product_id: The CardProduct primary key
        
    Returns:
        dict with market_price, low_price, high_price, foil_market_price
    """
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    # Get non-foil sales
    regular_sales = SaleHistory.objects.filter(
        product_id=product_id,
        is_foil=False,
        sold_at__gte=seven_days_ago
    )
    
    # Get foil sales
    foil_sales = SaleHistory.objects.filter(
        product_id=product_id,
        is_foil=True,
        sold_at__gte=seven_days_ago
    )
    
    result = {
        'market_price': None,
        'low_price': None,
        'high_price': None,
        'foil_market_price': None,
    }
    
    if regular_sales.exists():
        stats = regular_sales.aggregate(
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price')
        )
        result['market_price'] = stats['avg_price']
        result['low_price'] = stats['min_price']
        result['high_price'] = stats['max_price']
    
    if foil_sales.exists():
        foil_stats = foil_sales.aggregate(avg_price=Avg('price'))
        result['foil_market_price'] = foil_stats['avg_price']
    
    return result


def update_product_market_price(product_id: int) -> CardProduct:
    """
    Update the market_price field on a CardProduct.
    
    Called after sales are recorded.
    """
    try:
        product = CardProduct.objects.get(pk=product_id)
    except CardProduct.DoesNotExist:
        return None
    
    prices = calculate_market_price(product_id)
    
    product.market_price = prices['market_price']
    product.low_price = prices['low_price']
    product.high_price = prices['high_price']
    product.foil_market_price = prices['foil_market_price']
    product.price_updated_at = timezone.now()
    product.save(update_fields=[
        'market_price', 'low_price', 'high_price',
        'foil_market_price', 'price_updated_at'
    ])
    
    check_price_alerts(product)
    
    return product


def record_sale(order_item: OrderItem) -> SaleHistory:
    """
    Record a sale for Market Price Intelligence.
    
    Called when an order is marked as paid/completed.
    """
    if not order_item.listing:
        return None
    
    sale = SaleHistory.objects.create(
        product=order_item.product,
        listing=order_item.listing,
        order_item=order_item,
        seller=order_item.seller,
        price=order_item.price,
        quantity=order_item.quantity,
        condition=order_item.condition,
        language=order_item.listing.language,
        is_foil=order_item.listing.is_foil
    )
    
    # Trigger market price update
    if order_item.product:
        update_product_market_price(order_item.product_id)
    
    return sale


def record_sales_for_order(order: Order) -> list:
    """
    Record all sales for a completed order.
    """
    sales = []
    for item in order.items.all():
        sale = record_sale(item)
        if sale:
            sales.append(sale)
    return sales


def optimize_cart(cart_items: list) -> dict:
    """
    Cart Optimizer - Minimize shipping by consolidating sellers.
    
    Uses a greedy algorithm to find the minimum set of sellers
    that can fulfill all items in the cart.
    
    Args:
        cart_items: List of dicts with {product_id, quantity, condition (optional)}
        
    Returns:
        dict with optimized cart, seller count, and estimated shipping
    """
    if not cart_items:
        return {
            'success': False,
            'message': 'Cart is empty',
            'optimized_items': [],
            'total_sellers': 0,
            'estimated_shipping': Decimal('0.00'),
        }
    
    # Build availability map: product_id -> [listings]
    availability_map = {}
    
    for item in cart_items:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)
        condition = item.get('condition')
        
        filters = Q(
            product_id=product_id,
            status='active',
            quantity__gte=quantity
        )
        if condition:
            filters &= Q(condition=condition)
        
        listings = Listing.objects.filter(filters).order_by('price')
        availability_map[product_id] = list(listings)
    
    # Check for unavailable items
    unavailable = [pid for pid, listings in availability_map.items() if not listings]
    if unavailable:
        return {
            'success': False,
            'message': f'{len(unavailable)} items not available',
            'unavailable_product_ids': unavailable,
            'optimized_items': [],
            'total_sellers': 0,
            'estimated_shipping': Decimal('0.00'),
        }
    
    # Build seller coverage map: seller_id -> {product_ids, listings}
    seller_coverage = defaultdict(lambda: {'product_ids': set(), 'listings': {}})
    
    for product_id, listings in availability_map.items():
        for listing in listings:
            seller_id = listing.seller_id
            if product_id not in seller_coverage[seller_id]['product_ids']:
                seller_coverage[seller_id]['product_ids'].add(product_id)
                seller_coverage[seller_id]['listings'][product_id] = listing
    
    # Greedy algorithm: pick seller with most coverage
    selected_sellers = []
    covered_products = set()
    optimized_items = []
    
    all_product_ids = set(availability_map.keys())
    
    while covered_products != all_product_ids:
        best_seller = None
        best_coverage = 0
        
        for seller_id, data in seller_coverage.items():
            uncovered = data['product_ids'] - covered_products
            if len(uncovered) > best_coverage:
                best_coverage = len(uncovered)
                best_seller = seller_id
        
        if not best_seller:
            break
        
        # Add this seller's uncovered products to cart
        selected_sellers.append(best_seller)
        seller_data = seller_coverage[best_seller]
        
        for product_id in seller_data['product_ids']:
            if product_id not in covered_products:
                listing = seller_data['listings'][product_id]
                cart_item = next(i for i in cart_items if i.get('product_id') == product_id)
                
                optimized_items.append({
                    'product_id': product_id,
                    'listing_id': listing.id,
                    'seller_id': best_seller,
                    'price': listing.price,
                    'condition': listing.condition,
                    'quantity': cart_item.get('quantity', 1),
                })
                covered_products.add(product_id)
        
        # Remove this seller from consideration
        del seller_coverage[best_seller]
    
    # Calculate totals
    subtotal = sum(
        Decimal(str(item['price'])) * item['quantity']
        for item in optimized_items
    )
    shipping_per_seller = Decimal('15.00')
    estimated_shipping = len(selected_sellers) * shipping_per_seller
    
    return {
        'success': True,
        'message': f'Optimized to {len(selected_sellers)} seller(s)',
        'optimized_items': optimized_items,
        'seller_ids': selected_sellers,
        'total_sellers': len(selected_sellers),
        'subtotal': subtotal,
        'estimated_shipping': estimated_shipping,
        'total': subtotal + estimated_shipping,
    }


def update_all_market_prices():
    """
    Batch update market prices for all products with recent sales.
    
    Can be run as a scheduled task (e.g., Celery beat).
    """
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    products_with_sales = SaleHistory.objects.filter(
        sold_at__gte=seven_days_ago
    ).values_list('product_id', flat=True).distinct()
    
    updated = 0
    for product_id in products_with_sales:
        update_product_market_price(product_id)
        updated += 1
    
    return updated


def get_listings_for_product(product_id: int, filters: dict = None) -> list:
    """
    Get all active listings for a CardProduct, sorted by price.
    
    Args:
        product_id: CardProduct primary key
        filters: Optional dict with condition, language, is_foil
    """
    queryset = Listing.objects.filter(
        product_id=product_id,
        status='active'
    ).select_related('seller')
    
    if filters:
        if filters.get('condition'):
            queryset = queryset.filter(condition=filters['condition'])
        if filters.get('language'):
            queryset = queryset.filter(language=filters['language'])
        if filters.get('is_foil') is not None:
            queryset = queryset.filter(is_foil=filters['is_foil'])
    
    return queryset.order_by('price')


def snapshot_daily_prices():
    """
    Create daily price snapshot for all products.
    Should be run via cron/scheduler daily.
    """
    today = timezone.now().date()
    products = CardProduct.objects.all()
    
    cnt = 0
    for product in products:
        ProductPriceHistory.objects.update_or_create(
            product=product,
            date=today,
            defaults={
                'market_price': product.market_price,
                'low_price': product.low_price,
                'high_price': product.high_price,
                'foil_market_price': product.foil_market_price
            }
        )
        cnt += 1
    return cnt


def check_price_alerts(product: CardProduct):
    """
    Check and trigger price alerts for a product.
    """
    if not product.market_price:
        return

    # Find alerts where target_price >= current market_price
    alerts = PriceAlert.objects.filter(
        product=product, 
        is_active=True, 
        target_price__gte=product.market_price
    )
    
    for alert in alerts:
        # TO DO: Integrate with Notification Service
        print(f"[PRICE ALERT] User {alert.user.username}: {product.name} reached R$ {product.market_price}")

