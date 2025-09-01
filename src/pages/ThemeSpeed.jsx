import React, { useState, useEffect } from 'react';
import { Store, OptimizationJob } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Rocket, Zap, Gauge, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ThemeSpeed() {
  const [store, setStore] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [speedData, setSpeedData] = useState(null);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) setStore(stores[0]);
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };

  const runSpeedScan = async () => {
    if (!store) return;
    
    setIsScanning(true);
    toast.info("Running comprehensive speed analysis...");

    try {
      const result = await InvokeLLM({
        prompt: `
          Perform a comprehensive speed and performance analysis for a Shopify store: ${store.store_name}
          
          Analyze and provide:
          - Overall performance score (0-100)
          - Core Web Vitals analysis
          - Specific performance issues found
          - Optimization recommendations with impact levels
          - Before/after predictions
          - Implementation difficulty for each fix
        `,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            core_vitals: {
              type: "object",
              properties: {
                lcp: { type: "number" },
                fid: { type: "number" },
                cls: { type: "number" }
              }
            },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  difficulty: { type: "string" },
                  estimated_improvement: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            potential_score: { type: "number" }
          }
        }
      });

      setSpeedData(result);
      
      // Create optimization job record
      await OptimizationJob.create({
        store_id: store.id,
        job_type: "performance_analysis",
        title: "Theme Speed Analysis",
        status: "completed",
        progress: 100,
        items_total: 1,
        items_processed: 1,
        results: result
      });

      toast.success("Speed analysis completed!");
    } catch (error) {
      console.error('Speed analysis failed:', error);
      toast.error("Speed analysis failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getImpactColor = (impact) => {
    switch(impact?.toLowerCase()) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Rocket className="w-8 h-8 text-yellow-400" />
            Theme Speed & Performance Analyzer
          </h1>
          <p className="text-gray-400 mt-2">
            Deep performance analysis with actionable optimization recommendations.
          </p>
        </motion.div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-300">Store: {store?.store_name || 'Loading...'}</p>
            <p className="text-gray-400 text-sm">Domain: {store?.shop_domain}</p>
          </div>
          <Button 
            onClick={runSpeedScan}
            disabled={isScanning}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isScanning ? <Loader2 className="animate-spin mr-2" /> : <Gauge className="mr-2" />}
            Run Speed Scan
          </Button>
        </div>

        {speedData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Performance Score */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Performance Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className={`text-6xl font-bold mb-4 ${getScoreColor(speedData.overall_score)}`}>
                    {speedData.overall_score}
                  </div>
                  <Progress value={speedData.overall_score} className="mb-4" />
                  <p className="text-gray-400">
                    Potential after optimization: {speedData.potential_score}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-blue-400">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">LCP (Loading)</span>
                    <span className={getScoreColor(speedData.core_vitals.lcp * 20)}>
                      {speedData.core_vitals.lcp}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">FID (Interactivity)</span>
                    <span className={getScoreColor(100 - speedData.core_vitals.fid * 10)}>
                      {speedData.core_vitals.fid}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">CLS (Stability)</span>
                    <span className={getScoreColor(100 - speedData.core_vitals.cls * 100)}>
                      {speedData.core_vitals.cls}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues & Recommendations */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Performance Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {speedData.issues?.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{issue.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getImpactColor(issue.impact)}>
                            {issue.impact} impact
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {issue.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{issue.description}</p>
                      <p className="text-green-400 text-sm">
                        Improvement: {issue.estimated_improvement}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Recommendations */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {speedData.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
                <Button disabled className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  Apply Optimizations (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}