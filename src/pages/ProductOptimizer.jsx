import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { runProductAnalysis } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Loader2, Sparkles, ShoppingBag, BarChart, FileJson, Code, Eye, ExternalLink, Star, Copy } from 'lucide-react';

const Section = ({ title, icon, children }) => {
  const Icon = icon;
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-cyan-400">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default function ProductOptimizer() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      let productList = await Product.list();
      
      // Create demo products if none exist
      if (productList.length === 0) {
        await Product.bulkCreate([
          {
            shopify_id: 'prod_001',
            name: 'Wireless Bluetooth Earbuds Pro',
            description: 'High-quality wireless earbuds with noise cancellation and long battery life.'
          },
          {
            shopify_id: 'prod_002', 
            name: 'Smart Fitness Watch',
            description: 'Track your health and fitness with this advanced smartwatch.'
          },
          {
            shopify_id: 'prod_003',
            name: 'Portable Phone Charger 10000mAh',
            description: 'Fast charging power bank for all your devices.'
          }
        ]);
        productList = await Product.list();
      }
      
      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProduct(productList[0].id);
        if (productList[0].optimization_results) {
          setResults(productList[0].optimization_results);
        }
      }
    }
    loadProducts();
  }, []);

  const handleRunOptimizer = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product to optimize.");
      return;
    }
    setIsLoading(true);
    setResults(null);
    toast.info("Engaging Super AI Optimizer Pro... This may take a moment.");

    try {
      const response = await runProductAnalysis({ productId: selectedProduct });
      if (response.data) {
        setResults(response.data);
        toast.success("Product optimization complete!");
      } else {
        throw new Error(response.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Optimizer failed:", error);
      toast.error(`Optimization failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const renderHtmlPreview = () => {
    if (!results) return null;
    const { rewritten_content, reviews } = results;
    return `
      <h1>${rewritten_content?.title}</h1>
      <div>${rewritten_content?.description}</div>
      <h3>Customer Reviews</h3>
      ${reviews?.map(r => `
        <div style="border: 1px solid #333; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
          <strong>${r.author}</strong> - ${'⭐'.repeat(r.rating)}
          <p>${r.body}</p>
          <small>Source: ${r.source}</small>
        </div>
      `).join('') || ''}
    `;
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Super AI Product Optimizer
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze competitors, rewrite content, and optimize products with AI-powered insights.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                <ShoppingBag className="w-4 h-4 inline-block mr-2" />
                Select a Product
              </label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRunOptimizer} 
              disabled={isLoading || !selectedProduct} 
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-lg py-6 mt-4 md:mt-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Run Optimizer
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{opacity:0}} 
              animate={{opacity:1}} 
              exit={{opacity:0}} 
              className="text-center py-16"
            >
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4"/>
              <p className="text-lg text-gray-300">Analyzing competitors, rewriting content, and optimizing SEO...</p>
              <p className="text-sm text-gray-500">This can take up to 60 seconds.</p>
            </motion.div>
          )}

          {results && (
            <motion.div 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              className="space-y-6"
            >
              
              <Section title="Competitor Analysis" icon={BarChart}>
                <div className="grid md:grid-cols-3 gap-4">
                  {results.competitors?.map((c, i) => (
                    <Card key={i} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-white truncate">{c.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-bold text-green-400">{c.price}</p>
                        <p className="text-xs text-gray-400 capitalize mb-2">{c.source}</p>
                        {c.url && (
                          <Button variant="link" className="p-0 h-auto text-cyan-400 text-xs">
                            View Listing <ExternalLink className="w-3 h-3 ml-1"/>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )) || <p className="text-gray-400">No competitor data available</p>}
                </div>
              </Section>

              <Section title="Optimized Customer Reviews" icon={Star}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.reviews?.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-white">{r.author}</p>
                        <p className="text-yellow-400">{'⭐'.repeat(r.rating)}</p>
                      </div>
                      <p className="text-sm text-gray-300">{r.body}</p>
                      <p className="text-xs text-gray-500 mt-2">Source: {r.source}</p>
                    </div>
                  )) || <p className="text-gray-400">No reviews generated</p>}
                </div>
              </Section>
              
              <Section title="Sentiment Analysis" icon={BarChart}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Pros</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {results.sentiment_map?.pros?.map((p, i) => <li key={i}>{p}</li>) || <li>No pros identified</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 mb-2">Cons</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      {results.sentiment_map?.cons?.map((c, i) => <li key={i}>{c}</li>) || <li>No cons identified</li>}
                    </ul>
                  </div>
                </div>
                {results.sentiment_map?.emoji_summary && (
                  <p className="text-center mt-4 text-lg">{results.sentiment_map.emoji_summary}</p>
                )}
              </Section>
              
              <Section title="A/B Test Versions" icon={Eye}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Version A (SEO-Focused)</h4>
                    <div className="p-3 bg-gray-800 rounded-lg space-y-2">
                      <p className="font-bold text-cyan-400">{results.ab_test?.version_a?.title || 'No title generated'}</p>
                      <p className="text-sm text-gray-300">
                        {results.ab_test?.version_a?.description?.replace(/<[^>]+>/g, '').substring(0, 150) || 'No description generated'}...
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Version B (Emotion-Focused)</h4>
                    <div className="p-3 bg-gray-800 rounded-lg space-y-2">
                      <p className="font-bold text-cyan-400">{results.ab_test?.version_b?.title || 'No title generated'}</p>
                      <p className="text-sm text-gray-300">
                        {results.ab_test?.version_b?.description?.replace(/<[^>]+>/g, '').substring(0, 150) || 'No description generated'}...
                      </p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="SEO Recommendations" icon={FileJson}>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-white mb-1">Meta Title</h4>
                      <p className="text-sm text-gray-300">{results.seo_recommendations?.meta_title || 'None generated'}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-white mb-1">Meta Description</h4>
                      <p className="text-sm text-gray-300">{results.seo_recommendations?.meta_description || 'None generated'}</p>
                    </div>
                  </div>
                  {results.seo_recommendations?.alt_tags && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold text-white mb-1">Image Alt Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.seo_recommendations.alt_tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-600 text-white text-xs rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              <Section title="Export Data" icon={Code}>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="preview">HTML Preview</TabsTrigger>
                    <TabsTrigger value="json">JSON Data</TabsTrigger>
                    <TabsTrigger value="schema">JSON-LD Schema</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="relative">
                      <div 
                        className="p-4 bg-gray-800 rounded-lg prose prose-sm prose-invert max-w-none max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: renderHtmlPreview() }}
                      />
                      <Button
                        onClick={() => copyToClipboard(renderHtmlPreview(), 'HTML preview')}
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="json" className="mt-4">
                    <div className="relative">
                      <pre className="p-4 bg-gray-800 rounded-lg text-xs text-gray-300 max-h-96 overflow-auto">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(results, null, 2), 'JSON data')}
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="schema" className="mt-4">
                    <div className="relative">
                      <pre className="p-4 bg-gray-800 rounded-lg text-xs text-gray-300 max-h-96 overflow-auto">
                        {JSON.stringify(results.json_ld_schema || {}, null, 2)}
                      </pre>
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(results.json_ld_schema, null, 2), 'JSON-LD schema')}
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Section>

            </motion.div>
          )}

          {!results && !isLoading && (
            <motion.div 
              initial={{opacity:0}} 
              animate={{opacity:1}} 
              className="text-center py-16"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Optimize</h3>
              <p className="text-gray-400">Select a product and click "Run Optimizer" to start the AI analysis.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}