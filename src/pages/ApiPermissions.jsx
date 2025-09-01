import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const requiredScopes = [
  { scope: 'read_products', description: 'Access product data for SEO and content optimization.' },
  { scope: 'read_themes', description: 'Read theme files to analyze performance and code.' },
  { scope: 'read_shop', description: 'Read basic store information to confirm connection.' },
  // Write scopes for auto-fixer features
  { scope: 'write_products', description: 'Update product descriptions, titles, and metafields (Pro).', pro: true },
  { scope: 'write_themes', description: 'Apply auto-fixes and inject optimization snippets (Pro).', pro: true },
  { scope: 'read_product_listings', description: 'Analyze product visibility across sales channels.' },
];

export default function ApiPermissions() {
  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            Shopify API Permissions
          </h1>
          <p className="text-gray-400 mt-2">
            A guide to correctly configuring your Shopify Admin API Access Token.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>How to Get Your Access Token</CardTitle>
            <CardDescription>
              Follow these steps in your Shopify Admin to create a token with the correct permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Go to <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Settings</code> → <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Apps and sales channels</code>.</li>
              <li>Click <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Develop apps</code>, then <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Create an app</code>.</li>
              <li>Name it "Super AI Optimizer Pro" and click <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Create app</code>.</li>
              <li>Go to the <code className="bg-gray-800 p-1 rounded-md text-cyan-400">API credentials</code> tab and <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Configure Admin API scopes</code>.</li>
              <li>Check all the boxes listed below.</li>
              <li>Click <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Save</code>, then go back to the <code className="bg-gray-800 p-1 rounded-md text-cyan-400">API credentials</code> tab and click <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Install app</code>.</li>
              <li>Click <code className="bg-gray-800 p-1 rounded-md text-cyan-400">Reveal token once</code>. This is your <code className="bg-gray-800 p-1 rounded-md text-cyan-400">SHOPIFY_ACCESS_TOKEN</code>.</li>
            </ol>
            <Button asChild variant="link" className="p-0">
              <a href="https://shopify.dev/docs/apps/auth/admin-api-access-tokens" target="_blank" rel="noopener noreferrer">
                View Official Shopify Guide <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Required Permissions</CardTitle>
            <CardDescription>
              To enable full automation, our app needs the following permissions. We only request what's necessary to optimize your store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredScopes.map((item, index) => (
              <motion.div
                key={item.scope}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-mono text-sm text-cyan-400">{item.scope}</p>
                  <p className="text-sm text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}