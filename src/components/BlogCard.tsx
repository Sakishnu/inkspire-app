import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Blog } from "@/utils/mockDb";
import { useApp } from "@/context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Heart, Bookmark, Eye, Clock, Trash2, Share2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface BlogCardProps {
  blog: Blog;
  horizontal?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, horizontal = false, onDelete, onShare }) => {
  const { currentUser, users, bookmarks, toggleLike, toggleBookmark } = useApp();
  const navigate = useNavigate();

  const author = users.find((u) => u.id === blog.authorId);
  const isLiked = currentUser ? blog.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser
    ? bookmarks.some((b) => b.userId === currentUser.id && b.blogId === blog.id)
    : false;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(blog.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(blog.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(e);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(e);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (author?.id) {
      navigate(`/profile?id=${author.id}`);
    }
  };

  const formattedDate = blog.publishedDate
    ? new Date(blog.publishedDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date(blog.createdDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  if (horizontal) {
    return (
      <Card className="overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 group">
        <Link to={`/blog/${blog.id}`}>
          <div className="flex flex-col sm:flex-row h-full">
            {/* Image */}
            <div className="sm:w-1/3 relative overflow-hidden h-48 sm:h-auto min-h-[180px]">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            
            {/* Content */}
            <div className="sm:w-2/3 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="hover:bg-secondary/80 rounded-full font-medium">
                    {blog.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {blog.readingTime} min read
                  </span>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {blog.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                {/* Author */}
                 <div
                  onClick={handleAuthorClick}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors duration-200"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={author?.avatar} alt={author?.name} />
                    <AvatarFallback>{author?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-none">{author?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onShare && (
                    <button
                      onClick={handleShareClick}
                      className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-75"
                      aria-label="Share story"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="p-1.5 rounded-full hover:bg-muted text-red-500 hover:text-red-600 transition-all duration-200 active:scale-75"
                      aria-label="Delete story"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 p-1.5 rounded-full hover:bg-muted transition-all duration-200 active:scale-75 ${
                      isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Like story"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                    <span className="text-xs">{blog.likes.length}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-full hover:bg-muted transition-all duration-200 active:scale-75 ${
                      isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Bookmark story"
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <Link to={`/blog/${blog.id}`} className="flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <Badge className="absolute top-3 left-3 rounded-full font-medium" variant="default">
            {blog.category}
          </Badge>
        </div>

        {/* Card Body */}
        <CardContent className="flex flex-col justify-between flex-1 p-5">
          <div className="space-y-2">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {blog.readingTime} MIN READ
            </span>

            <h3 className="text-lg font-bold tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {blog.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
             {/* Author details */}
            <div
              onClick={handleAuthorClick}
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors duration-200"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={author?.avatar} alt={author?.name} />
                <AvatarFallback>{author?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none">{author?.name}</p>
                <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
              </div>
            </div>

            {/* Like and Bookmark action buttons */}
            <div className="flex items-center gap-1.5">
              {onShare && (
                <button
                  onClick={handleShareClick}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-75"
                  aria-label="Share story"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-full hover:bg-muted text-red-500 hover:text-red-600 transition-all duration-200 active:scale-75"
                  aria-label="Delete story"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleLike}
                className={`flex items-center gap-1 p-1.5 rounded-full hover:bg-muted transition-all duration-200 active:scale-75 ${
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Like story"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                <span className="text-xs">{blog.likes.length}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-full hover:bg-muted transition-all duration-200 active:scale-75 ${
                  isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Bookmark story"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
