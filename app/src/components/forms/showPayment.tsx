'use client';

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  loadStripe,
  type Stripe,
  type StripePaymentElementOptions,
} from '@stripe/stripe-js';
import * as React from 'react';

function PaymentForm() {
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
        return_url: `${window.location.origin}/checkout/success`,
      },
    });
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message!);
    } else {
      setMessage('An unexpected error occured.');
    }
    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'accordion',
  };

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id='submit'>
        <span id='button-text'>
          {isLoading ? <div className='spinner' id='spinner'></div> : 'Pay Now'}
        </span>
      </button>
      {message && <div id='payment-message'>{message}</div>}
    </form>
  );
}

export default function CheckoutForm({
  clientSecret,
  publicKey,
}: {
  clientSecret: string | null;
  publicKey: string | null;
}) {
  if (!clientSecret || !publicKey) {
    return null;
  }
  const [stripePromise, setStripePromise] = React.useState<
    Promise<Stripe | null>
  >(Promise.resolve(null));
  React.useEffect(() => {
    setStripePromise(loadStripe(publicKey));
  }, [publicKey]);
  return (
    <Elements
      stripe={stripePromise}
      options={{ appearance: { theme: 'stripe' }, clientSecret }}
    >
      <PaymentForm />
    </Elements>
  );
}
