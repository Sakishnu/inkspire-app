import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Globe,
  Calendar,
  Twitter,
  Linkedin,
  Github,
  Camera,
  Trash2,
  FileText,
  Bookmark,
  BookOpen,
  User,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

// Curated avatar presets (premium headshots/gradients)
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
];

// Curated cover banner presets (abstract workspace/gradients)
const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=300&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&h=300&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&h=300&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&h=300&q=80",
];

export const Profile: React.FC = () => {
  const { currentUser, updateProfile, blogs, bookmarks, users } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get("id");
  const profileUser = targetUserId ? users.find((u) => u.id === targetUserId) : currentUser;
  const isOwnProfile = !targetUserId || (currentUser && targetUserId === currentUser.id);

  // If not logged in and not viewing someone else's profile, show redirect screen
  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-border/50 bg-card/60 backdrop-blur-md p-8 text-center space-y-6 shadow-md">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Sign In to View Your Profile</h2>
              <p className="text-sm text-muted-foreground">
                You must be logged in to view your personalized profile details, published posts, and bookmarks.
              </p>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full rounded-full">
              Sign In Now
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter profile user's blogs
  const profileBlogs = blogs.filter((b) => b.authorId === profileUser.id);
  const publishedBlogs = profileBlogs.filter((b) => b.status === "published");
  const draftBlogs = isOwnProfile ? profileBlogs.filter((b) => b.status === "draft") : [];

  // Bookmarks
  const myBookmarkIds = bookmarks
    .filter((b) => b.userId === profileUser.id)
    .map((b) => b.blogId);
  const bookmarkedBlogs = isOwnProfile
    ? blogs.filter((b) => b.status === "published" && myBookmarkIds.includes(b.id))
    : [];

  // Profile Edit State (Modal Form)
  const [editOpen, setEditOpen] = useState(false);
  const [formName, setFormName] = useState(currentUser?.name || "");
  const [formUsername, setFormUsername] = useState(currentUser?.username || "");
  const [formBio, setFormBio] = useState(currentUser?.bio || "");
  const [formWebsite, setFormWebsite] = useState(currentUser?.website || "");
  const [formLocation, setFormLocation] = useState(currentUser?.location || "");
  const [formAvatar, setFormAvatar] = useState(currentUser?.avatar || "");
  const [formBanner, setFormBanner] = useState(currentUser?.banner || "");
  const [formTwitter, setFormTwitter] = useState(currentUser?.socials?.twitter || "");
  const [formLinkedin, setFormLinkedin] = useState(currentUser?.socials?.linkedin || "");
  const [formGithub, setFormGithub] = useState(currentUser?.socials?.github || "");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formName.trim()) {
      newErrors.name = "Full Name is required.";
    }

    if (!formUsername.trim()) {
      newErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formUsername)) {
      newErrors.username = "Username must be alphanumeric and underscores only (no spaces).";
    } else {
      const isTaken = users.some(
        (u) =>
          u.username.toLowerCase() === formUsername.toLowerCase() &&
          u.id !== currentUser?.id
      );
      if (isTaken) {
        newErrors.username = "Username is already taken by another creator.";
      }
    }

    if (formWebsite.trim() && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(formWebsite)) {
      newErrors.website = "Please enter a valid website link (starting with http:// or https://).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!validate()) {
      toast.error("Please resolve the validation errors before saving.");
      return;
    }

    updateProfile({
      name: formName.trim(),
      username: formUsername.trim().toLowerCase(),
      bio: formBio.trim(),
      website: formWebsite.trim(),
      location: formLocation.trim(),
      avatar: formAvatar,
      banner: formBanner,
      socials: {
        twitter: formTwitter.trim(),
        linkedin: formLinkedin.trim(),
        github: formGithub.trim(),
      },
    });

    setEditOpen(false);
  };

  const resetForm = () => {
    if (!currentUser) return;
    setFormName(currentUser.name);
    setFormUsername(currentUser.username);
    setFormBio(currentUser.bio || "");
    setFormWebsite(currentUser.website || "");
    setFormLocation(currentUser.location || "");
    setFormAvatar(currentUser.avatar || "");
    setFormBanner(currentUser.banner || "");
    setFormTwitter(currentUser.socials?.twitter || "");
    setFormLinkedin(currentUser.socials?.linkedin || "");
    setFormGithub(currentUser.socials?.github || "");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-left">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        {/* Back Link */}
        <div className="max-w-4xl mx-auto mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card Profile Summary */}
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-md overflow-hidden rounded-2xl relative">
            {/* Banner/Cover Image */}
            <div className="h-44 md:h-56 relative bg-muted">
              {profileUser.banner ? (
                <img
                  src={profileUser.banner}
                  alt="Profile Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/15" />
              )}
            </div>

            <CardContent className="p-6 relative pt-0">
              {/* Avatar overlapping Banner */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-xl rounded-full relative z-10 bg-background">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                  <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                    {profileUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Edit Profile Dialog Button */}
                {isOwnProfile && (
                  <Dialog
                    open={editOpen}
                    onOpenChange={(open) => {
                      setEditOpen(open);
                      if (open) resetForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="rounded-full px-6 font-semibold relative z-10 self-start sm:self-auto shadow-sm">
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your professional bio, profile picture, social links, and contact options.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Form Layout with Live Preview */}
                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-1 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Input Form Fields */}
                      <div className="lg:col-span-7 space-y-5">
                        {/* Name & Username */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="formName">Full Name *</Label>
                            <Input
                              id="formName"
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                              <p className="text-[10px] font-medium text-red-500">{errors.name}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="formUsername">Username *</Label>
                            <Input
                              id="formUsername"
                              value={formUsername}
                              onChange={(e) => setFormUsername(e.target.value)}
                              className={errors.username ? "border-red-500" : ""}
                            />
                            {errors.username && (
                              <p className="text-[10px] font-medium text-red-500">{errors.username}</p>
                            )}
                          </div>
                        </div>

                        {/* Profile Picture Controls */}
                        <div className="space-y-2.5">
                          <Label>Profile Picture</Label>
                          <div className="flex flex-wrap items-center gap-3">
                            <Avatar className="h-14 w-14 border">
                              <AvatarImage src={formAvatar} alt="Preset preview" />
                              <AvatarFallback>{formName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFormAvatar("")}
                                className="h-8 text-xs text-red-500 hover:bg-red-500/5 hover:text-red-500"
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="formAvatarUrl" className="text-[11px] text-muted-foreground">Custom Image URL</Label>
                            <Input
                              id="formAvatarUrl"
                              placeholder="Paste avatar URL..."
                              value={formAvatar}
                              onChange={(e) => setFormAvatar(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground block">Curated Presets:</span>
                            <div className="flex gap-2.5 overflow-x-auto pb-1">
                              {AVATAR_PRESETS.map((preset, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setFormAvatar(preset)}
                                  className={`h-10 w-10 rounded-full border-2 overflow-hidden shrink-0 transition-all ${
                                    formAvatar === preset ? "border-primary scale-110 shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                                  }`}
                                >
                                  <img src={preset} alt="preset" className="h-full w-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Banner Image Controls */}
                        <div className="space-y-2.5">
                          <Label>Cover Banner Image</Label>
                          <div className="aspect-[3/1] rounded-lg overflow-hidden border bg-muted max-w-sm relative">
                            {formBanner ? (
                              <img src={formBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/15" />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="formBannerUrl" className="text-[11px] text-muted-foreground">Custom Banner URL</Label>
                            <Input
                              id="formBannerUrl"
                              placeholder="Paste banner URL..."
                              value={formBanner}
                              onChange={(e) => setFormBanner(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground block">Curated Banner Presets:</span>
                            <div className="grid grid-cols-4 gap-2">
                              {BANNER_PRESETS.map((preset, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setFormBanner(preset)}
                                  className={`aspect-[3/1] rounded border overflow-hidden shrink-0 transition-all ${
                                    formBanner === preset ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-transparent opacity-75 hover:opacity-100"
                                  }`}
                                >
                                  <img src={preset} alt="banner preset" className="h-full w-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                          <Label htmlFor="formBio">Bio</Label>
                          <Textarea
                            id="formBio"
                            placeholder="Share something about yourself..."
                            value={formBio}
                            onChange={(e) => setFormBio(e.target.value)}
                            rows={3}
                          />
                        </div>

                        {/* Website & Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="formWebsite">Website Link</Label>
                            <Input
                              id="formWebsite"
                              placeholder="https://example.com"
                              value={formWebsite}
                              onChange={(e) => setFormWebsite(e.target.value)}
                              className={errors.website ? "border-red-500" : ""}
                            />
                            {errors.website && (
                              <p className="text-[10px] font-medium text-red-500">{errors.website}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="formLocation">Location</Label>
                            <Input
                              id="formLocation"
                              placeholder="City, Country"
                              value={formLocation}
                              onChange={(e) => setFormLocation(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="space-y-3 pt-2 border-t">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Social Profiles</span>
                          <div className="space-y-2">
                            <div className="relative">
                              <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Twitter Handle (e.g. twitter_user)"
                                value={formTwitter}
                                onChange={(e) => setFormTwitter(e.target.value)}
                                className="pl-9 h-10"
                              />
                            </div>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="LinkedIn Profile Name (e.g. user-name)"
                                value={formLinkedin}
                                onChange={(e) => setFormLinkedin(e.target.value)}
                                className="pl-9 h-10"
                              />
                            </div>
                            <div className="relative">
                              <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="GitHub Username (e.g. github_user)"
                                value={formGithub}
                                onChange={(e) => setFormGithub(e.target.value)}
                                className="pl-9 h-10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Preview Component Card */}
                      <div className="lg:col-span-5 lg:sticky lg:top-0 space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Real-time Profile Preview</span>
                        <Card className="border border-border/50 bg-card shadow-sm overflow-hidden rounded-xl">
                          <div className="h-28 relative bg-muted">
                            {formBanner ? (
                              <img src={formBanner} alt="banner preset" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/15" />
                            )}
                          </div>
                          <div className="p-4 relative pt-0 text-center flex flex-col items-center">
                            <Avatar className="h-20 w-20 border-2 border-background shadow-md -mt-10 mb-2 bg-background">
                              <AvatarImage src={formAvatar} alt={formName} />
                              <AvatarFallback className="text-2xl font-bold">{formName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h4 className="font-bold text-base leading-snug line-clamp-1">{formName || "Your Full Name"}</h4>
                            <span className="text-xs text-muted-foreground mb-3">@{formUsername || "username"}</span>

                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4 text-center">
                              {formBio || "Write a bio to tell the community about yourself..."}
                            </p>

                            <div className="w-full border-t border-b py-2 grid grid-cols-2 text-center text-xs text-muted-foreground mb-4">
                              <div>
                                <span className="block font-bold text-foreground">{publishedBlogs.length}</span>
                                <span>Posts</span>
                              </div>
                              <div>
                                <span className="block font-bold text-foreground">{currentUser.followersCount}</span>
                                <span>Followers</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 w-full text-[11px] text-muted-foreground text-left">
                              {formLocation && (
                                <p className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{formLocation}</span>
                                </p>
                              )}
                              {formWebsite && (
                                <p className="flex items-center gap-1.5 text-primary">
                                  <Globe className="h-3.5 w-3.5" />
                                  <span className="underline truncate">{formWebsite}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </form>

                    <DialogFooter className="border-t pt-4">
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-full px-5">
                        Cancel
                      </Button>
                      <Button type="submit" onClick={handleSave} className="rounded-full px-6 font-semibold">
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Bio & Details Display */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold tracking-tight">{profileUser.name}</h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-primary/5 text-primary border-primary/10 select-none uppercase tracking-wide">
                      {profileUser.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-line">
                  {profileUser.bio || (isOwnProfile ? "No bio set yet. Click 'Edit Profile' to add yours!" : "No bio set yet.")}
                </p>

                {/* Meta details: location, website, joined date */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium pt-1">
                  {profileUser.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.website && (
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{profileUser.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {new Date(profileUser.joinedDate).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Follow Stats */}
                <div className="flex items-center gap-6 border-t pt-4 text-sm font-semibold select-none">
                  <div className="flex items-center gap-1">
                    <span className="text-foreground">{publishedBlogs.length}</span>
                    <span className="text-muted-foreground font-medium">Stories</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-foreground">{profileUser.followersCount}</span>
                    <span className="text-muted-foreground font-medium">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-foreground">{profileUser.followingCount}</span>
                    <span className="text-muted-foreground font-medium">Following</span>
                  </div>
                </div>

                {/* Social links */}
                {(profileUser.socials?.twitter ||
                  profileUser.socials?.linkedin ||
                  profileUser.socials?.github) && (
                  <div className="flex items-center gap-2.5 pt-2">
                    {profileUser.socials?.twitter && (
                      <a
                        href={`https://twitter.com/${profileUser.socials.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        title="Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {profileUser.socials?.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${profileUser.socials.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {profileUser.socials?.github && (
                      <a
                        href={`https://github.com/${profileUser.socials.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        title="GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Stories Grid/Tabs */}
          <Tabs defaultValue="published" className="w-full">
            <div className="flex items-center justify-between border-b pb-3 mb-6">
              <TabsList className="bg-muted/50 p-1 border rounded-full">
                <TabsTrigger value="published" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                  <FileText className="mr-1.5 h-4 w-4" /> Published ({publishedBlogs.length})
                </TabsTrigger>
                {isOwnProfile && (
                  <>
                    <TabsTrigger value="drafts" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                      <BookOpen className="mr-1.5 h-4 w-4" /> Drafts ({draftBlogs.length})
                    </TabsTrigger>
                    <TabsTrigger value="bookmarks" className="rounded-full px-5 py-1.5 data-[state=active]:bg-background text-sm font-medium">
                      <Bookmark className="mr-1.5 h-4 w-4" /> Bookmarks ({bookmarkedBlogs.length})
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            {/* Published Stories tab */}
            <TabsContent value="published" className="space-y-6 focus-visible:outline-none">
              {publishedBlogs.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/10 p-8">
                  <p className="text-muted-foreground text-sm">No stories published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </TabsContent>

            {isOwnProfile && (
              <>
                {/* Draft Stories tab */}
                <TabsContent value="drafts" className="space-y-6 focus-visible:outline-none">
                  {draftBlogs.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/10 p-8 space-y-4">
                      <div className="mx-auto h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">No drafts found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Save drafts in the editor to work on them later.
                        </p>
                      </div>
                      <Button onClick={() => navigate("/studio?tab=write")} className="rounded-full">
                        Create a Draft
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {draftBlogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Bookmark Stories tab */}
                <TabsContent value="bookmarks" className="space-y-6 focus-visible:outline-none">
                  {bookmarkedBlogs.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/10 p-8 space-y-4">
                      <div className="mx-auto h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground">
                        <Bookmark className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">No bookmarked articles</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Explore stories on the home feed and click the bookmark icon to save them.
                        </p>
                      </div>
                      <Button onClick={() => navigate("/")} className="rounded-full">
                        Explore Stories
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookmarkedBlogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
