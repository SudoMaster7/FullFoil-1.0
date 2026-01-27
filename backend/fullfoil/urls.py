"""
FullFoil URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.http import JsonResponse

def api_root(request):
    return JsonResponse({'status': 'ok', 'message': 'FullFoil API is running'})

urlpatterns = [
    path('', api_root),
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Catalog API
    path('api/catalog/', include('catalog.urls')),
    
    # Users API
    path('api/users/', include('users.urls')),
    
    # Payments API
    path('api/payments/', include('payments.urls')),
    
    # Reviews API
    path('api/reviews/', include('reviews.urls')),
    path('api/builder/', include('builder.urls')),
]
