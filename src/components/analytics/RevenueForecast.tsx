import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueForecastProps {
  earningsLogs: Array<{
    date: string;
    creator_share: number | null;
    gross_revenue: number | null;
  }>;
}

export const RevenueForecast = ({ earningsLogs }: RevenueForecastProps) => {
  // Build 30-day dataset: past actuals + future forecast
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Map actuals by date
  const actualsByDate = new Map<string, number>();
  earningsLogs.forEach((log) => {
    const date = log.date;
    actualsByDate.set(date, (actualsByDate.get(date) || 0) + (log.creator_share || 0));
  });

  // Calculate average daily revenue from actuals
  const actualValues = Array.from(actualsByDate.values());
  const avgDailyRevenue = actualValues.length > 0
    ? actualValues.reduce((sum, v) => sum + v, 0) / actualValues.length
    : 0;

  const chartData: Array<{ date: string; actual: number | null; forecast: number | null }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -14; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (i <= 0) {
      // Past / today — use actuals
      const actual = actualsByDate.get(dateStr) || 0;
      chartData.push({ date: label, actual, forecast: null });
    } else {
      // Future — forecast with slight growth trend
      const growthFactor = 1 + (i * 0.005); // 0.5% daily growth
      const forecast = Math.round((avgDailyRevenue * growthFactor) * 100) / 100;
      chartData.push({ date: label, actual: null, forecast: Math.max(forecast, 0) });
    }
  }

  const totalForecast = chartData
    .filter((d) => d.forecast !== null)
    .reduce((sum, d) => sum + (d.forecast || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">30-Day Revenue Forecast</h3>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-500">
              ${totalForecast.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-xs">projected</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                interval="preserveStartEnd"
                tickCount={7}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === "actual" ? "Actual Revenue" : "Forecasted Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorActual)"
                name="actual"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#10B981"
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorForecast)"
                name="forecast"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500 rounded" style={{ borderBottom: "1px dashed" }} />
            <span>Forecast</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};