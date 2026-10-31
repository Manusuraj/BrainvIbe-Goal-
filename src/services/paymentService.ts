import { UserProfile } from '../types/models';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Client-side Key ID — the server's /create-order response is authoritative (Secret is NEVER exposed to frontend)
export const RAZORPAY_KEY_ID: string = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';

export const SUBSCRIPTION_PRICE_INR = 499;
export const SUBSCRIPTION_AMOUNT_PAISE = 49900;

export interface PaymentInitiationParams {
  user: UserProfile;
  onStart?: () => void;
  onSuccess: (paymentId: string) => Promise<void> | void;
  onError: (errorMessage: string) => void;
  onCancel?: () => void;
}

export function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.getElementById('razorpay-checkout-js') as HTMLScriptElement;
    if (existing) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);

    // Timeout safety
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 4000);
  });
}

export async function initiateSubscriptionCheckout({
  user,
  onStart,
  onSuccess,
  onError,
  onCancel,
}: PaymentInitiationParams): Promise<void> {
  try {
    onStart?.();

    // 1. Create order on backend — never fall back to a fake order, it can't be verified
    let orderData: any = null;
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.name,
        }),
      });
      orderData = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !orderData?.orderId) {
        onError(orderData?.error || `Could not create payment order (HTTP ${orderRes.status}).`);
        return;
      }
    } catch (orderFetchErr) {
      console.error('[Payment Service] Backend order creation failed:', orderFetchErr);
      onError('Payment server is unreachable. Please try again.');
      return;
    }

    const orderId: string = orderData.orderId;
    const orderAmount: number = orderData.amount || SUBSCRIPTION_AMOUNT_PAISE;
    const keyId: string = orderData.keyId || RAZORPAY_KEY_ID;
    const isTestMode = keyId.startsWith('rzp_test_');

    // 2. Ensure Razorpay SDK is available
    const isSDKReady = await loadRazorpaySDK();

    if (!isSDKReady || typeof window === 'undefined' || !window.Razorpay) {
      onError('Could not load Razorpay checkout. Check your connection or disable ad-blockers and try again.');
      return;
    }

    // 3. Open Razorpay Checkout modal with Test Mode options
    const options: any = {
      key: keyId,
      amount: orderAmount,
      currency: 'INR',
      name: 'BrainVibe Goal App',
      description: `Premium Annual (₹499/year)${isTestMode ? ' — Test Mode' : ''}`,
      image: '/assets/bv.png',
      order_id: orderId,
      handler: async (response: any) => {
        const paymentId = response?.razorpay_payment_id;
        try {
          // Verify signature with backend before granting Pro
          const verifyRes = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: paymentId,
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_signature: response?.razorpay_signature,
              uid: user.uid,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => null);
          if (!verifyRes.ok || !verifyData?.verified) {
            onError(
              `Payment received (Ref: ${paymentId}) but verification failed: ${verifyData?.error || 'unknown error'}. Please contact support.`
            );
            return;
          }
        } catch (vErr) {
          console.error('[Payment Service] Verification request failed:', vErr);
          onError(`Payment received (Ref: ${paymentId}) but could not be verified. Please contact support.`);
          return;
        }

        // Activate Pro in context and persistent storage
        await onSuccess(paymentId);
      },
      prefill: {
        name: user?.name || 'Goal Achiever',
        email: user?.email || '',
        contact: user?.phoneNumber || '',
      },
      notes: {
        plan: 'Premium Annual',
        price: '499',
        currency: 'INR',
        uid: user?.uid || 'guest',
      },
      theme: {
        color: '#ffcf07',
        backdrop_color: 'rgba(0,0,0,0.85)',
      },
      modal: {
        backdropclose: false,
        escape: true,
        ondismiss: () => {
          onCancel?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', async (response: any) => {
      console.warn('[Payment Service] Razorpay payment failed:', response?.error);
      const errCode = response?.error?.code || '';
      const errDesc = response?.error?.description || response?.error?.reason || 'Transaction could not be completed.';
      
      if (errDesc.toLowerCase().includes('merchant') || errCode === 'BAD_REQUEST_ERROR') {
        onError(`Razorpay setup issue: ${errDesc}. Check the API keys in your Razorpay Dashboard.`);
      } else {
        onError(`Payment failed: ${errDesc}`);
      }
    });

    rzp.open();
  } catch (err: any) {
    console.error('[Payment Service] Checkout error:', err);
    onError(err?.message || 'Unable to open checkout window. Please try again.');
  }
}
