import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TipJarSettings } from "@/components/monetization/TipJarSettings";
import { DigitalProductsManager } from "@/components/monetization/DigitalProductsManager";

const MonetizationPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Monetization
            </h1>
          </div>
          <p className="text-muted-foreground">
            Accept tips, sell digital products, and track affiliate earnings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tip Jar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TipJarSettings />
          </motion.div>

          {/* Digital Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DigitalProductsManager />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonetizationPage;
