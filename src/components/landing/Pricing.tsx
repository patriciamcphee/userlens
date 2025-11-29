import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Check } from "lucide-react";

interface PricingProps {
  onGetStarted: () => void;
}

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individual researchers and small teams",
    features: [
      "Up to 3 active projects",
      "12 participants per project",
      "Basic affinity mapping",
      "Export to PDF/CSV",
      "Email support",
      "7-day data retention",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For growing research teams and agencies",
    features: [
      "Unlimited projects",
      "Unlimited participants",
      "Advanced analytics & filters",
      "Real-time collaboration",
      "Priority email & chat support",
      "90-day data retention",
      "Custom project templates",
      "Team management (up to 10)",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "SSO & Azure AD integration",
      "Multi-tenant organizations",
      "Unlimited data retention",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & 24/7 support",
      "Custom contracts & invoicing",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing({ onGetStarted }: PricingProps) {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 mb-2">Pricing</h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Choose the plan that fits your needs
          </p>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade as you grow. All plans include 14-day free trial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${
                plan.popular 
                  ? "border-indigo-600 shadow-xl shadow-indigo-100 scale-105" 
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-indigo-600 hover:bg-indigo-700">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-600 ml-1">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-indigo-600" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            All plans include core features: participant tracking, synthesis boards, and basic analytics.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Questions about pricing? <a href="#footer" className="text-indigo-600 hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
