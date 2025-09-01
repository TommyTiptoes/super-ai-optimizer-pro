import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, RotateCw, Lock, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const badgeOptions = [
  { id: 'secure', icon: ShieldCheck, text: 'Secure Checkout', color: 'green' },
  { id: 'shipping', icon: Truck, text: 'Free Shipping', color: 'blue' },
  { id: 'returns', icon: RotateCw, text: '30-Day Returns', color: 'purple' },
  { id: 'encrypted', icon: Lock, text: 'SSL Encrypted', color: 'gray' },
];

const getColorClasses = (color) => {
    switch (color) {
        case 'green': return 'text-green-400 bg-green-900/50';
        case 'blue': return 'text-blue-400 bg-blue-900/50';
        case 'purple': return 'text-purple-400 bg-purple-900/50';
        default: return 'text-gray-400 bg-gray-700/50';
    }
};

export default function TrustBuilder() {
  const [selectedBadges, setSelectedBadges] = useState(['secure', 'shipping']);

  const toggleBadge = (id) => {
    setSelectedBadges(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const generateHtml = () => {
    return `
<div style="display: flex; gap: 1rem; justify-content: center; align-items: center; padding: 1rem; background-color: transparent;">
  ${selectedBadges.map(id => {
    const badge = badgeOptions.find(b => b.id === id);
    return `
    <div style="display: flex; align-items: center; gap: 0.5rem; color: #cbd5e1; font-family: sans-serif; font-size: 0.875rem;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${badge.icon.displayName}</svg>
      <span>${badge.text}</span>
    </div>`;
  }).join('\n  ')}
</div>
    `.trim();
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(generateHtml());
    toast.success("Badge HTML copied to clipboard!");
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-400" />
            Trust Badge Builder
          </h1>
          <p className="text-gray-400 mt-2">
            Boost customer confidence and conversions by adding trust badges to your store.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Select Your Badges</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {badgeOptions.map(badge => (
                <div
                  key={badge.id}
                  onClick={() => toggleBadge(badge.id)}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedBadges.includes(badge.id)
                      ? `border-green-500 ${getColorClasses(badge.color)}`
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <badge.icon className="w-8 h-8" />
                    <span className="text-sm font-medium">{badge.text}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Preview & Install</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                This is how the badges will look on your store.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <div className="flex gap-4 justify-center items-center">
                  {selectedBadges.map(id => {
                    const badge = badgeOptions.find(b => b.id === id);
                    if (!badge) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 text-gray-300">
                        <badge.icon className={`w-5 h-5 ${getColorClasses(badge.color).split(' ')[0]}`} />
                        <span className="text-sm">{badge.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <pre className="bg-gray-800 p-4 rounded-lg text-xs text-gray-300 mb-4 max-h-48 overflow-auto">
                {generateHtml()}
              </pre>
              
              <Button onClick={copyHtml} className="w-full bg-green-600 hover:bg-green-700">
                <Copy className="mr-2" />
                Copy HTML Snippet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}