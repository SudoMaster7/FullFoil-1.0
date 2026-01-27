"""
Stripe Service - Payment Processing

Handles all Stripe API interactions.
"""

import stripe
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import logging

from .models import Payment, PaymentStatus, WebhookEvent

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


def create_payment_intent(amount, currency='brl', user=None, order=None, metadata=None):
    """
    Create a Stripe PaymentIntent and local Payment record.
    
    Args:
        amount: Amount in cents (e.g., 1000 = R$10.00)
        currency: Currency code (default: brl)
        user: Django User object
        order: Order object
        metadata: Additional metadata dict
    
    Returns:
        dict with client_secret and payment_intent_id
    """
    try:
        # Create Stripe PaymentIntent
        intent_data = {
            'amount': int(amount),
            'currency': currency,
            'automatic_payment_methods': {'enabled': True},
            'metadata': metadata or {}
        }
        
        if order:
            intent_data['metadata']['order_id'] = str(order.id)
            intent_data['metadata']['order_number'] = order.order_number
        
        if user:
            intent_data['metadata']['user_id'] = str(user.id)
        
        intent = stripe.PaymentIntent.create(**intent_data)
        
        # Create local Payment record
        payment = Payment.objects.create(
            stripe_payment_intent_id=intent.id,
            user=user,
            order=order,
            amount=Decimal(amount) / 100,  # Convert cents to currency
            currency=currency,
            status=PaymentStatus.PENDING
        )
        
        logger.info(f"Created PaymentIntent {intent.id} for {amount/100} {currency}")
        
        return {
            'success': True,
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'payment_id': payment.id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating PaymentIntent: {e}")
        return {
            'success': False,
            'error': str(e)
        }


def get_payment_status(payment_intent_id):
    """
    Get the current status of a PaymentIntent.
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Update local record
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = _map_stripe_status(intent.status)
            if intent.status == 'succeeded':
                payment.paid_at = timezone.now()
            payment.save()
        except Payment.DoesNotExist:
            pass
        
        return {
            'success': True,
            'status': intent.status,
            'amount': intent.amount,
            'currency': intent.currency
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error getting status: {e}")
        return {
            'success': False,
            'error': str(e)
        }


def process_webhook_event(payload, sig_header, webhook_secret):
    """
    Process incoming Stripe webhook event.
    
    Returns:
        dict with success status and message
    """
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        return {'success': False, 'error': 'Invalid payload'}
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid webhook signature: {e}")
        return {'success': False, 'error': 'Invalid signature'}
    
    # Check for duplicate event (idempotency)
    event_id = event['id']
    if WebhookEvent.objects.filter(stripe_event_id=event_id).exists():
        logger.info(f"Duplicate webhook event: {event_id}")
        return {'success': True, 'message': 'Event already processed'}
    
    # Log the event
    webhook_event = WebhookEvent.objects.create(
        stripe_event_id=event_id,
        event_type=event['type'],
        payload=event['data']
    )
    
    # Handle specific event types
    try:
        if event['type'] == 'payment_intent.succeeded':
            _handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'payment_intent.payment_failed':
            _handle_payment_failed(event['data']['object'])
        elif event['type'] == 'charge.refunded':
            _handle_charge_refunded(event['data']['object'])
        
        webhook_event.processed = True
        webhook_event.processed_at = timezone.now()
        webhook_event.save()
        
        logger.info(f"Processed webhook event: {event['type']}")
        return {'success': True, 'message': f"Processed {event['type']}"}
        
    except Exception as e:
        webhook_event.error_message = str(e)
        webhook_event.save()
        logger.error(f"Error processing webhook: {e}")
        return {'success': False, 'error': str(e)}


def _handle_payment_succeeded(payment_intent):
    """Handle successful payment."""
    from catalog.models import Order
    
    pi_id = payment_intent['id']
    
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=pi_id)
        payment.mark_as_paid()
        payment.receipt_url = payment_intent.get('charges', {}).get('data', [{}])[0].get('receipt_url', '')
        payment.save()
        
        # Update order status
        if payment.order:
            payment.order.status = Order.Status.PAID
            payment.order.save()
            
            # Trigger notification
            from notifications.email_service import send_order_confirmation
            send_order_confirmation(payment.order)
        
        logger.info(f"Payment succeeded: {pi_id}")
        
    except Payment.DoesNotExist:
        logger.warning(f"Payment not found for succeeded intent: {pi_id}")


def _handle_payment_failed(payment_intent):
    """Handle failed payment."""
    pi_id = payment_intent['id']
    error_message = payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
    
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=pi_id)
        payment.mark_as_failed(error_message)
        logger.info(f"Payment failed: {pi_id} - {error_message}")
    except Payment.DoesNotExist:
        logger.warning(f"Payment not found for failed intent: {pi_id}")


def _handle_charge_refunded(charge):
    """Handle refunded charge."""
    pi_id = charge.get('payment_intent')
    
    if pi_id:
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=pi_id)
            payment.status = PaymentStatus.REFUNDED
            payment.save()
            
            if payment.order:
                from catalog.models import Order
                payment.order.status = Order.Status.REFUNDED
                payment.order.save()
            
            logger.info(f"Payment refunded: {pi_id}")
        except Payment.DoesNotExist:
            logger.warning(f"Payment not found for refund: {pi_id}")


def _map_stripe_status(stripe_status):
    """Map Stripe status to local PaymentStatus."""
    mapping = {
        'requires_payment_method': PaymentStatus.PENDING,
        'requires_confirmation': PaymentStatus.PENDING,
        'requires_action': PaymentStatus.PROCESSING,
        'processing': PaymentStatus.PROCESSING,
        'succeeded': PaymentStatus.SUCCEEDED,
        'canceled': PaymentStatus.CANCELLED,
    }
    return mapping.get(stripe_status, PaymentStatus.PENDING)
