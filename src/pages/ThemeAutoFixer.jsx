import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Settings, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { OptimizationJob, User } from '@/api/entities';

export default function ThemeAutoFixer() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const user = await User.me();
        const optimizationJobs = await OptimizationJob.filter(
          { created_by: user.email, job_type: 'performance_fix' }, 
          '-created_date', 
          20
        );
        setJobs(optimizationJobs);
      } catch (error) {
        console.error("Failed to load optimization jobs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-400" />;
      case 'failed': return <AlertTriangle className="text-red-400" />;
      default: return <Clock className="text-gray-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            Theme Auto-Fixer Log
          </h1>
          <p className="text-gray-400 mt-2">
            Track all automated fixes and optimizations applied to your theme by the AI.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-400">Loading optimization history...</p>
            ) : jobs.length === 0 ? (
              <p className="text-gray-400">No auto-fix jobs have been run yet.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-semibold text-white">{job.title}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(job.created_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                      {job.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}