import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, Image, Zap, Layers, Play } from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [
  {
    title: "Run Full Scan",
    description: "Comprehensive store analysis",
    icon: Scan,
    color: "purple",
    action: "scan"
  },
  {
    title: "Optimize Images",
    description: "Bulk compress & resize",
    icon: Image,
    color: "blue",
    action: "images"
  },
  {
    title: "Auto-Fix Issues",
    description: "Apply automatic fixes",
    icon: Zap,
    color: "yellow",
    action: "autofix"
  },
  {
    title: "Generate Pages",
    description: "AI-powered templates",
    icon: Layers,
    color: "emerald",
    action: "templates"
  }
];

export default function QuickActions({ onAction }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 glass-effect">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-700/50 text-left justify-start transition-all duration-200"
                onClick={() => onAction(action.action)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg bg-${action.color}-500/20`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                  </div>
                  <div>
                    <div className="font-medium text-white">{action.title}</div>
                    <div className="text-xs text-gray-400">{action.description}</div>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}