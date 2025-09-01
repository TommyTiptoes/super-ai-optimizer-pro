import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Scanner from "./Scanner";

import AIStorefrontCreator from "./AIStorefrontCreator";

import Agents from "./Agents";

import SEOTools from "./SEOTools";

import ImageOptimizer from "./ImageOptimizer";

import Accessibility from "./Accessibility";

import Templates from "./Templates";

import CompetitorSpy from "./CompetitorSpy";

import AuditLogs from "./AuditLogs";

import ProductDescriptionGenerator from "./ProductDescriptionGenerator";

import SmartPricing from "./SmartPricing";

import ThemeSpeed from "./ThemeSpeed";

import BrokenLinks from "./BrokenLinks";

import UXTester from "./UXTester";

import EmailCampaigns from "./EmailCampaigns";

import Heatmaps from "./Heatmaps";

import TrustBuilder from "./TrustBuilder";

import AppRecommender from "./AppRecommender";

import ThemeBackups from "./ThemeBackups";

import LandingPageBuilder from "./LandingPageBuilder";

import AppSetupWizard from "./AppSetupWizard";

import ApiPermissions from "./ApiPermissions";

import ThemeAutoFixer from "./ThemeAutoFixer";

import ProductOptimizer from "./ProductOptimizer";

import ReviewImporter from "./ReviewImporter";

import GeoTargeting from "./GeoTargeting";

import PricingPlans from "./PricingPlans";

import Deployment from "./Deployment";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Scanner: Scanner,
    
    AIStorefrontCreator: AIStorefrontCreator,
    
    Agents: Agents,
    
    SEOTools: SEOTools,
    
    ImageOptimizer: ImageOptimizer,
    
    Accessibility: Accessibility,
    
    Templates: Templates,
    
    CompetitorSpy: CompetitorSpy,
    
    AuditLogs: AuditLogs,
    
    ProductDescriptionGenerator: ProductDescriptionGenerator,
    
    SmartPricing: SmartPricing,
    
    ThemeSpeed: ThemeSpeed,
    
    BrokenLinks: BrokenLinks,
    
    UXTester: UXTester,
    
    EmailCampaigns: EmailCampaigns,
    
    Heatmaps: Heatmaps,
    
    TrustBuilder: TrustBuilder,
    
    AppRecommender: AppRecommender,
    
    ThemeBackups: ThemeBackups,
    
    LandingPageBuilder: LandingPageBuilder,
    
    AppSetupWizard: AppSetupWizard,
    
    ApiPermissions: ApiPermissions,
    
    ThemeAutoFixer: ThemeAutoFixer,
    
    ProductOptimizer: ProductOptimizer,
    
    ReviewImporter: ReviewImporter,
    
    GeoTargeting: GeoTargeting,
    
    PricingPlans: PricingPlans,
    
    Deployment: Deployment,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Scanner" element={<Scanner />} />
                
                <Route path="/AIStorefrontCreator" element={<AIStorefrontCreator />} />
                
                <Route path="/Agents" element={<Agents />} />
                
                <Route path="/SEOTools" element={<SEOTools />} />
                
                <Route path="/ImageOptimizer" element={<ImageOptimizer />} />
                
                <Route path="/Accessibility" element={<Accessibility />} />
                
                <Route path="/Templates" element={<Templates />} />
                
                <Route path="/CompetitorSpy" element={<CompetitorSpy />} />
                
                <Route path="/AuditLogs" element={<AuditLogs />} />
                
                <Route path="/ProductDescriptionGenerator" element={<ProductDescriptionGenerator />} />
                
                <Route path="/SmartPricing" element={<SmartPricing />} />
                
                <Route path="/ThemeSpeed" element={<ThemeSpeed />} />
                
                <Route path="/BrokenLinks" element={<BrokenLinks />} />
                
                <Route path="/UXTester" element={<UXTester />} />
                
                <Route path="/EmailCampaigns" element={<EmailCampaigns />} />
                
                <Route path="/Heatmaps" element={<Heatmaps />} />
                
                <Route path="/TrustBuilder" element={<TrustBuilder />} />
                
                <Route path="/AppRecommender" element={<AppRecommender />} />
                
                <Route path="/ThemeBackups" element={<ThemeBackups />} />
                
                <Route path="/LandingPageBuilder" element={<LandingPageBuilder />} />
                
                <Route path="/AppSetupWizard" element={<AppSetupWizard />} />
                
                <Route path="/ApiPermissions" element={<ApiPermissions />} />
                
                <Route path="/ThemeAutoFixer" element={<ThemeAutoFixer />} />
                
                <Route path="/ProductOptimizer" element={<ProductOptimizer />} />
                
                <Route path="/ReviewImporter" element={<ReviewImporter />} />
                
                <Route path="/GeoTargeting" element={<GeoTargeting />} />
                
                <Route path="/PricingPlans" element={<PricingPlans />} />
                
                <Route path="/Deployment" element={<Deployment />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}