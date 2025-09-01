import React, { useState, useEffect } from "react";
import { Store, OptimizationJob } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { generateSeoContent } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Search, 
  Target, 
  TrendingUp, 
  FileText, 
  Lightbulb, 
  Zap,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function SEOTools() {
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [contentForm, setContentForm] = useState({
    contentType: "product",
    title: "",
    description: "",
    keywords: ""
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
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

  const runSEOAnalysis = async () => {
    if (!store) return;
    
    setIsAnalyzing(true);
    toast.info("Analyzing your store's SEO performance...");

    try {
      const analysis = await InvokeLLM({
        prompt: `
          Analyze the SEO performance for a Shopify store: ${store.store_name} (${store.shop_domain}).
          Provide a comprehensive SEO audit including:
          - Overall SEO score (0-100)
          - Critical issues found
          - Keyword opportunities
          - Technical SEO problems
          - Content optimization suggestions
          - Competitor analysis insights
          
          Focus on actionable recommendations.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            critical_issues: { type: "array", items: { type: "string" } },
            keyword_opportunities: { type: "array", items: { type: "string" } },
            technical_issues: { type: "array", items: { type: "string" } },
            content_suggestions: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysisResults(analysis);
      toast.success("SEO analysis completed!");
    } catch (error) {
      console.error('SEO analysis error:', error);
      toast.error("Failed to analyze SEO. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateContent = async () => {
    if (!contentForm.title && !contentForm.description) {
      toast.error("Please provide either a title or description to optimize.");
      return;
    }

    setIsGenerating(true);
    
    try {
      const optimizedContent = await InvokeLLM({
        prompt: `
          Generate SEO-optimized content for a ${contentForm.contentType}:
          Current Title: ${contentForm.title}
          Current Description: ${contentForm.description}
          Target Keywords: ${contentForm.keywords}
          
          Provide improved versions that are SEO-friendly, engaging, and conversion-focused.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_title: { type: "string" },
            meta_description: { type: "string" },
            h1_tag: { type: "string" },
            optimized_description: { type: "string" },
            suggested_alt_text: { type: "string" },
            schema_markup: { type: "string" }
          }
        }
      });

      // Create optimization job record
      await OptimizationJob.create({
        store_id: store.id,
        job_type: "seo_generation",
        title: `SEO Content Generated - ${contentForm.contentType}`,
        status: "completed",
        progress: 100,
        items_total: 1,
        items_processed: 1,
        results: optimizedContent
      });

      toast.success("SEO content generated successfully!");
      setContentForm({ contentType: "product", title: "", description: "", keywords: "" });
    } catch (error) {
      console.error('Content generation error:', error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Search className="w-8 h-8 text-green-400" />
            SEO Optimization Tools
          </h1>
          <p className="text-gray-400 mt-2">
            Boost your search rankings with AI-powered SEO analysis and content generation.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="analyzer">SEO Analyzer</TabsTrigger>
            <TabsTrigger value="content">Content Generator</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Research</TabsTrigger>
            <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  SEO Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Button 
                    onClick={runSEOAnalysis} 
                    disabled={isAnalyzing || !store}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                    Run SEO Analysis
                  </Button>

                  {analysisResults && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg">SEO Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-400 mb-2">
                              {analysisResults.overall_score}/100
                            </div>
                            <div className={`text-sm ${analysisResults.overall_score >= 70 ? 'text-green-400' : analysisResults.overall_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysisResults.overall_score >= 70 ? 'Good' : analysisResults.overall_score >= 50 ? 'Needs Work' : 'Poor'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            Critical Issues
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.critical_issues.map((issue, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="w-1 h-1 bg-red-400 rounded-full mt-2"></span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            Keyword Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keyword_opportunities.map((keyword, idx) => (
                              <Badge key={idx} className="bg-blue-600 text-white">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  AI Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 mb-2 block">Content Type</label>
                      <Select 
                        value={contentForm.contentType} 
                        onValueChange={(value) => setContentForm(prev => ({...prev, contentType: value}))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="collection">Collection</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="blog_post">Blog Post</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-300 mb-2 block">Current Title</label>
                      <Input 
                        value={contentForm.title}
                        onChange={(e) => setContentForm(prev => ({...prev, title: e.target.value}))}
                        placeholder="Enter current title to optimize"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 mb-2 block">Current Description</label>
                      <Textarea 
                        value={contentForm.description}
                        onChange={(e) => setContentForm(prev => ({...prev, description: e.target.value}))}
                        placeholder="Enter current description to optimize"
                        className="bg-gray-800 border-gray-700 text-white h-24"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 mb-2 block">Target Keywords</label>
                      <Input 
                        value={contentForm.keywords}
                        onChange={(e) => setContentForm(prev => ({...prev, keywords: e.target.value}))}
                        placeholder="keyword1, keyword2, keyword3"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <Button 
                      onClick={generateContent}
                      disabled={isGenerating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                      Generate SEO Content
                    </Button>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">What You'll Get:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        SEO-optimized title (under 60 chars)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Meta description (under 160 chars)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        H1 tag recommendation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Enhanced product description
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Image alt text suggestions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Schema markup code
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400">Keyword Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Keyword Research Tool</h3>
                  <p>Advanced keyword analysis and competitor research coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400">Technical SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Technical SEO Audit</h3>
                  <p>Site speed, crawlability, and technical optimization tools coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}