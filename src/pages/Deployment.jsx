import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Settings,
  Globe,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const DeploymentStep = ({ number, title, status, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: number * 0.1 }}
    className="border border-gray-800 rounded-lg p-6 bg-gray-900/50"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
        status === 'completed' ? 'bg-green-600' : status === 'current' ? 'bg-purple-600' : 'bg-gray-600'
      }`}>
        {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : number}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {status === 'completed' && <Badge className="bg-green-600/20 text-green-400">Complete</Badge>}
      {status === 'current' && <Badge className="bg-purple-600/20 text-purple-400">Current Step</Badge>}
    </div>
    <div className="ml-11">{children}</div>
  </motion.div>
);

export default function Deployment() {
  const [currentStep, setCurrentStep] = useState(1);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Rocket className="w-8 h-8 text-purple-400" />
            Deploy Your App
          </h1>
          <p className="text-gray-400 mt-2">
            Get your AI Store Optimizer live and available to Shopify merchants worldwide.
          </p>
        </motion.div>

        <div className="space-y-6">
          <DeploymentStep 
            number={1} 
            title="Deploy on Base44 Platform" 
            status={currentStep >= 1 ? 'completed' : 'current'}
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Since you're using Base44, your app is automatically deployed when you save changes.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">✅ Your app is already live at:</h4>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-700 px-3 py-1 rounded text-cyan-400 flex-1">
                    https://your-app-id.base44.app
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard('https://your-app-id.base44.app')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setCurrentStep(2)} className="bg-purple-600 hover:bg-purple-700">
                Next: Shopify App Setup
              </Button>
            </div>
          </DeploymentStep>

          <DeploymentStep 
            number={2} 
            title="Create Shopify App Listing" 
            status={currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : 'pending'}
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Register your app with Shopify to make it installable by merchants.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-purple-400">Option A: Shopify App Store</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-400">Submit to Shopify App Store for public distribution</p>
                    <div className="space-y-2 text-xs">
                      <div>• 📝 Fill out app listing form</div>
                      <div>• 🔍 Pass Shopify review process</div>
                      <div>• 💰 Revenue sharing with Shopify</div>
                      <div>• 🌍 Global marketplace exposure</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-purple-500 text-purple-400"
                      onClick={() => window.open('https://partners.shopify.com', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Shopify Partners
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-emerald-400">Option B: Custom App</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-400">Direct installation for specific merchants</p>
                    <div className="space-y-2 text-xs">
                      <div>• ⚡ Faster deployment</div>
                      <div>• 🎯 Direct merchant relationships</div>
                      <div>• 💯 Keep 100% of revenue</div>
                      <div>• 🔧 More customization freedom</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-500 text-emerald-400"
                      onClick={() => setCurrentStep(3)}
                    >
                      Continue with Custom App
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DeploymentStep>

          <DeploymentStep 
            number={3} 
            title="Configure Shopify App Settings" 
            status={currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'current') : 'pending'}
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Set up your app configuration in Shopify Partners Dashboard.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Required App Settings:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">App URL:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-xs text-cyan-400">
                      https://your-app-id.base44.app
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Allowed redirection URLs:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-xs text-cyan-400">
                      https://your-app-id.base44.app/auth/callback
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Webhook endpoint:</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-xs text-cyan-400">
                      https://your-app-id.base44.app/webhooks
                    </code>
                  </div>
                </div>
              </div>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-blue-400">Required API Scopes</h4>
                      <p className="text-blue-300 text-sm">
                        read_products, write_products, read_themes, write_themes, read_shop
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => setCurrentStep(4)} className="bg-purple-600 hover:bg-purple-700">
                Next: Test Installation
              </Button>
            </div>
          </DeploymentStep>

          <DeploymentStep 
            number={4} 
            title="Test App Installation" 
            status={currentStep >= 4 ? (currentStep > 4 ? 'completed' : 'current') : 'pending'}
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Test your app installation on a development store.
              </p>
              
              <div className="bg-yellow-900/20 border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h4 className="font-semibold text-yellow-400">Important Testing Steps</h4>
                    <ul className="text-yellow-300 text-sm mt-2 space-y-1">
                      <li>• Create a Shopify development store</li>
                      <li>• Install your app using the installation URL</li>
                      <li>• Verify all features work correctly</li>
                      <li>• Test API permissions and data access</li>
                      <li>• Check responsive design on mobile</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300"
                  onClick={() => window.open('https://help.shopify.com/en/partners/dashboard/development-stores', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create Dev Store
                </Button>
                <Button onClick={() => setCurrentStep(5)} className="bg-purple-600 hover:bg-purple-700">
                  Next: Go Live
                </Button>
              </div>
            </div>
          </DeploymentStep>

          <DeploymentStep 
            number={5} 
            title="Launch Your App" 
            status={currentStep >= 5 ? 'completed' : 'pending'}
          >
            <div className="space-y-4">
              <p className="text-gray-300">
                Your AI Store Optimizer is ready for merchants!
              </p>
              
              <div className="bg-green-900/20 border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-400">🎉 Congratulations!</h4>
                    <p className="text-green-300 text-sm">
                      Your app is now live and ready to help Shopify merchants optimize their stores with AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-green-600 hover:bg-green-700 flex-1">
                  <Globe className="w-4 h-4 mr-2" />
                  View Live App
                </Button>
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Settings
                </Button>
              </div>
            </div>
          </DeploymentStep>
        </div>
      </div>
    </div>
  );
}