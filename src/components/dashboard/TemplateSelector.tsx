import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

// FIX: Define types to avoid 'any'
interface TemplateConfig {
  background?: string;
  cardBackground?: string;
  textColor?: string;
  buttonColor?: string;
  font?: string;
  [key: string]: string | undefined;
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  config: TemplateConfig;
}

interface DbTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  config: unknown; // JSON from DB
  is_active: boolean | null;
  created_at: string;
}

export const TemplateSelector = () => {
  const { data: profile, refetch } = useProfile();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // FIX: Cast data safely instead of using 'any'
      const formattedData: Template[] = (data as unknown as DbTemplate[] || []).map((item) => {
        const safeConfig = (typeof item.config === 'object' && item.config !== null) 
          ? (item.config as TemplateConfig) 
          : {};
          
        return {
          id: item.id,
          name: item.name,
          description: item.description || "",
          preview_image: item.preview_image || "",
          config: safeConfig
        };
      });

      setTemplates(formattedData);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (template: Template) => {
    try {
      setApplying(template.id);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          template: template.id, 
          theme_color: template.config.buttonColor || "#000000" 
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast.success(`Applied ${template.name} template!`);
      refetch();
    } catch (error) {
      toast.error("Failed to apply template");
      console.error(error);
    } finally {
      setApplying("");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Professional Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose a pre-designed look for your page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isActive = profile?.template === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                isActive ? "ring-2 ring-primary border-primary" : ""
              }`}
              onClick={() => applyTemplate(template)}
            >
              <div className="aspect-video relative bg-muted">
                {template.preview_image ? (
                  <img 
                    src={template.preview_image} 
                    alt={template.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    <Sparkles className="text-muted-foreground" />
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" />
                    Active
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold">{template.name}</h4>
                  {applying === template.id && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};