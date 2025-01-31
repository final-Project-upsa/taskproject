import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for growing teams",
      basePrice: 59.99,
      userRange: "Up to 25 users",
      extraUserPrice: 5.59,
      features: [
        "Unlimited tasks and projects",
        "Team chat and collaboration",
        "Basic dashboard",
        "Email support",
        "5GB storage per user",
        "Basic time tracking",
        "Standard task templates",
        "Basic project analytics"
      ],
      recommended: false,
      maxUsers: 25,
      minUsers: 5
    },
    {
      name: "Growth",
      description: "For scaling teams",
      basePrice: 129.99,
      userRange: "Up to 50 users",
      extraUserPrice: 8.99,
      features: [
        "Everything in Starter, plus:",
        "AI-powered task prioritization",
        "Smart task assignments",
        "Advanced analytics dashboard",
        "Priority support",
        "20GB storage per user",
        "Custom workflow automation",
        "AI writing assistance",
        "Time prediction for tasks"
      ],
      recommended: true,
      maxUsers: 50,
      minUsers: 10
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      basePrice: 249.99,
      userRange: "Up to 100 users",
      extraUserPrice: 11.99,
      features: [
        "Everything in Growth, plus:",
        "Advanced AI productivity insights",
        "AI-powered resource optimization",
        "Custom AI model training",
        "24/7 dedicated support",
        "Unlimited storage",
        "Advanced security features",
        "Custom integrations",
        "Priority feature requests"
      ],
      recommended: false,
      maxUsers: 100,
      minUsers: 20
    }
  ];

  const calculatePriceRange = (plan) => {
    const minCost = (plan.basePrice / plan.minUsers).toFixed(2);
    const maxCost = (plan.basePrice / plan.maxUsers).toFixed(2);
    return `$${maxCost} - $${minCost}`;
  };

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your team
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden 
                ${plan.recommended ? 'ring-2 ring-indigo-600' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-lg text-sm">
                  Recommended
                </div>
              )}
              
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">${plan.basePrice}</div>
                  <div className="text-gray-600">/month for {plan.userRange}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {calculatePriceRange(plan)} per user/month depending on team size
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    +${plan.extraUserPrice}/user/month after {plan.maxUsers} users
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      {feature.toLowerCase().includes('ai') ? (
                        <Sparkles className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-3 rounded-lg font-medium 
                  ${plan.recommended 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;