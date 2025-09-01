import React, { useState, useEffect } from "react";
import { Store } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Eye, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users,
  Loader2,
  ExternalLink,
  Target,
  BarChart3,
  Lightbulb
} from "lucide-react";

export default function CompetitorSpy() {
  const [store, setStore] = useState(null);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        setStore(stores[0]);
      }
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };

  const analyzeCompetitor = async () => {
    if (!competitorUrl) {
      toast.error("Please enter a competitor URL");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing competitor store...");

    try {
      const analysis = await InvokeLLM({
        prompt: `
          Analyze the competitor store at ${competitorUrl} and provide comprehensive insights:
          - Pricing strategy analysis
          - Product offerings and categories
          - Website design and UX analysis
          - Marketing strategies observed
          - SEO and content strategy
          - Social media presence
          - Strengths and weaknesses
          - Opportunities for our store: ${store?.store_name}
          
          Focus on actionable competitive intelligence.
        `,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            store_name: { type: "string" },
            pricing_strategy: { type: "string" },
            product_categories: { type: "array", items: { type: "string" } },
            estimated_traffic: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            key_products: { type: "array", items: { type: "string" } },
            marketing_channels: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysisResults(analysis);
      toast.success("Competitor analysis completed!");
    } catch (error) {
      console.error('Competitor analysis error:', error);
      toast.error("Failed to analyze competitor. Please check the URL and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Eye className="w-8 h-8 text-red-400" />
            Competitor Intelligence
          </h1>
          <p className="text-gray-400 mt-2">
            Analyze competitor stores to discover opportunities and stay ahead.
          </p>
        </motion.div>

        {/* Competitor URL Input */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analyze Competitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter competitor store URL (e.g., competitor.myshopify.com)"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button 
                onClick={analyzeCompetitor}
                disabled={isAnalyzing || !competitorUrl}
                className="bg-red-600 hover:bg-red-700"
              >
                {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Target className="mr-2" />}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-red-400">{analysisResults.store_name}</div>
                  <div className="text-sm text-gray-400">Store Name</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-green-400">{analysisResults.pricing_strategy}</div>
                  <div className="text-sm text-gray-400">Pricing Strategy</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-blue-400">{analysisResults.estimated_traffic}</div>
                  <div className="text-sm text-gray-400">Est. Traffic</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {analysisResults.product_categories?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Categories</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResults.strengths?.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="w-1 h-1 bg-green-400 rounded-full mt-2"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResults.weaknesses?.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="w-1 h-1 bg-red-400 rounded-full mt-2"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400">Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.product_categories?.map((category, idx) => (
                      <Badge key={idx} className="bg-blue-600 text-white">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Channels */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-purple-400">Marketing Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.marketing_channels?.map((channel, idx) => (
                      <Badge key={idx} className="bg-purple-600 text-white">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunities */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Opportunities for Your Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisResults.opportunities?.map((opportunity, idx) => (
                    <div key={idx} className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-gray-300">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400">Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisResults.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-300">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Popular Competitors Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-400">Quick Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Analyze popular stores in your industry:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "gymshark.com",
                "allbirds.com", 
                "casper.com",
                "warbyparker.com"
              ].map((url) => (
                <Button 
                  key={url}
                  variant="outline"
                  size="sm"
                  onClick={() => setCompetitorUrl(url)}
                  className="border-gray-700 text-gray-300 hover:border-red-500 hover:text-red-400"
                >
                  {url}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}