import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Info, Link2, BarChart3, DollarSign, Palette, 
  Layout, Shield, Share2, ChevronRight, ChevronLeft,
  ToggleRight, Calendar, Sparkles, GripVertical, Infinity,
  FolderOpen, Eye, MapPin, Smartphone, Target,
  Gift, ShoppingCart, CreditCard, Brush, Type, Grid,
  Layers, MessageSquare, Mail, Lock, Globe, Users,
  FileText, Video, Image, Loader2, BookOpen, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGuidePages, GuidePage } from "@/hooks/useGuidePages";

interface FeatureCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  features: {
    name: string;
    description: string;
    status: "available" | "coming-soon";
    icon: React.ReactNode;
  }[];
}

const defaultFeatureCategories: FeatureCategory[] = [
  {
    id: "links",
    title: "Link Management",
    icon: <Link2 className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    features: [
      { name: "Enable/Disable Toggle", description: "Turn links on or off without deleting", status: "available", icon: <ToggleRight className="w-4 h-4" /> },
      { name: "Link Scheduling", description: "Auto-publish or expire links at specific times", status: "available", icon: <Calendar className="w-4 h-4" /> },
      { name: "Highlighted Links", description: "Animate and visually boost important links", status: "available", icon: <Sparkles className="w-4 h-4" /> },
      { name: "Drag & Drop", description: "Reorder links easily with drag and drop", status: "available", icon: <GripVertical className="w-4 h-4" /> },
      { name: "Unlimited Storage", description: "No cap on number of links", status: "available", icon: <Infinity className="w-4 h-4" /> },
      { name: "Link Grouping", description: "Organize with folders & collapsible sections", status: "coming-soon", icon: <FolderOpen className="w-4 h-4" /> },
    ]
  },
  {
    id: "analytics",
    title: "Analytics & Tracking",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "from-purple-500 to-pink-500",
    features: [
      { name: "Views & Clicks", description: "Track total views, clicks, and CTR", status: "available", icon: <Eye className="w-4 h-4" /> },
      { name: "Revenue Tracking", description: "Monitor earnings from links & products", status: "available", icon: <DollarSign className="w-4 h-4" /> },
      { name: "Visitor Location", description: "See country and city data", status: "available", icon: <MapPin className="w-4 h-4" /> },
      { name: "Traffic Sources", description: "Track where visitors come from", status: "available", icon: <Share2 className="w-4 h-4" /> },
      { name: "Device Analytics", description: "Mobile, desktop, and tablet breakdown", status: "available", icon: <Smartphone className="w-4 h-4" /> },
      { name: "Pixel Tracking", description: "Facebook, Google Analytics integration", status: "available", icon: <Target className="w-4 h-4" /> },
    ]
  },
  {
    id: "monetization",
    title: "Monetization",
    icon: <DollarSign className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    features: [
      { name: "Tip Jar", description: "Accept donations from supporters", status: "available", icon: <Gift className="w-4 h-4" /> },
      { name: "Digital Products", description: "Sell PDFs, audio files, and more", status: "available", icon: <ShoppingCart className="w-4 h-4" /> },
      { name: "Revenue Share", description: "Earn 50% after reaching Pro status", status: "available", icon: <DollarSign className="w-4 h-4" /> },
      { name: "Direct Checkout", description: "Stripe and PayPal integration", status: "available", icon: <CreditCard className="w-4 h-4" /> },
      { name: "Wallet System", description: "Track and withdraw earnings", status: "available", icon: <DollarSign className="w-4 h-4" /> },
    ]
  },
  {
    id: "design",
    title: "Design & Customization",
    icon: <Palette className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
    features: [
      { name: "Pre-made Themes", description: "6+ beautiful templates to choose from", status: "available", icon: <Layout className="w-4 h-4" /> },
      { name: "Custom Colors", description: "Personalize your theme color", status: "available", icon: <Brush className="w-4 h-4" /> },
      { name: "Profile Customization", description: "Display name, bio, and avatar", status: "available", icon: <Type className="w-4 h-4" /> },
      { name: "Social Icons", description: "Add all your social media links", status: "available", icon: <Share2 className="w-4 h-4" /> },
      { name: "Responsive Design", description: "Optimized for mobile and desktop", status: "available", icon: <Smartphone className="w-4 h-4" /> },
      { name: "Grid Layout", description: "Modern grid display option", status: "available", icon: <Grid className="w-4 h-4" /> },
    ]
  },
  {
    id: "blocks",
    title: "Content Blocks",
    icon: <Layers className="w-5 h-5" />,
    color: "from-indigo-500 to-violet-500",
    features: [
      { name: "Header Block", description: "Bio and profile information", status: "available", icon: <Type className="w-4 h-4" /> },
      { name: "Link Cards", description: "Beautiful link display cards", status: "available", icon: <Link2 className="w-4 h-4" /> },
      { name: "Social Icons", description: "Compact social media bar", status: "available", icon: <Share2 className="w-4 h-4" /> },
      { name: "FAQ Block", description: "Accordion-style Q&A section", status: "coming-soon", icon: <MessageSquare className="w-4 h-4" /> },
    ]
  },
  {
    id: "marketing",
    title: "Marketing & Leads",
    icon: <Mail className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500",
    features: [
      { name: "Email Collection", description: "Capture visitor emails", status: "coming-soon", icon: <Mail className="w-4 h-4" /> },
      { name: "Referral System", description: "Earn from referred creators", status: "available", icon: <Users className="w-4 h-4" /> },
    ]
  },
  {
    id: "security",
    title: "Security & Access",
    icon: <Shield className="w-5 h-5" />,
    color: "from-slate-500 to-gray-600",
    features: [
      { name: "Protected Links", description: "PIN-protect sensitive content", status: "coming-soon", icon: <Lock className="w-4 h-4" /> },
      { name: "Social Login", description: "Easy sign-in with social accounts", status: "coming-soon", icon: <Users className="w-4 h-4" /> },
      { name: "Session Management", description: "Monitor active login sessions", status: "available", icon: <Shield className="w-4 h-4" /> },
    ]
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: <Globe className="w-5 h-5" />,
    color: "from-teal-500 to-green-500",
    features: [
      { name: "Custom Domain", description: "Use your own domain with SSL", status: "coming-soon", icon: <Globe className="w-4 h-4" /> },
      { name: "Analytics Tools", description: "GA4 and Meta Pixel support", status: "available", icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
];

// Custom Guide View (Book-style for uploaded content)
const CustomGuideView = ({ pages }: { pages: GuidePage[] }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
  };

  const page = pages[currentPage];

  return (
    <div className="flex flex-col h-full">
      {/* Page Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={page.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col items-center"
          >
            {/* Title */}
            <h3 className="text-lg font-display font-bold mb-2 text-center">
              {page.title}
            </h3>
            {page.description && (
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                {page.description}
              </p>
            )}

            {/* Content */}
            <div className="flex-1 w-full max-w-2xl rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center">
              {page.file_type === "image" ? (
                <img
                  src={page.file_url}
                  alt={page.title}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : page.file_type === "video" ? (
                <video
                  src={page.file_url}
                  controls
                  className="max-w-full max-h-[400px]"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 p-8">
                  <FileText className="w-16 h-16 text-muted-foreground" />
                  <a
                    href={page.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Open PDF in new tab
                  </a>
                  <iframe
                    src={page.file_url}
                    className="w-full h-[300px] rounded-lg border border-border"
                    title={page.title}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevPage}
          disabled={pages.length <= 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentPage + 1} / {pages.length}
          </span>
          <div className="flex gap-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === index
                    ? "bg-primary w-4"
                    : "bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextPage}
          disabled={pages.length <= 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Default Features View
const DefaultFeaturesView = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const currentCategory = defaultFeatureCategories[activeCategory];

  const nextCategory = () => {
    setActiveCategory((prev) => (prev + 1) % defaultFeatureCategories.length);
  };

  const prevCategory = () => {
    setActiveCategory((prev) => (prev - 1 + defaultFeatureCategories.length) % defaultFeatureCategories.length);
  };

  return (
    <div className="flex flex-col md:flex-row h-[600px]">
      {/* Sidebar - Categories */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 overflow-x-auto md:overflow-y-auto">
        <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
          {defaultFeatureCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeCategory === index
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {category.icon}
              <span>{category.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                currentCategory.color
              )}>
                {currentCategory.icon}
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">{currentCategory.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentCategory.features.filter(f => f.status === "available").length} features available
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid gap-3">
              {currentCategory.features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all",
                    feature.status === "available"
                      ? "bg-secondary/50 border-border hover:border-primary/50"
                      : "bg-muted/30 border-dashed border-border/50 opacity-70"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    feature.status === "available"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{feature.name}</p>
                      {feature.status === "coming-soon" && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                  {feature.status === "available" && (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevCategory}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-1">
            {defaultFeatureCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeCategory === index
                    ? "bg-primary w-4"
                    : "bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextCategory}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const HowToUseModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: guidePages = [], isLoading } = useGuidePages();

  const hasCustomGuide = guidePages.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">How to Use</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {hasCustomGuide ? (
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Link2 className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            {hasCustomGuide ? "How to Use Guide" : "Brioo Platform Guide"}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : hasCustomGuide ? (
          <CustomGuideView pages={guidePages} />
        ) : (
          <DefaultFeaturesView />
        )}
      </DialogContent>
    </Dialog>
  );
};
