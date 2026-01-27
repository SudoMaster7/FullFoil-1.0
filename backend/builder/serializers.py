from rest_framework import serializers
from .models import Deck, DeckCard
from catalog.serializers import CardProductListSerializer

class DeckCardSerializer(serializers.ModelSerializer):
    product = CardProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DeckCard
        fields = ['id', 'product', 'product_id', 'quantity', 'is_commander', 'is_sideboard']

class DeckSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    cards = DeckCardSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deck
        fields = ['id', 'user', 'user_name', 'name', 'description', 'game', 'format', 'is_public', 'cards', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
