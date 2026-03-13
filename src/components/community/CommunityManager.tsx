import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Plus, Trash2, Pin, PinOff, 
  CheckCircle, XCircle, HelpCircle, Send 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreatorPosts,
  useCreatePost,
  useDeletePost,
  useTogglePin,
  useManageComments,
} from "@/hooks/useCommunityFeed";
import {
  useCreatorQuestions,
  useAnswerQuestion,
  useDeleteQuestion,
} from "@/hooks/useQA";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const CommunityManager = () => {
  const { data: posts = [], isLoading: postsLoading } = useCreatorPosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const togglePin = useTogglePin();
  const { data: questions = [], isLoading: questionsLoading } = useCreatorQuestions();
  const answerQuestion = useAnswerQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [newPostContent, setNewPostContent] = useState("");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      await createPost.mutateAsync(newPostContent);
      setNewPostContent("");
      toast.success("Update posted!");
    } catch {
      toast.error("Failed to post update");
    }
  };

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    try {
      await answerQuestion.mutateAsync({ id, answer_text: answerText, is_public: true });
      setAnsweringId(null);
      setAnswerText("");
      toast.success("Answer published!");
    } catch {
      toast.error("Failed to publish answer");
    }
  };

  const unansweredQuestions = questions.filter((q) => !q.is_answered);
  const answeredQuestions = questions.filter((q) => q.is_answered);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Community</CardTitle>
            <CardDescription>Manage your feed updates and Q&A</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Feed ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Q&A ({unansweredQuestions.length} new)
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4 mt-4">
            {/* New Post */}
            <div className="space-y-2">
              <Textarea
                placeholder="Share an update with your audience..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || createPost.isPending}
                className="gap-1"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {createPost.isPending ? "Posting..." : "Post Update"}
              </Button>
            </div>

            {/* Posts List */}
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  {post.is_pinned && (
                    <Badge variant="secondary" className="mb-2 text-xs">📌 Pinned</Badge>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>❤️ {post.hearts_count}</span>
                      <span>💬 {post.comments_count}</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => togglePin.mutate({ id: post.id, is_pinned: !post.is_pinned })}
                      >
                        {post.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deletePost.mutate(post.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {posts.length === 0 && !postsLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No updates yet. Post your first one!</p>
              </div>
            )}
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-4 mt-4">
            {/* Unanswered Questions */}
            {unansweredQuestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">
                  New Questions ({unansweredQuestions.length})
                </h3>
                <div className="space-y-3">
                  {unansweredQuestions.map((q) => (
                    <div key={q.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            From {q.asker_name} • {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                          </span>
                          <p className="text-sm font-medium mt-1">{q.question}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => deleteQuestion.mutate(q.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>

                      {answeringId === q.id ? (
                        <div className="space-y-2 mt-3">
                          <Textarea
                            placeholder="Write your answer..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAnswer(q.id)}
                              disabled={!answerText.trim() || answerQuestion.isPending}
                              className="gap-1"
                            >
                              <Send className="w-3 h-3" />
                              {answerQuestion.isPending ? "Publishing..." : "Publish Answer"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1"
                          onClick={() => setAnsweringId(q.id)}
                        >
                          <Send className="w-3 h-3" />
                          Answer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answered Questions */}
            {answeredQuestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Answered ({answeredQuestions.length})
                </h3>
                <div className="space-y-3">
                  {answeredQuestions.map((q) => (
                    <div key={q.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 opacity-75">
                      <span className="text-xs text-muted-foreground">
                        From {q.asker_name}
                      </span>
                      <p className="text-sm mt-1">{q.question}</p>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">{q.answer_text}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={q.is_public ? "default" : "secondary"} className="text-xs">
                          {q.is_public ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.length === 0 && !questionsLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No questions yet. Visitors can ask from your bio page.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
