
import React, { useState, useEffect } from 'react';
import { Store } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Wand, CheckCircle, ArrowRight, Loader2, ExternalLink } from 'lucide-react';

const steps = [
  { id: 1, title: "Connect Store", description: "Link your Shopify store to get started" },
  { id: 2, title: "Initial Scan", description: "Analyze your store's current performance" },
  { id: 3, title: "Enable Features", description: "Choose which optimization tools to activate" },
  { id: 4, title: "Ready to Optimize", description: "Your store is ready for AI optimization" }
];

export default function AppSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [store, setStore] = useState(null);
  const [storeUrl, setStoreUrl] = useState('super-ai-optimizer-pro.myshopify.com');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [features, setFeatures] = useState({
    scanner: true,
    seo: true,
    images: true,
    trust: true,
    speed: false,
    competitor: false
  });

  useEffect(() => {
    checkExistingStore();
  }, []);

  const checkExistingStore = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        setStore(stores[0]);
        setCurrentStep(4); // Skip to final step if store exists
      }
    } catch (error) {
      console.error('Error checking store:', error);
    }
  };

  const connectStore = async () => {
    if (!storeUrl.trim()) {
      toast.error("Please enter your store URL");
      return;
    }

    setIsConnecting(true);
    try {
      // Clean up the URL
      let cleanUrl = storeUrl.replace('https://', '').replace('http://', '').toLowerCase();
      
      // Extract store name
      let storeName = cleanUrl;
      if (cleanUrl.includes('.myshopify.com')) {
        storeName = cleanUrl.split('.myshopify.com')[0];
      }
      
      const newStore = await Store.create({
        shop_domain: cleanUrl.includes('.myshopify.com') ? cleanUrl : cleanUrl + '.myshopify.com',
        store_name: storeName.charAt(0).toUpperCase() + storeName.slice(1).replace(/-/g, ' '),
        health_score: 0,
        speed_score: 0,
        seo_score: 0,
        accessibility_score: 0,
        content_score: 0,
        bloat_score: 0,
        plan: "pro"
      });
      
      setStore(newStore);
      setCurrentStep(2);
      toast.success("Store connected successfully!");
    } catch (error) {
      console.error('Connection error:', error);
      toast.error("Failed to connect store: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const runInitialScan = async () => {
    setIsScanning(true);
    try {
      // Simulate initial scan
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update store with sample scores
      await Store.update(store.id, {
        health_score: 72,
        speed_score: 68,
        seo_score: 83,
        accessibility_score: 65,
        content_score: 79,
        bloat_score: 71,
        last_scan_date: new Date().toISOString()
      });
      
      setCurrentStep(3);
      toast.success("Initial scan completed!");
    } catch (error) {
      toast.error("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleFeature = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const completeSetup = () => {
    setCurrentStep(4);
    toast.success("Setup completed! Your store is ready for optimization.");
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Wand className="w-8 h-8 text-purple-400" />
            App Setup Wizard
          </h1>
          <p className="text-gray-400 mt-2">
            Get your store optimized in just a few simple steps.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-purple-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">{steps[currentStep - 1]?.title}</CardTitle>
            <p className="text-gray-400">{steps[currentStep - 1]?.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 mb-2 block">Store URL</label>
                  <Input
                    placeholder="https://your-store.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button 
                  onClick={connectStore}
                  disabled={isConnecting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isConnecting ? <Loader2 className="animate-spin mr-2" /> : <ExternalLink className="mr-2" />}
                  Connect Store
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center space-y-4">
                <div className="text-gray-300">
                  Connected to: <span className="text-white font-semibold">{store?.shop_domain}</span>
                </div>
                <Button 
                  onClick={runInitialScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isScanning ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                  {isScanning ? 'Scanning...' : 'Run Initial Scan'}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Choose Features to Enable</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries({
                    scanner: 'Store Scanner',
                    seo: 'SEO Assistant', 
                    images: 'Image Optimizer',
                    trust: 'Trust Badge Generator',
                    speed: 'Theme Speed Analyzer',
                    competitor: 'Competitor Spy'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">{label}</span>
                      <button
                        onClick={() => toggleFeature(key)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          features[key] ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          features[key] ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={completeSetup}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Complete Setup
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">Setup Complete!</h3>
                <p className="text-gray-300">Your store is now connected and ready for AI-powered optimization.</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Button 
                    onClick={() => window.location.href = '/Dashboard'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/Scanner'}
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                  >
                    Run Full Scan
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
