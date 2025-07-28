import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProductByPriceId } from '@/stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscription(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchSubscription();
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const getCurrentPlan = () => {
    if (!subscription || !subscription.price_id) {
      return { name: 'Free', product: null };
    }

    const product = getProductByPriceId(subscription.price_id);
    return {
      name: product?.name || 'Unknown',
      product
    };
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active';
  };

  const isExpired = () => {
    if (!subscription?.current_period_end) return false;
    return Date.now() > subscription.current_period_end * 1000;
  };

  const getExpirationDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end * 1000);
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getCurrentPlan,
    isActive,
    isExpired,
    getExpirationDate,
  };
};