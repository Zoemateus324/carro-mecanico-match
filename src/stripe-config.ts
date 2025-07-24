export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_RBHm7VH15SqyC8',
    priceId: 'price_1QIvDPK0hRh7i4zgWYV6lGLy',
    name: 'Ultimate yearly',
    description: 'Ultimate plan with all features included for a full year',
    mode: 'subscription',
    price: 45000, // $450.00 in cents
    currency: 'usd',
    interval: 'year'
  },
  {
    id: 'prod_RBHmR4S1EaVFsG',
    priceId: 'price_1QIvD0K0hRh7i4zgvOfjae6C',
    name: 'Ultimate monthly',
    description: 'Ultimate plan with all features included, billed monthly',
    mode: 'subscription',
    price: 4500, // $45.00 in cents
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_RBHlOyXkfGdAbL',
    priceId: 'price_1QIvCMK0hRh7i4zg5DBiebE2',
    name: 'Premium yearly',
    description: 'Premium plan with advanced features for a full year',
    mode: 'subscription',
    price: 25000, // $250.00 in cents
    currency: 'usd',
    interval: 'year'
  },
  {
    id: 'prod_RBHlKDWVVR3uPR',
    priceId: 'price_1QIvBwK0hRh7i4zgqpSEndfd',
    name: 'Premium monthly',
    description: 'Premium plan with advanced features, billed monthly',
    mode: 'subscription',
    price: 2500, // R$25.00 in cents (assuming BRL)
    currency: 'brl',
    interval: 'month'
  },
  {
    id: 'prod_RBHHmxh3aNehG0',
    priceId: 'price_1QIuieK0hRh7i4zgLm9Tkfru',
    name: 'Standard yearly',
    description: 'Standard plan with essential features for a full year',
    mode: 'subscription',
    price: 10000, // $100.00 in cents
    currency: 'usd',
    interval: 'year'
  },
  {
    id: 'prod_RBGMr3Bv6WkfkH',
    priceId: 'price_1QItpiK0hRh7i4zgl4vjKlin',
    name: 'Standard monthly',
    description: 'Standard plan with essential features, billed monthly',
    mode: 'subscription',
    price: 1000, // $10.00 in cents
    currency: 'usd',
    interval: 'month'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100);
}