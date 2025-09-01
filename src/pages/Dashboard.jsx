
import React, { useState, useEffect } from "react";
import { Store, ScanResult, OptimizationJob } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Scan, 
  Search, 
  Image, 
  Accessibility, 
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load or create store record
      const stores = await Store.filter({ created_by: currentUser.email });
      let storeData;
      
      if (stores.length === 0) {
        // Create demo store for new users
        storeData = await Store.create({
          shop_domain: "demo-store.myshopify.com",
          store_name: "Demo Store",
          theme_id: "12345",
          health_score: 72,
          speed_score: 68,
          seo_score: 83,
          accessibility_score: 65,
          content_score: 79,
          bloat_score: 71,
          last_scan_date: new Date().toISOString(),
          plan: "pro",
          settings: {
            auto_scan: true,
            notifications: true
          }
        });
      } else {
        storeData = stores[0];
      }
      
      setStore(storeData);

      // Load recent scan results
      const scans = await ScanResult.filter({ store_id: storeData.id }, '-created_date', 5);
      setRecentScans(scans);

      // Load recent optimization jobs
      const jobs = await OptimizationJob.filter({ store_id: storeData.id }, '-created_date', 10);
      setRecentJobs(jobs);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    if (!store) return;

    switch (action) {
      case 'scan':
        // Create new scan job
        await ScanResult.create({
          store_id: store.id,
          scan_type: 'full',
          status: 'pending',
          issues_found: 0,
          critical_issues: 0,
          high_issues: 0,
          medium_issues: 0,
          low_issues: 0,
          pages_scanned: 0,
          started_at: new Date().toISOString()
        });
        
        // Simulate scan completion after delay
        setTimeout(async () => {
          const updatedScans = await ScanResult.filter({ store_id: store.id }, '-created_date', 5);
          setRecentScans(updatedScans);
        }, 2000);
        break;

      case 'images':
        await OptimizationJob.create({
          store_id: store.id,
          job_type: 'image_optimization',
          title: 'Bulk Image Optimization',
          status: 'queued',
          progress: 0,
          items_total: 25,
          items_processed: 0,
          started_at: new Date().toISOString()
        });
        loadDashboardData();
        break;

      case 'autofix':
        await OptimizationJob.create({
          store_id: store.id,
          job_type: 'performance_fix',
          title: 'Auto-Fix Performance Issues',
          status: 'queued',
          progress: 0,
          items_total: 12,
          items_processed: 0,
          started_at: new Date().toISOString()
        });
        loadDashboardData();
        break;

      case 'templates':
        await OptimizationJob.create({
          store_id: store.id,
          job_type: 'template_generation',
          title: 'Generate Homepage Template',
          status: 'queued',
          progress: 0,
          items_total: 1,
          items_processed: 0,
          started_at: new Date().toISOString()
        });
        loadDashboardData();
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-800 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-800 rounded-lg"></div>
              <div className="h-64 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentActivity = recentJobs.map(job => ({
    id: job.id,
    title: job.title,
    description: `${job.job_type.replace(/_/g, ' ')} - ${job.progress}% complete`,
    status: job.status,
    created_date: job.created_date,
    results: job.results
  }));

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Store Optimization Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {user?.full_name}! Here's your store performance overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Scan
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                window.location.href = createPageUrl('Scanner?start_scan=true');
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Run Full Analysis
            </Button>
          </div>
        </motion.div>

        {/* Health Scores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <HealthScoreCard
            title="Overall Health"
            score={store?.health_score || 0}
            previousScore={store?.health_score ? store.health_score - 5 : null}
            icon={Activity}
            color="purple"
          />
          <HealthScoreCard
            title="Performance"
            score={store?.speed_score || 0}
            previousScore={store?.speed_score ? store.speed_score - 3 : null}
            icon={Zap}
            color="yellow"
          />
          <HealthScoreCard
            title="SEO Score"
            score={store?.seo_score || 0}
            previousScore={store?.seo_score ? store.seo_score + 2 : null}
            icon={Search}
            color="emerald"
          />
          <HealthScoreCard
            title="Accessibility"
            score={store?.accessibility_score || 0}
            previousScore={store?.accessibility_score ? store.accessibility_score + 8 : null}
            icon={Accessibility}
            color="blue"
          />
          <HealthScoreCard
            title="Content Quality"
            score={store?.content_score || 0}
            previousScore={store?.content_score ? store.content_score - 1 : null}
            icon={CheckCircle2}
            color="cyan"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <QuickActions onAction={handleQuickAction} />
          </motion.div>

          {/* Right Column - Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <RecentActivity activities={recentActivity} />
          </motion.div>
        </div>

        {/* Store Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gray-900/50 border-gray-800 glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Store Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-white">{store?.shop_domain}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800 glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-purple-400 capitalize">
                {store?.plan || 'Starter'} Plan
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Last Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-white">
                {store?.last_scan_date ? 'Today' : 'Never'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-white">{recentJobs.length}</p>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
