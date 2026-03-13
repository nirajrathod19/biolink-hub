import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Send, Pin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicCreatorPosts, useSubmitComment } from "@/hooks/useCommunityFeed";
import { formatDistanceToNow } from "date-fns";
import type { BioTheme } from "@/lib/bioThemes";

interface CommunityFeedProps {
  userId: string;
  themeColor?: string;
  theme?: BioTheme;
}

export const CommunityFeed = ({ userId, themeColor = "#8B5CF6", theme }: CommunityFeedProps) => {
  const { data: posts = [], isLoading } = usePublicCreatorPosts(userId);
  const submitComment = useSubmitComment();
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");

  const accent = theme?.accent || themeColor;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 mt-8">
        <div className="h-6 w-32 rounded" style={{ background: theme ? `${accent}20` : undefined }} />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl" style={{ background: theme?.cardBg || undefined }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  const handleSubmitComment = async (postId: string) => {
    if (!commentText.trim()) return;
    await submitComment.mutateAsync({
      postId,
      content: commentText,
      visitorName: commentName || undefined,
    });
    setCommentText("");
    setCommentName("");
    setCommentingPostId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}20` }}
        >
          <MessageSquare className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h2 className="font-semibold text-lg" style={{ color: theme?.textColor }}>Updates</h2>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05, duration: 0.4 }}
            className="rounded-xl p-4"
            style={{
              background: theme?.cardBg || undefined,
              border: theme ? `1px solid ${theme.cardBorder}` : undefined,
              backdropFilter: theme?.cardBg?.includes("rgba") ? "blur(12px)" : undefined,
              color: theme?.cardText,
            }}
          >
            {/* Pinned badge */}
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-xs mb-2" style={{ color: accent }}>
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
            )}

            {/* Content */}
            <p className="text-sm whitespace-pre-wrap" style={{ color: theme?.cardText }}>{post.content}</p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: theme ? `1px solid ${theme.cardBorder}` : undefined }}>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-xs transition-colors" style={{ color: theme?.bioTextColor }}>
                  <Heart className="w-3.5 h-3.5" />
                  <span>{post.hearts_count}</span>
                </button>
                <button
                  onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: theme?.bioTextColor }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.comments_count}</span>
                </button>
              </div>
              <span className="text-xs flex items-center gap-1" style={{ color: theme?.bioTextColor }}>
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Comment Form */}
            {commentingPostId === post.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 space-y-2"
                style={{ borderTop: theme ? `1px solid ${theme.cardBorder}` : undefined }}
              >
                <Input
                  placeholder="Your name (optional)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="text-sm h-8"
                  style={{ background: theme ? `${theme.cardBg}` : undefined, color: theme?.cardText, borderColor: theme?.cardBorder }}
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="text-sm min-h-[60px] flex-1"
                    style={{ background: theme ? `${theme.cardBg}` : undefined, color: theme?.cardText, borderColor: theme?.cardBorder }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSubmitComment(post.id)}
                    disabled={!commentText.trim() || submitComment.isPending}
                    style={{ backgroundColor: accent, color: theme?.accentText }}
                    className="self-end"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs" style={{ color: theme?.bioTextColor }}>
                  Comments are reviewed before appearing publicly.
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
