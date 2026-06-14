import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, Bookmark, FileText, Heart, Compass, LogIn } from "lucide-react";

export const HomeFeed: React.FC = () => {
  const { currentUser, blogs, bookmarks, follows, users, deleteBlog } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("for-you");

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-border/50 bg-card/60 backdrop-blur-md p-8 text-center space-y-6 shadow-md">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Access Your Personalized Feed</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to customize your topics, follow writers, bookmark your favorite articles, and share comments.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => navigate("/login")} className="w-full rounded-full">
                <LogIn className="mr-2 h-4 w-4" /> Sign In Now
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="w-full rounded-full">
                Back to Explore
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // 1. Curated "My Feed" Feed (only published blogs of current user)
  const forYouBlogs = blogs.filter(
    (b) => b.status === "published" && b.authorId === currentUser.id
  );

  // 2. Following (list of followed user profiles)
  const followedAuthorIds = follows
    .filter((f) => f.followerId === currentUser.id)
    .map((f) => f.followingId);
  const followedUsers = users.filter((u) => followedAuthorIds.includes(u.id));

  // 3. Bookmarks Feed
  const myBookmarkedIds = bookmarks
    .filter((b) => b.userId === currentUser.id)
    .map((b) => b.blogId);
  const bookmarkedBlogs = blogs.filter(
    (b) => b.status === "published" && myBookmarkedIds.includes(b.id)
  );

  // Stats
  const myBlogs = blogs.filter((b) => b.authorId === currentUser.id);
  const publishedMyBlogs = myBlogs.filter((b) => b.status === "published");
  const draftMyBlogs = myBlogs.filter((b) => b.status === "draft");

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-left">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Left Column */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="for-you" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <TabsList className="bg-muted/50 p-1 rounded-full border">
                  <TabsTrigger value="for-you" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                    My Feed
                  </TabsTrigger>
                  <TabsTrigger value="following" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                    Following ({followedUsers.length})
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                    Bookmarks ({bookmarkedBlogs.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* My Feed Tab */}
              <TabsContent value="for-you" className="space-y-6 focus-visible:outline-none">
                {forYouBlogs.length === 0 ? (
                  <div className="text-center py-12 border rounded-xl bg-muted/10">
                    <p className="text-muted-foreground text-sm">You haven't published any stories yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {forYouBlogs.map((blog) => (
                      <BlogCard
                        key={blog.id}
                        blog={blog}
                        onDelete={() => {
                          if (window.confirm("Are you sure you want to delete this story?")) {
                            deleteBlog(blog.id);
                          }
                        }}
                        onShare={() => {
                          const shareUrl = `${window.location.origin}/blog/${blog.id}`;
                          navigator.clipboard.writeText(shareUrl)
                            .then(() => toast.success("Story link copied to clipboard!"))
                            .catch(() => toast.error("Failed to copy link."));
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="space-y-6 focus-visible:outline-none">
                {followedUsers.length === 0 ? (
                  <div className="text-center py-16 border rounded-2xl bg-muted/10 p-8 space-y-4">
                    <div className="mx-auto h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">You are not following anyone</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Follow writers in the Explore section to keep up with their latest work.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to="/">Explore Writers</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {followedUsers.map((user) => (
                      <Card key={user.id} className="border border-border/50 bg-card/60 backdrop-blur-sm p-4 hover:shadow-md transition-all duration-300 animate-in fade-in-50 duration-200">
                        <Link to={`/profile?id=${user.id}`} className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border shadow-sm">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <div>
                              <h4 className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate">
                                {user.name}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                @{user.username}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {user.bio}
                            </p>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks" className="space-y-6 focus-visible:outline-none">
                {bookmarkedBlogs.length === 0 ? (
                  <div className="text-center py-16 border rounded-2xl bg-muted/10 p-8 space-y-4">
                    <div className="mx-auto h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground">
                      <Bookmark className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">No bookmarked stories</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Click the bookmark icon on any blog card to save it for reading later.
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to="/">Find Stories to Save</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {bookmarkedBlogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Profile Sidebar Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Summary */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-primary/10 to-accent/10 relative" />
              <CardContent className="p-6 pt-0 relative flex flex-col items-center text-center">
                <Link to="/profile" className="flex flex-col items-center group">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-md -mt-8 mb-3 group-hover:scale-105 transition-all duration-300">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">{currentUser.name}</h3>
                  <span className="text-xs text-muted-foreground mb-4">@{currentUser.username}</span>
                </Link>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                  {currentUser.bio}
                </p>

                {/* Follow Stats */}
                <div className="grid grid-cols-2 gap-4 w-full border-t border-b py-3 text-sm mb-6">
                  <div>
                    <span className="block font-bold text-foreground">{currentUser.followersCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</span>
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">{currentUser.followingCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Following</span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quick Stats list */}
            <Card className="border border-border/50 bg-card/30 backdrop-blur-sm p-4 text-xs space-y-3">
              <CardHeader className="p-0 pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Published Stories:</span>
                  <span className="font-semibold text-foreground">{publishedMyBlogs.length}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Draft Stories:</span>
                  <span className="font-semibold text-foreground">{draftMyBlogs.length}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total Bookmarks:</span>
                  <span className="font-semibold text-foreground">{myBookmarkedIds.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default HomeFeed;
