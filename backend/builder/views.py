from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models  # Add this import
from .models import Deck, DeckCard
from .serializers import DeckSerializer, DeckCardSerializer
from catalog.models import CardProduct

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.is_public or obj.user == request.user
        return obj.user == request.user

class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Deck.objects.filter(models.Q(is_public=True) | models.Q(user=self.request.user))
        return Deck.objects.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_card(self, request, pk=None):
        deck = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        is_sideboard = request.data.get('is_sideboard', False)
        
        product = get_object_or_404(CardProduct, pk=product_id)
        
        deck_card, created = DeckCard.objects.get_or_create(
            deck=deck,
            product=product,
            is_sideboard=is_sideboard,
            defaults={'quantity': 0}
        )
        
        deck_card.quantity += quantity
        deck_card.save()
        
        return Response(DeckSerializer(deck).data)

    @action(detail=True, methods=['post'])
    def remove_card(self, request, pk=None):
        deck = self.get_object()
        card_id = request.data.get('card_id') # DeckCard ID
        
        try:
            deck_card = DeckCard.objects.get(pk=card_id, deck=deck)
            deck_card.delete()
            return Response(DeckSerializer(deck).data)
        except DeckCard.DoesNotExist:
            return Response({'error': 'Card not found in deck'}, status=status.HTTP_404_NOT_FOUND)
