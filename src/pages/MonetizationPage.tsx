import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TipJarSettings } from "@/components/monetization/TipJarSettings";
import { DigitalProductsManager } from "@/components/monetization/DigitalProductsManager";
import { ProductManager } from "@/components/monetization/ProductManager";
import { CouponManager } from "@/components/monetization/CouponManager";
import { StoreIntegrationManager } from "@/components/monetization/StoreIntegrationManager";
import { AdRevenueCard } from "@/components/monetization/AdRevenueCard";
import { AdPlacementManager } from "@/components/monetization/AdPlacementManager";

const MonetizationPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Monetization</h1>
          </div>
          <p className="text-muted-foreground">
            Earn from ads, sell products, and integrate your store
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <AdRevenueCard />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mb-6">
          <AdPlacementManager />
        </motion.div>

        {/* Store Products (new e-commerce) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
          <ProductManager />
        </motion.div>

        {/* Coupons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="mb-6">
          <CouponManager />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DigitalProductsManager />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <StoreIntegrationManager />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="max-w-md">
          <TipJarSettings />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default MonetizationPage;