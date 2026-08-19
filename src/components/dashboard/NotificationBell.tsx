import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";

export const NotificationBell = ({ className }: { className?: string }) => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className={cn(
            "relative p-2 rounded-lg hover:bg-secondary transition-colors",
            className
          )}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={() => markRead.mutate(undefined)}
              disabled={markRead.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              You're all caught up.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    className={cn(
                      "w-full text-left px-3 py-2.5 hover:bg-secondary/60 transition-colors",
                      !n.is_read && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!n.is_read) markRead.mutate([n.id]);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
