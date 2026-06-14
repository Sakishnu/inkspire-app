import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { AuthorCard } from "@/components/AuthorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Clock, TrendingUp, Users, BookOpen, Sparkles, Send, Search, X } from "lucide-react";
import { toast } from "sonner";

export const Index: React.FC = () => {
  const {
    blogs,
    users,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useApp();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  // 1. Get Featured Blog (specifically designated, or highest views)
  const featuredBlog = blogs.find((b) => b.featured && b.status === "published") || blogs.find(b => b.status === "published");
  const featuredAuthor = featuredBlog ? users.find((u) => u.id === featuredBlog.authorId) : null;

  // 2. Filter blogs based on Search Query and Selected Category
  const filteredBlogs = blogs.filter((blog) => {
    if (blog.status !== "published") return false;
    
    const matchesCategory = selectedCategory
      ? blog.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;
      
    const matchesSearch = searchQuery
      ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesCategory && matchesSearch;
  });

  // 3. Get Trending Blogs (highest views, exclude featured if possible, limit to 4)
  const trendingBlogs = [...blogs]
    .filter((b) => b.status === "published" && b.id !== featuredBlog?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  // 4. Get Popular Authors (writers ordered by followers count)
  const popularAuthors = [...users]
    .filter((u) => u.role === "writer" || u.role === "admin" || u.role === "moderator")
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmittingNewsletter(true);
    setTimeout(() => {
      toast.success("Thank you for subscribing to our newsletter!");
      setNewsletterEmail("");
      setSubmittingNewsletter(false);
    }, 1000);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-left">
      <Navbar />

      <main className="flex-1">
        {/* Search / Category active indicator bar */}
        {(searchQuery || selectedCategory) && (
          <div className="bg-primary/5 py-4 border-b">
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>Filtered by:</span>
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1 rounded-full px-3">
                    Category: {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 rounded-full px-3">
                    Search: "{searchQuery}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-semibold rounded-full h-8">
                Clear all filters
              </Button>
            </div>
          </div>
        )}

        {/* 1. Hero Section (Hide if query filters are active to focus on results) */}
        {!searchQuery && !selectedCategory && featuredBlog && (
          <section className="py-10 md:py-16 border-b">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left contents */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      Featured Story
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <Link to={`/blog/${featuredBlog.id}`} className="block group">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-[1.15]">
                        {featuredBlog.title}
                      </h1>
                    </Link>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {featuredBlog.subtitle}
                    </p>
                  </div>

                  {/* Author + Reading time */}
                  <div className="flex items-center gap-4 pt-2">
                    {featuredAuthor && (
                      <Link to={`/profile?id=${featuredAuthor.id}`} className="flex items-center gap-2.5 hover:opacity-95 group transition-opacity duration-200">
                        <img
                          src={featuredAuthor.avatar}
                          alt={featuredAuthor.name}
                          className="h-10 w-10 rounded-full object-cover border group-hover:scale-105 transition-transform duration-200"
                        />
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors duration-200">{featuredAuthor.name}</p>
                          <p className="text-xs text-muted-foreground">@{featuredAuthor.username}</p>
                        </div>
                      </Link>
                    )}
                    <div className="h-8 w-px bg-border" />
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{featuredBlog.readingTime} min read</span>
                      </p>
                      <p>
                        {featuredBlog.publishedDate &&
                          new Date(featuredBlog.publishedDate).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                          })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button asChild size="lg" className="rounded-full px-6 font-semibold">
                      <Link to={`/blog/${featuredBlog.id}`}>Read Full Article</Link>
                    </Button>
                  </div>
                </div>

                {/* Right Image */}
                <div className="lg:col-span-7">
                  <Link to={`/blog/${featuredBlog.id}`} className="block overflow-hidden rounded-2xl border shadow-md relative aspect-[16/10] bg-muted group">
                    <img
                      src={featuredBlog.coverImage}
                      alt={featuredBlog.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Featured Categories */}
        <section className="py-8 bg-muted/20 border-b">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Explore Topics
                </h2>
                <p className="text-xs text-muted-foreground">Filter articles by your favorite categories</p>
              </div>
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs rounded-full">
                  Reset Category
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer text-xs py-1.5 px-4 rounded-full font-semibold transition-all hover:bg-primary/90 hover:text-primary-foreground"
                onClick={() => setSelectedCategory(null)}
              >
                All Stories
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory?.toLowerCase() === cat.name.toLowerCase() ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1.5 px-4 rounded-full font-semibold transition-all hover:bg-primary/95 hover:text-primary-foreground"
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Trending Blogs Section (Hide if query filters are active) */}
        {!searchQuery && !selectedCategory && trendingBlogs.length > 0 && (
          <section className="py-12 border-b">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Trending on Inkspire</h2>
                  <p className="text-xs text-muted-foreground">Most popular stories read by our readers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingBlogs.map((blog, idx) => {
                  const author = users.find((u) => u.id === blog.authorId);
                  return (
                    <div key={blog.id} className="flex gap-4 items-start group">
                      <span className="text-3xl font-extrabold text-muted-foreground/30 group-hover:text-primary/40 transition-colors select-none font-sans">
                        0{idx + 1}
                      </span>
                      <div className="space-y-2">
                        {/* Author line */}
                        {author && (
                          <Link to={`/profile?id=${author.id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200 group">
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="h-5 w-5 rounded-full object-cover border group-hover:scale-105 transition-transform duration-200"
                            />
                            <span className="text-xs font-semibold line-clamp-1">{author.name}</span>
                          </Link>
                        )}
                        {/* Title */}
                        <Link to={`/blog/${blog.id}`} className="block">
                          <h3 className="text-sm font-bold tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        {/* Meta */}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>
                            {blog.publishedDate &&
                              new Date(blog.publishedDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                          </span>
                          <span>•</span>
                          <span>{blog.readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 4. Popular Authors Section (Hide if query filters are active) */}
        {!searchQuery && !selectedCategory && popularAuthors.length > 0 && (
          <section className="py-12 bg-muted/10 border-b">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Popular Writers</h2>
                  <p className="text-xs text-muted-foreground">Follow leading developers, designers, and essayists</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Latest Blogs Feed */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {searchQuery || selectedCategory ? "Search Results" : "Latest Stories"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || selectedCategory
                    ? `Showing ${filteredBlogs.length} articles matching filters`
                    : "Freshly published ideas and insights"}
                </p>
              </div>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl bg-muted/10 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">No articles found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  We couldn't find any published stories matching your filters. Try selecting a different topic or resetting your search.
                </p>
                <Button onClick={clearFilters} variant="outline" className="rounded-full">
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default Index;
