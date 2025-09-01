import React, { useState, useEffect } from 'react';
import { Store } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { AppWindow, Zap, Loader2, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AppRecommender() {
  const [store, setStore] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    async function loadStore() {
      try {
        const user = await User.me();
        const stores = await Store.filter({ created_by: user.email });
        if (stores.length > 0) setStore(stores[0]);
      } catch (error) {
        console.error("Error loading store:", error);
      }
    }
    loadStore();
  }, []);

  const handleGenerate = async () => {
    if (!store) {
      toast.error("Store not loaded.");
      return;
    }
    setIsGenerating(true);
    toast.info("Analyzing your store to recommend the perfect app stack...");

    try {
      const result = await InvokeLLM({
        prompt: `
          Based on this Shopify store profile:
          - Name: ${store.store_name}
          - Domain: ${store.shop_domain}
          - Plan: ${store.plan}
          - Health Score: ${store.health_score}

          Recommend a stack of Shopify apps. Categorize them into 'Marketing', 'SEO', 'Speed', 'Trust', and 'Customer Service'.
          For each app, provide a name, a brief description of why it's a good fit for this store, and a plausible (but not necessarily real) link to its app store page.
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  app_name: { type: "string" },
                  description: { type: "string" },
                  app_store_link: { type: "string", format: "uri" }
                }
              }
            }
          }
        }
      });
      
      // Group recommendations by category
      const grouped = result.recommendations.reduce((acc, app) => {
        (acc[app.category] = acc[app.category] || []).push(app);
        return acc;
      }, {});

      setRecommendations(grouped);
      toast.success("App recommendations generated!");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <AppWindow className="w-8 h-8 text-indigo-400" />
            AI App Stack Recommender
          </h1>
          <p className="text-gray-400 mt-2">
            Get a curated list of the best Shopify apps for your specific store needs.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-indigo-400">Your Custom App Stack</CardTitle>
              <Button onClick={handleGenerate} disabled={isGenerating || !store} className="bg-indigo-600 hover:bg-indigo-700">
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                Recommend Apps
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            )}
            {recommendations ? (
              <ScrollArea className="h-[60vh]">
              <div className="space-y-6">
                {Object.entries(recommendations).map(([category, apps]) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold text-white mb-4">{category}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {apps.map((app, index) => (
                        <Card key={index} className="bg-gray-800/50 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-lg text-white">{app.app_name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm mb-4">{app.description}</p>
                            <a href={app.app_store_link} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="w-full border-indigo-500 text-indigo-400 hover:bg-indigo-900/20">
                                View in App Store <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                            </a>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </ScrollArea>
            ) : (
              !isGenerating && (
                <div className="text-center py-16 text-gray-500">
                  <AppWindow className="w-16 h-16 mx-auto mb-4" />
                  <p>Your personalized app recommendations will appear here.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}