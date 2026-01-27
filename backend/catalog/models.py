"""
FullFoil Catalog Models - TCGPlayer-style Canonical Catalog

This module defines the core data models following the TCGPlayer architecture:
- CardSet: Expansion/Set metadata
- CardProduct: Canonical card catalog (admin-only creation)
- Listing: Seller inventory attached to CardProduct
- Order/OrderItem: Purchase tracking
- SaleHistory: Price intelligence data
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal


class GameType(models.TextChoices):
    """Supported TCG game types."""
    MAGIC = 'magic', 'Magic: The Gathering'
    POKEMON = 'pokemon', 'Pokémon TCG'
    YUGIOH = 'yugioh', 'Yu-Gi-Oh!'
    LORCANA = 'lorcana', 'Disney Lorcana'
    ONEPIECE = 'onepiece', 'One Piece Card Game'
    FAB = 'fab', 'Flesh and Blood'


class Condition(models.TextChoices):
    """Standardized card condition grading system."""
    NM = 'near_mint', 'Near Mint (NM)'
    LP = 'lightly_played', 'Lightly Played (LP)'
    MP = 'moderately_played', 'Moderately Played (MP)'
    HP = 'heavily_played', 'Heavily Played (HP)'
    DMG = 'damaged', 'Damaged (DMG)'


class Language(models.TextChoices):
    """Supported card languages."""
    EN = 'en', 'English'
    PT = 'pt', 'Português'
    ES = 'es', 'Español'
    JP = 'jp', '日本語'
    KR = 'kr', '한국어'
    CN = 'cn', '中文'
    DE = 'de', 'Deutsch'
    FR = 'fr', 'Français'
    IT = 'it', 'Italiano'


class Rarity(models.TextChoices):
    """Normalized rarity values across games."""
    COMMON = 'common', 'Common'
    UNCOMMON = 'uncommon', 'Uncommon'
    RARE = 'rare', 'Rare'
    MYTHIC = 'mythic', 'Mythic Rare'
    ULTRA_RARE = 'ultra_rare', 'Ultra Rare'
    SECRET_RARE = 'secret_rare', 'Secret Rare'
    SPECIAL = 'special', 'Special'


class CardSet(models.Model):
    """
    Represents a TCG expansion/set.
    
    Example: "Lost Caverns of Ixalan", "Scarlet & Violet", etc.
    """
    code = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    game = models.CharField(max_length=20, choices=GameType.choices)
    release_date = models.DateField(null=True, blank=True)
    total_cards = models.PositiveIntegerField(default=0)
    logo_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-release_date']
        verbose_name = 'Card Set'
        verbose_name_plural = 'Card Sets'

    def __str__(self):
        return f"{self.name} ({self.code})"


class CardProduct(models.Model):
    """
    The Canonical Card Catalog.
    
    This is the single source of truth for card metadata.
    - Users CANNOT create CardProducts (admin-only)
    - Sellers create Listings that reference CardProducts
    - Market price is calculated from SaleHistory
    """
    # External Reference
    external_id = models.CharField(max_length=100, db_index=True)
    
    # Core Card Data
    name = models.CharField(max_length=300, db_index=True)
    game = models.CharField(max_length=20, choices=GameType.choices, db_index=True)
    card_set = models.ForeignKey(
        CardSet, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='cards'
    )
    number = models.CharField(max_length=20, blank=True)
    rarity = models.CharField(max_length=20, choices=Rarity.choices, default=Rarity.COMMON)
    card_type = models.CharField(max_length=100, blank=True)  # Creature, Spell, Trainer, etc.
    
    # Images
    image_url = models.URLField(blank=True)
    image_url_hires = models.URLField(blank=True)
    
    # Card Details
    artist = models.CharField(max_length=200, blank=True)
    text = models.TextField(blank=True)
    attributes = models.JSONField(default=dict, blank=True)  # Game-specific data
    
    # Market Price Intelligence (calculated fields)
    market_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="7-day rolling average sale price"
    )
    low_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    high_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    foil_market_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_updated_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    total_listings = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Card Product'
        verbose_name_plural = 'Card Products'
        unique_together = ['game', 'external_id']
        indexes = [
            models.Index(fields=['game', 'name']),
            models.Index(fields=['game', 'rarity']),
        ]

    def __str__(self):
        return f"{self.name} ({self.game})"

    def generate_sku_base(self):
        """Generate base SKU for this card."""
        return f"{self.game.upper()}_{self.external_id}"


class Seller(models.Model):
    """
    Seller profile for marketplace vendors.
    """
    user = models.OneToOneField(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='seller_profile'
    )
    business_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    
    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    total_reviews = models.PositiveIntegerField(default=0)
    total_sales = models.PositiveIntegerField(default=0)
    
    # Business Info
    commission_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.10'))
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Address
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, default='Brazil')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Seller'
        verbose_name_plural = 'Sellers'

    def __str__(self):
        return self.business_name


class Listing(models.Model):
    """
    Seller inventory item - represents a card for sale.
    
    This is the USER'S inventory attached to the canonical CardProduct.
    Sellers do not create cards, they create listings referencing existing cards.
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        SOLD_OUT = 'sold_out', 'Sold Out'
        INACTIVE = 'inactive', 'Inactive'
        PENDING = 'pending', 'Pending Review'

    # Foreign Keys
    product = models.ForeignKey(
        CardProduct,
        on_delete=models.CASCADE,
        related_name='listings'
    )
    seller = models.ForeignKey(
        Seller,
        on_delete=models.CASCADE,
        related_name='listings'
    )
    
    # Grading & Variant
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.NM
    )
    language = models.CharField(
        max_length=5,
        choices=Language.choices,
        default=Language.PT
    )
    is_foil = models.BooleanField(default=False)
    
    # SKU (auto-generated)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Pricing & Inventory
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    
    # Statistics
    views = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price']
        verbose_name = 'Listing'
        verbose_name_plural = 'Listings'
        indexes = [
            models.Index(fields=['product', 'condition', 'status']),
            models.Index(fields=['seller', 'status']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.seller.business_name} - R${self.price}"

    def save(self, *args, **kwargs):
        # Auto-generate SKU
        if not self.sku:
            condition_code = self.condition[:2].upper()
            lang_code = self.language.upper()
            foil_code = 'F' if self.is_foil else 'NF'
            self.sku = f"{self.product.generate_sku_base()}-{condition_code}-{lang_code}-{foil_code}-{self.seller_id}"
        
        # Auto-update status based on quantity
        if self.quantity == 0:
            self.status = self.Status.SOLD_OUT
        elif self.status == self.Status.SOLD_OUT and self.quantity > 0:
            self.status = self.Status.ACTIVE
            
        super().save(*args, **kwargs)


class Order(models.Model):
    """
    Customer order containing one or more items from different sellers.
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Payment'
        PAID = 'paid', 'Paid'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    # Customer
    customer = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders'
    )
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Shipping Address
    shipping_name = models.CharField(max_length=200)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=50)
    shipping_zip = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=50, default='Brazil')
    
    # Payment
    payment_method = models.CharField(max_length=50, default='stripe')
    payment_intent_id = models.CharField(max_length=200, blank=True)
    
    # Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Shipping tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    shipping_carrier = models.CharField(max_length=50, default='Correios')
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            self.order_number = f"FF-{timestamp}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Individual item within an order.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )
    product = models.ForeignKey(
        CardProduct,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )
    seller = models.ForeignKey(
        Seller,
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Snapshot at time of purchase
    product_name = models.CharField(max_length=300)
    condition = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

    @property
    def subtotal(self):
        return self.price * self.quantity


class SaleHistory(models.Model):
    """
    Records completed sales for Market Price Intelligence.
    
    Used to calculate 7-day rolling average market price.
    """
    product = models.ForeignKey(
        CardProduct,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        null=True
    )
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.SET_NULL,
        null=True
    )
    seller = models.ForeignKey(
        Seller,
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Sale Details
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(max_length=20, choices=Condition.choices)
    language = models.CharField(max_length=5, choices=Language.choices)
    is_foil = models.BooleanField(default=False)
    
    sold_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sold_at']
        verbose_name = 'Sale History'
        verbose_name_plural = 'Sale History'
        indexes = [
            models.Index(fields=['product', 'sold_at']),
            models.Index(fields=['product', 'is_foil', 'sold_at']),
        ]

    def __str__(self):
        return f"{self.product.name} @ R${self.price} ({self.sold_at.date()})"


class ProductPriceHistory(models.Model):
    """
    Daily snapshot of product market price.
    """
    product = models.ForeignKey(
        CardProduct,
        on_delete=models.CASCADE,
        related_name='price_history_points'
    )
    date = models.DateField(default=timezone.now)
    market_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    low_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    high_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    foil_market_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    class Meta:
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(fields=['product', 'date'], name='unique_daily_price')
        ]

    def __str__(self):
        return f"{self.product.name} - {self.date}"


class PriceAlert(models.Model):
    """
    User alert for price changes.
    """
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='price_alerts'
    )
    product = models.ForeignKey(
        CardProduct,
        on_delete=models.CASCADE,
        related_name='price_alerts'
    )
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(
        max_length=20, 
        choices=Condition.choices, 
        default=Condition.NM
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name} @ {self.target_price}"
