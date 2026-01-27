"""
FullFoil Users URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, RegisterView, ProfileView, AddressViewSet

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
