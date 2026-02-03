import { useSecurityStats } from "@/hooks/useSecurity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, Lock, Activity, Globe } from "lucide-react";
import { format } from "date-fns";

export const SecurityDashboard = () => {
  const { data: stats, isLoading, error } = useSecurityStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load security statistics
      </div>
    );
  }

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes("FAILED") || eventType.includes("LOCKED")) return "destructive";
    if (eventType.includes("WARNING")) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Security Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Failed Logins (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {stats?.failed_attempts_24h || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              Locked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats?.locked_accounts || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              Flagged IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {stats?.flagged_ips?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged IPs */}
      {stats?.flagged_ips && stats.flagged_ips.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              Suspicious IP Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.flagged_ips.map((ip) => (
                <div
                  key={ip.ip}
                  className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                >
                  <code className="text-sm font-mono">{ip.ip}</code>
                  <Badge variant="destructive">
                    {ip.attempts} failed attempts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_events && stats.recent_events.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.recent_events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getEventBadgeVariant(event.event_type)}>
                        {event.event_type}
                      </Badge>
                      {!event.success && (
                        <Badge variant="outline" className="text-destructive border-destructive/30">
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.ip_address && (
                        <span className="font-mono mr-2">IP: {event.ip_address}</span>
                      )}
                      {event.user_id && (
                        <span className="mr-2">User: {event.user_id.slice(0, 8)}...</span>
                      )}
                    </div>
                    {event.event_data && Object.keys(event.event_data).length > 0 && (
                      <pre className="text-xs text-muted-foreground bg-background/50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(event.event_data, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.created_at), "MMM d, HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent security events
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
