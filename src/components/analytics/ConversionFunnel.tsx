import { motion } from "framer-motion";
import { Eye, User, MousePointer, ShoppingBag, CreditCard } from "lucide-react";

interface FunnelStage {
  label: string;
  value: number;
  icon: any;
}

interface Props {
  visitors: number;
  profileViews: number;
  linkClicks: number;
  productViews: number;
  purchases: number;
}

export const ConversionFunnel = ({
  visitors,
  profileViews,
  linkClicks,
  productViews,
  purchases,
}: Props) => {
  const stages: FunnelStage[] = [
    { label: "Visitor", value: visitors, icon: User },
    { label: "Profile View", value: profileViews, icon: Eye },
    { label: "Link Click", value: linkClicks, icon: MousePointer },
    { label: "Product View", value: productViews, icon: ShoppingBag },
    { label: "Purchase", value: purchases, icon: CreditCard },
  ];

  const max = Math.max(stages[0].value, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-xl">
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Conversion Funnel
        </div>
        <h3 className="font-display text-lg font-semibold">
          Visitor → Purchase journey
        </h3>
      </div>

      <div className="space-y-2.5">
        {stages.map((stage, i) => {
          const widthPct = Math.max((stage.value / max) * 100, 8);
          const dropPct =
            i > 0 && stages[i - 1].value > 0
              ? Math.round(
                  ((stages[i - 1].value - stage.value) / stages[i - 1].value) *
                    100
                )
              : 0;

          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ delay: i * 0.1 + 0.15, duration: 0.9, ease: "easeOut" }}
                className="relative mx-auto h-14 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#7B61FF]/30 via-[#C8B6FF]/20 to-[#69EACB]/30 backdrop-blur-md"
                style={{
                  boxShadow:
                    "0 8px 32px -12px rgba(123,97,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {/* moving shimmer */}
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{
                    duration: 4 + i * 0.4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <div className="relative flex h-full items-center justify-between px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                      <stage.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate text-sm font-medium text-white">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {dropPct > 0 && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-200">
                        −{dropPct}%
                      </span>
                    )}
                    <span className="font-display text-sm font-bold text-white">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
        <div>
          <div className="text-muted-foreground">Overall conversion</div>
          <div className="font-display text-lg font-bold text-[#69EACB]">
            {visitors > 0
              ? ((purchases / visitors) * 100).toFixed(2)
              : "0.00"}
            %
          </div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground">Biggest drop-off</div>
          <div className="font-display text-sm font-semibold">
            {biggestDropLabel(stages)}
          </div>
        </div>
      </div>
    </div>
  );
};

const biggestDropLabel = (stages: FunnelStage[]) => {
  let maxDrop = 0;
  let label = "—";
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].value;
    if (!prev) continue;
    const drop = (prev - stages[i].value) / prev;
    if (drop > maxDrop) {
      maxDrop = drop;
      label = `${stages[i - 1].label} → ${stages[i].label}`;
    }
  }
  return label;
};
