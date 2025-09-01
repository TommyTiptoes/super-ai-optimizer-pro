
import React, { useState, useEffect, useCallback } from "react";
import { Template, Store } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Layers,
  Search,
  Star,
  Download,
  Eye,
  Filter,
  Sparkles,
  Crown,
  TrendingUp
} from "lucide-react";

export default function Templates() {
  const [store, setStore] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const createDemoTemplates = useCallback(async () => {
    const demoTemplates = [
      {
        name: "Tech Nexus Pro",
        category: "tech_gaming",
        description: "Modern tech store template with dark theme and futuristic design elements. Perfect for electronics and gaming stores.",
        preview_image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        is_premium: true,
        install_count: 1247,
        sections: [
          { name: "Hero Banner", type: "hero", settings: { layout: "full-width" } },
          { name: "Featured Products", type: "products", settings: { grid: "4-column" } },
          { name: "Tech Specs", type: "custom", settings: { style: "dark" } }
        ],
        color_scheme: { primary: "#00ff88", secondary: "#1a1a1a", accent: "#ff6b6b" }
      },
      {
        name: "Cinema Elite",
        category: "home_cinema",
        description: "Luxurious template for home cinema and entertainment systems with immersive dark design.",
        preview_image: "https://images.unsplash.com/photo-1489599511991-4de40f71fb4e?w=400",
        is_premium: true,
        install_count: 892,
        sections: [
          { name: "Cinematic Hero", type: "hero", settings: { video_bg: true } },
          { name: "Product Showcase", type: "products", settings: { style: "cinema" } }
        ],
        color_scheme: { primary: "#gold", secondary: "#000", accent: "#red" }
      },
      {
        name: "Store Classic",
        category: "general_store",
        description: "Clean and versatile template suitable for any type of store. Easy to customize and mobile-friendly.",
        preview_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
        is_premium: false,
        install_count: 3421,
        sections: [
          { name: "Header", type: "header", settings: { style: "classic" } },
          { name: "Product Grid", type: "products", settings: { columns: 3 } }
        ],
        color_scheme: { primary: "#007bff", secondary: "#f8f9fa", accent: "#28a745" }
      },
      {
        name: "Single Focus",
        category: "one_product",
        description: "Focused template designed for stores selling one main product with maximum conversion optimization.",
        preview_image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
        is_premium: false,
        install_count: 567,
        sections: [
          { name: "Product Hero", type: "hero", settings: { focus: "single" } },
          { name: "Features", type: "features", settings: { layout: "vertical" } }
        ],
        color_scheme: { primary: "#6c5ce7", secondary: "#fdcb6e", accent: "#e84393" }
      },
      {
        name: "Fashion Forward",
        category: "fashion",
        description: "Trendy fashion template with Instagram-style layouts and modern typography for clothing brands.",
        preview_image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
        is_premium: true,
        install_count: 2103,
        sections: [
          { name: "Fashion Hero", type: "hero", settings: { style: "magazine" } },
          { name: "Lookbook", type: "gallery", settings: { masonry: true } }
        ],
        color_scheme: { primary: "#ff6b9d", secondary: "#f1f2f6", accent: "#3742fa" }
      },
      {
        name: "Beauty Glow",
        category: "beauty",
        description: "Elegant beauty and cosmetics template with soft colors and clean product showcases.",
        preview_image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
        is_premium: false,
        install_count: 1876,
        sections: [
          { name: "Beauty Hero", type: "hero", settings: { overlay: "gradient" } },
          { name: "Product Cards", type: "products", settings: { style: "minimal" } }
        ],
        color_scheme: { primary: "#ff9ff3", secondary: "#f54ea2", accent: "#feca57" }
      }
    ];

    for (const template of demoTemplates) {
      await Template.create(template);
    }
  }, []); // createDemoTemplates has no external dependencies

  const loadData = useCallback(async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        setStore(stores[0]);
      }

      // Load templates
      const templateList = await Template.list();

      // If no templates exist, create some demo templates
      if (templateList.length === 0) {
        await createDemoTemplates();
        const newTemplateList = await Template.list();
        setTemplates(newTemplateList);
      } else {
        setTemplates(templateList);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [createDemoTemplates]); // loadData depends on createDemoTemplates

  const filterTemplates = useCallback(() => {
    let filtered = templates;

    if (categoryFilter !== "all") {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, categoryFilter]); // filterTemplates depends on these state variables

  useEffect(() => {
    loadData();
  }, [loadData]); // useEffect now depends on the memoized loadData function

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]); // useEffect now depends on the memoized filterTemplates function

  const installTemplate = async (template) => {
    if (!store) {
      toast.error("Please connect your store first");
      return;
    }

    toast.info(`Installing ${template.name}...`);

    // Simulate installation
    setTimeout(() => {
      toast.success(`${template.name} installed successfully!`);
      // Update install count
      // Note: This update is client-side only for simulation.
      // In a real app, you'd likely re-fetch templates or update state more robustly.
      Template.update(template.id, {
        install_count: template.install_count + 1
      });
      // To reflect the change in UI, you'd need to re-load templates or update the specific template in state
      setTemplates(prevTemplates =>
        prevTemplates.map(t =>
          t.id === template.id ? { ...t, install_count: t.install_count + 1 } : t
        )
      );
    }, 2000);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "tech_gaming", label: "Tech & Gaming" },
    { value: "home_cinema", label: "Home Cinema" },
    { value: "general_store", label: "General Store" },
    { value: "one_product", label: "Single Product" },
    { value: "fashion", label: "Fashion" },
    { value: "beauty", label: "Beauty" }
  ];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Layers className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-cyan-400" />
            Store Templates
          </h1>
          <p className="text-gray-400 mt-2">
            Professional templates to transform your store instantly.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden group">
                <div className="relative">
                  <img
                    src={template.preview_image}
                    alt={template.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {template.is_premium && (
                      <Badge className="bg-yellow-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white">{template.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <TrendingUp className="w-3 h-3" />
                      {template.install_count}
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit capitalize text-xs">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    {template.color_scheme && Object.values(template.color_scheme).slice(0, 3).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-gray-600"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>

                  <Button
                    onClick={() => installTemplate(template)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    disabled={!store}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Template
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No templates found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Custom Template Request */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-bold text-white mb-2">Need a Custom Template?</h3>
            <p className="text-gray-300 mb-4">
              Our AI can create a personalized template based on your specific requirements.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Request Custom Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
