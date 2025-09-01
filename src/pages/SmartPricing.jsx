import React, { useState, useEffect } from 'react';
import { Product, Store } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target, Loader2, AlertCircle } from 'lucide-react';

export default function SmartPricing() {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) setStore(stores[0]);

      const productList = await Product.list();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const analyzePricing = async () => {
    if (!store || products.length === 0) {
      toast.error("No products found to analyze");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing competitor pricing and market positioning...");

    try {
      const result = await InvokeLLM({
        prompt: `
          Analyze pricing strategy for a ${store.store_name} store with these products:
          ${products.slice(0, 5).map(p => `- ${p.name}: ${p.description}`).join('\n')}

          Provide competitive pricing analysis including:
          - Current market price ranges for similar products
          - Recommended optimal pricing for maximum profit
          - Price elasticity insights
          - Competitor analysis summary
          - Profit margin recommendations
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_analysis: { type: "string" },
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  current_price: { type: "number" },
                  suggested_price: { type: "number" },
                  competitor_range: { type: "string" },
                  profit_potential: { type: "string" },
                  price_confidence: { type: "number" }
                }
              }
            },
            overall_strategy: { type: "string" },
            revenue_impact: { type: "string" }
          }
        }
      });

      setPricingData(result);
      toast.success("Pricing analysis completed!");
    } catch (error) {
      console.error('Pricing analysis failed:', error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            Smart Pricing Optimizer
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered competitor analysis and profit optimization for your products.
          </p>
        </motion.div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-300">Products analyzed: {products.length}</p>
            <p className="text-gray-400 text-sm">Store: {store?.store_name || 'Loading...'}</p>
          </div>
          <Button 
            onClick={analyzePricing}
            disabled={isAnalyzing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Target className="mr-2" />}
            Analyze Pricing
          </Button>
        </div>

        {pricingData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-400">Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{pricingData.market_analysis}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400">Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{pricingData.overall_strategy}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-purple-400">Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{pricingData.revenue_impact}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Product Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingData.products?.map((product, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{product.name}</h4>
                        <Badge className={product.price_confidence >= 80 ? "bg-green-600" : "bg-yellow-600"}>
                          {product.price_confidence}% confidence
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Current Price</p>
                          <p className="text-white font-semibold">${product.current_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Suggested Price</p>
                          <p className="text-green-400 font-semibold">${product.suggested_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Market Range</p>
                          <p className="text-gray-300">{product.competitor_range}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Profit Potential</p>
                          <p className="text-purple-400">{product.profit_potential}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}