"""
Reviews Views - API Endpoints
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Count

from .models import Review, ReviewHelpful
from .serializers import (
    ReviewSerializer, ReviewCreateSerializer,
    SellerResponseSerializer, ReviewHelpfulSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow read for anyone, write only for owner."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.buyer == request.user


class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews.
    
    GET /api/reviews/                 - List all reviews
    POST /api/reviews/                - Create review
    GET /api/reviews/{id}/            - Review detail
    POST /api/reviews/{id}/respond/   - Seller response
    POST /api/reviews/{id}/helpful/   - Mark as helpful
    """
    queryset = Review.objects.filter(is_approved=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by seller
        seller_id = self.request.query_params.get('seller')
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        
        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=int(min_rating))
        
        return queryset.select_related('buyer', 'seller', 'order')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        """
        POST /api/reviews/{id}/respond/
        
        Allow seller to respond to a review.
        """
        review = self.get_object()
        
        # Verify user is the seller
        try:
            from catalog.models import Seller
            seller = Seller.objects.get(user=request.user)
            if review.seller != seller:
                return Response(
                    {'error': 'You can only respond to your own reviews'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Seller.DoesNotExist:
            return Response(
                {'error': 'Seller account required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SellerResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review.seller_response = serializer.validated_data['response']
        review.seller_response_at = timezone.now()
        review.save()
        
        return Response({
            'success': True,
            'review': ReviewSerializer(review).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def helpful(self, request, pk=None):
        """
        POST /api/reviews/{id}/helpful/
        
        Mark a review as helpful/not helpful.
        """
        review = self.get_object()
        is_helpful = request.data.get('is_helpful', True)
        
        vote, created = ReviewHelpful.objects.update_or_create(
            review=review,
            user=request.user,
            defaults={'is_helpful': is_helpful}
        )
        
        return Response({
            'success': True,
            'is_helpful': vote.is_helpful,
            'total_helpful': review.helpful_votes.filter(is_helpful=True).count()
        })


class SellerReviewsView(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/sellers/{seller_id}/reviews/
    
    Get all reviews for a seller with aggregated stats.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        seller_id = self.kwargs.get('seller_id')
        return Review.objects.filter(
            seller_id=seller_id,
            is_approved=True
        ).select_related('buyer', 'order')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Get stats
        stats = queryset.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
        )
        
        # Rating distribution
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = queryset.filter(rating=i).count()
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'stats': {
                'average_rating': round(stats['average_rating'] or 0, 2),
                'total_reviews': stats['total_reviews'],
                'distribution': distribution
            },
            'reviews': serializer.data
        })
