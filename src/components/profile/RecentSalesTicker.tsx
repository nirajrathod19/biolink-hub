import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BioTheme } from "@/lib/bioThemes";

interface RecentSalesTickerProps {
  userId: string;
  theme: BioTheme;
}

interface SaleItem {
  id: string;
  type: "product" | "tip";
  title: string;
  amount: number;
  currency: string;
  time: string;
}

export const RecentSalesTicker = ({ userId, theme }: RecentSalesTickerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: sales = [] } = useQuery({
    queryKey: ["recent-sales-ticker", userId],
    queryFn: async () => {
      const items: SaleItem[] = [];

      // Fetch recent product sales (copies_sold > 0)
      const { data: products } = await supabase
        .from("digital_products")
        .select("id, title, price, currency, copies_sold, updated_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .gt("copies_sold", 0)
        .order("updated_at", { ascending: false })
        .limit(5);

      products?.forEach((p) => {
        items.push({
          id: `product-${p.id}`,
          type: "product",
          title: p.title,
          amount: p.price,
          currency: p.currency || "USD",
          time: p.updated_at,
        });
      });

      // Fetch recent paid Q&A tips
      const { data: tips } = await supabase
        .from("qa_questions")
        .select("id, asker_name, tip_amount, created_at")
        .eq("creator_user_id", userId)
        .eq("is_paid", true)
        .gt("tip_amount", 0)
        .order("created_at", { ascending: false })
        .limit(5);

      tips?.forEach((t) => {
        items.push({
          id: `tip-${t.id}`,
          type: "tip",
          title: `${t.asker_name} sent a tip`,
          amount: t.tip_amount || 0,
          currency: "USD",
          time: t.created_at,
        });
      });

      return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (sales.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sales.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sales.length]);

  if (sales.length === 0) return null;

  const current = sales[currentIndex];

  return (
    <div className="my-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: theme.cardBg || `${theme.accent}10`,
            border: `1px solid ${theme.cardBorder || `${theme.accent}20`}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${theme.accent}20` }}
          >
            {current.type === "product" ? (
              <ShoppingBag className="w-4 h-4" style={{ color: theme.accent }} />
            ) : (
              <Heart className="w-4 h-4" style={{ color: theme.accent }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: theme.textColor }}>
              {current.title}
            </p>
            <p className="text-[10px]" style={{ color: theme.bioTextColor }}>
              {current.currency === "INR" ? "₹" : "$"}{current.amount.toFixed(2)}
            </p>
          </div>
          <span className="text-[10px] shrink-0" style={{ color: theme.bioTextColor }}>
            🔥 Recent
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};