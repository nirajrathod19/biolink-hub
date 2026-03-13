import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowUp, ArrowDown, Eye, Trash2, Move } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { LayoutElement } from "@/hooks/useLayoutElements";

interface LayerControlsProps {
  element: LayoutElement;
  onUpdate: (updates: Partial<LayoutElement>) => void;
  onDelete: () => void;
  label?: string;
}

export const LayerControls = ({ element, onUpdate, onDelete, label }: LayerControlsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Layer Settings"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{label || "Layer Settings"}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Z-Index */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Z-Index (Layer Order)</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onUpdate({ z_index: Math.max(0, element.z_index - 1) })}
              >
                <ArrowDown className="w-3 h-3" /> Back
              </Button>
              <span className="text-xs font-mono text-muted-foreground flex-1 text-center">
                {element.z_index}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onUpdate({ z_index: element.z_index + 1 })}
              >
                <ArrowUp className="w-3 h-3" /> Front
              </Button>
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Opacity</Label>
              <span className="text-xs font-mono text-muted-foreground">{element.opacity}%</span>
            </div>
            <Slider
              value={[element.opacity]}
              onValueChange={([val]) => onUpdate({ opacity: val })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Size</Label>
              <span className="text-xs font-mono text-muted-foreground">{element.width}%</span>
            </div>
            <Slider
              value={[element.width]}
              onValueChange={([val]) => onUpdate({ width: val, height: val })}
              min={25}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          {/* Absolute Positioning Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs text-foreground">Free Position</Label>
              <p className="text-[10px] text-muted-foreground">Drag to place anywhere</p>
            </div>
            <Switch
              checked={element.is_absolute}
              onCheckedChange={(checked) => onUpdate({ is_absolute: checked })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};