import { useState } from "react";
import { Package, Search, Filter, Check, Truck, MessageCircle, PackageCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminOrders, Order } from "@/hooks/useOrders";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export const AdminOrdersTab = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.customer_name.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q) || o.customer_phone.includes(q) || o.transaction_id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatItems = (items: any) => {
    if (Array.isArray(items)) return items.map((i: any) => `${i.title} x${i.quantity || 1}`).join(", ");
    return JSON.stringify(items);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
      return false;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`Order ${newStatus}`);
    return true;
  };

  const sendWhatsAppToBuyer = (order: Order, messageType: "accept" | "dispatch") => {
    const products = formatItems(order.items);
    const name = order.customer_name;
    let msg = "";
    if (messageType === "accept") {
      msg = `Hi ${name}, your order for ${products} is accepted and is being packed! 🎁\n\nThank you for shopping on Brioo!`;
    } else {
      msg = `Great news ${name}! Your order ${products} has been dispatched and is on its way. 🚚\n\nThank you for shopping on Brioo!`;
    }
    const cleanPhone = order.customer_phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleAccept = async (order: Order) => {
    const ok = await updateStatus(order.id, "confirmed");
    if (ok) sendWhatsAppToBuyer(order, "accept");
  };

  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);

  const handleMarkPacked = async (order: Order) => {
    setPackingOrderId(order.id);
    try {
      const { data, error } = await supabase.functions.invoke("mark-order-packed", {
        body: { orderId: order.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Order packed! AWB: ${data?.awb || "N/A"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to mark as packed");
    } finally {
      setPackingOrderId(null);
    }
  };

  const handleDispatch = async (order: Order) => {
    const ok = await updateStatus(order.id, "shipped");
    if (ok) sendWhatsAppToBuyer(order, "dispatch");
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case "paid": return "default";
      case "confirmed": return "default";
      case "shipped": return "secondary";
      case "delivered": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Orders
        </h1>
        <p className="text-muted-foreground text-sm">All store orders across creators</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone, txn ID..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlassCard>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-secondary/50 rounded" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{formatItems(order.items)}</TableCell>
                    <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                    <TableCell>
                      <Badge variant={order.payment_method === "online" ? "default" : "secondary"}>
                        {order.payment_method || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{order.transaction_id || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(order.status)}>
                        {order.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(order.status === "pending" || order.status === "paid") && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAccept(order)}>
                            <Check className="w-3 h-3" /> Accept
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleMarkPacked(order)} disabled={packingOrderId === order.id}>
                            {packingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <PackageCheck className="w-3 h-3" />} Pack
                          </Button>
                        )}
                        {order.status === "packed" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDispatch(order)}>
                            <Truck className="w-3 h-3" /> Dispatch
                          </Button>
                        )}
                        {order.customer_phone && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`, "_blank")}>
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};