import React, { useState } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Sparkles, Layout, Code, Eye, Loader2, Palette, Target, Zap } from 'lucide-react';

const pageTypes = [
  'Product Launch',
  'Lead Generation', 
  'Event Registration',
  'Course Sales',
  'Newsletter Signup',
  'App Download',
  'Service Promotion',
  'Webinar Landing'
];

const conversionGoals = [
  'Email Signups',
  'Product Sales',
  'Demo Requests',
  'App Downloads',
  'Event Registrations',
  'Consultations',
  'Free Trials',
  'Course Enrollments'
];

export default function LandingPageBuilder() {
  const [formData, setFormData] = useState({
    pageType: '',
    headline: '',
    description: '',
    targetAudience: '',
    conversionGoal: '',
    keyBenefits: '',
    socialProof: '',
    urgency: ''
  });
  const [generatedPage, setGeneratedPage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateLandingPage = async () => {
    if (!formData.pageType || !formData.headline || !formData.conversionGoal) {
      toast.error("Please fill out Page Type, Headline, and Conversion Goal.");
      return;
    }

    setIsGenerating(true);
    setGeneratedPage(null);
    toast.info("AI is crafting your high-converting landing page...");

    try {
      const result = await InvokeLLM({
        prompt: `
          You are an expert conversion copywriter and landing page designer.
          Create a high-converting landing page with these specifications:
          
          Page Type: ${formData.pageType}
          Headline: ${formData.headline}
          Description: ${formData.description}
          Target Audience: ${formData.targetAudience}
          Conversion Goal: ${formData.conversionGoal}
          Key Benefits: ${formData.keyBenefits}
          Social Proof: ${formData.socialProof}
          Urgency Elements: ${formData.urgency}
          
          Generate a complete landing page including:
          - Compelling hero section with headline and subheadline
          - Benefits section with specific value propositions
          - Social proof section with testimonials/reviews
          - Clear call-to-action buttons
          - Trust signals and urgency elements
          - Complete HTML/CSS code for the page
          - Mobile-responsive design
          - Conversion optimization techniques
        `,
        response_json_schema: {
          type: "object",
          properties: {
            hero_section: {
              type: "object",
              properties: {
                headline: { type: "string" },
                subheadline: { type: "string" },
                cta_text: { type: "string" },
                hero_image_suggestion: { type: "string" }
              }
            },
            benefits_section: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  icon_suggestion: { type: "string" }
                }
              }
            },
            social_proof: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  quote: { type: "string" },
                  author: { type: "string" },
                  company: { type: "string" }
                }
              }
            },
            trust_signals: { type: "array", items: { type: "string" } },
            html_code: { type: "string" },
            css_code: { type: "string" },
            conversion_tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      setGeneratedPage(result);
      toast.success("Landing page generated successfully!");
    } catch (error) {
      console.error('Landing page generation failed:', error);
      toast.error("Failed to generate landing page. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Layout className="w-8 h-8 text-blue-400" />
            AI Landing Page Builder
          </h1>
          <p className="text-gray-400 mt-2">
            Create high-converting landing pages optimized for your specific conversion goals.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Page Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 mb-2 block">Page Type</label>
                  <Select value={formData.pageType} onValueChange={(value) => setFormData(prev => ({...prev, pageType: value}))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select page type" />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-300 mb-2 block">Main Headline</label>
                  <Input 
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="Your compelling headline..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 mb-2 block">Description</label>
                  <Textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What are you promoting?"
                    className="bg-gray-800 border-gray-700 text-white h-20"
                  />
                </div>

                <div>
                  <label className="text-gray-300 mb-2 block">Conversion Goal</label>
                  <Select value={formData.conversionGoal} onValueChange={(value) => setFormData(prev => ({...prev, conversionGoal: value}))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Primary conversion goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversionGoals.map(goal => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-300 mb-2 block">Target Audience</label>
                  <Textarea 
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Who is this page for?"
                    className="bg-gray-800 border-gray-700 text-white h-16"
                  />
                </div>

                <div>
                  <label className="text-gray-300 mb-2 block">Key Benefits</label>
                  <Textarea 
                    name="keyBenefits"
                    value={formData.keyBenefits}
                    onChange={handleInputChange}
                    placeholder="Main benefits or features to highlight..."
                    className="bg-gray-800 border-gray-700 text-white h-16"
                  />
                </div>

                <Button 
                  onClick={generateLandingPage}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                  Generate Landing Page
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 min-h-[40rem]">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Generated Landing Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPage ? (
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="code">HTML/CSS</TabsTrigger>
                      <TabsTrigger value="tips">Tips</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="mt-4">
                      <div className="bg-white rounded-lg p-6 text-black">
                        <div className="text-center mb-8">
                          <h1 className="text-4xl font-bold mb-4">{generatedPage.hero_section.headline}</h1>
                          <p className="text-xl text-gray-600 mb-6">{generatedPage.hero_section.subheadline}</p>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                            {generatedPage.hero_section.cta_text}
                          </Button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                          {generatedPage.benefits_section.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="text-center">
                              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                              <p className="text-gray-600">{benefit.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="sections" className="mt-4 space-y-4">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-green-400">Hero Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-white font-semibold">{generatedPage.hero_section.headline}</p>
                          <p className="text-gray-300">{generatedPage.hero_section.subheadline}</p>
                          <Badge className="bg-blue-600">{generatedPage.hero_section.cta_text}</Badge>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-purple-400">Benefits ({generatedPage.benefits_section.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {generatedPage.benefits_section.map((benefit, idx) => (
                              <div key={idx} className="p-3 bg-gray-700/50 rounded">
                                <h4 className="text-white font-medium">{benefit.title}</h4>
                                <p className="text-gray-300 text-sm">{benefit.description}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="code" className="mt-4 space-y-4">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            HTML Code
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-900 p-4 rounded text-xs text-gray-300 overflow-auto max-h-64">
                            {generatedPage.html_code}
                          </pre>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-cyan-400 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            CSS Code
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-900 p-4 rounded text-xs text-gray-300 overflow-auto max-h-64">
                            {generatedPage.css_code}
                          </pre>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="tips" className="mt-4">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-green-400 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Conversion Optimization Tips
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {generatedPage.conversion_tips?.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-gray-300">
                                <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full pt-16">
                    <Layout className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium">Your landing page will appear here</h3>
                    <p className="text-sm">Fill out the form and click "Generate Landing Page" to get started.</p>
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