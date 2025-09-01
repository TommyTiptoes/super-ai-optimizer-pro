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
import { Sparkles, Wand, Code, Eye, FileText, Bot, Loader2, Palette, ShoppingBag, Zap } from 'lucide-react';

const colorSchemes = [
  { 
    name: 'Ocean Breeze', 
    primary: 'from-blue-600 to-cyan-500', 
    secondary: 'from-slate-800 to-slate-900',
    accent: '#06b6d4',
    preview: 'bg-gradient-to-r from-blue-600 to-cyan-500'
  },
  { 
    name: 'Sunset Glow', 
    primary: 'from-orange-500 to-pink-500', 
    secondary: 'from-gray-900 to-black',
    accent: '#f97316',
    preview: 'bg-gradient-to-r from-orange-500 to-pink-500'
  },
  { 
    name: 'Forest Dreams', 
    primary: 'from-emerald-600 to-teal-500', 
    secondary: 'from-gray-800 to-gray-900',
    accent: '#10b981',
    preview: 'bg-gradient-to-r from-emerald-600 to-teal-500'
  },
  { 
    name: 'Purple Haze', 
    primary: 'from-purple-600 to-indigo-500', 
    secondary: 'from-slate-900 to-black',
    accent: '#8b5cf6',
    preview: 'bg-gradient-to-r from-purple-600 to-indigo-500'
  },
  { 
    name: 'Gold Rush', 
    primary: 'from-yellow-500 to-orange-500', 
    secondary: 'from-amber-900 to-orange-900',
    accent: '#f59e0b',
    preview: 'bg-gradient-to-r from-yellow-500 to-orange-500'
  },
  { 
    name: 'Rose Garden', 
    primary: 'from-pink-500 to-rose-500', 
    secondary: 'from-rose-900 to-pink-900',
    accent: '#f43f5e',
    preview: 'bg-gradient-to-r from-pink-500 to-rose-500'
  }
];

const storeTypes = [
  'Fashion & Apparel',
  'Electronics & Tech',
  'Home & Garden',
  'Beauty & Cosmetics', 
  'Sports & Fitness',
  'Jewelry & Accessories',
  'Books & Media',
  'Food & Beverages',
  'Art & Crafts',
  'Pet Supplies'
];

const designStyles = [
  'Modern Minimalist',
  'Bold & Vibrant', 
  'Elegant & Luxury',
  'Rustic & Natural',
  'Tech & Futuristic',
  'Vintage & Retro',
  'Clean & Professional',
  'Artistic & Creative'
];

const WizardStep = ({ number, title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 p-6 border border-gray-800 rounded-xl bg-gray-900/50"
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {number}
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <div>{children}</div>
    </motion.div>
);

export default function AIStorefrontCreator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        niche: '',
        storeType: '',
        vibe: '',
        designStyle: '',
        audience: '',
        products: '',
        features: [],
        colorScheme: colorSchemes[0],
        customColors: {
            primary: '#8b5cf6',
            secondary: '#1f2937',
            accent: '#06b6d4'
        }
    });
    const [generatedContent, setGeneratedContent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureToggle = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature) 
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleColorSchemeChange = (scheme) => {
        setFormData(prev => ({ ...prev, colorScheme: scheme }));
    };

    const handleGenerate = async () => {
        if (!formData.niche || !formData.vibe) {
            toast.error("Please fill out Niche and Brand Vibe.");
            return;
        }

        setIsGenerating(true);
        setGeneratedContent(null);
        toast.info("AI is building your storefront... this may take a moment.");

        const prompt = `
            You are an expert Shopify theme developer and branding specialist.
            Generate a complete storefront starter pack for a new Shopify store based on these details:
            
            STORE DETAILS:
            - Niche: ${formData.niche}
            - Store Type: ${formData.storeType}
            - Brand Vibe: ${formData.vibe}
            - Design Style: ${formData.designStyle}
            - Target Audience: ${formData.audience}
            - Key Products: ${formData.products}
            - Features Requested: ${formData.features.join(', ')}
            - Color Scheme: ${formData.colorScheme.name} (Primary: ${formData.colorScheme.primary}, Accent: ${formData.colorScheme.accent})

            Your output MUST be a JSON object with the following structure:
            {
              "homepage_sections": [
                { "name": "Hero Section", "liquid_code": "<modern liquid code with animations>", "schema_json": "{...comprehensive schema...}", "description": "Eye-catching banner with CTA" },
                { "name": "Featured Products", "liquid_code": "<product grid with hover effects>", "schema_json": "{...schema...}", "description": "Showcase bestsellers" },
                { "name": "About Story", "liquid_code": "<brand story section>", "schema_json": "{...schema...}", "description": "Connect with customers" },
                { "name": "Testimonials", "liquid_code": "<social proof carousel>", "schema_json": "{...schema...}", "description": "Customer reviews" },
                { "name": "Newsletter", "liquid_code": "<email signup with incentive>", "schema_json": "{...schema...}", "description": "Build email list" }
              ],
              "pages": [
                { "title": "About Us", "handle": "about-us", "body_html": "<compelling brand story HTML>", "meta_description": "Learn about our mission..." },
                { "title": "Shipping & Returns", "handle": "shipping-returns", "body_html": "<clear policy HTML>", "meta_description": "Our shipping and return policies..." },
                { "title": "Size Guide", "handle": "size-guide", "body_html": "<helpful sizing info>", "meta_description": "Find your perfect fit..." },
                { "title": "FAQ", "handle": "faq", "body_html": "<common questions answered>", "meta_description": "Frequently asked questions..." }
              ],
              "color_theme": {
                "primary_color": "${formData.colorScheme.accent}",
                "secondary_color": "#1f2937",
                "accent_color": "${formData.colorScheme.accent}",
                "text_color": "#111827",
                "background_color": "#ffffff"
              },
              "seo": { 
                "meta_title": "Professional SEO title under 60 chars", 
                "meta_description": "Compelling description under 160 chars",
                "keywords": ["relevant", "keywords", "for", "niche"]
              },
              "recommendations": [
                "Install apps for specific functionality",
                "Optimization suggestions",
                "Marketing strategies"
              ]
            }
            
            Make the liquid code modern, performant, and mobile-responsive. Include proper schema settings for customization.
            Focus on the specified design style and incorporate the color scheme throughout.
        `;

        try {
            const result = await InvokeLLM({
                prompt,
                response_json_schema: { 
                    type: "object", 
                    properties: {
                        homepage_sections: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    name: {type: "string"}, 
                                    liquid_code: {type: "string"}, 
                                    schema_json: {type: "string"},
                                    description: {type: "string"}
                                } 
                            } 
                        },
                        pages: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    title: {type: "string"}, 
                                    handle: {type: "string"}, 
                                    body_html: {type: "string"},
                                    meta_description: {type: "string"}
                                } 
                            } 
                        },
                        color_theme: {
                            type: "object",
                            properties: {
                                primary_color: {type: "string"},
                                secondary_color: {type: "string"},
                                accent_color: {type: "string"},
                                text_color: {type: "string"},
                                background_color: {type: "string"}
                            }
                        },
                        seo: { 
                            type: "object", 
                            properties: { 
                                meta_title: {type: "string"}, 
                                meta_description: {type: "string"},
                                keywords: {type: "array", items: {type: "string"}}
                            } 
                        },
                        recommendations: {
                            type: "array",
                            items: {type: "string"}
                        }
                    }
                }
            });
            setGeneratedContent(result);
            setStep(2);
            toast.success("Storefront generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate storefront. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const availableFeatures = [
        'Product Reviews',
        'Wishlist',
        'Live Chat',
        'Size Guide',
        'Quick View',
        'Product Zoom',
        'Related Products',
        'Recently Viewed',
        'Email Signup',
        'Social Media Feed'
    ];

    return (
        <div className="p-6 md:p-8 min-h-screen bg-gray-950">
            <div className="max-w-6xl mx-auto space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                        <Wand className="w-8 h-8 text-purple-400" />
                        AI Storefront Creator
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Create a professional, conversion-optimized storefront tailored to your business.
                    </p>
                </motion.div>

                {step === 1 && (
                    <WizardStep number={1} title="Build Your Perfect Store">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column - Store Details */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Store Niche *</label>
                                    <Input 
                                        name="niche" 
                                        value={formData.niche} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., Sustainable fashion for millennials" 
                                        className="bg-gray-800 border-gray-700 text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Store Type</label>
                                    <Select value={formData.storeType} onValueChange={(value) => setFormData(prev => ({...prev, storeType: value}))}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                            <SelectValue placeholder="Select store category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {storeTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Brand Vibe *</label>
                                    <Input 
                                        name="vibe" 
                                        value={formData.vibe} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., Premium, eco-friendly, trendy" 
                                        className="bg-gray-800 border-gray-700 text-white" 
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Design Style</label>
                                    <Select value={formData.designStyle} onValueChange={(value) => setFormData(prev => ({...prev, designStyle: value}))}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                            <SelectValue placeholder="Choose design aesthetic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designStyles.map(style => (
                                                <SelectItem key={style} value={style}>{style}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Target Audience</label>
                                    <Textarea 
                                        name="audience" 
                                        value={formData.audience} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., Tech-savvy professionals aged 25-40 who value quality and sustainability" 
                                        className="bg-gray-800 border-gray-700 text-white h-20" 
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block font-medium">Key Products</label>
                                    <Textarea 
                                        name="products" 
                                        value={formData.products} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., Organic cotton t-shirts, recycled denim jeans, bamboo accessories" 
                                        className="bg-gray-800 border-gray-700 text-white h-20" 
                                    />
                                </div>
                            </div>

                            {/* Right Column - Customization */}
                            <div className="space-y-6">
                                {/* Color Scheme Selection */}
                                <div>
                                    <label className="text-gray-300 mb-3 block font-medium flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Choose Color Scheme
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {colorSchemes.map((scheme) => (
                                            <button
                                                key={scheme.name}
                                                onClick={() => handleColorSchemeChange(scheme)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    formData.colorScheme.name === scheme.name 
                                                        ? 'border-purple-500 bg-purple-900/20' 
                                                        : 'border-gray-700 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className={`w-full h-12 rounded-md mb-2 ${scheme.preview}`}></div>
                                                <p className="text-white text-sm font-medium">{scheme.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Feature Selection */}
                                <div>
                                    <label className="text-gray-300 mb-3 block font-medium flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Store Features
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableFeatures.map((feature) => (
                                            <button
                                                key={feature}
                                                onClick={() => handleFeatureToggle(feature)}
                                                className={`p-2 text-xs rounded-md border transition-all text-left ${
                                                    formData.features.includes(feature)
                                                        ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                                                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                {feature}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {formData.features.map((feature) => (
                                            <Badge key={feature} className="bg-purple-600 text-white text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Section */}
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <h4 className="text-white font-medium mb-3">Preview Colors</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded ${formData.colorScheme.preview}`}></div>
                                            <span className="text-gray-300 text-sm">Primary Gradient</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded" style={{backgroundColor: formData.colorScheme.accent}}></div>
                                            <span className="text-gray-300 text-sm">Accent Color</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating} 
                            size="lg" 
                            className="w-full bg-purple-600 hover:bg-purple-700 mt-8"
                        >
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            Generate My Storefront
                        </Button>
                    </WizardStep>
                )}

                {step === 2 && generatedContent && (
                    <WizardStep number={2} title="Your Custom Storefront is Ready!">
                        <Tabs defaultValue="homepage" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                                <TabsTrigger value="homepage">Homepage</TabsTrigger>
                                <TabsTrigger value="pages">Pages</TabsTrigger>
                                <TabsTrigger value="colors">Colors</TabsTrigger>
                                <TabsTrigger value="seo">SEO</TabsTrigger>
                                <TabsTrigger value="actions">Deploy</TabsTrigger>
                            </TabsList>

                            <TabsContent value="homepage" className="mt-4">
                                <div className="space-y-4">
                                    {generatedContent.homepage_sections.map(section => (
                                        <Card key={section.name} className="bg-gray-900 border-gray-800">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-purple-400 flex items-center gap-2">
                                                        <Code className="w-4 h-4" /> 
                                                        {section.name}
                                                    </CardTitle>
                                                    <Badge className="bg-gray-700 text-gray-300">
                                                        {section.description}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h5 className="text-gray-400 text-xs mb-2">Liquid Template</h5>
                                                        <pre className="bg-gray-800/50 p-3 rounded-lg text-xs text-gray-300 max-h-48 overflow-auto">
                                                            {section.liquid_code}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-gray-400 text-xs mb-2">Section Schema</h5>
                                                        <pre className="bg-gray-800/50 p-3 rounded-lg text-xs text-gray-300 max-h-48 overflow-auto">
                                                            {section.schema_json}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="pages" className="mt-4">
                                <div className="space-y-4">
                                    {generatedContent.pages.map(page => (
                                        <Card key={page.handle} className="bg-gray-900 border-gray-800">
                                            <CardHeader>
                                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> 
                                                    {page.title}
                                                </CardTitle>
                                                <p className="text-gray-400 text-sm">{page.meta_description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose prose-invert prose-sm max-w-none bg-gray-800/50 p-4 rounded-lg max-h-64 overflow-auto" 
                                                     dangerouslySetInnerHTML={{ __html: page.body_html }} />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="colors" className="mt-4">
                                <Card className="bg-gray-900 border-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-purple-400 flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Custom Color Theme
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                {Object.entries(generatedContent.color_theme || {}).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-3">
                                                        <div 
                                                            className="w-8 h-8 rounded-md border border-gray-600" 
                                                            style={{ backgroundColor: value }}
                                                        ></div>
                                                        <div>
                                                            <p className="text-white font-medium capitalize">
                                                                {key.replace('_', ' ')}
                                                            </p>
                                                            <p className="text-gray-400 text-sm font-mono">{value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-3">Color Preview</h4>
                                                <div className="space-y-2">
                                                    <div className={`p-3 rounded ${formData.colorScheme.preview} text-white font-medium`}>
                                                        Primary Gradient Button
                                                    </div>
                                                    <div className="p-3 rounded bg-gray-800 text-white">
                                                        Secondary Background
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div 
                                                            className="w-12 h-12 rounded-full" 
                                                            style={{ backgroundColor: formData.colorScheme.accent }}
                                                        ></div>
                                                        <div className="flex-1 bg-white rounded p-2">
                                                            <p className="text-gray-800 text-sm">Sample text content</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="seo" className="mt-4">
                                <Card className="bg-gray-900 border-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-purple-400">SEO Optimization</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-gray-400 text-sm">Meta Title</label>
                                            <p className="p-3 bg-gray-800/50 rounded text-white">{generatedContent.seo.meta_title}</p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">Meta Description</label>
                                            <p className="p-3 bg-gray-800/50 rounded text-white">{generatedContent.seo.meta_description}</p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">Target Keywords</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {generatedContent.seo.keywords?.map(keyword => (
                                                    <Badge key={keyword} className="bg-purple-600 text-white">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {generatedContent.recommendations && (
                                            <div>
                                                <label className="text-gray-400 text-sm">Recommendations</label>
                                                <ul className="mt-2 space-y-1">
                                                    {generatedContent.recommendations.map((rec, idx) => (
                                                        <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="actions" className="mt-4 text-center">
                                <div className="p-8 space-y-6">
                                    <div className="max-w-md mx-auto">
                                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                                        <h3 className="text-2xl font-bold text-white mb-2">Ready to Launch!</h3>
                                        <p className="text-gray-300 mb-6">Your custom storefront is generated and ready to be applied to your store.</p>
                                        
                                        <div className="space-y-3">
                                            <Button size="lg" disabled className="bg-emerald-600 hover:bg-emerald-700 cursor-not-allowed w-full">
                                                Deploy to Store (Coming Soon)
                                            </Button>
                                            <Button variant="outline" size="lg" className="border-purple-500 text-purple-400 hover:bg-purple-900/20 w-full">
                                                Download Code Package
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => { setStep(1); setGeneratedContent(null); }} 
                                                className="border-gray-700 text-gray-300 w-full"
                                            >
                                                Create Another Store
                                            </Button>
                                        </div>
                                        
                                        <p className="text-xs text-gray-500 mt-4">
                                            Deployment will create a new, unpublished theme with all customizations applied.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </WizardStep>
                )}
            </div>
        </div>
    );
}