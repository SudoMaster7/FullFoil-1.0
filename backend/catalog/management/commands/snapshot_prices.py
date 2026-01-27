from django.core.management.base import BaseCommand
from django.utils import timezone
from catalog.services import snapshot_daily_prices

class Command(BaseCommand):
    help = 'Creates a daily snapshot of market prices for all products'

    def handle(self, *args, **options):
        self.stdout.write('Starting daily price snapshot...')
        
        try:
            count = snapshot_daily_prices()
            self.stdout.write(self.style.SUCCESS(f'Successfully snapshot prices for {count} products.'))
        except Exception as e:
            self.style.ERROR(f'Error creating snapshot: {str(e)}')
            raise e
