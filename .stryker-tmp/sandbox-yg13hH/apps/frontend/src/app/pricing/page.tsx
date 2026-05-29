'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Zap, Rocket, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/lib/toast';

const plans = [
  {
    name: 'Free',
    tier: 'free',
    price: '$0',
    description: 'Perfect for getting started with blockchain education.',
    features: [
      'Access to all free courses',
      'Basic progress tracking',
      'Community forum access',
      'Public profile',
    ],
    buttonText: 'Current Plan',
    highlight: false,
    icon: Zap,
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '$19',
    period: '/month',
    description: 'Unlimited access for serious learners and professionals.',
    features: [
      'Everything in Free',
      'Unlimited access to ALL courses',
      'Priority support',
      'Completion certificates',
      'Early access to new features',
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
    icon: Rocket,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise',
    price: '$49',
    period: '/month',
    description: 'Custom solutions for teams and organizations.',
    features: [
      'Everything in Pro',
      'Team management dashboard',
      'Custom learning paths',
      'Bulk enrollment options',
      'Dedicated account manager',
    ],
    buttonText: 'Contact Sales',
    highlight: false,
    icon: ShieldCheck,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    if (tier === 'free') return;
    if (tier === 'enterprise') {
      toast.info('Please contact our sales team for Enterprise plans.');
      return;
    }

    setLoadingTier(tier);
    try {
      const { data } = await api.post('/subscriptions/checkout', { tier });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-gray-900 dark:text-white">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock unlimited access to the world's best blockchain education platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col p-8 space-y-6 transition-all hover:shadow-2xl ${
                plan.highlight
                  ? 'border-2 border-blue-500 scale-105 z-10'
                  : 'border border-gray-200 dark:border-gray-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-bold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <Icon className={`w-8 h-8 ${plan.highlight ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.highlight ? 'primary' : 'outline'}
                className="w-full h-12 text-lg font-bold"
                onClick={() => handleUpgrade(plan.tier)}
                disabled={plan.tier === 'free' || (loadingTier !== null)}
              >
                {loadingTier === plan.tier ? 'Processing...' : plan.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Need a custom plan for your school or team?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We offer volume discounts and special features for organizations.
        </p>
        <Button variant="outline">Contact Enterprise Sales</Button>
      </div>
    </main>
  );
}
