from django.db import models
from django.contrib.auth import get_user_model
from catalog.models import CardProduct, GameType

class Deck(models.Model):
    """
    User created deck of cards.
    """
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='decks')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    game = models.CharField(max_length=20, choices=GameType.choices, default=GameType.MAGIC)
    format = models.CharField(max_length=50, blank=True, help_text="e.g. Standard, Commander")
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class DeckCard(models.Model):
    """
    Card entry in a deck.
    """
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    product = models.ForeignKey(CardProduct, on_delete=models.CASCADE, related_name='deck_usages')
    quantity = models.PositiveIntegerField(default=1)
    is_commander = models.BooleanField(default=False)
    is_sideboard = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['deck', 'product', 'is_sideboard']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.deck.name}"
