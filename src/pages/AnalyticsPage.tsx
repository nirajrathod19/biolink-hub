import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Settings,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EnhancedAnalytics } from "@/components/analytics/EnhancedAnalytics";
import { AnalyticsSettingsCard } from "@/components/analytics/AnalyticsSettingsCard";
import { useProfile } from "@/hooks/useProfile";
import { useLinks } from "@/hooks/useLinks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Sample data - in production this would come from click_logs
const clickData = [
  { date: "Jan 20", clicks: 45, views: 120 },
  { date: "Jan 21", clicks: 52, views: 145 },
  { date: "Jan 22", clicks: 78, views: 190 },
  { date: "Jan 23", clicks: 65, views: 175 },
  { date: "Jan 24", clicks: 89, views: 210 },
  { date: "Jan 25", clicks: 95, views: 245 },
  { date: "Jan 26", clicks: 102, views: 280 },
];

const trafficSources = [
  { name: "Direct", value: 45, color: "hsl(var(--primary))" },
  { name: "Instagram", value: 25, color: "#EC4899" },
  { name: "Twitter", value: 15, color: "#3B82F6" },
  { name: "Google", value: 10, color: "#10B981" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
];

const deviceData = [
  { name: "Mobile", value: 68, icon: Smartphone },
  { name: "Desktop", value: 28, icon: Monitor },
  { name: "Tablet", value: 4, icon: Monitor },
];

const AnalyticsPage = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: links = [], isLoading: linksLoading } = useLinks();

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
  const topLink = links.reduce((top, link) => 
    (link.click_count || 0) > (top?.click_count || 0) ? link : top, 
    links[0]
  );

  if (profileLoading || linksLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your bio page performance
          </p>
        </div>

        {/* Tabs for Overview / Enhanced / Settings */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="enhanced">Detailed</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Views",
              value: profile?.total_clicks ? profile.total_clicks * 1.4 : 0,
              change: "+12.5%",
              trend: "up",
              icon: Eye,
            },
            {
              label: "Total Clicks",
              value: totalClicks || profile?.total_clicks || 0,
              change: "+8.2%",
              trend: "up",
              icon: MousePointer,
            },
            {
              label: "Click Rate",
              value: "66.1%",
              change: "-2.4%",
              trend: "down",
              icon: TrendingUp,
            },
            {
              label: "Unique Visitors",
              value: profile?.unique_clicks || 0,
              change: "+15.3%",
              trend: "up",
              icon: Globe,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-display font-bold">
                  {typeof stat.value === "number" ? Math.round(stat.value).toLocaleString() : stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Clicks Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Clicks Over Time</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clickData}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Traffic Sources</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {trafficSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span>{source.name}</span>
                    </div>
                    <span className="text-muted-foreground">{source.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Top Performing Links</h3>
              </div>
              <div className="space-y-3">
                {links.slice(0, 5).map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <p className="font-medium text-sm truncate max-w-[200px]">{link.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MousePointer className="w-3 h-3" />
                      <span className="text-sm">{link.click_count || 0}</span>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No links yet. Add some links to see analytics!
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Device Breakdown</h3>
              </div>
              <div className="space-y-4">
                {deviceData.map((device) => (
                  <div key={device.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <device.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <span className="text-sm font-medium">{device.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${device.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
          </TabsContent>

          {/* Enhanced Analytics Tab */}
          <TabsContent value="enhanced">
            <EnhancedAnalytics />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-xl">
              <AnalyticsSettingsCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
