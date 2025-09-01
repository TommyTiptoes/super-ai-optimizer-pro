import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function HealthScoreCard({ 
  title, 
  score, 
  previousScore, 
  icon: Icon, 
  color = "purple" 
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getTrend = () => {
    if (!previousScore) return null;
    if (score > previousScore) return { icon: TrendingUp, color: "text-emerald-400", text: "↗" };
    if (score < previousScore) return { icon: TrendingDown, color: "text-red-400", text: "↘" };
    return { icon: Minus, color: "text-gray-400", text: "→" };
  };

  const trend = getTrend();

  return (
    <Card className="bg-gray-900/50 border-gray-800 glass-effect hover:bg-gray-800/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend.color}`}>
              <trend.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{Math.abs(score - previousScore)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-gray-500 text-sm mb-1">/100</span>
          </div>
          <Progress 
            value={score} 
            className={`h-2 bg-gray-800`}
          />
        </div>
      </CardContent>
    </Card>
  );
}