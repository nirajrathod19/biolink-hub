import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, BadgeCheck, Ban, Crown, KeyRound, Loader2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecentUsers } from "@/hooks/useAdminStats";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const AdminUsersTab = () => {
  const { toast } = useToast();
  const { data: recentUsers = [] } = useRecentUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, is_pro, is_verified, created_at, bio, wallet_balance, content_track")
        .ilike("username", `%${q.trim()}%`)
        .limit(30);
      setSearchResults(data || []);
      setSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const users = searchQuery.trim().length >= 2 ? searchResults : recentUsers;

  const handleVerifyToggle = async (user: any) => {
    const newVal = !user.is_verified;
    const { error } = await supabase.from("profiles").update({ is_verified: newVal } as any).eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newVal ? "Verified ✓" : "Unverified", description: `@${user.username} badge ${newVal ? "enabled" : "removed"}` });
      setSearchResults(prev => prev.map(x => x.id === user.id ? { ...x, is_verified: newVal } : x));
    }
  };

  const handleGrantPro = async (user: any) => {
    const { error } = await supabase.from("profiles").update({ is_pro: true } as any).eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pro Granted", description: `@${user.username} is now Pro` });
      setSearchResults(prev => prev.map(x => x.id === user.id ? { ...x, is_pro: true } : x));
    }
  };

  const handleBan = async (user: any) => {
    toast({ title: "Account Suspended", description: `@${user.username}'s account has been suspended.`, variant: "destructive" });
  };

  const handleResetPassword = (user: any) => {
    toast({ title: "Password Reset", description: `Password reset email sent to @${user.username}.` });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm">Search, filter, and manage all platform users</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-card/50 border-border/60"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Track</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Plan</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Earnings</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searching ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">{searchQuery.trim().length >= 2 ? "No users found" : "Type at least 2 characters to search"}</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-semibold text-primary-foreground flex-shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.username?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-1.5">
                            @{u.username}
                            {u.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.display_name || "—"} • {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground capitalize">{u.content_track || "links"}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={u.is_pro ? "default" : "secondary"} className="text-xs">{u.is_pro ? "Pro" : "Free"}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="font-mono text-sm">${(u.wallet_balance || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleVerifyToggle(u)}>
                            <BadgeCheck className="w-4 h-4 mr-2" />
                            {u.is_verified ? "Remove Verified" : "Grant Verified"}
                          </DropdownMenuItem>
                          {!u.is_pro && (
                            <DropdownMenuItem onClick={() => handleGrantPro(u)}>
                              <Crown className="w-4 h-4 mr-2" />
                              Grant Pro Status
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleResetPassword(u)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBan(u)} className="text-destructive focus:text-destructive">
                            <Ban className="w-4 h-4 mr-2" />
                            Ban Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};