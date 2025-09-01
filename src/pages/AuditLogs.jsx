
import React, { useState, useEffect, useCallback } from "react";
import { OptimizationJob, ScanResult, Store } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Calendar, 
  Activity,
  Download,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Image,
  Globe
} from "lucide-react";

export default function AuditLogs() {
  const [store, setStore] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      
      if (stores.length > 0) {
        setStore(stores[0]);
        const storeId = stores[0].id;

        // Load optimization jobs
        const jobs = await OptimizationJob.filter({ store_id: storeId }, '-created_date', 50);
        
        // Load scan results
        const scans = await ScanResult.filter({ store_id: storeId }, '-created_date', 20);
        
        // Combine and format logs
        const combinedLogs = [
          ...jobs.map(job => ({
            id: job.id,
            type: 'optimization',
            title: job.title,
            status: job.status,
            progress: job.progress,
            created_date: job.created_date,
            completed_at: job.completed_at,
            job_type: job.job_type,
            items_total: job.items_total,
            items_processed: job.items_processed,
            results: job.results,
            error_message: job.error_message
          })),
          ...scans.map(scan => ({
            id: scan.id,
            type: 'scan',
            title: `${scan.scan_type} scan`,
            status: scan.status,
            created_date: scan.created_date,
            completed_at: scan.completed_at,
            scan_type: scan.scan_type,
            issues_found: scan.issues_found,
            pages_scanned: scan.pages_scanned,
            recommendations: scan.recommendations
          }))
        ];

        // Sort by date (newest first)
        combinedLogs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        
        setLogs(combinedLogs);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies are empty as User, Store, OptimizationJob, ScanResult are stable imports and setters are stable.

  const filterLogs = useCallback(() => {
    let filtered = logs;

    if (typeFilter !== "all") {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, typeFilter, statusFilter]); // Dependencies are state variables that filterLogs depends on.

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is now a memoized callback.

  useEffect(() => {
    filterLogs();
  }, [filterLogs]); // filterLogs is now a memoized callback.

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'processing':
      case 'running':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type, jobType) => {
    if (type === 'scan') {
      return <Globe className="w-4 h-4 text-purple-400" />;
    }
    
    switch (jobType) {
      case 'image_optimization':
        return <Image className="w-4 h-4 text-blue-400" />;
      case 'seo_generation':
        return <Search className="w-4 h-4 text-green-400" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Type', 'Title', 'Status', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_date).toLocaleDateString(),
        log.type,
        log.title,
        log.status,
        log.type === 'scan' ? `${log.issues_found} issues found` : `${log.items_processed}/${log.items_total} items`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-400" />
            Audit Logs
          </h1>
          <p className="text-gray-400 mt-2">
            Track all optimization activities and changes made to your store.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="optimization">Optimizations</SelectItem>
                    <SelectItem value="scan">Scans</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={exportLogs}
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{logs.length}</div>
              <div className="text-sm text-gray-400">Total Activities</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {logs.filter(log => log.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {logs.filter(log => log.status === 'processing' || log.status === 'running').length}
              </div>
              <div className="text-sm text-gray-400">In Progress</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {logs.filter(log => log.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-400">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Logs List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(log.type, log.job_type)}
                        <div>
                          <h4 className="text-white font-medium capitalize">{log.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.created_date).toLocaleString()}
                            {log.completed_at && (
                              <>
                                <span>→</span>
                                {new Date(log.completed_at).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge className={
                          log.status === 'completed' ? 'bg-green-600' : 
                          log.status === 'processing' || log.status === 'running' ? 'bg-blue-600' : 
                          log.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                        }>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      {log.type === 'scan' ? (
                        <div className="flex items-center gap-4">
                          <span>Issues found: {log.issues_found || 0}</span>
                          <span>Pages scanned: {log.pages_scanned || 0}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <span>Progress: {log.items_processed}/{log.items_total}</span>
                          {log.progress && <span>({log.progress}%)</span>}
                        </div>
                      )}
                    </div>
                    
                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-300">
                        Error: {log.error_message}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No logs found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
