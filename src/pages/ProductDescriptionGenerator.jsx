import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FileText, Wand, Loader2, Sparkles, Copy, Check, ShoppingBag, VenetianMask } from 'lucide-react';

const tones = ["Persuasive", "Luxury", "Playful", "Professional", "Minimalist", "Bold"];

const GeneratedField = ({ title, value, onCopy }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    onCopy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-white">{title}</h4>
      <div className="relative">
        <Textarea
          value={value}
          readOnly
          className="bg-gray-800 border-gray-700 text-gray-300 h-auto"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};


export default function ProductDescriptionGenerator() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tone, setTone] = useState(tones[0]);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      let productList = await Product.list();
      if (productList.length === 0) {
        // Create demo products if none exist
        await Product.bulkCreate([
          { shopify_id: 'prod_1', name: 'CyberGlow LED Desk Lamp', description: 'A basic LED lamp.'},
          { shopify_id: 'prod_2', name: 'Quantum-Core Gaming Mouse', description: 'A standard gaming mouse with RGB.'},
          { shopify_id: 'prod_3', name: 'Zenith Fitness Smartwatch', description: 'A watch that tracks steps.'}
        ]);
        productList = await Product.list();
      }
      setProducts(productList);
      setSelectedProduct(productList[0]?.id || null);
    };
    loadProducts();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setIsLoading(true);
    setGeneratedContent(null);
    toast.info(`Generating content for ${product.name} with a ${tone} tone...`);

    try {
      const result = await InvokeLLM({
        prompt: `
          Generate compelling marketing copy for a Shopify product.
          Product Name: ${product.name}
          Current Description: ${product.description}
          Desired Tone: ${tone}

          Provide the following:
          1. A new, catchy product title.
          2. A persuasive meta description (max 160 characters).
          3. A full, engaging product description using HTML for formatting (e.g., <h3>, <p>, <ul>, <li>).
        `,
        response_json_schema: {
          type: "object",
          properties: {
            new_title: { type: "string" },
            meta_description: { type: "string" },
            full_description: { type: "string", description: "HTML formatted description" }
          },
          required: ["new_title", "meta_description", "full_description"]
        }
      });
      setGeneratedContent(result);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Content generation failed:", error);
      toast.error("AI generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" />
            AI Product Description Generator
          </h1>
          <p className="text-gray-400 mt-2">
            Instantly create compelling product titles, meta descriptions, and full descriptions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <ShoppingBag className="w-5 h-5" />
                  Select Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedProduct || ''} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Choose a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <VenetianMask className="w-5 h-5" />
                  Select Tone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand className="w-5 h-5 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 min-h-[30rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <Sparkles className="w-5 h-5" />
                  Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedContent ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <GeneratedField title="New Product Title" value={generatedContent.new_title} onCopy={() => toast.success("Title copied!")} />
                    <GeneratedField title="Meta Description" value={generatedContent.meta_description} onCopy={() => toast.success("Meta description copied!")} />
                    <div>
                      <h4 className="font-semibold text-white mb-2">Full Description</h4>
                      <div className="relative">
                         <div
                            className="p-4 bg-gray-800 border border-gray-700 rounded-md text-gray-300 prose prose-sm prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: generatedContent.full_description }}
                          />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedContent.full_description);
                            toast.success("Full description copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button disabled className="w-full bg-purple-600 hover:bg-purple-700">Apply Directly to Shopify (Coming Soon)</Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full pt-16">
                    <FileText className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium">Your generated content will appear here.</h3>
                    <p className="text-sm">Select a product and tone, then click "Generate Content".</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}