import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Wallet, Loader2, Clock, Crown, CheckCircle, XCircle, ArrowDownRight, TrendingUp, BarChart3, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWithdrawals, useRequestWithdrawal, usePayWithWallet, useTransactions } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WALLET_PLANS = [
  { key: "monthly" as const, name: "Monthly", price: 3, savings: null },
  { key: "quarterly" as const, name: "4 Months", price: 11, savings: "Save $1" },
  { key: "annual" as const, name: "Annual", price: 30, savings: "Save $6" },
];

const WalletPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawals();
  const { data: transactions = [] } = useTransactions();
  const requestWithdrawal = useRequestWithdrawal();
  const payWithWallet = usePayWithWallet();

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [proDialogOpen, setProDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank_transfer">("upi");
  // Bank Transfer
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  // UPI
  const [upiId, setUpiId] = useState("");

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
  const totalWithdrawn = profile?.total_withdrawn || 0;
  const pendingRevenue = profile?.pending_revenue || 0;
  const adsBalance = profile?.ads_balance || 0;

  // Calculate earnings from transactions
  const earningTransactions = transactions.filter(t => t.type === "earning");
  const totalEarned = earningTransactions.reduce((sum, t) => sum + t.amount, 0);
  const last7DaysEarnings = earningTransactions
    .filter(t => new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 3) return;

    let paymentDetails: any = {};

    if (paymentMethod === "upi") {
      paymentDetails.upi_id = upiId;
    } else if (paymentMethod === "bank_transfer") {
      paymentDetails = {
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
        ifsc_code: ifscCode,
      };
    }

    await requestWithdrawal.mutateAsync({
      amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
    });

    setWithdrawDialogOpen(false);
    resetWithdrawForm();
  };

  const resetWithdrawForm = () => {
    setWithdrawAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setIfscCode("");
    setUpiId("");
  };

  const handlePayWithWallet = async () => {
    await payWithWallet.mutateAsync(selectedPlan);
    setProDialogOpen(false);
  };

  const pendingWithdrawal = withdrawals.find(w => w.status === "pending" || w.status === "processing");
  const selectedPlanDetails = WALLET_PLANS.find(p => p.key === selectedPlan);
  const canAffordPlan = selectedPlanDetails && walletBalance >= selectedPlanDetails.price;

  const isWithdrawValid = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 3 || amount > walletBalance) return false;
    if (paymentMethod === "upi" && !upiId) return false;
    if (paymentMethod === "bank_transfer" && (!accountHolder || !accountNumber || !ifscCode)) return false;
    return true;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "processing":
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            Wallet
          </h1>
          <p className="text-muted-foreground">
            Your ad revenue is automatically split — 50% goes directly to your wallet.
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard gradient>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-xl md:text-2xl font-display font-bold">${walletBalance.toFixed(2)}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl md:text-2xl font-display font-bold">${pendingRevenue.toFixed(2)}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-xl md:text-2xl font-display font-bold">${totalEarned.toFixed(2)}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Withdrawn</p>
              <p className="text-xl md:text-2xl font-display font-bold">${totalWithdrawn.toFixed(2)}</p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Withdraw Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <GradientButton
            className="w-full"
            size="lg"
            disabled={walletBalance < 3 || !!pendingWithdrawal}
            onClick={() => setWithdrawDialogOpen(true)}
          >
            <Wallet className="w-5 h-5 mr-2" />
            {pendingWithdrawal
              ? pendingWithdrawal.status === "processing"
                ? "Withdrawal Under Process"
                : "Withdrawal Pending"
              : walletBalance < 3
                ? "Min. $3 to withdraw"
                : `Withdraw $${walletBalance.toFixed(2)}`
            }
          </GradientButton>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <GlassCard className="mb-6">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Earnings Summary
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Last 7 Days</p>
                <p className="text-lg font-bold">${last7DaysEarnings.toFixed(4)}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Ad Revenue</p>
                <p className="text-lg font-bold">${adsBalance.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="text-lg font-bold">{profile?.unique_clicks || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              💡 You earn $0.001 per unique profile view. Revenue is auto-credited to your wallet daily.
            </p>
          </GlassCard>
        </motion.div>

        {/* Pay with Wallet for Pro */}
        {!profile?.is_pro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <GlassCard className="mb-6 border-primary/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      Use wallet balance or reach 1,000 unique clicks
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Progress: {profile?.unique_clicks || 0} / 1,000 clicks
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

        {/* Pending Withdrawal Alert */}
        {pendingWithdrawal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <GlassCard className={`mb-6 ${pendingWithdrawal.status === "processing" ? "border-orange-500/30" : "border-yellow-500/30"}`}>
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${pendingWithdrawal.status === "processing" ? "text-orange-500" : "text-yellow-500"}`} />
                <div>
                  <h3 className={`font-display font-semibold ${pendingWithdrawal.status === "processing" ? "text-orange-500" : "text-yellow-500"}`}>
                    {pendingWithdrawal.status === "processing" ? "Withdrawal Under Process" : "Withdrawal Pending"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${pendingWithdrawal.amount.toFixed(2)} via {pendingWithdrawal.payment_method.replace("_", " ")} — {pendingWithdrawal.status === "processing" ? "being processed" : "awaiting approval"}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Withdrawal History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GlassCard>
            <h3 className="font-display font-semibold mb-4">Withdrawal History</h3>
            <div className="space-y-3">
              {withdrawalsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowDownRight className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No withdrawals yet. Once your balance reaches $3, you can request a payout.
                  </p>
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowDownRight className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {w.payment_method.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">${w.amount.toFixed(2)}</p>
                      {getStatusBadge(w.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method and enter your details.
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
                onValueChange={(v) => setPaymentMethod(v as any)}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/30">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="font-normal flex items-center gap-2 cursor-pointer flex-1">
                    <span>🇮🇳</span> UPI
                    <Badge variant="outline" className="ml-auto text-xs">Instant via Razorpay</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/30">
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="font-normal flex items-center gap-2 cursor-pointer flex-1">
                    <span>🏦</span> Bank Transfer (NEFT/IMPS)
                    <Badge variant="outline" className="ml-auto text-xs">1-2 days</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* UPI fields */}
            {paymentMethod === "upi" && (
              <div>
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi or 9876543210@paytm"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Payouts processed via Razorpay X — works with Google Pay, PhonePe, Paytm
                </p>
              </div>
            )}

            {/* Bank Transfer fields */}
            {paymentMethod === "bank_transfer" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="account-holder">Account Holder Name</Label>
                  <Input
                    id="account-holder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="As on bank passbook"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="State Bank of India"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Your bank account number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc-code">IFSC Code</Label>
                  <Input
                    id="ifsc-code"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                    className="mt-1"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Payouts via Razorpay X NEFT/IMPS. Typically processed within 1-2 business days.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setWithdrawDialogOpen(false)}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleWithdraw}
              disabled={requestWithdrawal.isPending || !isWithdrawValid()}
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