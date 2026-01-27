"""
FullFoil Catalog URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CardSetViewSet, CardProductViewSet, ListingViewSet,
    SellerViewSet, OrderViewSet, CartOptimizeView, PriceAlertViewSet
)

router = DefaultRouter()
router.register(r'sets', CardSetViewSet, basename='cardset')
router.register(r'cards', CardProductViewSet, basename='cardproduct')
router.register(r'listings', ListingViewSet, basename='listing')
router.register(r'sellers', SellerViewSet, basename='seller')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'alerts', PriceAlertViewSet, basename='pricealert')

urlpatterns = [
    path('', include(router.urls)),
    path('cart/optimize/', CartOptimizeView.as_view(), name='cart-optimize'),
]
