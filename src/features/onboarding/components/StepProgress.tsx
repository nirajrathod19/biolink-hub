import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  total: number;
  current: number;
}

export const StepProgress = ({ total, current }: Props) => {
  return (
    <div className="flex items-center gap-1.5 px-6 pt-5">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: done || active ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                done && "bg-primary",
                active && "bg-gradient-to-r from-primary to-accent"
              )}
            />
          </div>
        );
      })}
      <span className="ml-2 text-[10px] font-medium tabular-nums text-muted-foreground">
        {current + 1}/{total}
      </span>
      {current === total - 1 && (
        <Check className="w-3.5 h-3.5 text-primary" />
      )}
    </div>
  );
};
