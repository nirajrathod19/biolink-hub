import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2, Palette, Search, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ToolId = "bio" | "link" | "theme" | "seo";

const TOOLS: { id: ToolId; icon: any; title: string; subtitle: string; accent: string }[] = [
  { id: "bio", icon: Sparkles, title: "Smart Bio", subtitle: "Name, profession, niche → polished bio + headline + CTA.", accent: "from-violet-500 to-fuchsia-500" },
  { id: "link", icon: Wand2, title: "Link Description", subtitle: "Turn a title into a benefit-led description with variants.", accent: "from-sky-500 to-cyan-400" },
  { id: "theme", icon: Palette, title: "Theme Generator", subtitle: "Describe a vibe → palette, fonts, gradient, button style.", accent: "from-amber-500 to-rose-500" },
  { id: "seo", icon: Search, title: "SEO Generator", subtitle: "Auto meta title, description, OG tags + schema.", accent: "from-emerald-500 to-teal-500" },
];

const AIStudioPage = () => {
  const { toast } = useToast();
  const [active, setActive] = useState<ToolId>("bio");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // shared inputs
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [niche, setNiche] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkContext, setLinkContext] = useState("");
  const [vibe, setVibe] = useState("");
  const [seoBio, setSeoBio] = useState("");

  const run = async () => {
    setLoading(true);
    setResult(null);
    let input: any = {};
    if (active === "bio") input = { name, profession, niche };
    if (active === "link") input = { title: linkTitle, context: linkContext };
    if (active === "theme") input = { vibe };
    if (active === "seo") input = { name, niche, bio: seoBio };

    const { data, error } = await supabase.functions.invoke("ai-studio", {
      body: { tool: active, input },
    });
    setLoading(false);
    if (error || data?.error) {
      toast({ title: "Generation failed", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    setResult(data.result);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> AI Studio · Beta
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Build your page with AI.
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Four focused tools to write, design, and rank your Brioo page in seconds. More coming.
          </p>
        </div>

        {/* Tool tabs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOOLS.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => { setActive(t.id); setResult(null); }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                  isActive
                    ? "border-primary/40 bg-card shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.4)]"
                    : "border-border/60 bg-card/40 hover:border-border hover:bg-card/70"
                )}
              >
                <div className={cn("mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white", t.accent)}>
                  <t.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Workspace */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <GlassCard className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">Inputs</div>

            {active === "bio" && (
              <>
                <Field label="Your name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Niraj Rathod" /></Field>
                <Field label="Profession"><Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Fitness coach" /></Field>
                <Field label="Niche"><Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Fat loss for busy professionals" /></Field>
              </>
            )}
            {active === "link" && (
              <>
                <Field label="Link title"><Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="My 12-week program" /></Field>
                <Field label="Context (optional)"><Textarea value={linkContext} onChange={(e) => setLinkContext(e.target.value)} placeholder="What the offer includes, who it's for…" rows={4} /></Field>
              </>
            )}
            {active === "theme" && (
              <Field label="Describe the vibe"><Textarea value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="Premium dark fitness coach, electric green accents" rows={5} /></Field>
            )}
            {active === "seo" && (
              <>
                <Field label="Your name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label="Niche"><Input value={niche} onChange={(e) => setNiche(e.target.value)} /></Field>
                <Field label="Bio"><Textarea value={seoBio} onChange={(e) => setSeoBio(e.target.value)} rows={4} /></Field>
              </>
            )}

            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate</>}
            </Button>
          </GlassCard>

          <GlassCard className="relative min-h-[280px]">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Result</div>
              {result && (
                <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1 text-xs hover:bg-foreground/5">
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />} Copy JSON
                </button>
              )}
            </div>
            {!result && !loading && (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Sparkles className="mb-3 h-6 w-6 opacity-50" />
                Run a tool to see the output here.
              </div>
            )}
            {loading && (
              <div className="flex h-full min-h-[240px] items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {result && (
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-background/60 p-4 text-xs leading-relaxed text-foreground/90">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default AIStudioPage;
