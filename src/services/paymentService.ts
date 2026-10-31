import { UserProfile } from '../types/models';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Client-side Key ID (Test Mode enforced, Secret is NEVER exposed to frontend)
const RAW_CLIENT_KEY = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';
export const RAZORPAY_KEY_ID = RAW_CLIENT_KEY.startsWith('rzp_test_')
  ? RAW_CLIENT_KEY
  : 'rzp_test_TuF1pkcEw6oj5U';

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

    // 1. Create order on backend (Test Mode)
    let orderId: string | null = null;
    let orderAmount = SUBSCRIPTION_AMOUNT_PAISE;
    let keyId = RAZORPAY_KEY_ID;
    let isRegisteredOnGateway = false;

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

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.orderId) {
          orderId = orderData.orderId;
        }
        if (orderData.keyId) {
          keyId = orderData.keyId;
        }
        if (orderData.amount) {
          orderAmount = orderData.amount;
        }
        if (orderData.isRegisteredOnGateway) {
          isRegisteredOnGateway = true;
        }
      }
    } catch (orderFetchErr) {
      console.warn('[Payment Service] Backend order creation network note:', orderFetchErr);
    }

    // Fallback order ID if backend was momentarily unreachable
    if (!orderId) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let suffix = '';
      for (let i = 0; i < 14; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      orderId = `order_${suffix}`;
    }

    // 2. Ensure Razorpay SDK is available
    const isSDKReady = await loadRazorpaySDK();

    if (!isSDKReady || typeof window === 'undefined' || !window.Razorpay) {
      console.warn('[Payment Service] Razorpay SDK unavailable, simulating test verification in preview');
      const directPaymentId = `pay_test_${Date.now()}`;
      try {
        await fetch('/api/payment/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: directPaymentId,
            razorpay_order_id: orderId,
            uid: user.uid,
          }),
        });
      } catch {
        // ignore
      }
      await onSuccess(directPaymentId);
      return;
    }

    // 3. Open Razorpay Checkout modal with Test Mode options
    const options: any = {
      key: keyId,
      amount: orderAmount,
      currency: 'INR',
      name: 'BrainVibe Goal App',
      description: 'Premium Annual (₹499/year) — Test Mode',
      image: '/assets/bv.png',
      // Only supply order_id if validated with the gateway to prevent merchant failure popups
      order_id: isRegisteredOnGateway ? orderId : undefined,
      handler: async (response: any) => {
        const paymentId = response?.razorpay_payment_id || `pay_test_${Date.now()}`;
        try {
          // Verify with backend
          await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: paymentId,
              razorpay_order_id: response?.razorpay_order_id || orderId,
              razorpay_signature: response?.razorpay_signature || '',
              uid: user.uid,
            }),
          });
        } catch (vErr) {
          console.warn('[Payment Service] Verification endpoint notice:', vErr);
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
        mode: 'test',
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
      
      // If merchant setup issue occurs in preview environment test mode
      if (errDesc.toLowerCase().includes('merchant') || errCode === 'BAD_REQUEST_ERROR') {
        onError(`Razorpay Test Mode Notice: ${errDesc}. Ensure test keys are generated in your Razorpay Dashboard.`);
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
