import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Send, MessageCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicQA, useSubmitQuestion, QAQuestion } from "@/hooks/useQA";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { BioTheme } from "@/lib/bioThemes";

interface QABoxProps {
  creatorUserId: string;
  creatorName?: string;
  themeColor?: string;
  theme?: BioTheme;
}

const MIN_QUESTION_LENGTH = 15;
const COOLDOWN_SECONDS = 30;

export const QABox = ({ creatorUserId, creatorName, themeColor = "#8B5CF6", theme }: QABoxProps) => {
  const { data: answeredQuestions = [] } = usePublicQA(creatorUserId);
  const submitQuestion = useSubmitQuestion();
  const [showForm, setShowForm] = useState(false);
  const [showAnswered, setShowAnswered] = useState(false);
  const [question, setQuestion] = useState("");
  const [askerName, setAskerName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const accent = theme?.accent || themeColor;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", user.id)
          .single();
        if (profile) {
          setAskerName(profile.display_name || profile.username || "");
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    if (!askerName.trim()) {
      toast.error("Please enter your name to ask a question");
      return;
    }
    if (question.trim().length < MIN_QUESTION_LENGTH) {
      toast.error(`Question must be at least ${MIN_QUESTION_LENGTH} characters long`);
      return;
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before asking another question`);
      return;
    }
    try {
      await submitQuestion.mutateAsync({
        creatorUserId,
        question,
        askerName: askerName.trim(),
      });
      setQuestion("");
      setShowForm(false);
      setCooldown(COOLDOWN_SECONDS);
      toast.success("Question submitted! The creator will review it.");
    } catch {
      toast.error("Failed to submit question");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-8"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accent}20` }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: accent }} />
          </div>
          <h2 className="font-semibold text-lg" style={{ color: theme?.textColor }}>Ask Me Anything</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1 text-xs"
          style={{ borderColor: `${accent}30`, color: theme?.cardText }}
          disabled={cooldown > 0}
        >
          <MessageCircle className="w-3 h-3" />
          {cooldown > 0 ? `Wait ${cooldown}s` : "Ask"}
        </Button>
      </div>

      {/* Question Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl p-4 mb-4 space-y-3"
          style={{
            background: theme?.cardBg,
            border: theme ? `1px solid ${theme.cardBorder}` : undefined,
            backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
          }}
        >
          <div className="relative">
            <Input
              placeholder="Your name"
              value={askerName}
              onChange={(e) => setAskerName(e.target.value)}
              className="text-sm pr-8"
              disabled={isLoggedIn}
              style={{ background: theme ? `${accent}08` : undefined, color: theme?.cardText, borderColor: theme?.cardBorder }}
            />
            {isLoggedIn && (
              <ShieldCheck className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
          </div>
          {!isLoggedIn && (
            <p className="text-xs" style={{ color: theme?.bioTextColor }}>
              💡 Log in to auto-fill your name and get verified badge
            </p>
          )}
          <Textarea
            placeholder={`Ask ${creatorName || "the creator"} anything... (min ${MIN_QUESTION_LENGTH} chars)`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="text-sm min-h-[80px]"
            style={{ background: theme ? `${accent}08` : undefined, color: theme?.cardText, borderColor: theme?.cardBorder }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: theme?.bioTextColor }}>
              {question.length}/{MIN_QUESTION_LENGTH} min
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                style={{ borderColor: theme?.cardBorder, color: theme?.cardText }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1"
                style={{ backgroundColor: accent, color: theme?.accentText }}
                onClick={handleSubmit}
                disabled={!question.trim() || !askerName.trim() || question.trim().length < MIN_QUESTION_LENGTH || submitQuestion.isPending}
              >
                <Send className="w-3 h-3" />
                {submitQuestion.isPending ? "Sending..." : "Submit"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Answered Questions */}
      {answeredQuestions.length > 0 && (
        <div>
          <button
            onClick={() => setShowAnswered(!showAnswered)}
            className="flex items-center gap-1 text-sm transition-colors mb-3"
            style={{ color: theme?.bioTextColor }}
          >
            {showAnswered ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {answeredQuestions.length} answered question{answeredQuestions.length !== 1 ? "s" : ""}
          </button>

          {showAnswered && (
            <div className="space-y-3">
              {answeredQuestions.map((qa, index) => (
                <motion.div
                  key={qa.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="rounded-xl p-4"
                  style={{
                    background: theme?.cardBg,
                    border: theme ? `1px solid ${theme.cardBorder}` : undefined,
                    backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
                  }}
                >
                  <div className="mb-2">
                    <span className="text-xs font-medium" style={{ color: accent }}>
                      Q from {qa.asker_name}
                    </span>
                    <p className="text-sm font-medium mt-1" style={{ color: theme?.cardText }}>{qa.question}</p>
                  </div>
                  {qa.answer_text && (
                    <div className="pt-2" style={{ borderTop: theme ? `1px solid ${theme.cardBorder}` : undefined }}>
                      <span className="text-xs" style={{ color: theme?.bioTextColor }}>Answer</span>
                      <p className="text-sm mt-1" style={{ color: theme?.cardText }}>{qa.answer_text}</p>
                    </div>
                  )}
                  <span className="text-xs mt-2 block" style={{ color: theme?.bioTextColor }}>
                    {qa.answered_at && formatDistanceToNow(new Date(qa.answered_at), { addSuffix: true })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
