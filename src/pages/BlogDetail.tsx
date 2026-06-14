import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Heart, Bookmark, Share2, Download, AlertTriangle, MessageSquare, Send, Clock, UserPlus, UserCheck, ChevronLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    blogs,
    users,
    comments,
    bookmarks,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    isFollowing,
    addComment,
    toggleLikeComment,
    editComment,
    deleteComment,
    submitReport,
    updateBlog,
  } = useApp();

  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Report dialog form state
  const [reportReason, setReportReason] = useState("Spam/Low Quality");
  const [reportDetails, setReportDetails] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const blog = blogs.find((b) => b.id === id);

  // Bump views count once when component mounts
  useEffect(() => {
    if (blog) {
      updateBlog(blog.id, { views: blog.views + 1 });
    }
  }, [id]);
  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Story Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            The blog post you are trying to view does not exist or has been deleted by the author.
          </p>
          <Button onClick={() => navigate("/")} className="rounded-full">
            Back to Explore
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const author = users.find((u) => u.id === blog.authorId);
  const following = author ? isFollowing(author.id) : false;
  const isLiked = currentUser ? blog.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser
    ? bookmarks.some((b) => b.userId === currentUser.id && b.blogId === blog.id)
    : false;

  const blogComments = comments.filter((c) => c.blogId === blog.id);
  const parentComments = blogComments.filter((c) => c.parentId === null);

  const getReplies = (commentId: string) => {
    return blogComments.filter((c) => c.parentId === commentId);
  };

  const getCommenter = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = () => {
    if (!currentUser) {
      toast.error("Please log in to download this content.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    window.print();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    addComment(blog.id, newCommentContent, null);
    setNewCommentContent("");
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    addComment(blog.id, replyContent, parentId);
    setReplyContent("");
    setReplyTargetId(null);
  };

  const handleReportSubmit = () => {
    if (!reportDetails.trim()) {
      toast.error("Please add additional details for the report.");
      return;
    }
    submitReport(blog.id, null, reportReason, reportDetails);
    setReportDetails("");
    setReportOpen(false);
  };

  const formattedDate = blog.publishedDate
    ? new Date(blog.publishedDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(blog.createdDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-left">
      <Navbar />

      <main className="flex-1 container max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <article className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full font-medium">
                {blog.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {blog.readingTime} min read
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] font-sans">
              {blog.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-sans">
              {blog.subtitle}
            </p>

            {/* Author layout */}
            {author && (
              <div className="flex items-center justify-between gap-4 pt-4 border-b pb-6">
                <div className="flex items-center gap-3">
                  {author && (
                    <Link to={`/profile?id=${author.id}`}>
                      <Avatar className="h-11 w-11 border hover:scale-105 transition-transform duration-200">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      {author && (
                        <Link to={`/profile?id=${author.id}`} className="hover:text-primary hover:underline font-semibold text-sm transition-colors duration-200">
                          {author.name}
                        </Link>
                      )}
                      {currentUser?.id !== author?.id && author && (
                        <button
                          onClick={() => toggleFollow(author.id)}
                          className={`text-xs font-semibold ${
                            following ? "text-muted-foreground hover:text-red-500" : "text-primary hover:underline"
                          }`}
                        >
                          {following ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Published on {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(blog.id)}
                    className={`flex items-center gap-1 p-2 rounded-full hover:bg-muted active:scale-75 transition-all ${
                      isLiked ? "text-red-500 bg-red-500/5" : "text-muted-foreground"
                    }`}
                    aria-label="Like story"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                    <span className="text-xs font-medium">{blog.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleBookmark(blog.id)}
                    className={`p-2 rounded-full hover:bg-muted active:scale-75 transition-all ${
                      isBookmarked ? "text-primary bg-primary/5" : "text-muted-foreground"
                    }`}
                    aria-label="Bookmark story"
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-muted active:scale-75 text-muted-foreground transition-all"
                    aria-label="Share story"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-full hover:bg-muted active:scale-75 text-muted-foreground transition-all"
                    aria-label="Download as PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {/* Report dialog */}
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all hover:text-red-500" aria-label="Report story">
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md text-left">
                      <DialogHeader>
                        <DialogTitle>Report Story</DialogTitle>
                        <DialogDescription>
                          Let us know why this content violates the platform guidelines.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="reason">Reason</Label>
                          <select
                            id="reason"
                            className="w-full h-10 px-3 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          >
                            <option>Spam/Low Quality</option>
                            <option>Copyright Violation</option>
                            <option>Harassment/Hate Speech</option>
                            <option>Misinformation</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="details">Additional Details</Label>
                          <Textarea
                            id="details"
                            placeholder="Explain why you are reporting this post..."
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                        <Button onClick={handleReportSubmit} className="bg-red-500 hover:bg-red-600 text-white">Submit Report</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>

          {/* Print Styles Dynamic Block */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              nav, footer, button, .no-print, [role="dialog"], header, .no-print-custom {
                display: none !important;
              }
              .print-container {
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `}} />

          {/* Cover Image */}
          <div className="overflow-hidden rounded-2xl border shadow-sm aspect-[16/9] bg-muted relative">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* HTML Article Body */}
          <div
            className="prose prose-inkspire dark:prose-invert max-w-none pt-4 focus-visible:outline-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-b pb-8">
            {blog.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Author Bio Footer Widget */}
          {author && (
            <div className="p-6 border rounded-2xl bg-muted/20 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Link to={`/profile?id=${author.id}`}>
                <Avatar className="h-16 w-16 border hover:scale-105 transition-transform duration-200">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <Link to={`/profile?id=${author.id}`} className="hover:text-primary hover:underline transition-colors duration-200 block">
                      <h3 className="font-bold text-base">{author.name}</h3>
                    </Link>
                    <Link to={`/profile?id=${author.id}`} className="hover:text-primary transition-colors duration-200 block">
                      <p className="text-xs text-muted-foreground">@{author.username}</p>
                    </Link>
                  </div>
                  {currentUser?.id !== author.id && (
                    <Button
                      variant={following ? "outline" : "default"}
                      size="sm"
                      className="rounded-full h-8"
                      onClick={() => toggleFollow(author.id)}
                    >
                      {following ? <UserCheck className="mr-1 h-3.5 w-3.5" /> : <UserPlus className="mr-1 h-3.5 w-3.5" />}
                      {following ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {author.bio || "Writer on Inkspire publishing platform."}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold pt-1 justify-center sm:justify-start">
                  <span>{author.followersCount} Followers</span>
                  <span>•</span>
                  <span>{author.followingCount} Following</span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Discussion ({blogComments.length})
            </h3>

            {/* New Comment Textbox */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <Textarea
                  placeholder="Share your thoughts on this story..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="bg-muted/30 border-border"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="rounded-full px-5 font-semibold">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Comment
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center bg-muted/10">
                <p className="text-sm text-muted-foreground">
                  Please{" "}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    sign in
                  </Link>{" "}
                  to share your thoughts in the comments.
                </p>
              </div>
            )}

            {/* Comments Lists */}
            <div className="space-y-6 pt-4">
              {parentComments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                parentComments.map((comment) => {
                  const commenter = getCommenter(comment.userId);
                  const commentReplies = getReplies(comment.id);
                  const isCommentLiked = currentUser ? comment.likes.includes(currentUser.id) : false;

                  return (
                    <div key={comment.id} className="space-y-4 border-b pb-6 last:border-none">
                      {/* Comment Header */}
                      <div className="flex items-start gap-3">
                        {commenter?.id ? (
                          <Link to={`/profile?id=${commenter.id}`}>
                            <Avatar className="h-8 w-8 border hover:scale-105 transition-transform duration-200">
                              <AvatarImage src={commenter.avatar} alt={commenter.name} />
                              <AvatarFallback>{commenter.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </Link>
                        ) : (
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={commenter?.avatar} alt={commenter?.name} />
                            <AvatarFallback>{commenter?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {commenter?.id ? (
                              <Link to={`/profile?id=${commenter.id}`} className="font-semibold text-xs hover:text-primary hover:underline transition-colors duration-200">
                                {commenter.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-xs">{commenter?.name}</span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2 pt-1">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                rows={2}
                                className="text-sm bg-background"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingCommentId(null)}
                                  className="h-7 rounded-full text-xs"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (editingContent.trim()) {
                                      editComment(comment.id, editingContent);
                                      setEditingCommentId(null);
                                    }
                                  }}
                                  className="h-7 rounded-full text-xs"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-foreground/90">
                              {comment.content}
                            </p>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center gap-4 pt-1 text-[11px] font-medium text-muted-foreground">
                            <button
                              onClick={() => toggleLikeComment(comment.id)}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                isCommentLiked ? "text-red-500" : ""
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${isCommentLiked ? "fill-red-500" : ""}`} />
                              <span>{comment.likes.length}</span>
                            </button>
                            <button
                              onClick={() =>
                                setReplyTargetId(replyTargetId === comment.id ? null : comment.id)
                              }
                              className="hover:text-primary transition-colors"
                            >
                              Reply
                            </button>
                            {currentUser?.id === comment.userId && editingCommentId !== comment.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingContent(comment.content);
                                  }}
                                  className="hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this comment?")) {
                                      deleteComment(comment.id);
                                    }
                                  }}
                                  className="hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reply Form */}
                      {replyTargetId === comment.id && currentUser && (
                        <div className="pl-11 space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="h-9 bg-muted/20"
                            />
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleSubmitReply(comment.id)}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {commentReplies.length > 0 && (
                        <div className="pl-11 space-y-4 pt-2 border-l ml-4 border-border/80">
                          {commentReplies.map((reply) => {
                            const replier = getCommenter(reply.userId);
                            const isReplyLiked = currentUser ? reply.likes.includes(currentUser.id) : false;

                            return (
                              <div key={reply.id} className="flex items-start gap-3">
                                {replier?.id ? (
                                  <Link to={`/profile?id=${replier.id}`}>
                                    <Avatar className="h-7 w-7 border hover:scale-105 transition-transform duration-200">
                                      <AvatarImage src={replier.avatar} alt={replier.name} />
                                      <AvatarFallback>{replier.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  </Link>
                                ) : (
                                  <Avatar className="h-7 w-7 border">
                                    <AvatarImage src={replier?.avatar} alt={replier?.name} />
                                    <AvatarFallback>{replier?.name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    {replier?.id ? (
                                      <Link to={`/profile?id=${replier.id}`} className="font-semibold text-xs hover:text-primary hover:underline transition-colors duration-200">
                                        {replier.name}
                                      </Link>
                                    ) : (
                                      <span className="font-semibold text-xs">{replier?.name}</span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(reply.createdDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  {editingCommentId === reply.id ? (
                                    <div className="space-y-2 pt-1">
                                      <Textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows={2}
                                        className="text-sm bg-background"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setEditingCommentId(null)}
                                          className="h-7 rounded-full text-xs"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            if (editingContent.trim()) {
                                              editComment(reply.id, editingContent);
                                              setEditingCommentId(null);
                                            }
                                          }}
                                          className="h-7 rounded-full text-xs"
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                      {reply.content}
                                    </p>
                                  )}
                                  
                                  {/* Reply Likes & Actions */}
                                  <div className="flex items-center gap-4 pt-1 text-[10px] font-medium text-muted-foreground">
                                    <button
                                      onClick={() => toggleLikeComment(reply.id)}
                                      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                        isReplyLiked ? "text-red-500" : ""
                                      }`}
                                    >
                                      <Heart className={`h-3 w-3 ${isReplyLiked ? "fill-red-500" : ""}`} />
                                      <span>{reply.likes.length}</span>
                                    </button>
                                    {currentUser?.id === reply.userId && editingCommentId !== reply.id && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(reply.id);
                                            setEditingContent(reply.content);
                                          }}
                                          className="hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                          <Edit className="h-2.5 w-2.5" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this reply?")) {
                                              deleteComment(reply.id);
                                            }
                                          }}
                                          className="hover:text-red-500 transition-colors flex items-center gap-1"
                                        >
                                          <Trash2 className="h-2.5 w-2.5" />
                                          <span>Delete</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};
export default BlogDetail;
