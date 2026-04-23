import { useState } from "react";
import { Loader2, PlayCircle, CheckCircle2, XCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type CheckStatus = "idle" | "running" | "pass" | "fail";

interface CheckResult {
  name: string;
  status: CheckStatus;
  detail?: string;
  payload?: unknown;
  expected?: string;
}

const initialChecks: CheckResult[] = [
  { name: "create-tip-order · rejects missing fields", status: "idle", expected: "HTTP 500 + 'Invalid creator or amount'" },
  { name: "create-tip-order · rejects oversized amount", status: "idle", expected: "HTTP 500 + 'Amount too large'" },
  { name: "create-tip-order · creates pending tip + Razorpay order", status: "idle", expected: "order_id, tip_id, key_id returned" },
  { name: "verify-tip-payment · rejects missing payment fields", status: "idle", expected: "HTTP 500 + 'Missing payment fields'" },
  { name: "verify-tip-payment · rejects invalid signature", status: "idle", expected: "HTTP 500 + 'Invalid signature' or 'Tip not found'" },
  { name: "send-digital-file · rejects missing required fields", status: "idle", expected: "HTTP 400/500 + 'Missing required fields'" },
  { name: "send-digital-file · rejects unknown product", status: "idle", expected: "HTTP 404/500 + 'Product not available'" },
  { name: "DB · tip_transactions table reachable", status: "idle", expected: "Returns row count" },
  { name: "DB · leads table reachable", status: "idle", expected: "Returns row count" },
  { name: "DB · digital_products has upsell_product_ids column", status: "idle", expected: "Column query succeeds" },
  { name: "DB · profiles has video_background_url column", status: "idle", expected: "Column query succeeds" },
];

const StatusPill = ({ status }: { status: CheckStatus }) => {
  if (status === "pass")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Pass
      </Badge>
    );
  if (status === "fail")
    return (
      <Badge className="bg-destructive/15 text-destructive border border-destructive/30 gap-1">
        <XCircle className="w-3 h-3" /> Fail
      </Badge>
    );
  if (status === "running")
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Running
      </Badge>
    );
  return <Badge variant="outline">Idle</Badge>;
};

export const AdminDebugTab = () => {
  const [creatorId, setCreatorId] = useState("");
  const [results, setResults] = useState<CheckResult[]>(initialChecks);
  const [running, setRunning] = useState(false);

  const update = (idx: number, patch: Partial<CheckResult>) =>
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const safeInvoke = async (fn: string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    return { data, error };
  };

  const runAll = async () => {
    setRunning(true);
    setResults(initialChecks.map((c) => ({ ...c, status: "running", detail: undefined, payload: undefined })));

    // ---- create-tip-order ----
    try {
      update(0, { status: "running" });
      const r = await safeInvoke("create-tip-order", {});
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /invalid creator|amount/i.test(errText + JSON.stringify(r.data || {}));
      update(0, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data), payload: r.data ?? r.error });
    } catch (e: any) {
      update(0, { status: "fail", detail: e.message });
    }

    try {
      update(1, { status: "running" });
      const r = await safeInvoke("create-tip-order", {
        creator_id: creatorId || "00000000-0000-0000-0000-000000000000",
        amount: 999999,
      });
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /too large|invalid/i.test(errText);
      update(1, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data) });
    } catch (e: any) {
      update(1, { status: "fail", detail: e.message });
    }

    if (creatorId) {
      try {
        update(2, { status: "running" });
        const r = await safeInvoke("create-tip-order", {
          creator_id: creatorId,
          amount: 1,
          supporter_name: "Admin Debug",
          message: "test",
        });
        const ok = !r.error && r.data?.order_id && r.data?.tip_id;
        update(2, { status: ok ? "pass" : "fail", detail: r.error?.message || `order_id=${r.data?.order_id}`, payload: r.data });
      } catch (e: any) {
        update(2, { status: "fail", detail: e.message });
      }
    } else {
      update(2, { status: "fail", detail: "Provide a real creator_id to run this live check" });
    }

    // ---- verify-tip-payment ----
    try {
      update(3, { status: "running" });
      const r = await safeInvoke("verify-tip-payment", {});
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /missing payment fields/i.test(errText);
      update(3, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data) });
    } catch (e: any) {
      update(3, { status: "fail", detail: e.message });
    }

    try {
      update(4, { status: "running" });
      const r = await safeInvoke("verify-tip-payment", {
        razorpay_order_id: "order_fake",
        razorpay_payment_id: "pay_fake",
        razorpay_signature: "deadbeef",
        tip_id: "00000000-0000-0000-0000-000000000000",
      });
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /(invalid signature|tip not found)/i.test(errText);
      update(4, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data) });
    } catch (e: any) {
      update(4, { status: "fail", detail: e.message });
    }

    // ---- send-digital-file ----
    try {
      update(5, { status: "running" });
      const r = await safeInvoke("send-digital-file", {});
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /missing required fields/i.test(errText);
      update(5, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data) });
    } catch (e: any) {
      update(5, { status: "fail", detail: e.message });
    }

    try {
      update(6, { status: "running" });
      const r = await safeInvoke("send-digital-file", {
        creator_id: creatorId || "00000000-0000-0000-0000-000000000000",
        email: "debug@example.com",
        product_id: "00000000-0000-0000-0000-000000000000",
      });
      const errText = r.error?.message || "";
      const isExpected = !!r.error && /(product not available|not found)/i.test(errText);
      update(6, { status: isExpected ? "pass" : "fail", detail: errText || JSON.stringify(r.data) });
    } catch (e: any) {
      update(6, { status: "fail", detail: e.message });
    }

    // ---- DB sanity checks ----
    try {
      update(7, { status: "running" });
      const { count, error } = await supabase
        .from("tip_transactions")
        .select("*", { count: "exact", head: true });
      update(7, { status: error ? "fail" : "pass", detail: error?.message || `rows: ${count ?? 0}` });
    } catch (e: any) {
      update(7, { status: "fail", detail: e.message });
    }

    try {
      update(8, { status: "running" });
      const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
      update(8, { status: error ? "fail" : "pass", detail: error?.message || `rows: ${count ?? 0}` });
    } catch (e: any) {
      update(8, { status: "fail", detail: e.message });
    }

    try {
      update(9, { status: "running" });
      const { error } = await supabase.from("digital_products").select("id, upsell_product_ids").limit(1);
      update(9, { status: error ? "fail" : "pass", detail: error?.message || "column accessible" });
    } catch (e: any) {
      update(9, { status: "fail", detail: e.message });
    }

    try {
      update(10, { status: "running" });
      const { error } = await supabase
        .from("profiles")
        .select("id, video_background_url, video_overlay_opacity")
        .limit(1);
      update(10, { status: error ? "fail" : "pass", detail: error?.message || "columns accessible" });
    } catch (e: any) {
      update(10, { status: "fail", detail: e.message });
    }

    setRunning(false);
  };

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Bug className="w-6 h-6 text-primary" /> Edge Function Debug
        </h1>
        <p className="text-muted-foreground text-sm">
          Live verification for <code className="px-1.5 py-0.5 rounded bg-muted text-xs">create-tip-order</code>,{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">verify-tip-payment</code>, and{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">send-digital-file</code>.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="creator-id">Creator user_id (optional, enables live order check)</Label>
            <Input
              id="creator-id"
              placeholder="uuid of a real creator profile"
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
            />
          </div>
          <Button onClick={runAll} disabled={running} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {running ? "Running…" : "Run all checks"}
          </Button>
        </div>

        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            {passCount} passing
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            {failCount} failing
          </Badge>
          <Badge variant="outline">{results.length} total</Badge>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{r.name}</p>
                {r.expected && <p className="text-[11px] text-muted-foreground mt-0.5">Expected: {r.expected}</p>}
                {r.detail && (
                  <p
                    className={`text-xs mt-1.5 break-all ${
                      r.status === "fail" ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {r.detail}
                  </p>
                )}
                {r.payload != null && (
                  <pre className="mt-2 text-[10px] bg-muted/40 p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(r.payload, null, 2)}
                  </pre>
                )}
              </div>
              <StatusPill status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
