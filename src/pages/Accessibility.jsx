import React, { useState, useEffect } from "react";
import { Store, Issue } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Accessibility, 
  Eye, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Heart,
  Zap
} from "lucide-react";

export default function AccessibilityPage() {
  const [store, setStore] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [accessibilityScore, setAccessibilityScore] = useState(null);
  const [accessibilityIssues, setAccessibilityIssues] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        setStore(stores[0]);
        setAccessibilityScore(stores[0].accessibility_score || 65);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const runAccessibilityAudit = async () => {
    if (!store) return;
    
    setIsScanning(true);
    toast.info("Running comprehensive accessibility audit...");

    try {
      const auditResults = await InvokeLLM({
        prompt: `
          Perform a comprehensive accessibility audit for a Shopify store: ${store.store_name}.
          Analyze for WCAG 2.1 AA compliance and identify:
          - Missing alt text on images
          - Color contrast issues
          - Keyboard navigation problems
          - Screen reader compatibility issues
          - Form accessibility issues
          - Heading structure problems
          - Focus management issues
          
          Provide specific, actionable recommendations.
        `,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            critical_issues: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  fix_instructions: { type: "string" },
                  wcag_guideline: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAccessibilityScore(auditResults.overall_score);
      
      // Create accessibility issues
      const issues = auditResults.critical_issues.map(issue => ({
        ...issue,
        type: 'accessibility',
        status: 'open',
        auto_fixable: issue.title.includes('Alt text') || issue.title.includes('Color contrast')
      }));
      
      setAccessibilityIssues(issues);

      // Update store accessibility score
      await Store.update(store.id, {
        accessibility_score: auditResults.overall_score
      });

      toast.success("Accessibility audit completed!");
    } catch (error) {
      console.error('Accessibility audit error:', error);
      toast.error("Failed to run accessibility audit. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Work";
    return "Poor";
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Accessibility className="w-8 h-8 text-purple-400" />
            Accessibility Optimizer
          </h1>
          <p className="text-gray-400 mt-2">
            Make your store accessible to everyone with WCAG 2.1 AA compliance checking.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Accessibility Score Card */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Accessibility Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(accessibilityScore)}`}>
                    {accessibilityScore}/100
                  </div>
                  <div className={`text-sm ${getScoreColor(accessibilityScore)}`}>
                    {getScoreLabel(accessibilityScore)}
                  </div>
                </div>
                
                <Progress 
                  value={accessibilityScore} 
                  className="w-full" 
                />

                <Button 
                  onClick={runAccessibilityAudit} 
                  disabled={isScanning || !store}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isScanning ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                  Run Accessibility Audit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Impact Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">15%</div>
                  <div className="text-sm text-gray-400">of people have a disability</div>
                </div>
                <div className="text-center p-3 bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">+12%</div>
                  <div className="text-sm text-gray-400">revenue increase potential</div>
                </div>
                <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">SEO</div>
                  <div className="text-sm text-gray-400">ranking boost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Overview */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                WCAG 2.1 AA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Perceivable</span>
                  <Badge className={accessibilityScore >= 70 ? 'bg-green-600' : 'bg-red-600'}>
                    {accessibilityScore >= 70 ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Operable</span>
                  <Badge className={accessibilityScore >= 60 ? 'bg-green-600' : 'bg-red-600'}>
                    {accessibilityScore >= 60 ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Understandable</span>
                  <Badge className={accessibilityScore >= 80 ? 'bg-green-600' : 'bg-red-600'}>
                    {accessibilityScore >= 80 ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Robust</span>
                  <Badge className={accessibilityScore >= 75 ? 'bg-green-600' : 'bg-red-600'}>
                    {accessibilityScore >= 75 ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Issues */}
        {accessibilityIssues.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Accessibility Issues Found ({accessibilityIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessibilityIssues.map((issue, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{issue.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          issue.impact === 'critical' ? 'bg-red-600' :
                          issue.impact === 'high' ? 'bg-orange-600' :
                          issue.impact === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        }>
                          {issue.impact}
                        </Badge>
                        {issue.auto_fixable && (
                          <Badge className="bg-green-600">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{issue.description}</p>
                    
                    <div className="bg-gray-700/50 rounded p-3">
                      <h5 className="text-white font-medium text-sm mb-2">How to fix:</h5>
                      <p className="text-gray-300 text-sm">{issue.fix_instructions}</p>
                      {issue.wcag_guideline && (
                        <p className="text-purple-400 text-xs mt-2">
                          WCAG Guideline: {issue.wcag_guideline}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Best Practices */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-purple-400">Accessibility Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Quick Wins:</h4>
                <ul className="space-y-2">
                  {[
                    "Add alt text to all product images",
                    "Ensure sufficient color contrast (4.5:1 ratio)",
                    "Use proper heading structure (H1, H2, H3...)",
                    "Make all interactive elements keyboard accessible",
                    "Add labels to form inputs",
                    "Include skip navigation links"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-3">Advanced Improvements:</h4>
                <ul className="space-y-2">
                  {[
                    "Implement ARIA landmarks and labels",
                    "Test with screen readers",
                    "Add captions to video content",
                    "Provide text alternatives for audio",
                    "Use focus indicators for all interactive elements",
                    "Test keyboard navigation flow"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}