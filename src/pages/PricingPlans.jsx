import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { 
  Check, 
  Lock, 
  Crown, 
  Zap, 
  Star, 
  TrendingUp,
  Sparkles,
  Globe,
  Shield,
  Rocket
} from 'lucide-react';
import UpgradeModal from '../components/modals/UpgradeModal';

const plans = {
  basic: {
    name: "Basic",
    price: { monthly: 0, yearly: 0 },
    color: "green",
    icon: Shield,
    features: [
      { name: "SEO Scanner (basic audit)", included: true },
      { name: "Image Optimizer (10/day limit)", included: true },
      { name: "AI Audit Summary", included: true },
      { name: "Basic Theme Speed Fixes", included: true },
      { name: "Toggle Module Controls", included: false, requiresPlan: "growth" },
      { name: "Auto-install snippets", included: false, requiresPlan: "growth" },
      { name: "AI Layout Generator", included: false, requiresPlan: "growth" },
      { name: "Auto Blog Generator", included: false, requiresPlan: "growth" },
      { name: "Geo Banner Swap", included: false, requiresPlan: "growth" },
      { name: "AI Store Builder", included: false, requiresPlan: "pro" },
      { name: "Product Review Importer", included: false, requiresPlan: "pro" },
      { name: "Competitor Spy Tools", included: false, requiresPlan: "pro" },
      { name: "Smart CTA/Upsell Injectors", included: false, requiresPlan: "pro" },
      { name: "Geo-Product Logic", included: false, requiresPlan: "pro" },
      { name: "Theme Auto Fixer Panel", included: false, requiresPlan: "pro" },
      { name: "AI HelpBot Assistant", included: false, requiresPlan: "pro" }
    ]
  },
  growth: {
    name: "Growth",
    price: { monthly: 14.99, yearly: 149.99 },
    color: "yellow",
    icon: TrendingUp,
    popular: true,
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Toggle Module Controls", included: true },
      { name: "Auto-install snippets (theme helper)", included: true },
      { name: "AI Layout Generator", included: true },
      { name: "Auto Blog Generator (5/mo)", included: true },
      { name: "Geo Banner Swap (UK vs US)", included: true },
      { name: "AI Store Builder", included: false, requiresPlan: "pro" },
      { name: "Product Review Importer", included: false, requiresPlan: "pro" },
      { name: "Competitor Spy Tools", included: false, requiresPlan: "pro" },
      { name: "Smart CTA/Upsell Injectors", included: false, requiresPlan: "pro" },
      { name: "Geo-Product Logic", included: false, requiresPlan: "pro" },
      { name: "Theme Auto Fixer Panel", included: false, requiresPlan: "pro" },
      { name: "AI HelpBot Assistant", included: false, requiresPlan: "pro" }
    ]
  },
  pro: {
    name: "Pro",
    price: { monthly: 29.99, yearly: 299.99 },
    color: "red",
    icon: Crown,
    features: [
      { name: "Everything in Growth", included: true },
      { name: "AI Store Builder (full theme pages)", included: true },
      { name: "Product Review Importer (All platforms)", included: true },
      { name: "Competitor Spy Tools (Amazon, Etsy, eBay)", included: true },
      { name: "Smart CTA/Upsell Injectors", included: true },
      { name: "Geo-Product Logic (country visibility)", included: true },
      { name: "Theme Auto Fixer Log Panel", included: true },
      { name: "Dark Mode UI Toggle", included: true },
      { name: "Shopify API Permissions Dashboard", included: true },
      { name: "AI HelpBot Assistant", included: true },
      { name: "Setup Wizard for onboarding", included: true },
      { name: "A/B Test Banner Swapper", included: true }
    ]
  }
};

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        const user = await User.me();
        setCurrentPlan(user.subscription_plan || 'basic');
      } catch (error) {
        console.error('Error loading user plan:', error);
      }
    };
    loadUserPlan();
  }, []);

  const handleFeatureClick = (feature, planKey) => {
    if (!feature.included && feature.requiresPlan) {
      setSelectedFeature({ ...feature, targetPlan: feature.requiresPlan });
      setShowUpgradeModal(true);
    }
  };

  const getColorClasses = (color, variant = 'bg') => {
    const colors = {
      green: {
        bg: 'bg-green-600',
        border: 'border-green-500',
        text: 'text-green-400',
        glow: 'shadow-green-500/25'
      },
      yellow: {
        bg: 'bg-yellow-600',
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/25'
      },
      red: {
        bg: 'bg-red-600',
        border: 'border-red-500',
        text: 'text-red-400',
        glow: 'shadow-red-500/25'
      }
    };
    return colors[color][variant];
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI Power</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">Transform your Shopify store with intelligent optimization</p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>Yearly</span>
            <Badge className="bg-green-600 text-white ml-2">Save 17%</Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {Object.entries(plans).map(([planKey, plan], index) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === planKey;
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            
            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 h-full ${
                  plan.popular ? `hover:shadow-2xl ${getColorClasses(plan.color, 'glow')}` : ''
                } ${isCurrentPlan ? `ring-2 ${getColorClasses(plan.color, 'border')}` : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${getColorClasses(plan.color, 'bg')} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-white">
                        {price === 0 ? 'Free' : `$${price}`}
                      </div>
                      {price > 0 && (
                        <div className="text-gray-400">
                          /{isYearly ? 'year' : 'month'}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center gap-3 ${
                            !feature.included ? 'cursor-pointer hover:bg-gray-800/30 p-2 rounded' : 'p-2'
                          }`}
                          onClick={() => handleFeatureClick(feature, planKey)}
                        >
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-200' : 'text-gray-500'
                          }`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button disabled className="w-full bg-gray-700 text-gray-400">
                          Current Plan
                        </Button>
                      ) : planKey === 'basic' ? (
                        <Button 
                          className={`w-full ${getColorClasses(plan.color, 'bg')} hover:opacity-90 text-white`}
                        >
                          Upgrade for More Power
                        </Button>
                      ) : planKey === 'growth' ? (
                        <Button 
                          className={`w-full ${getColorClasses(plan.color, 'bg')} hover:opacity-90 text-white`}
                        >
                          Unlock Full Automation
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full ${getColorClasses(plan.color, 'bg')} hover:opacity-90 text-white`}
                        >
                          Go Pro – Dominate Your Niche
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">30-day money back</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Instant activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Global support</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            All plans include SSL security, 99.9% uptime, and premium support.
          </p>
        </motion.div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={selectedFeature}
        currentPlan={currentPlan}
      />
    </div>
  );
}