"""
Email Service - Notification System

Handles all transactional emails with template-based rendering.
Uses Django's email backend (can be configured for SendGrid, SES, etc.)
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

# Default from email
DEFAULT_FROM_EMAIL = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@fullfoil.com.br')


def send_templated_email(subject, template_name, context, to_emails, from_email=None):
    """
    Send an email using a template.
    
    Args:
        subject: Email subject
        template_name: Template name without extension (e.g., 'order_confirmation')
        context: Context dict for template rendering
        to_emails: List of recipient emails
        from_email: Sender email (optional)
    
    Returns:
        bool: Success status
    """
    from_email = from_email or DEFAULT_FROM_EMAIL
    
    try:
        # Try to render HTML template
        html_content = render_to_string(f'emails/{template_name}.html', context)
        text_content = strip_tags(html_content)
    except Exception as e:
        # Fallback to plain text
        logger.warning(f"HTML template not found, using plain text: {e}")
        text_content = _get_plain_text_content(template_name, context)
        html_content = None
    
    try:
        if html_content:
            msg = EmailMultiAlternatives(subject, text_content, from_email, to_emails)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        else:
            send_mail(subject, text_content, from_email, to_emails)
        
        logger.info(f"Email sent: {subject} to {to_emails}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


def _get_plain_text_content(template_name, context):
    """Generate plain text email content for fallback."""
    templates = {
        'order_confirmation': _order_confirmation_text,
        'order_shipped': _order_shipped_text,
        'order_delivered': _order_delivered_text,
        'review_request': _review_request_text,
        'seller_new_order': _seller_new_order_text,
        'payment_received': _payment_received_text,
    }
    
    func = templates.get(template_name, lambda c: str(c))
    return func(context)


def _order_confirmation_text(ctx):
    return f"""
Olá {ctx.get('customer_name', 'Cliente')}!

Seu pedido #{ctx.get('order_number', '')} foi confirmado!

Itens:
{ctx.get('items_text', '')}

Total: R$ {ctx.get('total', '0.00')}

Acompanhe seu pedido em: {ctx.get('tracking_url', '')}

Obrigado por comprar na FullFoil!
"""


def _order_shipped_text(ctx):
    return f"""
Olá {ctx.get('customer_name', 'Cliente')}!

Seu pedido #{ctx.get('order_number', '')} foi enviado!

Código de rastreamento: {ctx.get('tracking_number', 'N/A')}
Transportadora: {ctx.get('carrier', 'Correios')}

Rastreie em: {ctx.get('tracking_url', '')}

FullFoil
"""


def _order_delivered_text(ctx):
    return f"""
Olá {ctx.get('customer_name', 'Cliente')}!

Seu pedido #{ctx.get('order_number', '')} foi entregue!

Esperamos que você esteja satisfeito com suas cartas.
Deixe uma avaliação: {ctx.get('review_url', '')}

FullFoil
"""


def _review_request_text(ctx):
    return f"""
Olá {ctx.get('customer_name', 'Cliente')}!

Como foi sua experiência com o pedido #{ctx.get('order_number', '')}?

Sua opinião é muito importante para nós e para outros compradores.

Deixe sua avaliação: {ctx.get('review_url', '')}

FullFoil
"""


def _seller_new_order_text(ctx):
    return f"""
Nova venda! 🎉

Pedido: #{ctx.get('order_number', '')}
Comprador: {ctx.get('customer_name', '')}

Itens:
{ctx.get('items_text', '')}

Total da venda: R$ {ctx.get('seller_total', '0.00')}

Acesse o painel de vendedor para processar: {ctx.get('dashboard_url', '')}

FullFoil
"""


def _payment_received_text(ctx):
    return f"""
Pagamento confirmado!

Pedido: #{ctx.get('order_number', '')}
Valor: R$ {ctx.get('amount', '0.00')}

Seu pedido está sendo processado.

FullFoil
"""


# ============================================
# High-level email functions
# ============================================

def send_order_confirmation(order):
    """Send order confirmation email to customer."""
    context = {
        'customer_name': order.customer.first_name or order.customer.username,
        'order_number': order.order_number,
        'total': str(order.total),
        'items_text': '\n'.join([
            f"- {item.product_name} x{item.quantity}: R$ {item.price}"
            for item in order.items.all()
        ]),
        'tracking_url': f"http://localhost:5173/#/orders/{order.id}",
    }
    
    return send_templated_email(
        subject=f"Pedido #{order.order_number} confirmado - FullFoil",
        template_name='order_confirmation',
        context=context,
        to_emails=[order.customer.email]
    )


def send_order_shipped(order):
    """Send shipping notification to customer."""
    context = {
        'customer_name': order.customer.first_name or order.customer.username,
        'order_number': order.order_number,
        'tracking_number': order.tracking_number or 'N/A',
        'carrier': order.shipping_carrier or 'Correios',
        'tracking_url': f"https://www.linkcorreios.com.br/?id={order.tracking_number}" if order.tracking_number else '',
    }
    
    return send_templated_email(
        subject=f"Pedido #{order.order_number} enviado! - FullFoil",
        template_name='order_shipped',
        context=context,
        to_emails=[order.customer.email]
    )


def send_order_delivered(order):
    """Send delivery confirmation with review request."""
    context = {
        'customer_name': order.customer.first_name or order.customer.username,
        'order_number': order.order_number,
        'review_url': f"http://localhost:5173/#/orders/{order.id}/review",
    }
    
    return send_templated_email(
        subject=f"Pedido #{order.order_number} entregue! Deixe sua avaliação - FullFoil",
        template_name='order_delivered',
        context=context,
        to_emails=[order.customer.email]
    )


def send_seller_new_order(order, seller):
    """Notify seller of new order."""
    # Get items for this seller
    items = order.items.filter(seller=seller)
    seller_total = sum(item.price * item.quantity for item in items)
    
    context = {
        'order_number': order.order_number,
        'customer_name': order.customer.first_name or order.customer.username,
        'items_text': '\n'.join([
            f"- {item.product_name} x{item.quantity}"
            for item in items
        ]),
        'seller_total': str(seller_total),
        'dashboard_url': 'http://localhost:5173/#/seller/orders',
    }
    
    return send_templated_email(
        subject=f"Nova venda! Pedido #{order.order_number} - FullFoil",
        template_name='seller_new_order',
        context=context,
        to_emails=[seller.user.email]
    )


def send_payment_received(order):
    """Send payment confirmation."""
    context = {
        'order_number': order.order_number,
        'amount': str(order.total),
        'customer_name': order.customer.first_name or order.customer.username,
    }
    
    return send_templated_email(
        subject=f"Pagamento confirmado - Pedido #{order.order_number}",
        template_name='payment_received',
        context=context,
        to_emails=[order.customer.email]
    )
