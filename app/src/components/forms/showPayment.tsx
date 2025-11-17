'use client';

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { env } from 'next-runtime-env';
import * as React from 'react';

interface feeProps {
  fees: number;
}

const stripePubKey = env('NEXT_PUBLIC_STRIPE_PUBLIC_KEY') ?? '';
const frontendUrl = env('NEXT_PUBLIC_FRONTEND_URL');
const stripePromise = loadStripe(stripePubKey);

export default function CheckoutForm(reservationId: string) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${frontendUrl}/reservation/${reservationId}/pricing/checkout/success`,
      },
    });

    if (error?.type === 'card_error' || error?.type === 'validation_error') {
      setMessage(error.message ?? 'An unexpected error occurred.');
    } else {
      setMessage('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'accordion',
  };

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id='submit'>
        <span id="button-text">
          {isLoading ? <div className='spinner' id='spinner'></div> : 'Pay Now'}
        </span>
      </button>
      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {

}
