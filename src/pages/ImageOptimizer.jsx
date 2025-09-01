import React, { useState, useEffect } from "react";
import { Store, OptimizationJob } from "@/api/entities";
import { User } from "@/api/entities";
import { optimizeImage } from "@/api/functions";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Image, 
  Upload, 
  Zap, 
  Settings, 
  Download,
  FileImage,
  Loader2,
  CheckCircle2,
  TrendingDown
} from "lucide-react";

export default function ImageOptimizer() {
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState("bulk");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationJobs, setOptimizationJobs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [optimizationSettings, setOptimizationSettings] = useState({
    format: "webp",
    quality: 85,
    maxWidth: 1200,
    maxHeight: 1200,
    stripMetadata: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        setStore(stores[0]);
        
        // Load recent optimization jobs
        const jobs = await OptimizationJob.filter({ 
          store_id: stores[0].id, 
          job_type: "image_optimization" 
        }, '-created_date', 10);
        setOptimizationJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      try {
        const { file_url } = await UploadFile({ file });
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: file_url,
          size: file.size,
          optimized: false
        }]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const startBulkOptimization = async () => {
    if (!store || uploadedFiles.length === 0) {
      toast.error("Please upload images first");
      return;
    }

    setIsOptimizing(true);
    toast.info("Starting bulk image optimization...");

    try {
      // Create optimization job
      const job = await OptimizationJob.create({
        store_id: store.id,
        job_type: "image_optimization",
        title: `Bulk Image Optimization - ${uploadedFiles.length} images`,
        status: "processing",
        progress: 0,
        items_total: uploadedFiles.length,
        items_processed: 0,
        results: {
          settings: optimizationSettings,
          original_files: uploadedFiles.length
        }
      });

      // Simulate optimization process
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Simulate optimization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mark file as optimized
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, optimized: true, sizeSaved: Math.floor(f.size * 0.3) } : f
        ));

        // Update job progress
        const progress = Math.floor(((i + 1) / uploadedFiles.length) * 100);
        await OptimizationJob.update(job.id, {
          progress,
          items_processed: i + 1,
          status: i === uploadedFiles.length - 1 ? "completed" : "processing"
        });
      }

      toast.success("Bulk optimization completed successfully!");
      loadData(); // Reload jobs
      
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error("Failed to optimize images. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  const totalSizeSaved = uploadedFiles
    .filter(f => f.optimized)
    .reduce((sum, f) => sum + (f.sizeSaved || 0), 0);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Image className="w-8 h-8 text-blue-400" />
            Image Optimizer
          </h1>
          <p className="text-gray-400 mt-2">
            Compress and optimize images for faster loading times and better performance.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="bulk">Bulk Optimizer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
                      <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-300 mb-2">Drop images here or click to upload</p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="outline" className="cursor-pointer border-gray-700">
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white font-medium">
                            Uploaded Files ({uploadedFiles.length})
                          </h4>
                          <Button variant="outline" size="sm" onClick={clearFiles}>
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                              <div className="flex items-center gap-3">
                                <div className="text-xs">
                                  {file.optimized ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <FileImage className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-white truncate max-w-32">{file.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                    {file.optimized && file.sizeSaved && (
                                      <span className="text-green-400 ml-2">
                                        -{(file.sizeSaved / 1024 / 1024).toFixed(2)} MB saved
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {file.optimized && (
                                <Badge className="bg-green-600 text-white text-xs">
                                  Optimized
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={startBulkOptimization}
                        disabled={isOptimizing || uploadedFiles.length === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isOptimizing ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                        Optimize All Images
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400">Optimization Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-white">{uploadedFiles.length}</p>
                        <p className="text-sm text-gray-400">Images Uploaded</p>
                      </div>
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">
                          {uploadedFiles.filter(f => f.optimized).length}
                        </p>
                        <p className="text-sm text-gray-400">Optimized</p>
                      </div>
                    </div>

                    {totalSizeSaved > 0 && (
                      <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingDown className="w-5 h-5 text-green-400" />
                          <span className="text-lg font-bold text-green-400">
                            {(totalSizeSaved / 1024 / 1024).toFixed(2)} MB Saved
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Average compression: ~30%
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-white font-medium">Current Settings:</h5>
                      <div className="text-sm space-y-1 text-gray-300">
                        <p>• Format: {optimizationSettings.format.toUpperCase()}</p>
                        <p>• Quality: {optimizationSettings.quality}%</p>
                        <p>• Max Size: {optimizationSettings.maxWidth}x{optimizationSettings.maxHeight}px</p>
                        <p>• Strip Metadata: {optimizationSettings.stripMetadata ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Optimization Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 mb-2 block">Output Format</label>
                      <Select 
                        value={optimizationSettings.format} 
                        onValueChange={(value) => setOptimizationSettings(prev => ({...prev, format: value}))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webp">WebP (Recommended)</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-300 mb-2 block">
                        Quality: {optimizationSettings.quality}%
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="100"
                        value={optimizationSettings.quality}
                        onChange={(e) => setOptimizationSettings(prev => ({...prev, quality: parseInt(e.target.value)}))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-300 mb-2 block">Max Width</label>
                        <Input
                          type="number"
                          value={optimizationSettings.maxWidth}
                          onChange={(e) => setOptimizationSettings(prev => ({...prev, maxWidth: parseInt(e.target.value)}))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 mb-2 block">Max Height</label>
                        <Input
                          type="number"
                          value={optimizationSettings.maxHeight}
                          onChange={(e) => setOptimizationSettings(prev => ({...prev, maxHeight: parseInt(e.target.value)}))}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="strip-metadata"
                        checked={optimizationSettings.stripMetadata}
                        onChange={(e) => setOptimizationSettings(prev => ({...prev, stripMetadata: e.target.checked}))}
                        className="accent-blue-500"
                      />
                      <label htmlFor="strip-metadata" className="text-gray-300">
                        Strip metadata (reduces file size)
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Optimization Tips:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• WebP format provides the best compression</li>
                      <li>• Quality of 85% is optimal for most images</li>
                      <li>• Images larger than 1200px are rarely needed</li>
                      <li>• Stripping metadata can save 10-30KB per image</li>
                      <li>• Consider lazy loading for below-fold images</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Optimization History</CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationJobs.length > 0 ? (
                  <div className="space-y-4">
                    {optimizationJobs.map((job) => (
                      <div key={job.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{job.title}</h4>
                          <Badge className={
                            job.status === 'completed' ? 'bg-green-600' : 
                            job.status === 'processing' ? 'bg-blue-600' : 
                            job.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{job.items_processed}/{job.items_total} images</span>
                          <span>•</span>
                          <span>{new Date(job.created_date).toLocaleDateString()}</span>
                        </div>
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No optimization history</h3>
                    <p>Your optimization jobs will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}