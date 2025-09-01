

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Zap, 
  Scan, 
  Search, 
  Image, 
  Accessibility, 
  Layers, 
  Eye, 
  Activity,
  Settings,
  FileText,
  Bot,
  Wand,
  DollarSign,
  Rocket,
  Link2Off,
  TestTube2,
  Mail,
  Thermometer,
  ShieldCheck,
  AppWindow,
  History,
  Layout as LayoutIcon,
  Sparkles,
  Globe,
  DownloadCloud
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Logo from "../components/ui/Logo";
import JarvisInterface from "../components/voice/JarvisInterface";
import { Button } from "@/components/ui/button"; // Assuming Button component is available here
import toast from 'react-hot-toast'; // Assuming react-hot-toast for notifications

const mainTools = [
  { title: "Setup Wizard", url: createPageUrl("AppSetupWizard"), icon: Wand },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Activity },
  { title: "Scanner", url: createPageUrl("Scanner"), icon: Scan },
  { title: "AI Agents", url: createPageUrl("Agents"), icon: Bot },
  { title: "Deploy App", url: createPageUrl("Deployment"), icon: Rocket }, // Added deployment page
];

const newTools = [
    { title: "Product Optimizer", url: createPageUrl("ProductOptimizer"), icon: Sparkles },
    { title: "Review Importer", url: createPageUrl("ReviewImporter"), icon: DownloadCloud },
    { title: "Geo-Targeting", url: createPageUrl("GeoTargeting"), icon: Globe },
    { title: "Product AI Generator", url: createPageUrl("ProductDescriptionGenerator"), icon: FileText },
    { title: "Smart Pricing", url: createPageUrl("SmartPricing"), icon: DollarSign },
    { title: "Theme Speed", url: createPageUrl("ThemeSpeed"), icon: Rocket },
    { title: "Broken Link Detector", url: createPageUrl("BrokenLinks"), icon: Link2Off },
    { title: "Smart UX Tester", url: createPageUrl("UXTester"), icon: TestTube2 },
    { title: "AI Email Campaigns", url: createPageUrl("EmailCampaigns"), icon: Mail },
    { title: "Heatmap Tracker", url: createPageUrl("Heatmaps"), icon: Thermometer },
    { title: "Trust Badge Builder", url: createPageUrl("TrustBuilder"), icon: ShieldCheck },
    { title: "AI App Recommender", url: createPageUrl("AppRecommender"), icon: AppWindow },
    { title: "Landing Page Builder", url: createPageUrl("LandingPageBuilder"), icon: LayoutIcon },
    { title: "Theme Backups", url: createPageUrl("ThemeBackups"), icon: History },
];

const systemTools = [
  { title: "Theme Auto-Fixer", url: createPageUrl("ThemeAutoFixer"), icon: Settings },
  { title: "API Permissions", url: createPageUrl("ApiPermissions"), icon: ShieldCheck },
];

const existingTools = [
  { title: "SEO Tools", url: createPageUrl("SEOTools"), icon: Search },
  { title: "Image Optimizer", url: createPageUrl("ImageOptimizer"), icon: Image },
  { title: "Accessibility", url: createPageUrl("Accessibility"), icon: Accessibility },
  { title: "Templates", url: createPageUrl("Templates"), icon: Layers },
  { title: "Competitor Spy", url: createPageUrl("CompetitorSpy"), icon: Eye },
  { title: "Audit Logs", url: createPageUrl("AuditLogs"), icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [jarvisSpeak, setJarvisSpeak] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleVoiceCommand = (command) => {
    console.log('Voice command received:', command);
    
    // Basic voice command processing
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('scan') || lowerCommand.includes('analyze')) {
      if (jarvisSpeak) {
        jarvisSpeak("Initiating store scan. Analyzing your Shopify store for optimization opportunities.");
      }
      // Navigate to scanner
      window.location.href = createPageUrl("Scanner");
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
      if (jarvisSpeak) {
        jarvisSpeak("Taking you to the dashboard.");
      }
      window.location.href = createPageUrl("Dashboard");
    } else if (lowerCommand.includes('agent') || lowerCommand.includes('assistant')) {
      if (jarvisSpeak) {
        jarvisSpeak("Opening AI agents interface. How may I assist you today?");
      }
      window.location.href = createPageUrl("Agents");
    } else if (lowerCommand.includes('storefront') || lowerCommand.includes('create')) {
      if (jarvisSpeak) {
        jarvisSpeak("Loading the AI Storefront Creator. Ready to build something remarkable?");
      }
      window.location.href = createPageUrl("AIStorefrontCreator");
    } else {
      if (jarvisSpeak) {
        jarvisSpeak("I'm not certain I understood that command. Perhaps you could try 'scan store', 'go to dashboard', or 'open agents'.");
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
    toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --background: ${isDarkMode ? '0 0% 8%' : '0 0% 98%'};
            --foreground: ${isDarkMode ? '0 0% 98%' : '0 0% 8%'};
            --card: ${isDarkMode ? '0 0% 12%' : '0 0% 100%'};
            --card-foreground: ${isDarkMode ? '0 0% 98%' : '0 0% 8%'};
            --popover: ${isDarkMode ? '0 0% 10%' : '0 0% 100%'};
            --popover-foreground: ${isDarkMode ? '0 0% 98%' : '0 0% 8%'};
            --primary: 260 100% 65%;
            --primary-foreground: 0 0% 98%;
            --secondary: ${isDarkMode ? '0 0% 16%' : '0 0% 92%'};
            --secondary-foreground: ${isDarkMode ? '0 0% 98%' : '0 0% 8%'};
            --muted: ${isDarkMode ? '0 0% 16%' : '0 0% 92%'};
            --muted-foreground: ${isDarkMode ? '0 0% 65%' : '0 0% 45%'};
            --accent: 190 100% 50%;
            --accent-foreground: 0 0% 98%;
            --destructive: 0 84% 60%;
            --destructive-foreground: 0 0% 98%;
            --border: ${isDarkMode ? '0 0% 20%' : '0 0% 85%'};
            --input: ${isDarkMode ? '0 0% 16%' : '0 0% 100%'};
            --ring: 260 100% 65%;
            --radius: 0.5rem;
          }
          
          body {
            background: hsl(var(--background));
            color: hsl(var(--foreground));
          }
          
          .gradient-accent {
            background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%);
          }
          
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, ${isDarkMode ? '0.05' : '0.95'});
            border: 1px solid rgba(255, 255, 255, ${isDarkMode ? '0.1' : '0.2'});
          }
          
          .neon-glow {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }

          .jarvis-glow {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
          }
        `}
      </style>
      <div className={`min-h-screen flex w-full ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Sidebar className={`border-r ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <SidebarHeader className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size="normal" className="jarvis-glow" />
                <div>
                  <h2 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Command Center</h2>
                  <p className="text-xs text-cyan-400 font-medium">Shopify Edition</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {isDarkMode ? '🌙' : '☀️'}
              </Button>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider px-2 mb-4`}>
                Core Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainTools.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`${isDarkMode ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'} transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url ? 'bg-purple-600 text-white shadow-lg neon-glow' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider px-2 mb-4`}>
                Growth Suite
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {newTools.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`${isDarkMode ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'} transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url ? 'bg-purple-600 text-white shadow-lg neon-glow' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider px-2 mb-4`}>
                System Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemTools.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`${isDarkMode ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'} transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url ? 'bg-purple-600 text-white shadow-lg neon-glow' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider px-2 mb-4`}>
                Legacy Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {existingTools.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`${isDarkMode ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'} transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === item.url ? 'bg-purple-600 text-white shadow-lg neon-glow' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

          </SidebarContent>

          <SidebarFooter className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} p-6`}>
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>Shopify App</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>v2.0 Professional</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gray-950">
          <header className={`${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 md:hidden`}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className={`${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} p-2 rounded-xl transition-colors duration-200`} />
              <Logo size="small" />
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Command Center</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Jarvis Voice Interface */}
        <JarvisInterface 
          onVoiceCommand={handleVoiceCommand}
          onSpeakResponse={setJarvisSpeak}
        />
      </div>
    </SidebarProvider>
  );
}

