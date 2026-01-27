"""
Payments Views - Stripe API Endpoints
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings

from .services import create_payment_intent, get_payment_status, process_webhook_event
from .models import Payment


class CreatePaymentIntentView(APIView):
    """
    POST /api/payments/create-intent/
    
    Create a Stripe PaymentIntent for checkout.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        amount = request.data.get('amount')  # Amount in cents
        currency = request.data.get('currency', 'brl')
        order_id = request.data.get('order_id')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get order if provided
        order = None
        if order_id:
            from catalog.models import Order
            try:
                order = Order.objects.get(id=order_id, customer=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        result = create_payment_intent(
            amount=amount,
            currency=currency,
            user=request.user,
            order=order,
            metadata={
                'user_email': request.user.email
            }
        )
        
        if result['success']:
            return Response(result)
        else:
            return Response(
                {'error': result.get('error', 'Failed to create payment')},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymentStatusView(APIView):
    """
    GET /api/payments/status/{payment_intent_id}/
    
    Get the status of a payment.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, payment_intent_id):
        result = get_payment_status(payment_intent_id)
        
        if result['success']:
            return Response(result)
        else:
            return Response(
                {'error': result.get('error', 'Failed to get status')},
                status=status.HTTP_400_BAD_REQUEST
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    POST /api/payments/webhook/
    
    Handle incoming Stripe webhook events.
    Must be configured in Stripe Dashboard.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        
        if not webhook_secret:
            # Development mode - process without signature verification
            import json
            try:
                event_data = json.loads(payload)
                from .models import WebhookEvent
                from django.utils import timezone
                
                # Log event
                event_id = event_data.get('id', f'dev_{timezone.now().timestamp()}')
                event_type = event_data.get('type', 'unknown')
                
                WebhookEvent.objects.create(
                    stripe_event_id=event_id,
                    event_type=event_type,
                    payload=event_data.get('data', {}),
                    processed=True,
                    processed_at=timezone.now()
                )
                
                return Response({'received': True, 'mode': 'development'})
                
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid JSON'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        result = process_webhook_event(payload, sig_header, webhook_secret)
        
        if result['success']:
            return Response({'received': True})
        else:
            return Response(
                {'error': result.get('error')},
                status=status.HTTP_400_BAD_REQUEST
            )
