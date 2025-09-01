import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '@/api/entities';
import { importReviews } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { DownloadCloud, CheckCircle, Star, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ReviewImporter() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [filters, setFilters] = useState({
    minRating: 0,
    withImagesOnly: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [importedReviews, setImportedReviews] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      const productList = await Product.list();
      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProduct(productList[0].id);
      }
    }
    loadProducts();
  }, []);

  const handleImport = async () => {
    if (!selectedProduct || !sourceUrl) {
      toast.error("Please select a product and enter a source URL.");
      return;
    }
    setIsLoading(true);
    setImportedReviews([]);
    toast.info("Starting review import process...");

    try {
      const response = await importReviews({ sourceUrl, productId: selectedProduct, filters });
      if (response.data?.success) {
        toast.success(`Successfully imported ${response.data.count} reviews!`);
        // Refresh reviews for the selected product
        const reviews = await ProductReview.filter({ product_id: selectedProduct }, '-created_date', 5);
        setImportedReviews(reviews);
      } else {
        throw new Error(response.data?.error || "Import failed.");
      }
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <DownloadCloud className="w-8 h-8 text-cyan-400" />
            Marketplace Review Importer
          </h1>
          <p className="text-gray-400 mt-2">
            Pull reviews from AliExpress, Amazon, and eBay directly to your Shopify products.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Import Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Marketplace Product URL</label>
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="e.g., https://www.amazon.com/dp/B08J5F3G18"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Map to Shopify Product</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="minRating"
                  checked={filters.minRating === 4}
                  onCheckedChange={(checked) => setFilters(f => ({...f, minRating: checked ? 4 : 0}))}
                />
                <label htmlFor="minRating" className="text-gray-300">Only import 4-5 star reviews</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="withImagesOnly"
                  checked={filters.withImagesOnly}
                  onCheckedChange={(checked) => setFilters(f => ({...f, withImagesOnly: checked}))}
                />
                <label htmlFor="withImagesOnly" className="text-gray-300">Only import reviews with images</label>
              </div>
            </div>

            <Button onClick={handleImport} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <DownloadCloud className="mr-2" />}
              Start Import
            </Button>
          </CardContent>
        </Card>

        {importedReviews.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader><CardTitle>Recently Imported Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {importedReviews.map(review => (
                <div key={review.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-white">{review.author}</p>
                    <p className="text-yellow-400 flex items-center gap-1">{review.rating} <Star className="w-4 h-4" /></p>
                  </div>
                  <p className="text-sm text-gray-300">{review.body}</p>
                  {review.image_urls?.length > 0 && (
                     <div className="flex gap-2 mt-2">
                       {review.image_urls.map((url, i) => <img key={i} src={url} alt="review" className="w-16 h-16 rounded-md object-cover"/>)}
                     </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}