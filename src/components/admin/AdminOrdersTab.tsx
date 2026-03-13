import { useState } from "react";
import { Package, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminOrders, Order } from "@/hooks/useOrders";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminOrdersTab = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
                      <Badge variant={order.payment_method === "Online" ? "default" : "secondary"}>
                        {order.payment_method || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{order.transaction_id || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "paid" ? "default" : order.status === "delivered" ? "default" : "secondary"}>
                        {order.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
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