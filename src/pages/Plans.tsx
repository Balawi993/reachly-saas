import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

export default function Plans() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      features: [
        '1 connected account',
        'Up to 500 targets/month',
        'Basic message templates',
        'Email support',
      ],
      current: true,
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      features: [
        '5 connected accounts',
        'Up to 5,000 targets/month',
        'Advanced templates & tokens',
        'Priority support',
        'Followers extraction',
        'Analytics dashboard',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      features: [
        'Unlimited accounts',
        'Unlimited targets',
        'Custom message AI',
        'Dedicated support',
        'Advanced analytics',
        'Team collaboration',
        'API access',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Scale your outreach with the perfect plan for your needs
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 shadow-lg transition-all hover:shadow-xl ${
                plan.recommended ? 'border-2 border-primary' : ''
              }`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Recommended
                </Badge>
              )}
              {plan.current && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success">
                  Current Plan
                </Badge>
              )}

              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold text-foreground">{plan.name}</h3>
                <div className="mb-2 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.recommended ? 'bg-gradient-primary' : ''
                }`}
                variant={plan.recommended ? 'default' : 'outline'}
                disabled
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-primary p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-primary-foreground">
            Need a custom solution?
          </h2>
          <p className="mb-6 text-primary-foreground/90">
            Contact our sales team for enterprise pricing and custom features
          </p>
          <Button variant="secondary" size="lg" disabled>
            Contact Sales
          </Button>
        </Card>
      </div>
    </div>
  );
}
