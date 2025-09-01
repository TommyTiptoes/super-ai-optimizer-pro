import React, { useState, useEffect } from 'react';
import { Store, Product } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Mail, Zap, Loader2, Clipboard, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const campaignTypes = [
  { value: "welcome_series", label: "Welcome Series (3 Emails)" },
  { value: "abandoned_cart", label: "Abandoned Cart (2 Emails)" },
  { value: "post_purchase", label: "Post-Purchase Upsell (1 Email)" },
  { value: "win_back", label: "Win-Back Campaign (2 Emails)" }
];

export default function EmailCampaigns() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [form, setForm] = useState({
    campaignType: 'welcome_series',
    tone: 'friendly',
    productId: ''
  });
  const [expandedEmail, setExpandedEmail] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await User.me();
        const stores = await Store.filter({ created_by: user.email });
        if (stores.length > 0) setStore(stores[0]);
        const productList = await Product.list();
        setProducts(productList);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!store) {
      toast.error("Store information not loaded.");
      return;
    }

    setIsGenerating(true);
    setGeneratedCampaign(null);
    toast.info("AI is writing your email campaign...");

    const selectedProduct = products.find(p => p.id === form.productId);
    const productInfo = selectedProduct ? `for the product: ${selectedProduct.name} - ${selectedProduct.description}` : '';

    try {
      const result = await InvokeLLM({
        prompt: `
          Generate an email campaign for a Shopify store named "${store.store_name}".
          Campaign Type: ${campaignTypes.find(c => c.value === form.campaignType)?.label}.
          Brand Tone: ${form.tone}.
          ${productInfo}
          
          Provide a JSON response with an array of emails. Each email object should have a 'subject' and a 'body' (in HTML format).
          Keep the emails concise, engaging, and mobile-friendly. Use placeholders like {{customer_name}} and {{store_name}}.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            campaign_name: { type: "string" },
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" }
                }
              }
            }
          }
        }
      });
      setGeneratedCampaign(result);
      setExpandedEmail(0);
      toast.success("Email campaign generated successfully!");
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast.error("Failed to generate email campaign.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-pink-400" />
            AI Email Campaign Generator
          </h1>
          <p className="text-gray-400 mt-2">
            Create powerful, automated email series to engage customers and drive sales.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-pink-400">Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 mb-2 block">Campaign Type</label>
                  <Select value={form.campaignType} onValueChange={(v) => setForm(f => ({ ...f, campaignType: v }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-300 mb-2 block">Tone of Voice</label>
                  <Select value={form.tone} onValueChange={(v) => setForm(f => ({ ...f, tone: v }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="professional">Professional & Direct</SelectItem>
                      <SelectItem value="luxury">Luxury & Exclusive</SelectItem>
                      <SelectItem value="playful">Playful & Funny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-300 mb-2 block">Focus Product (Optional)</label>
                  <Select value={form.productId} onValueChange={(v) => setForm(f => ({ ...f, productId: v }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-pink-600 hover:bg-pink-700">
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                  Generate Campaign
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 min-h-[30rem]">
              <CardHeader>
                <CardTitle className="text-white">Generated Campaign</CardTitle>
                <p className="text-gray-400 text-sm">{generatedCampaign?.campaign_name}</p>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                  </div>
                )}
                {generatedCampaign ? (
                  <div className="space-y-3">
                    {generatedCampaign.emails.map((email, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg">
                        <button
                          className="w-full p-4 text-left flex justify-between items-center"
                          onClick={() => setExpandedEmail(expandedEmail === index ? null : index)}
                        >
                          <h4 className="font-semibold text-white">Email {index + 1}: {email.subject}</h4>
                          {expandedEmail === index ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                        </button>
                        {expandedEmail === index && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border-t border-gray-700">
                            <div className="flex justify-end gap-2 mb-4">
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(email.subject)}>
                                <Clipboard className="w-3 h-3 mr-2" /> Copy Subject
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(email.body)}>
                                <Clipboard className="w-3 h-3 mr-2" /> Copy Body
                              </Button>
                            </div>
                            <ScrollArea className="h-64">
                              <div
                                className="prose prose-sm prose-invert max-w-none bg-gray-800/50 p-4 rounded"
                                dangerouslySetInnerHTML={{ __html: email.body }}
                              />
                            </ScrollArea>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  !isGenerating && (
                    <div className="text-center py-16 text-gray-500">
                      <Mail className="w-16 h-16 mx-auto mb-4" />
                      <p>Your generated email campaign will appear here.</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}