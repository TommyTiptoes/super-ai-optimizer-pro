import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Globe, Save, MapPin } from 'lucide-react';
import MultiSelect from "../components/ui/MultiSelect";

const ALL_COUNTRIES = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'KR', label: '🇰🇷 South Korea' },
  { value: 'CN', label: '🇨🇳 China' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'IT', label: '🇮🇹 Italy' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'SE', label: '🇸🇪 Sweden' },
  { value: 'NO', label: '🇳🇴 Norway' },
  { value: 'DK', label: '🇩🇰 Denmark' },
  { value: 'CH', label: '🇨🇭 Switzerland' },
  { value: 'BE', label: '🇧🇪 Belgium' },
  { value: 'AT', label: '🇦🇹 Austria' },
  { value: 'PL', label: '🇵🇱 Poland' },
  { value: 'RU', label: '🇷🇺 Russia' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'EG', label: '🇪🇬 Egypt' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'SA', label: '🇸🇦 Saudi Arabia' },
  { value: 'TR', label: '🇹🇷 Turkey' },
  { value: 'TH', label: '🇹🇭 Thailand' },
  { value: 'VN', label: '🇻🇳 Vietnam' },
  { value: 'MY', label: '🇲🇾 Malaysia' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'PH', label: '🇵🇭 Philippines' },
  { value: 'ID', label: '🇮🇩 Indonesia' },
  { value: 'NZ', label: '🇳🇿 New Zealand' },
];

export default function GeoTargeting() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [regionalContent, setRegionalContent] = useState({});

  useEffect(() => {
    async function loadProducts() {
      let productList = await Product.list();
      
      // Add sample international products if none exist
      if (productList.length === 0) {
        await Product.bulkCreate([
          {
            shopify_id: 'geo_001',
            name: 'US-Only Gaming Headset Pro',
            description: 'High-performance gaming headset with premium features - US market exclusive',
            region_availability: ['US'],
            regional_content: {
              US: { price: '$149.99', shipping_text: 'Free US shipping' }
            }
          },
          {
            shopify_id: 'geo_002', 
            name: 'European Luxury Watch Collection',
            description: 'Elegant timepieces crafted in Switzerland for the European market',
            region_availability: ['GB', 'DE', 'FR', 'IT', 'ES', 'CH'],
            regional_content: {
              GB: { price: '£299', shipping_text: 'Free UK delivery' },
              DE: { price: '€349', shipping_text: 'Kostenloser Versand' },
              FR: { price: '€349', shipping_text: 'Livraison gratuite' }
            }
          },
          {
            shopify_id: 'geo_003',
            name: 'Global Smartphone Accessories',
            description: 'Universal phone accessories available worldwide',
            region_availability: [],
            regional_content: {
              US: { price: '$29.99', shipping_text: 'Ships from California' },
              GB: { price: '£24.99', shipping_text: 'UK warehouse stock' },
              AU: { price: 'AU$39.99', shipping_text: 'Express Australia Post' },
              CA: { price: 'CA$34.99', shipping_text: 'Canada Post delivery' }
            }
          }
        ]);
        productList = await Product.list();
      }
      
      setProducts(productList);
      if (productList.length > 0) {
        handleProductSelect(productList[0]);
      }
    }
    loadProducts();
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setAvailability(product.region_availability || []);
    setRegionalContent(product.regional_content || {});
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    try {
      await Product.update(selectedProduct.id, {
        region_availability: availability,
        regional_content: regionalContent
      });
      toast.success(`${selectedProduct.name} geo-targeting rules saved!`);
      // Refresh local product list state
      setProducts(products.map(p => p.id === selectedProduct.id ? {...p, region_availability: availability, regional_content: regionalContent } : p));
    } catch (error) {
      toast.error(`Failed to save rules: ${error.message}`);
    }
  };

  const handleContentChange = (country, field, value) => {
    setRegionalContent(prev => ({
      ...prev,
      [country]: {
        ...(prev[country] || {}),
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            Global Geo-Targeting Engine
          </h1>
          <p className="text-gray-400 mt-2">
            Control product visibility and content based on customer location across 35+ countries.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
             <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Product Configuration
              </CardTitle>
               <Select onValueChange={(productId) => handleProductSelect(products.find(p => p.id === productId))}>
                <SelectTrigger className="w-[300px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
             </div>
          </CardHeader>
          {selectedProduct && (
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Region Availability</label>
                <p className="text-xs text-gray-500 mb-2">Select countries where this product is available. Leave empty for worldwide availability.</p>
                <MultiSelect
                  options={ALL_COUNTRIES}
                  selected={availability}
                  onChange={setAvailability}
                  className="w-full"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Regional Content Overrides
                </h3>
                <div className="space-y-4">
                  {(availability.length > 0 ? availability : ['US', 'GB', 'DE', 'AU']).map(countryCode => (
                    <div key={countryCode} className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <span className="text-xl">{ALL_COUNTRIES.find(c=>c.value === countryCode)?.label?.split(' ')[0]}</span>
                        {ALL_COUNTRIES.find(c=>c.value === countryCode)?.label?.split(' ').slice(1).join(' ') || countryCode}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input 
                          placeholder="Price override (e.g., £89.99, €99.99)"
                          value={regionalContent[countryCode]?.price || ''}
                          onChange={(e) => handleContentChange(countryCode, 'price', e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                         <Input 
                          placeholder="Shipping text (e.g., Free UK Delivery)"
                          value={regionalContent[countryCode]?.shipping_text || ''}
                          onChange={(e) => handleContentChange(countryCode, 'shipping_text', e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2" />
                Save Global Targeting Rules
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}