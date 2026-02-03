import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUpdateLinkSchedule, LinkAnimation } from "@/hooks/useLinkScheduling";
import { toast } from "sonner";

interface LinkScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  link: {
    id: string;
    title: string;
    scheduled_start?: string | null;
    scheduled_end?: string | null;
    animation?: string | null;
    is_highlighted?: boolean;
  };
}

const animations: { value: LinkAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: '💓 Pulse' },
  { value: 'bounce', label: '⬆️ Bounce' },
  { value: 'shake', label: '📳 Shake' },
  { value: 'glow', label: '✨ Glow' },
];

export const LinkScheduleDialog = ({ isOpen, onClose, link }: LinkScheduleDialogProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    link.scheduled_start ? new Date(link.scheduled_start) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    link.scheduled_end ? new Date(link.scheduled_end) : undefined
  );
  const [animation, setAnimation] = useState<LinkAnimation>(
    (link.animation as LinkAnimation) || 'none'
  );
  const [isHighlighted, setIsHighlighted] = useState(link.is_highlighted || false);

  const updateSchedule = useUpdateLinkSchedule();

  const handleSave = async () => {
    try {
      await updateSchedule.mutateAsync({
        id: link.id,
        scheduled_start: startDate?.toISOString() || null,
        scheduled_end: endDate?.toISOString() || null,
        animation: animation === 'none' ? null : animation,
        is_highlighted: isHighlighted,
      });
      toast.success("Link schedule updated!");
      onClose();
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const handleClearSchedule = async () => {
    setStartDate(undefined);
    setEndDate(undefined);
    try {
      await updateSchedule.mutateAsync({
        id: link.id,
        scheduled_start: null,
        scheduled_end: null,
        animation: null,
        is_highlighted: false,
      });
      toast.success("Schedule cleared!");
      onClose();
    } catch (error) {
      toast.error("Failed to clear schedule");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule & Animate
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Link Title */}
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Link</p>
            <p className="font-medium truncate">{link.title}</p>
          </div>

          {/* Schedule Start */}
          <div className="space-y-2">
            <Label>Start Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Schedule End */}
          <div className="space-y-2">
            <Label>End Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Animation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Animation Effect
            </Label>
            <Select value={animation} onValueChange={(v) => setAnimation(v as LinkAnimation)}>
              <SelectTrigger>
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                {animations.map((anim) => (
                  <SelectItem key={anim.value} value={anim.value}>
                    {anim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Highlight */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Highlight Link</Label>
              <p className="text-xs text-muted-foreground">
                Add a special border to draw attention
              </p>
            </div>
            <Switch
              checked={isHighlighted}
              onCheckedChange={setIsHighlighted}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearSchedule}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={updateSchedule.isPending}
          >
            {updateSchedule.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
