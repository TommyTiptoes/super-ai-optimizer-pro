import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Thermometer, MousePointer, Tablet, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for demonstration
const mockHeatmapData = {
  desktop: Array.from({ length: 50 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    value: Math.random(),
  })),
  tablet: Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    value: Math.random(),
  })),
  mobile: Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    value: Math.random(),
  })),
};

const HeatmapPoint = ({ point }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="absolute rounded-full"
    style={{
      left: `${point.x}%`,
      top: `${point.y}%`,
      width: `${point.value * 60 + 20}px`,
      height: `${point.value * 60 + 20}px`,
      background: `radial-gradient(circle, rgba(255, 87, 51, ${point.value * 0.6}) 0%, rgba(255, 87, 51, 0) 70%)`,
      transform: 'translate(-50%, -50%)',
    }}
  />
);

export default function Heatmaps() {
  const [device, setDevice] = useState('desktop');

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Thermometer className="w-8 h-8 text-orange-400" />
            Live Heatmap Tracker
          </h1>
          <p className="text-gray-400 mt-2">
            See where your customers click and what they ignore on your key pages.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-orange-400">Homepage Engagement</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="text-gray-300 border-gray-700">
                Install Tracking Snippet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585152220-406b9b71a3d3?q=80&w=2070&auto=format&fit=crop"
                alt="Product Page"
                className="w-full h-full object-cover opacity-30"
              />
              {mockHeatmapData[device].map((point, index) => (
                <HeatmapPoint key={index} point={point} />
              ))}
            </div>
            <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/50"></div> Hotspot</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/50"></div> Active Area</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500/50"></div> Cool Area</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}