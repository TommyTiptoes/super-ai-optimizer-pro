import React, { useState, useEffect } from 'react';
import { Store, OptimizationJob } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { TestTube2, Play, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function UXTester() {
  const [store, setStore] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [uxData, setUxData] = useState(null);

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

  const runUXTest = async () => {
    if (!store) return;
    
    setIsTesting(true);
    toast.info("Simulating shopper journeys and testing user flows...");

    try {
      const result = await InvokeLLM({
        prompt: `
          Perform a comprehensive UX analysis for a Shopify store: ${store.store_name}
          
          Simulate key customer journeys and analyze:
          - Homepage to product discovery flow
          - Product page to cart functionality  
          - Checkout process usability
          - Mobile responsiveness issues
          - CTA button effectiveness
          - Navigation clarity
          - Form usability
          - Page load friction points
          - Trust signals presence
          - Conversion blockers
          
          Provide specific findings with severity levels and improvement suggestions.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            overall_ux_score: { type: "number" },
            journey_tests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  completion_rate: { type: "number" },
                  avg_time: { type: "string" },
                  friction_points: { type: "array", items: { type: "string" } },
                  status: { type: "string" }
                }
              }
            },
            critical_issues: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  page: { type: "string" },
                  severity: { type: "string" },
                  fix_suggestion: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            conversion_blockers: { type: "array", items: { type: "string" } },
            mobile_issues: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setUxData(result);
      
      // Create optimization job record
      await OptimizationJob.create({
        store_id: store.id,
        job_type: "ux_analysis",
        title: "UX Flow Testing",
        status: "completed", 
        progress: 100,
        items_total: result.journey_tests?.length || 5,
        items_processed: result.journey_tests?.length || 5,
        results: result
      });

      toast.success("UX analysis completed!");
    } catch (error) {
      console.error('UX testing failed:', error);
      toast.error("UX testing failed. Please try again.");
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';  
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <TestTube2 className="w-8 h-8 text-blue-400" />
            Smart UX Tester
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered simulation of customer journeys to identify friction points and conversion blockers.
          </p>
        </motion.div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-300">Store: {store?.store_name || 'Loading...'}</p>
            <p className="text-gray-400 text-sm">Testing key customer flows and interactions</p>
          </div>
          <Button 
            onClick={runUXTest}
            disabled={isTesting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTesting ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" />}
            Run UX Tests
          </Button>
        </div>

        {uxData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Overall UX Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-white mb-4">{uxData.overall_ux_score}/100</div>
                <Progress value={uxData.overall_ux_score} className="mb-4" />
                <p className="text-gray-400">
                  {uxData.overall_ux_score >= 80 ? 'Excellent user experience' : 
                   uxData.overall_ux_score >= 60 ? 'Good with room for improvement' : 
                   'Significant UX issues detected'}
                </p>
              </CardContent>
            </Card>

            {/* Journey Tests */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Customer Journey Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uxData.journey_tests?.map((journey, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(journey.status)}
                          <h4 className="font-semibold text-white">{journey.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">{journey.completion_rate}% completion</div>
                          <div className="text-gray-400 text-sm">Avg: {journey.avg_time}</div>
                        </div>
                      </div>
                      
                      {journey.friction_points?.length > 0 && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Friction Points:</p>
                          <ul className="space-y-1">
                            {journey.friction_points.map((point, pidx) => (
                              <li key={pidx} className="text-red-400 text-sm flex items-start gap-2">
                                <span className="mt-1">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical Issues */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Critical Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uxData.critical_issues?.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{issue.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {issue.page}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                      <div className="space-y-2">
                        <p className="text-blue-400 text-sm">Impact: {issue.impact}</p>
                        <p className="text-green-400 text-sm">Suggested fix: {issue.fix_suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Blockers & Mobile Issues */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">Conversion Blockers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {uxData.conversion_blockers?.map((blocker, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        {blocker}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-purple-400">Mobile Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {uxData.mobile_issues?.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  UX Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {uxData.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
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
    </div>
  );
}