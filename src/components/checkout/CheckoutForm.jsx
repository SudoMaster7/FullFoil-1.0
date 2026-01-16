import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPaymentIntent } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './CheckoutForm.css';

// Validation schema
const shippingSchema = z.object({
    fullName: z.string().min(3, 'Nome completo é obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    zipCode: z.string().min(8, 'CEP inválido'),
    address: z.string().min(5, 'Endereço é obrigatório'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório'),
    country: z.string().default('Brasil')
});

function CheckoutForm({ cartItems, totalAmount, onComplete, processing }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth(); // Get logged-in user
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(shippingSchema),
        defaultValues: {
            country: 'Brasil',
            email: user?.email || '', // Pre-fill email if logged in
            fullName: user?.name || '' // Pre-fill name if logged in
        }
    });

    const calculateTotals = () => {
        const subtotal = totalAmount;
        const shipping = 15.00;
        const tax = subtotal * 0.10;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    };

    const onSubmit = async (shippingData) => {
        if (!stripe || !elements) {
            toast.error('Sistema de pagamento não está pronto');
            return;
        }

        setPaymentProcessing(true);
        setPaymentError(null);

        try {
            const { total } = calculateTotals();

            // Step 1: Create payment intent
            toast.loading('Processando pagamento...');
            const { clientSecret, paymentIntentId } = await createPaymentIntent(total, 'brl');

            // Step 2: Confirm payment with Stripe
            const cardElement = elements.getElement(CardElement);

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: shippingData.fullName,
                            email: shippingData.email,
                            phone: shippingData.phone,
                            address: {
                                line1: shippingData.address,
                                city: shippingData.city,
                                state: shippingData.state,
                                postal_code: shippingData.zipCode,
                                country: 'BR'
                            }
                        }
                    }
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            // Step 3: Create order in our system
            const orderData = {
                userId: user?.id, // Associate with logged-in user
                items: cartItems.map(item => ({
                    cardId: item.id,
                    name: item.name,
                    game: item.game,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                shipping: shippingData,
                payment: {
                    method: 'card',
                    stripePaymentIntentId: paymentIntent.id,
                    status: paymentIntent.status
                },
                totals: calculateTotals()
            };

            toast.dismiss();
            toast.success('Pagamento realizado com sucesso!');

            await onComplete(orderData);

        } catch (error) {
            setPaymentError(error.message);
            toast.dismiss();
            toast.error(`Erro no pagamento: ${error.message}`);
        } finally {
            setPaymentProcessing(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': {
                    color: '#aab7c4'
                },
                backgroundColor: 'transparent'
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        },
        hidePostalCode: true
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
            {/* Shipping Information */}
            <div className="form-section">
                <h3>📦 Informações de Envio</h3>

                <div className="form-grid">
                    <div className="form-group full-width">
                        <label htmlFor="fullName">Nome Completo *</label>
                        <input
                            id="fullName"
                            type="text"
                            {...register('fullName')}
                            className={errors.fullName ? 'error' : ''}
                            placeholder="João da Silva"
                        />
                        {errors.fullName && (
                            <span className="error-message">{errors.fullName.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={errors.email ? 'error' : ''}
                            placeholder="joao@exemplo.com"
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Telefone *</label>
                        <input
                            id="phone"
                            type="tel"
                            {...register('phone')}
                            className={errors.phone ? 'error' : ''}
                            placeholder="(11) 98765-4321"
                        />
                        {errors.phone && (
                            <span className="error-message">{errors.phone.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="zipCode">CEP *</label>
                        <input
                            id="zipCode"
                            type="text"
                            {...register('zipCode')}
                            className={errors.zipCode ? 'error' : ''}
                            placeholder="01234-567"
                            maxLength={9}
                        />
                        {errors.zipCode && (
                            <span className="error-message">{errors.zipCode.message}</span>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="address">Endereço *</label>
                        <input
                            id="address"
                            type="text"
                            {...register('address')}
                            className={errors.address ? 'error' : ''}
                            placeholder="Rua, Número, Complemento"
                        />
                        {errors.address && (
                            <span className="error-message">{errors.address.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">Cidade *</label>
                        <input
                            id="city"
                            type="text"
                            {...register('city')}
                            className={errors.city ? 'error' : ''}
                            placeholder="São Paulo"
                        />
                        {errors.city && (
                            <span className="error-message">{errors.city.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="state">Estado *</label>
                        <input
                            id="state"
                            type="text"
                            {...register('state')}
                            className={errors.state ? 'error' : ''}
                            placeholder="SP"
                            maxLength={2}
                        />
                        {errors.state && (
                            <span className="error-message">{errors.state.message}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div className="form-section">
                <h3>💳 Informações de Pagamento</h3>

                <div className="payment-info">
                    <p className="payment-description">
                        Aceitamos cartões de crédito e débito. Seu pagamento é processado de forma segura pela Stripe.
                    </p>
                </div>

                <div className="form-group">
                    <label>Cartão de Crédito/Débito *</label>
                    <div className="card-element-container">
                        <CardElement options={cardElementOptions} />
                    </div>
                    {paymentError && (
                        <span className="error-message">{paymentError}</span>
                    )}
                </div>

                <div className="test-cards-info">
                    <details>
                        <summary>ℹ️ Cartões de teste</summary>
                        <div className="test-cards-list">
                            <p><strong>Sucesso:</strong> 4242 4242 4242 4242</p>
                            <p><strong>Falha:</strong> 4000 0000 0000 0002</p>
                            <p>Use qualquer data futura e CVC válido</p>
                        </div>
                    </details>
                </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-checkout"
                    disabled={!stripe || paymentProcessing || processing}
                >
                    {paymentProcessing || processing ? (
                        <>
                            <span className="spinner"></span>
                            Processando...
                        </>
                    ) : (
                        <>
                            🔒 Finalizar Pedido - R$ {calculateTotals().total.toFixed(2)}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default CheckoutForm;
