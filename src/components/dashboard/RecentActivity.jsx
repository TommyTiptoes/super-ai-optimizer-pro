import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
    case 'processing': return <Clock className="w-4 h-4 text-yellow-400" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-emerald-900/50 text-emerald-300 border-emerald-700';
    case 'failed': return 'bg-red-900/50 text-red-300 border-red-700';
    case 'processing': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
    default: return 'bg-gray-800/50 text-gray-300 border-gray-700';
  }
};

export default function RecentActivity({ activities }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 glass-effect">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <div className="mt-1">
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-white truncate">{activity.title}</h4>
                  <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{format(new Date(activity.created_date), 'MMM d, HH:mm')}</span>
                  {activity.results && (
                    <span className="text-purple-400">
                      {activity.results.items_processed || 0} items processed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Run your first scan to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}