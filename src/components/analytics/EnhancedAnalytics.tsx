import { motion } from "framer-motion";
import { Globe, Smartphone, Monitor, Tablet, Share2, MapPin, Link2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEnhancedAnalytics, useAffiliateClicks } from "@/hooks/useEnhancedAnalytics";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const DEVICE_COLORS = {
  Mobile: "#8B5CF6",
  Desktop: "#3B82F6",
  Tablet: "#10B981",
  Unknown: "#6B7280",
};

const REFERRER_COLORS = [
  "#EC4899",
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "desktop":
      return <Monitor className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

export const EnhancedAnalytics = () => {
  const { data: analytics, isLoading } = useEnhancedAnalytics();
  const { data: affiliateClicks = [] } = useAffiliateClicks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i}>
            <div className="animate-pulse h-48 bg-secondary/50 rounded" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <GlassCard>
        <div className="text-center py-8 text-muted-foreground">
          No analytics data available yet
        </div>
      </GlassCard>
    );
  }

  const deviceChartData = analytics.deviceData.map((d) => ({
    name: d.device_type,
    value: d.count,
    fill: DEVICE_COLORS[d.device_type as keyof typeof DEVICE_COLORS] || DEVICE_COLORS.Unknown,
  }));

  const referrerChartData = analytics.referrerData.slice(0, 6).map((r, i) => ({
    name: r.referer.length > 15 ? r.referer.slice(0, 15) + "..." : r.referer,
    fullName: r.referer,
    value: r.count,
    fill: REFERRER_COLORS[i % REFERRER_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Top Countries</h3>
            </div>
            <div className="space-y-3">
              {analytics.geoData.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No geographic data yet
                </p>
              ) : (
                analytics.geoData.map((country, index) => (
                  <div key={country.country}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-sm">{country.country}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {country.count} ({country.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Device Breakdown</h3>
            </div>
            {analytics.deviceData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No device data yet
              </p>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {deviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {analytics.deviceData.map((device) => (
                    <div key={device.device_type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DEVICE_COLORS[device.device_type as keyof typeof DEVICE_COLORS] || DEVICE_COLORS.Unknown }}
                        />
                        <DeviceIcon type={device.device_type} />
                        <span>{device.device_type}</span>
                      </div>
                      <span className="text-muted-foreground">{device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Traffic Sources / Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Traffic Sources</h3>
            </div>
            {analytics.referrerData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No referrer data yet
              </p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referrerChartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} clicks`,
                        props.payload.fullName
                      ]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {referrerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Affiliate Clicks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Affiliate Clicks</h3>
            </div>
            {affiliateClicks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No affiliate clicks tracked yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {affiliateClicks.slice(0, 10).map((click: any) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">
                        {click.links?.title || "Unknown Link"}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs flex-shrink-0">
                      {click.country || "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
