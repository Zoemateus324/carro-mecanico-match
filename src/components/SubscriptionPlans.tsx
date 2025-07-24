import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star, Zap } from 'lucide-react';
import { stripeProducts, formatPrice } from '@/stripe-config';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanChange?: () => void;
}

const SubscriptionPlans = ({ currentPlan, onPlanChange }: SubscriptionPlansProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to subscribe to a plan.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/dashboard?canceled=true`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: 'There was an error starting your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('ultimate')) return Crown;
    if (planName.toLowerCase().includes('premium')) return Star;
    return Zap;
  };

  const getPlanFeatures = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('ultimate')) {
      return [
        'Unlimited vehicles',
        'Unlimited service requests',
        'Priority support',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager'
      ];
    }
    if (name.includes('premium')) {
      return [
        'Up to 10 vehicles',
        'Unlimited service requests',
        'Priority support',
        'Advanced analytics',
        'API access'
      ];
    }
    return [
      'Up to 3 vehicles',
      '50 service requests/month',
      'Standard support',
      'Basic analytics'
    ];
  };

  const isPopular = (planName: string) => {
    return planName.toLowerCase().includes('premium');
  };

  // Group products by plan type
  const planGroups = stripeProducts.reduce((acc, product) => {
    const planType = product.name.replace(' yearly', '').replace(' monthly', '');
    if (!acc[planType]) {
      acc[planType] = [];
    }
    acc[planType].push(product);
    return acc;
  }, {} as Record<string, typeof stripeProducts>);

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your automotive service needs. All plans include our core features with varying limits and capabilities.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(planGroups).map(([planType, products]) => {
          const monthlyProduct = products.find(p => p.interval === 'month');
          const yearlyProduct = products.find(p => p.interval === 'year');
          const IconComponent = getPlanIcon(planType);
          const features = getPlanFeatures(planType);
          const popular = isPopular(planType);

          return (
            <Card 
              key={planType} 
              className={`relative ${popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${popular ? 'bg-primary' : 'bg-muted'}`}>
                    <IconComponent className={`h-6 w-6 ${popular ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{planType}</CardTitle>
                
                {monthlyProduct && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {formatPrice(monthlyProduct.price, monthlyProduct.currency)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    {yearlyProduct && (
                      <div className="text-sm text-muted-foreground">
                        or {formatPrice(yearlyProduct.price, yearlyProduct.currency)}/year
                        <Badge variant="secondary" className="ml-2">
                          Save {Math.round((1 - (yearlyProduct.price / 12) / monthlyProduct.price) * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {monthlyProduct && (
                    <Button
                      onClick={() => handleSubscribe(monthlyProduct.priceId)}
                      disabled={loading === monthlyProduct.priceId}
                      variant={popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {loading === monthlyProduct.priceId ? 'Processing...' : 'Subscribe Monthly'}
                    </Button>
                  )}
                  
                  {yearlyProduct && (
                    <Button
                      onClick={() => handleSubscribe(yearlyProduct.priceId)}
                      disabled={loading === yearlyProduct.priceId}
                      variant={popular ? 'secondary' : 'ghost'}
                      className="w-full"
                    >
                      {loading === yearlyProduct.priceId ? 'Processing...' : 'Subscribe Yearly'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;