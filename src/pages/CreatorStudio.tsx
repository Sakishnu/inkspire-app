import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blog } from "@/utils/mockDb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Edit2, Trash2, BookOpen, BarChart2, Check, LayoutGrid, Calendar, ChevronRight, PenTool } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export const CreatorStudio: React.FC = () => {
  const { currentUser, blogs, comments, createBlog, updateBlog, deleteBlog, categories } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "write";

  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam === "write" || tabParam === "stories" || tabParam === "analytics") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  // Form State
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [previewActive, setPreviewActive] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [coverImageError, setCoverImageError] = useState<string | null>(null);

  const attemptedResolutions = useRef<Set<string>>(new Set());

  // Function to resolve Pinterest URLs directly via widgets API
  const resolvePinterestUrl = async (urlStr: string): Promise<string | null> => {
    const match = urlStr.match(/(?:pinterest\.[a-z\.]+|pin\.it)\/pin\/(\d+)/i);
    if (!match) return null;
    const pinId = match[1];
    
    try {
      const res = await fetch(`https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.status === "success" && json.data && json.data.length > 0) {
        const pin = json.data[0];
        const images = pin.images;
        if (images) {
          const candidate = images.orig || images["736x"] || images["564x"] || images["474x"] || images["236x"];
          if (candidate && candidate.url) {
            return candidate.url;
          }
        }
      }
    } catch (e) {
      console.error("Pinterest resolver error:", e);
    }
    return null;
  };

  // Extract meta tags from HTML
  const extractImageUrl = (html: string): string | null => {
    // og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) return ogMatch[1];

    // twitter:image
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterMatch && twitterMatch[1]) return twitterMatch[1];

    // image_src
    const srcMatch = html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i) ||
                     html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']image_src["']/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];

    return null;
  };

  // Asynchronously fetch and parse webpage HTML via CORS proxies
  const resolveGeneralUrl = async (urlStr: string): Promise<string | null> => {
    const proxies = [
      (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
    ];

    for (const getProxyUrl of proxies) {
      try {
        const proxyUrl = getProxyUrl(urlStr);
        const res = await fetch(proxyUrl);
        if (!res.ok) continue;

        if (proxyUrl.includes("allorigins.win")) {
          const json = await res.json();
          if (json && json.contents) {
            const imgUrl = extractImageUrl(json.contents);
            if (imgUrl) return imgUrl;
          }
        } else {
          const text = await res.text();
          if (text) {
            const imgUrl = extractImageUrl(text);
            if (imgUrl) return imgUrl;
          }
        }
      } catch (e) {
        console.warn(`Proxy failed:`, e);
      }
    }
    return null;
  };

  useEffect(() => {
    setCoverImageError(null);

    if (!coverImage) {
      return;
    }

    if (coverImage.startsWith("data:")) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const url = new URL(coverImage);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          setCoverImageError("URL must start with http:// or https://");
          return;
        }

        // Test loading the image
        const img = new Image();
        img.onload = () => {
          setCoverImageError(null);
        };
        img.onerror = async () => {
          // Check if we already attempted resolving this URL
          if (attemptedResolutions.current.has(coverImage)) {
            setCoverImageError("Image URL could not be loaded or is invalid.");
            return;
          }

          // Add to attempted list to avoid infinite loop
          attemptedResolutions.current.add(coverImage);
          setCoverImageError("Resolving image from webpage...");

          // First try Pinterest resolution if it matches a Pinterest URL
          if (/(?:pinterest\.[a-z\.]+|pin\.it)/i.test(coverImage)) {
            const resolved = await resolvePinterestUrl(coverImage);
            if (resolved) {
              setCoverImage(resolved);
              return;
            }
          }

          // Fallback to general proxy scraper for any webpage
          const resolved = await resolveGeneralUrl(coverImage);
          if (resolved) {
            setCoverImage(resolved);
          } else {
            setCoverImageError("Image URL could not be loaded or is invalid.");
          }
        };
        img.src = coverImage;
      } catch (_) {
        setCoverImageError("Please enter a valid image URL.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [coverImage]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-border/50 bg-card/60 backdrop-blur-md p-8 text-center space-y-6 shadow-md">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <PenTool className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Sign In to Write</CardTitle>
              <p className="text-sm text-muted-foreground">
                Only authenticated writers can access the Creator Studio. Create or sign in to your writer account today.
              </p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full rounded-full">
              Sign In
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter user's own blogs
  const myBlogs = blogs.filter((b) => b.authorId === currentUser.id);
  const publishedBlogs = myBlogs.filter((b) => b.status === "published");
  const draftBlogs = myBlogs.filter((b) => b.status === "draft");
  const scheduledBlogs = myBlogs.filter((b) => b.status === "scheduled");

  // Aggregate Analytics
  const totalViews = publishedBlogs.reduce((acc, b) => acc + b.views, 0);
  const totalLikes = publishedBlogs.reduce((acc, b) => acc + b.likes.length, 0);
  const avgReadingTime = publishedBlogs.length
    ? Math.round((publishedBlogs.reduce((acc, b) => acc + b.readingTime, 0) / publishedBlogs.length) * 10) / 10
    : 0;

  // Handle Edit Action
  const handleEditInit = (blog: Blog) => {
    attemptedResolutions.current.clear();
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setSubtitle(blog.subtitle);
    setCategory(blog.category);
    setTags(blog.tags.join(", "));
    setCoverImage(blog.coverImage);
    setContent(blog.content);
    setSeoTitle(blog.seoTitle);
    setSeoDescription(blog.seoDescription);
    setIsScheduled(blog.status === "scheduled");
    setScheduledDate(blog.scheduledDate ? blog.scheduledDate.substring(0, 16) : "");
    setSearchParams({ tab: "write" });
    toast.info(`Loaded "${blog.title.slice(0, 20)}..." for editing`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCoverImage(reader.result);
          toast.success("Image uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    attemptedResolutions.current.clear();
    setEditingBlogId(null);
    setTitle("");
    setSubtitle("");
    setCategory("Technology");
    setTags("");
    setCoverImage("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80");
    setContent("");
    setSeoTitle("");
    setSeoDescription("");
    setPreviewActive(false);
    setIsScheduled(false);
    setScheduledDate("");
  };

  // Form Submit Handler
  const handleSave = (status: "draft" | "published") => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required.");
      return;
    }

    if (isScheduled && !scheduledDate) {
      toast.error("Scheduled date and time are required.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalStatus: "draft" | "published" | "scheduled" = isScheduled ? "scheduled" : status;

    const blogPayload = {
      title,
      subtitle,
      content,
      category,
      tags: tagList,
      coverImage,
      status: finalStatus,
      scheduledDate: isScheduled ? new Date(scheduledDate).toISOString() : null,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || subtitle || "No SEO description set.",
      featured: false,
    };

    if (editingBlogId) {
      updateBlog(editingBlogId, blogPayload);
    } else {
      createBlog(blogPayload);
    }

    resetForm();
    setSearchParams({ tab: "stories" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-left">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Creator Studio</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {currentUser.name}. Draft, schedule, publish, and monitor your stories.
            </p>
          </div>
          {editingBlogId && (
            <Button variant="outline" size="sm" onClick={resetForm} className="rounded-full">
              Cancel Editing
            </Button>
          )}
        </div>

        <Tabs defaultValue="write" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-muted/50 p-1 border rounded-full mb-8">
            <TabsTrigger value="write" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
              <PenTool className="mr-1.5 h-4 w-4" /> Write
            </TabsTrigger>
            <TabsTrigger value="stories" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
              <BookOpen className="mr-1.5 h-4 w-4" /> Stories ({myBlogs.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
              <BarChart2 className="mr-1.5 h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* WRITE TAB */}
          <TabsContent value="write" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Editors / Inputs */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
                  <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
                    <CardTitle className="text-lg font-bold">
                      {editingBlogId ? "Edit Story" : "Write a New Story"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewActive(!previewActive)}
                      className="rounded-full gap-1.5 h-8 text-xs font-semibold"
                    >
                      <Eye className="h-4 w-4" />
                      {previewActive ? "Hide Preview" : "Show Preview"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6 text-left">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter a captivating title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-10 text-base font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        placeholder="Explain the article preview..."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 px-3 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          placeholder="React, clean-code, design"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        placeholder="Paste image link..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className={coverImageError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {coverImageError && (
                        <p className="text-xs text-red-500 font-medium mt-1">{coverImageError}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="imageUpload">Upload Image</Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2 pb-1">
                      <input
                        type="checkbox"
                        id="isScheduled"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="h-4 w-4 rounded border-input bg-background focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <Label htmlFor="isScheduled" className="cursor-pointer text-sm font-medium">
                        Schedule this story for later publication
                      </Label>
                    </div>

                    {isScheduled && (
                      <div className="space-y-1.5 border p-3 rounded-md bg-muted/20">
                        <Label htmlFor="scheduledDate">Scheduled Date and Time</Label>
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full h-10 bg-background"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="content">Content (HTML supported)</Label>
                      <Textarea
                        id="content"
                        placeholder="<h2>Intro</h2><p>Start writing your story here...</p>"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        className="font-mono text-sm leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>



                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => handleSave("draft")} className="flex-1 rounded-full h-11 font-semibold">
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSave("published")} className="flex-1 rounded-full h-11 font-semibold">
                    {isScheduled ? "Schedule Story" : "Publish Story"}
                  </Button>
                </div>
              </div>

              {/* Live Preview Side Pane */}
              <div className={`lg:col-span-5 space-y-6 sticky top-24 ${previewActive ? "" : "hidden lg:block"}`}>
                <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm h-[720px] flex flex-col">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base font-bold">Live Story Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Preview Image */}
                     {coverImage && (
                       <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted relative flex items-center justify-center">
                         {coverImageError ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-500/10 text-red-500 text-center">
                             <span className="text-sm font-semibold mb-1">Image Preview Failed</span>
                             <span className="text-xs text-muted-foreground">{coverImageError}</span>
                           </div>
                         ) : (
                           <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                         )}
                       </div>
                     )}

                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          {category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                          PREVIEWING
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title || "Untitled Story"}</h1>
                      <p className="text-sm text-muted-foreground">{subtitle || "Write a subtitle..."}</p>
                    </div>

                    <div className="border-t pt-4">
                      {content ? (
                        <div
                          className="prose prose-inkspire dark:prose-invert max-w-none text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Write some content in the editor to preview your story structure.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* STORIES TAB */}
          <TabsContent value="stories" className="space-y-6 focus-visible:outline-none text-left">
            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                {myBlogs.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-muted-foreground">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">You haven't written any stories yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Draft a story using the editor to start compiling your Inkspire portfolio.
                      </p>
                    </div>
                    <Button onClick={() => setSearchParams({ tab: "write" })} className="rounded-full">
                      <Plus className="mr-1 h-4 w-4" /> Start Writing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Subsections: Published and Drafts */}
                    <div className="space-y-4">
                      <h3 className="text-base font-bold flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-green-500" /> Published Posts ({publishedBlogs.length})
                      </h3>
                      {publishedBlogs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-6">No published posts.</p>
                      ) : (
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {publishedBlogs.map((b) => (
                            <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                              <div className="space-y-1">
                                <Link to={`/blog/${b.id}`} className="font-bold text-sm hover:underline hover:text-primary">
                                  {b.title}
                                </Link>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span>{b.category}</span>
                                  <span>•</span>
                                  <span>{b.views} views</span>
                                  <span>•</span>
                                  <span>{b.likes.length} likes</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEditInit(b)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this published article?")) {
                                      deleteBlog(b.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-base font-bold flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-amber-500" /> Drafts ({draftBlogs.length})
                      </h3>
                      {draftBlogs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-6">No drafts.</p>
                      ) : (
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {draftBlogs.map((b) => (
                            <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-foreground/80">{b.title || "(Untitled Draft)"}</span>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span>{b.category}</span>
                                  <span>•</span>
                                  <span>Created: {new Date(b.createdDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEditInit(b)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this draft?")) {
                                      deleteBlog(b.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-base font-bold flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-500" /> Scheduled Posts ({scheduledBlogs.length})
                      </h3>
                      {scheduledBlogs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic pl-6">No scheduled posts.</p>
                      ) : (
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {scheduledBlogs.map((b) => (
                            <div key={b.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-foreground/80">{b.title || "(Untitled Scheduled Post)"}</span>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span>{b.category}</span>
                                  <span>•</span>
                                  <span>Scheduled: {b.scheduledDate ? new Date(b.scheduledDate).toLocaleString() : ""}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleEditInit(b)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this scheduled post?")) {
                                      deleteBlog(b.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-5 flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Post Views
                  </span>
                  <span className="text-3xl font-extrabold text-foreground">{totalViews}</span>
                  <span className="text-[10px] text-muted-foreground">Across all published posts</span>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-5 flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Story Likes
                  </span>
                  <span className="text-3xl font-extrabold text-foreground">{totalLikes}</span>
                  <span className="text-[10px] text-muted-foreground">Net feedback rate</span>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-5 flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Published Stories
                  </span>
                  <span className="text-3xl font-extrabold text-foreground">{publishedBlogs.length}</span>
                  <span className="text-[10px] text-muted-foreground">Portfolio size</span>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-5 flex flex-col justify-between h-32">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Avg Reading Time
                  </span>
                  <span className="text-3xl font-extrabold text-foreground">{avgReadingTime}m</span>
                  <span className="text-[10px] text-muted-foreground">Average length per post</span>
                </CardContent>
              </Card>
            </div>

            {/* Performance breakdown list */}
            <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base font-bold">Story Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {publishedBlogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-6 text-center italic">
                    Publish stories to populate performance details.
                  </p>
                ) : (
                  <div className="divide-y text-sm">
                    {publishedBlogs.map((b) => {
                      const blogComments = comments.filter((c) => c.blogId === b.id).length;
                      const engagement = b.views > 0 ? Math.round(((b.likes.length + blogComments) / b.views) * 100) : 0;

                      return (
                        <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-sm line-clamp-1">{b.title}</p>
                            <span className="text-[10px] text-muted-foreground">{b.category}</span>
                          </div>
                          <div className="flex items-center gap-6 text-right font-medium flex-wrap md:flex-nowrap">
                            <div>
                              <span className="block font-bold">{b.views}</span>
                              <span className="text-[9px] text-muted-foreground uppercase">Views</span>
                            </div>
                            <div>
                              <span className="block font-bold">{b.likes.length}</span>
                              <span className="text-[9px] text-muted-foreground uppercase">Likes</span>
                            </div>
                            <div>
                              <span className="block font-bold">{blogComments}</span>
                              <span className="text-[9px] text-muted-foreground uppercase">Comments</span>
                            </div>
                            <div>
                              <span className="block font-bold text-primary">{engagement}%</span>
                              <span className="text-[9px] text-muted-foreground uppercase">Engagement</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};
export default CreatorStudio;
