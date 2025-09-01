import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, X, Sparkles, Zap } from 'lucide-react';

const planDetails = {
  growth: {
    name: "Growth",
    price: "$14.99/mo",
    color: "yellow",
    features: ["AI Layout Generator", "Auto Blog Generator", "Geo Banner Swap"]
  },
  pro: {
    name: "Pro", 
    price: "$29.99/mo",
    color: "red",
    features: ["AI Store Builder", "Review Importer", "Competitor Spy", "AI Assistant"]
  }
};

export default function UpgradeModal({ isOpen, onClose, feature, currentPlan }) {
  if (!isOpen || !feature) return null;

  const targetPlan = planDetails[feature.targetPlan];
  const isProFeature = feature.targetPlan === 'pro';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-md w-full"
        >
          <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-cyan-600" />
            
            <CardHeader className="text-center pb-4">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
                {isProFeature ? <Crown className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
              </div>
              
              <CardTitle className="text-xl text-white mb-2">
                This feature requires {targetPlan.name}
              </CardTitle>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">{feature.name}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  {isProFeature ? 
                    "Want competitor spying, review imports, and AI assistants? Upgrade to unlock all features." :
                    "Unlock advanced automation tools and AI-powered features for your store."
                  }
                </p>
                
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <div className="text-lg font-semibold text-white mb-2">
                    {targetPlan.name} Plan - {targetPlan.price}
                  </div>
                  <div className="space-y-1">
                    {targetPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-700 text-gray-300"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    // In a real app, this would trigger the Shopify billing API
                    console.log(`Upgrading to ${targetPlan.name} plan`);
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}