import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Gift, Loader2, Clock, Crown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions, useWithdrawals, useRequestWithdrawal, usePayWithWallet } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const WALLET_PLANS = [
  { key: "monthly" as const, name: "Monthly", price: 3, savings: null },
  { key: "quarterly" as const, name: "4 Months", price: 11, savings: "Save $1" },
  { key: "annual" as const, name: "Annual", price: 30, savings: "Save $6" },
];

const WalletPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: withdrawals = [] } = useWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();
  const payWithWallet = usePayWithWallet();

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [proDialogOpen, setProDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank_transfer">("paypal");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const walletBalance = profile?.wallet_balance || 0;
  const pendingAmount = profile?.pending_revenue || 0;
  const totalEarned = transactions
    .filter(tx => tx.type === "earning" || tx.type === "referral")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 3) return;

    const paymentDetails = paymentMethod === "paypal" 
      ? { paypal_email: paypalEmail }
      : { 
          bank_name: bankName,
          account_number: accountNumber,
          routing_number: routingNumber,
          account_holder: accountHolder,
        };

    await requestWithdrawal.mutateAsync({
      amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    });

    setWithdrawDialogOpen(false);
    setWithdrawAmount("");
    setPaypalEmail("");
    setBankName("");
    setAccountNumber("");
    setRoutingNumber("");
    setAccountHolder("");
  };

  const handlePayWithWallet = async () => {
    await payWithWallet.mutateAsync(selectedPlan);
    setProDialogOpen(false);
  };

  const pendingWithdrawal = withdrawals.find(w => w.status === "pending" || w.status === "processing");
  const selectedPlanDetails = WALLET_PLANS.find(p => p.key === selectedPlan);
  const canAffordPlan = selectedPlanDetails && walletBalance >= selectedPlanDetails.price;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your earnings and withdrawals
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard gradient>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-display font-bold">${walletBalance.toFixed(2)}</p>
                </div>
              </div>
              <GradientButton 
                className="w-full" 
                disabled={walletBalance < 3 || !!pendingWithdrawal}
                onClick={() => setWithdrawDialogOpen(true)}
              >
                {pendingWithdrawal 
                  ? pendingWithdrawal.status === "processing" 
                    ? "Under Process" 
                    : "Withdrawal Pending"
                  : walletBalance < 3 
                    ? "Min. $3 to withdraw" 
                    : "Withdraw"
                }
              </GradientButton>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-display font-bold">${pendingAmount.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Revenue not yet transferred to wallet
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-display font-bold">${totalEarned.toFixed(2)}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Pay with Wallet for Pro */}
        {!profile?.is_pro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <GlassCard className="mb-8 border-primary/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Pay with Wallet Balance</h3>
                    <p className="text-sm text-muted-foreground">
                      Use your wallet balance to subscribe to Pro and start earning revenue
                    </p>
                  </div>
                </div>
                <GradientButton 
                  onClick={() => setProDialogOpen(true)}
                  disabled={walletBalance < 3}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {walletBalance >= 3 ? "Subscribe with Wallet" : "Need $3 min"}
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Pro Status */}
        {!profile?.is_pro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <GlassCard className="mb-8 border-yellow-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold mb-1 text-yellow-500">🔒 Pro Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock Pro to start earning revenue. Reach 1,000 unique clicks or subscribe to Pro.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progress: {profile?.unique_clicks || 0} / 1,000 unique clicks
                  </p>
                </div>
                <GradientButton variant="outline" onClick={() => navigate("/dashboard/settings")}>
                  View Pro Plans
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Pending Withdrawal Alert */}
        {pendingWithdrawal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <GlassCard className={`mb-8 ${pendingWithdrawal.status === "processing" ? "border-orange-500/30" : "border-yellow-500/30"}`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${pendingWithdrawal.status === "processing" ? "text-orange-500" : "text-yellow-500"}`} />
                <div>
                  <h3 className={`font-display font-semibold ${pendingWithdrawal.status === "processing" ? "text-orange-500" : "text-yellow-500"}`}>
                    {pendingWithdrawal.status === "processing" ? "Withdrawal Under Process" : "Withdrawal Pending"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your withdrawal request of ${pendingWithdrawal.amount.toFixed(2)} via {pendingWithdrawal.payment_method.replace("_", " ")} is {pendingWithdrawal.status === "processing" ? "being processed" : "awaiting approval"}.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GlassCard>
            <h3 className="font-display font-semibold mb-4">Transaction History</h3>
            <div className="space-y-3">
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !profile?.is_pro && transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Unlock Pro to start earning and see your transactions here.
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transactions yet. Share your profile to start earning!
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "earning"
                            ? "bg-green-500/10"
                            : tx.type === "referral"
                            ? "bg-purple-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {tx.type === "earning" && <ArrowUpRight className="w-5 h-5 text-green-500" />}
                        {tx.type === "referral" && <Gift className="w-5 h-5 text-purple-500" />}
                        {(tx.type === "withdrawal" || tx.type === "subscription") && (
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        tx.amount > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(4)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount and payment details for your withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="3"
                max={walletBalance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Minimum $3"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: ${walletBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as "paypal" | "bank_transfer")}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="font-normal">PayPal (Automated)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="font-normal">Bank Transfer (Manual)</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "paypal" && (
              <div>
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-email@paypal.com"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Payments are processed automatically via PayPal
                </p>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <>
                <div>
                  <Label htmlFor="account-holder">Account Holder Name</Label>
                  <Input
                    id="account-holder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank of America"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routing-number">Routing Number</Label>
                    <Input
                      id="routing-number"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="XXXXXXXXX"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <GradientButton
              variant="outline"
              onClick={() => setWithdrawDialogOpen(false)}
            >
              Cancel
            </GradientButton>
            <GradientButton
              onClick={handleWithdraw}
              disabled={
                requestWithdrawal.isPending ||
                parseFloat(withdrawAmount) < 3 ||
                parseFloat(withdrawAmount) > walletBalance ||
                (paymentMethod === "paypal" && !paypalEmail) ||
                (paymentMethod === "bank_transfer" && (!bankName || !accountNumber || !accountHolder))
              }
            >
              {requestWithdrawal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay with Wallet Dialog */}
      <Dialog open={proDialogOpen} onOpenChange={setProDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Subscribe to Pro with Wallet
            </DialogTitle>
            <DialogDescription>
              Use your wallet balance to subscribe to Pro and start earning revenue from your profile views.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-display font-bold">${walletBalance.toFixed(2)}</p>
            </div>

            <div>
              <Label>Select Plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={(v) => setSelectedPlan(v as typeof selectedPlan)}
                className="mt-2 space-y-2"
              >
                {WALLET_PLANS.map((plan) => {
                  const canAfford = walletBalance >= plan.price;
                  return (
                    <div 
                      key={plan.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedPlan === plan.key 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-secondary/30"
                      } ${!canAfford ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={plan.key} 
                          id={plan.key} 
                          disabled={!canAfford}
                        />
                        <div>
                          <Label htmlFor={plan.key} className="font-medium cursor-pointer">
                            {plan.name}
                          </Label>
                          {plan.savings && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                              {plan.savings}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${plan.price}</p>
                        {!canAfford && (
                          <p className="text-xs text-red-500">Insufficient</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setProDialogOpen(false)}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handlePayWithWallet}
              disabled={!canAffordPlan || payWithWallet.isPending}
            >
              {payWithWallet.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Pay ${selectedPlanDetails?.price || 0}
                </>
              )}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WalletPage;