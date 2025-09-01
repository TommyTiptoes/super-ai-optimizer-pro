
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Store, ScanResult, Issue } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { scanStore } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Scan, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  Zap,
  Eye,
  Code,
  RefreshCw,
  Wand // Added Wand icon for the setup wizard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const issueTypeIcons = {
  performance: Zap,
  seo: Search,
  accessibility: Eye,
  content: Code,
  bloat: RefreshCw
};

const impactColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

export default function Scanner() {
  const [store, setStore] = useState(null);
  const [currentScan, setCurrentScan] = useState(null);
  const [issues, setIssues] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); 
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(''); // New state variable for detailed error
  const [filters, setFilters] = useState({
    type: 'all',
    impact: 'all',
    status: 'all',
    search: ''
  });
  const [expandedIssue, setExpandedIssue] = useState(null);
  const initialScanTriggered = useRef(false);

  // Helper to construct internal page URLs
  const createPageUrl = (pageName) => {
    // This is a simple placeholder. In a real app, this might map pageName to a specific route.
    // For now, it assumes pageName is the direct path (e.g., "AppSetupWizard").
    return `/${pageName}`;
  };

  const testShopifyConnection = useCallback(async () => {
    if (!store) return;
    
    try {
      setConnectionStatus('checking');
      setConnectionErrorMessage(''); // Clear any previous error message
      const response = await fetch('/functions/shopifyIntegration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getShop',
          storeUrl: store.shop_domain
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('connected');
        setConnectionErrorMessage(''); // Clear error message on success
        console.log('✅ Shopify connection successful!', result.data);
        
        // Update store with actual Shopify data
        if (result.data.shop) {
          // Destructure result.data.shop to get name and theme
          const { name, theme } = result.data.shop;
          await Store.update(store.id, {
            store_name: name || store.store_name, // Use actual shop name if available
            theme_id: theme?.id || store.theme_id // Use actual theme ID if available
          });
        }
      } else {
        setConnectionStatus('error');
        console.error('❌ Shopify connection failed:', result.error);
        
        let errorMessage = 'Unable to connect to your Shopify store.';
        if (result.error && typeof result.error === 'string') {
          const lowerCaseError = result.error.toLowerCase();
          if (lowerCaseError.includes('unauthorized') || lowerCaseError.includes('invalid access token')) {
            errorMessage = 'Shopify API connection failed: The provided Access Token is unauthorized or invalid.';
          } else if (lowerCaseError.includes('not found')) {
            errorMessage = 'Shopify store not found or incorrect shop domain provided.';
          } else if (lowerCaseError.includes('permission') || lowerCaseError.includes('scope')) {
            errorMessage = 'Shopify API connection failed: Missing required permissions/scopes. Ensure read_themes, read_products, and read_shop are granted.';
          } else {
            errorMessage += ` Error details: ${result.error}`;
          }
        } else if (result.error) {
          errorMessage += ` Error details: ${JSON.stringify(result.error)}`;
        }
        setConnectionErrorMessage(errorMessage);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Connection test failed:', error);
      let errorMessage = 'An unexpected error occurred during the Shopify connection test.';
      if (error instanceof Error) {
        errorMessage += ` Error details: ${error.message}`;
        if (error.message.toLowerCase().includes('failed to fetch')) {
          errorMessage = 'Network error: Could not reach the server. Please check your internet connection and try again.';
        }
      } else {
        errorMessage += ` Error details: ${String(error)}`;
      }
      setConnectionErrorMessage(errorMessage);
    }
  }, [store]);

  const loadScannerData = useCallback(async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      
      if (stores.length > 0) {
        const storeData = stores[0];
        setStore(storeData);
        setConnectionStatus('checking'); // Set to checking when store data is loaded
        setConnectionErrorMessage(''); // Clear error message when loading new data
        
        // Load latest scan
        const scans = await ScanResult.filter({ store_id: storeData.id }, '-created_date', 1);
        if (scans.length > 0) {
          const latestScan = scans[0];
          setCurrentScan(latestScan);

          // Load issues for this scan
          const scanIssues = await Issue.filter({ scan_id: latestScan.id }, '-impact');
          setIssues(scanIssues);
        } else {
          // No scans found, clear current scan and issues
          setCurrentScan(null);
          setIssues([]);
        }
      } else {
        // No stores found, clear everything
        setStore(null);
        setCurrentScan(null);
        setIssues([]);
        setConnectionStatus('no-store'); // Indicate no store is connected
        setConnectionErrorMessage('');
      }
    } catch (error) {
      console.error('Error loading scanner data:', error);
      setConnectionStatus('error'); // Set to error if loading scanner data fails
      setConnectionErrorMessage('Failed to load scanner data. Please refresh the page.');
    }
  }, []);

  const runFullScan = useCallback(async () => {
    if (!store || isScanning) return;

    // Check connection first
    if (connectionStatus !== 'connected') {
      alert('Please wait for Shopify connection to be established before scanning.');
      return;
    }

    setIsScanning(true);
    console.log('🚀 Starting scan for store:', store.shop_domain);
    
    // Show optimistic loading state
    setCurrentScan({
      store_id: store.id,
      scan_type: 'full',
      status: 'running',
      issues_found: 0,
      critical_issues: 0,
      high_issues: 0,
      medium_issues: 0,
      low_issues: 0,
      pages_scanned: 0,
      started_at: new Date().toISOString()
    });
    setIssues([]);
    
    try {
      console.log('📊 Calling scanStore function with:', { storeId: store.id });
      const response = await scanStore({ storeId: store.id });
      console.log('📋 Scan response:', response);
      
      if (response.status === 200 && response.data) {
        if (response.data.success) {
          console.log('✅ Scan completed successfully, reloading data...');
          // Wait a moment for data to be fully saved
          setTimeout(() => {
            loadScannerData();
          }, 500);
        } else {
          throw new Error(response.data.error || 'Scan returned unsuccessful result');
        }
      } else {
        const errorText = response.data?.error || `HTTP ${response.status}`;
        throw new Error(errorText);
      }
      
    } catch (error) {
      console.error('❌ Scan error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Scan failed. ';
      if (error.message.includes('Unauthorized')) {
        errorMessage += 'Please refresh the page and try again.';
      } else if (error.message.includes('Store not found')) {
        errorMessage += 'Store configuration issue. Please check your setup.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage);
      
      // Reset to previous state
      await loadScannerData();
    } finally {
      setIsScanning(false);
    }
  }, [store, isScanning, connectionStatus, loadScannerData]);

  useEffect(() => {
    loadScannerData();
  }, [loadScannerData]);

  // Test connection when store changes and connectionStatus is 'checking'
  useEffect(() => {
    if (store && connectionStatus === 'checking') {
      const timer = setTimeout(() => testShopifyConnection(), 1000);
      return () => clearTimeout(timer);
    }
  }, [store, connectionStatus, testShopifyConnection]);

  useEffect(() => {
    // This effect runs when the component mounts and when the `store` object is loaded.
    // It checks for a URL parameter to automatically start a scan.
    if (store && !initialScanTriggered.current) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('start_scan') === 'true') {
        initialScanTriggered.current = true;
        runFullScan();
        // Clean the URL to prevent re-scanning on page refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [store, runFullScan]);

  const filteredIssues = issues.filter(issue => {
    if (filters.type !== 'all' && issue.type !== filters.type) return false;
    if (filters.impact !== 'all' && issue.impact !== filters.impact) return false;
    if (filters.status !== 'all' && issue.status !== filters.status) return false;
    if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase()) 
        && !issue.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Show setup prompt if no store is connected
  if (!store) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Scan className="w-24 h-24 mx-auto mb-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Store First</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Before we can scan your store for optimization opportunities, you need to connect your Shopify store.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = createPageUrl("AppSetupWizard")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                <Wand className="w-5 h-5 mr-2" />
                Start Setup Wizard
              </Button>
              <p className="text-sm text-gray-500">
                This will guide you through connecting your store in just a few steps.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Connection Status */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Scan className="w-8 h-8 text-purple-400" />
              Store Scanner
            </h1>
            <p className="text-gray-400 mt-2">
              Comprehensive analysis of your store's performance, SEO, and accessibility
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Store:</span>
              <span className="text-sm text-cyan-400 font-mono">{store.shop_domain}</span>
              {connectionStatus === 'connected' && (
                <Badge className="bg-green-600/50 text-white text-xs border-green-700 ml-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ✅ API Connected & Ready
                </Badge>
              )}
              {connectionStatus === 'error' && (
                <Badge className="bg-red-600/50 text-white text-xs border-red-700 ml-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  ❌ Connection Issue
                </Badge>
              )}
              {connectionStatus === 'checking' && (
                <Badge className="bg-yellow-600/50 text-white text-xs border-yellow-700 ml-2">
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  🔄 Testing Connection...
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {connectionStatus === 'error' && (
              <Button variant="outline" onClick={testShopifyConnection} className="border-gray-700 text-gray-300 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            )}
            <Button
              onClick={runFullScan}
              disabled={isScanning || !store || connectionStatus !== 'connected'}
              className={`text-white ${connectionStatus === 'connected' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'}`}
            >
              {isScanning ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  🔍 Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  🚀 Run Full Scan
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Connection Status Alert */}
        {connectionStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-400">🎉 Successfully Connected!</h3>
                    <p className="text-green-300 text-sm">
                      Your Shopify store is now connected and ready for optimization. Click "Run Full Scan" to analyze your store.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Connection Error Alert */}
        {connectionStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-400">Shopify API Connection Issue</h3>
                    <p className="text-red-300 text-sm mt-1">
                      {connectionErrorMessage || 'Unable to connect to your Shopify store. Please verify your SHOPIFY_ACCESS_TOKEN is correct and has the required permissions.'}
                    </p>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-red-300">Required permissions: <code className="font-mono text-xs bg-red-800/50 p-1 rounded">read_themes</code>, <code className="font-mono text-xs bg-red-800/50 p-1 rounded">read_products</code>, <code className="font-mono text-xs bg-red-800/50 p-1 rounded">read_shop</code></p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/30 text-red-300 hover:text-red-200"
                        onClick={testShopifyConnection}
                      >
                        🔄 Test Connection Again
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scan Status */}
        {currentScan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-800 glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Latest Scan Results
                  </CardTitle>
                  <Badge className={currentScan.status === 'completed' ? 
                    'bg-emerald-900/50 text-emerald-300 border-emerald-700' :
                    currentScan.status === 'failed' ?
                    'bg-red-900/50 text-red-300 border-red-700' :
                    'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                  }>
                    {currentScan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{currentScan.issues_found || 0}</p>
                    <p className="text-sm text-gray-400">Total Issues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{currentScan.critical_issues || 0}</p>
                    <p className="text-sm text-gray-400">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{currentScan.high_issues || 0}</p>
                    <p className="text-sm text-gray-400">High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{currentScan.medium_issues || 0}</p>
                    <p className="text-sm text-gray-400">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{currentScan.low_issues || 0}</p>
                    <p className="text-sm text-gray-400">Low</p>
                  </div>
                </div>
                {isScanning && (
                  <div className="mt-4">
                    <Progress value={Math.random() * 100} className="h-2" />
                    <p className="text-sm text-gray-400 mt-2">Connecting to backend and analyzing your store...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800 glass-effect">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Filter by:</span>
                </div>
                
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="bloat">Bloat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.impact} onValueChange={(value) => setFilters({...filters, impact: value})}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impact</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search issues..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-64 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Issues List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredIssues.map((issue, index) => {
              const IconComponent = issueTypeIcons[issue.type] || AlertTriangle;
              
              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 glass-effect hover:bg-gray-800/30 transition-all duration-200">
                    <CardHeader className="cursor-pointer" onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-${issue.type === 'performance' ? 'yellow' : issue.type === 'seo' ? 'emerald' : issue.type === 'accessibility' ? 'blue' : issue.type === 'content' ? 'purple' : 'red'}-500/20`}>
                            <IconComponent className={`w-5 h-5 text-${issue.type === 'performance' ? 'yellow' : issue.type === 'seo' ? 'emerald' : issue.type === 'accessibility' ? 'blue' : issue.type === 'content' ? 'purple' : 'red'}-400`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{issue.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{issue.description}</p>
                            <p className="text-gray-500 text-xs mt-2">Path: {issue.page_path}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${impactColors[issue.impact]} border`}>
                            {issue.impact}
                          </Badge>
                          {issue.auto_fixable && (
                            <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {expandedIssue === issue.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <CardContent className="border-t border-gray-700 pt-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-white mb-2">How to Fix</h4>
                                <p className="text-gray-300 text-sm">{issue.fix_instructions}</p>
                              </div>
                              
                              {issue.code_before && (
                                <div>
                                  <h4 className="font-medium text-white mb-2">Code Changes</h4>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-red-400 text-xs mb-1">Before:</p>
                                      <pre className="bg-gray-800 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                                        {issue.code_before}
                                      </pre>
                                    </div>
                                    <div>
                                      <p className="text-emerald-400 text-xs mb-1">After:</p>
                                      <pre className="bg-gray-800 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                                        {issue.code_after}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center pt-2">
                                <div className="text-sm text-gray-400">
                                  Estimated Impact: <span className="text-emerald-400">{issue.estimated_impact}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                                    Ignore
                                  </Button>
                                  {issue.auto_fixable && (
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                      <Zap className="w-4 h-4 mr-2" />
                                      Auto Fix
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredIssues.length === 0 && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Scan className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No Issues Found</h3>
            <p className="text-gray-400">
              {currentScan ? "Your store is optimized! Run a new scan to check for updates." : "Run your first scan to analyze your store."}
            </p>
          </motion.div>
        )}

        {filteredIssues.length === 0 && isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Clock className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
            <h3 className="text-xl font-semibold text-white mb-2">Scanning in progress...</h3>
            <p className="text-gray-400">
              Please wait while we analyze your store for potential issues.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
