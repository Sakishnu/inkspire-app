import React, { createContext, useContext, useState, useEffect } from "react";
import { mockDb, User, Blog, Comment, Notification, Bookmark, Follow, Category, Tag, Report } from "@/utils/mockDb";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// Initialize mock DB immediately to populate localStorage before state initialization
mockDb.init();

interface AppContextType {
  currentUser: User | null;
  users: User[];
  blogs: Blog[];
  comments: Comment[];
  follows: Follow[];
  bookmarks: Bookmark[];
  notifications: Notification[];
  categories: Category[];
  tags: Tag[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  
  // Auth Operations
  login: (identifier: string, password?: string) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, username: string, email: string, role: 'writer' | 'reader', phone?: string, password?: string) => Promise<boolean>;
  googleLogin: (googleUser: { email: string; name: string; avatar: string }) => Promise<boolean>;
  resetPassword: (identifier: string, newPasswordHash: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => void;
  
  // Blog Operations
  toggleLike: (blogId: string) => void;
  toggleBookmark: (blogId: string) => void;
  createBlog: (blog: Omit<Blog, "id" | "authorId" | "views" | "likes" | "createdDate" | "publishedDate" | "readingTime">) => Blog;
  updateBlog: (blogId: string, updatedFields: Partial<Blog>) => void;
  deleteBlog: (blogId: string) => void;
  
  // Follow Operations
  toggleFollow: (authorId: string) => void;
  isFollowing: (authorId: string) => boolean;

  // Comment Operations
  addComment: (blogId: string, content: string, parentId: string | null) => void;
  toggleLikeComment: (commentId: string) => void;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  
  // Notification Operations
  markNotificationsRead: () => void;
  
  // Report Operations
  submitReport: (blogId: string | null, commentId: string | null, reason: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("inkspire_current_user");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default logged in user for testing ease (Emily Chen - Reader)
    return null;
  });

  const [users, setUsers] = useState<User[]>(() => mockDb.get<User[]>("users", []));
  const [blogs, setBlogs] = useState<Blog[]>(() => mockDb.get<Blog[]>("blogs", []));
  const [comments, setComments] = useState<Comment[]>(() => mockDb.get<Comment[]>("comments", []));
  const [follows, setFollows] = useState<Follow[]>(() => mockDb.get<Follow[]>("follows", []));
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => mockDb.get<Bookmark[]>("bookmarks", []));
  const [notifications, setNotifications] = useState<Notification[]>(() => mockDb.get<Notification[]>("notifications", []));
  const [categories] = useState<Category[]>(() => mockDb.get<Category[]>("categories", []));
  const [tags] = useState<Tag[]>(() => mockDb.get<Tag[]>("tags", []));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load initial blogs and comments from Supabase if configured
  useEffect(() => {
    const loadData = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data: blogsData, error: blogsError } = await supabase
          .from("blogs")
          .select("*")
          .order("createdDate", { ascending: false });

        if (blogsError) throw blogsError;
        if (blogsData) {
          setBlogs(blogsData as Blog[]);
        }

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .order("createdDate", { ascending: true });

        if (commentsError) throw commentsError;
        if (commentsData) {
          setComments(commentsData as Comment[]);
        }
      } catch (error) {
        console.error("Failed to load initial data from Supabase:", error);
      }
    };
    loadData();
  }, []);

  // Sync state changes with mockDb
  useEffect(() => {
    mockDb.set("users", users);
  }, [users]);

  useEffect(() => {
    mockDb.set("blogs", blogs);
  }, [blogs]);

  useEffect(() => {
    mockDb.set("comments", comments);
  }, [comments]);

  useEffect(() => {
    mockDb.set("follows", follows);
  }, [follows]);

  useEffect(() => {
    mockDb.set("bookmarks", bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    mockDb.set("notifications", notifications);
  }, [notifications]);

  // Auto-publish scheduled posts whose time has passed
  useEffect(() => {
    const now = new Date();
    const hasScheduledToPublish = blogs.some(
      (b) => b.status === "scheduled" && b.scheduledDate && new Date(b.scheduledDate) <= now
    );

    if (hasScheduledToPublish) {
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => {
          if (b.status === "scheduled" && b.scheduledDate && new Date(b.scheduledDate) <= now) {
            // Trigger notifications to followers of the author since it's now published
            const followers = follows.filter((f) => f.followingId === b.authorId).map((f) => f.followerId);
            if (followers.length > 0) {
              const newNotifs = followers.map((followerId) => ({
                id: `notif_${Date.now()}_${followerId}_${b.id}`,
                userId: followerId,
                senderId: b.authorId,
                type: "publish" as const,
                blogId: b.id,
                read: false,
                createdDate: new Date().toISOString(),
              }));
              setNotifications((prev) => [...newNotifs, ...prev]);
            }

            const updatedBlog = {
              ...b,
              status: "published" as const,
              publishedDate: new Date().toISOString(),
              scheduledDate: null,
            };

            if (isSupabaseConfigured()) {
              supabase
                .from("blogs")
                .update(updatedBlog)
                .eq("id", b.id)
                .then(({ error }) => {
                  if (error) console.error("Error auto-publishing blog to Supabase:", error);
                });
            }

            toast.success(`Automatically published scheduled story: "${b.title}"`);
            return updatedBlog;
          }
          return b;
        })
      );
    }
  }, [blogs, follows]);

  // Auth Operations
  const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.phone && u.phone.trim() === identifier.trim())
    );
    if (!user) {
      return false;
    }

    if (user.isSuspended) {
      toast.error("This account has been suspended by a moderator.");
      return false;
    }

    if (password) {
      const inputHash = await hashPassword(password);
      if (user.passwordHash !== inputHash) {
        return false;
      }
    } else {
      return false;
    }

    setCurrentUser(user);
    localStorage.setItem("inkspire_current_user", JSON.stringify(user));
    toast.success(`Welcome back, ${user.name}!`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("inkspire_current_user");
    toast.success("Logged out successfully.");
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    role: 'writer' | 'reader',
    phone?: string,
    password?: string
  ): Promise<boolean> => {
    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    const usernameExists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    const phoneExists = phone ? users.some((u) => u.phone && u.phone.trim() === phone.trim()) : false;

    if (emailExists) {
      toast.error("Email is already registered.");
      return false;
    }
    if (usernameExists) {
      toast.error("Username is already taken.");
      return false;
    }
    if (phoneExists) {
      toast.error("Phone number is already registered.");
      return false;
    }

    let passwordHash = "";
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      username: username.toLowerCase(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&h=150&q=80`,
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=300&q=80",
      bio: "A reader and writer on Inkspire publishing platform.",
      website: "",
      socials: { twitter: "", linkedin: "", github: "" },
      role,
      followersCount: 0,
      followingCount: 0,
      privacySettings: { profilePublic: true, allowComments: true },
      joinedDate: new Date().toISOString(),
      isSuspended: false,
      phone,
      passwordHash,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem("inkspire_current_user", JSON.stringify(newUser));
    toast.success("Account created successfully!");
    return true;
  };

  const googleLogin = async (googleUser: { email: string; name: string; avatar: string }): Promise<boolean> => {
    const existingUser = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());
    if (existingUser) {
      if (existingUser.isSuspended) {
        toast.error("This account has been suspended by a moderator.");
        return false;
      }
      setCurrentUser(existingUser);
      localStorage.setItem("inkspire_current_user", JSON.stringify(existingUser));
      toast.success(`Welcome back, ${existingUser.name}!`);
      return true;
    }

    const baseUsername = googleUser.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    let finalUsername = baseUsername || "google_user";
    let index = 1;
    while (users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${baseUsername}${index}`;
      index++;
    }

    const newUser: User = {
      id: `user_google_${Date.now()}`,
      email: googleUser.email,
      name: googleUser.name,
      username: finalUsername,
      avatar: googleUser.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&h=150&q=80`,
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=300&q=80",
      bio: "Joined via Google authentication.",
      website: "",
      socials: { twitter: "", linkedin: "", github: "" },
      role: 'writer',
      followersCount: 0,
      followingCount: 0,
      privacySettings: { profilePublic: true, allowComments: true },
      joinedDate: new Date().toISOString(),
      isSuspended: false,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem("inkspire_current_user", JSON.stringify(newUser));
    toast.success(`Successfully signed in with Google as ${googleUser.name}!`);
    return true;
  };

  const loginWithPhone = async (phone: string): Promise<boolean> => {
    const cleanPhone = phone.trim();
    const existingUser = users.find((u) => u.phone && u.phone.trim() === cleanPhone);
    if (existingUser) {
      if (existingUser.isSuspended) {
        toast.error("This account has been suspended by a moderator.");
        return false;
      }
      setCurrentUser(existingUser);
      localStorage.setItem("inkspire_current_user", JSON.stringify(existingUser));
      toast.success(`Welcome back, ${existingUser.name}!`);
      return true;
    }

    // Create a new reader account
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, "");
    const baseUsername = `user_${cleanDigits}`;
    let finalUsername = baseUsername || "phone_user";
    let index = 1;
    while (users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${baseUsername}_${index}`;
      index++;
    }

    const newUser: User = {
      id: `user_phone_${Date.now()}`,
      email: `phone_${cleanDigits}@inkspire.com`,
      name: `Phone User`,
      username: finalUsername,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&h=150&q=80`,
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=300&q=80",
      bio: "Joined via phone OTP authentication.",
      website: "",
      socials: { twitter: "", linkedin: "", github: "" },
      role: 'reader',
      followersCount: 0,
      followingCount: 0,
      privacySettings: { profilePublic: true, allowComments: true },
      joinedDate: new Date().toISOString(),
      isSuspended: false,
      phone: cleanPhone,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem("inkspire_current_user", JSON.stringify(newUser));
    toast.success("Account created successfully!");
    return true;
  };

  const resetPassword = async (identifier: string, newPasswordHash: string): Promise<boolean> => {
    const userIndex = users.findIndex(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.phone && u.phone.trim() === identifier.trim())
    );
    if (userIndex === -1) {
      return false;
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      passwordHash: newPasswordHash,
    };

    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === updatedUsers[userIndex].id) {
      setCurrentUser(updatedUsers[userIndex]);
      localStorage.setItem("inkspire_current_user", JSON.stringify(updatedUsers[userIndex]));
    }
    return true;
  };

  const updateProfile = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem("inkspire_current_user", JSON.stringify(updatedUser));
    
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    toast.success("Profile updated successfully!");
  };

  // Blog Actions
  const toggleLike = (blogId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to like blogs.");
      return;
    }
    let updatedBlog: Blog | null = null;
    setBlogs((prevBlogs) =>
      prevBlogs.map((b) => {
        if (b.id === blogId) {
          const isLiked = b.likes.includes(currentUser.id);
          const newLikes = isLiked
            ? b.likes.filter((id) => id !== currentUser.id)
            : [...b.likes, currentUser.id];
          
          // Trigger notification to author
          if (!isLiked && b.authorId !== currentUser.id) {
            const newNotification: Notification = {
              id: `notif_${Date.now()}`,
              userId: b.authorId,
              senderId: currentUser.id,
              type: "like",
              blogId: b.id,
              read: false,
              createdDate: new Date().toISOString(),
            };
            setNotifications((prevNotif) => [newNotification, ...prevNotif]);
          }

          const updated = { ...b, likes: newLikes };
          updatedBlog = updated;
          return updated;
        }
        return b;
      })
    );

    if (isSupabaseConfigured() && updatedBlog) {
      supabase
        .from("blogs")
        .update({ likes: (updatedBlog as Blog).likes })
        .eq("id", blogId)
        .then(({ error }) => {
          if (error) console.error("Error updating blog likes in Supabase:", error);
        });
    }
  };

  const toggleBookmark = (blogId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to bookmark blogs.");
      return;
    }

    const isBookmarked = bookmarks.some((b) => b.userId === currentUser.id && b.blogId === blogId);

    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => !(b.userId === currentUser.id && b.blogId === blogId)));
      toast.info("Removed from Bookmarks");
    } else {
      const newBookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        userId: currentUser.id,
        blogId,
      };
      setBookmarks((prev) => [...prev, newBookmark]);
      toast.success("Added to Bookmarks");
    }
  };

  const createBlog = (blogData: Omit<Blog, "id" | "authorId" | "views" | "likes" | "createdDate" | "publishedDate" | "readingTime">) => {
    if (!currentUser) throw new Error("Authentication required.");

    const readingTime = Math.max(1, Math.ceil(blogData.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));

    const newBlog: Blog = {
      ...blogData,
      id: `blog_${Date.now()}`,
      authorId: currentUser.id,
      views: 0,
      likes: [],
      createdDate: new Date().toISOString(),
      publishedDate: blogData.status === "published" ? new Date().toISOString() : null,
      readingTime,
    };

    setBlogs((prev) => [newBlog, ...prev]);

    if (isSupabaseConfigured()) {
      supabase
        .from("blogs")
        .insert(newBlog)
        .then(({ error }) => {
          if (error) {
            console.error("Error saving blog to Supabase:", error);
            toast.error("Failed to save blog post to database.");
          }
        });
    }

    // Send notifications to followers
    const followers = follows.filter((f) => f.followingId === currentUser.id).map((f) => f.followerId);
    if (followers.length > 0 && newBlog.status === "published") {
      const newNotifs = followers.map((followerId) => ({
        id: `notif_${Date.now()}_${followerId}`,
        userId: followerId,
        senderId: currentUser.id,
        type: "publish" as const,
        blogId: newBlog.id,
        read: false,
        createdDate: new Date().toISOString(),
      }));
      setNotifications((prev) => [...newNotifs, ...prev]);
    }

    toast.success(blogData.status === "published" ? "Blog published successfully!" : "Draft saved successfully.");
    return newBlog;
  };

  const updateBlog = (blogId: string, updatedFields: Partial<Blog>) => {
    let updatedBlog: Blog | null = null;
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id === blogId) {
          const updated = { ...b, ...updatedFields };
          // If status changes to published and publishedDate is empty, set it
          if (updatedFields.status === "published" && !b.publishedDate) {
            updated.publishedDate = new Date().toISOString();
          }
          // Recalculate reading time if content changed
          if (updatedFields.content) {
            updated.readingTime = Math.max(1, Math.ceil(updatedFields.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));
          }
          updatedBlog = updated;
          return updated;
        }
        return b;
      })
    );

    if (isSupabaseConfigured() && updatedBlog) {
      supabase
        .from("blogs")
        .update(updatedBlog)
        .eq("id", blogId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating blog in Supabase:", error);
            toast.error("Failed to update blog post in database.");
          }
        });
    }

    toast.success("Blog post updated successfully.");
  };

  const deleteBlog = (blogId: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.blogId !== blogId));
    setComments((prev) => prev.filter((comment) => comment.blogId !== blogId));

    if (isSupabaseConfigured()) {
      supabase
        .from("blogs")
        .delete()
        .eq("id", blogId)
        .then(({ error }) => {
          if (error) {
            console.error("Error deleting blog from Supabase:", error);
            toast.error("Failed to delete blog post from database.");
          }
        });
      
      supabase
        .from("comments")
        .delete()
        .eq("blogId", blogId)
        .then(({ error }) => {
          if (error) console.error("Error deleting blog comments from Supabase:", error);
        });
    }

    toast.success("Blog post deleted successfully.");
  };

  // Follow Operations
  const toggleFollow = (authorId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to follow writers.");
      return;
    }
    if (authorId === currentUser.id) {
      toast.error("You cannot follow yourself.");
      return;
    }

    const followExists = follows.some((f) => f.followerId === currentUser.id && f.followingId === authorId);

    if (followExists) {
      setFollows((prev) => prev.filter((f) => !(f.followerId === currentUser.id && f.followingId === authorId)));
      // Decrement counts
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === currentUser.id) {
            return { ...u, followingCount: Math.max(0, u.followingCount - 1) };
          }
          if (u.id === authorId) {
            return { ...u, followersCount: Math.max(0, u.followersCount - 1) };
          }
          return u;
        })
      );
      toast.info("Unfollowed writer");
    } else {
      const newFollow: Follow = {
        id: `follow_${Date.now()}`,
        followerId: currentUser.id,
        followingId: authorId,
      };
      setFollows((prev) => [...prev, newFollow]);
      // Increment counts
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === currentUser.id) {
            return { ...u, followingCount: u.followingCount + 1 };
          }
          if (u.id === authorId) {
            return { ...u, followersCount: u.followersCount + 1 };
          }
          return u;
        })
      );

      // Trigger notification
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userId: authorId,
        senderId: currentUser.id,
        type: "follow",
        blogId: null,
        read: false,
        createdDate: new Date().toISOString(),
      };
      setNotifications((prevNotif) => [newNotification, ...prevNotif]);
      toast.success("Followed writer");
    }

    // Refresh current user cache in storage
    setTimeout(() => {
      setUsers((latestUsers) => {
        const freshMe = latestUsers.find(u => u.id === currentUser.id);
        if (freshMe) {
          setCurrentUser(freshMe);
          localStorage.setItem("inkspire_current_user", JSON.stringify(freshMe));
        }
        return latestUsers;
      });
    }, 50);
  };

  const isFollowing = (authorId: string) => {
    if (!currentUser) return false;
    return follows.some((f) => f.followerId === currentUser.id && f.followingId === authorId);
  };

  // Comment Operations
  const addComment = (blogId: string, content: string, parentId: string | null) => {
    if (!currentUser) {
      toast.error("Please sign in to write comments.");
      return;
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      blogId,
      userId: currentUser.id,
      content,
      parentId,
      likes: [],
      createdDate: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);

    if (isSupabaseConfigured()) {
      supabase
        .from("comments")
        .insert(newComment)
        .then(({ error }) => {
          if (error) {
            console.error("Error saving comment to Supabase:", error);
            toast.error("Failed to save comment to database.");
          }
        });
    }

    // Send notification to blog owner
    const targetBlog = blogs.find((b) => b.id === blogId);
    if (targetBlog && targetBlog.authorId !== currentUser.id) {
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        userId: targetBlog.authorId,
        senderId: currentUser.id,
        type: "comment",
        blogId: blogId,
        read: false,
        createdDate: new Date().toISOString(),
      };
      setNotifications((prevNotif) => [newNotification, ...prevNotif]);
    }

    toast.success("Comment added.");
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to like comments.");
      return;
    }
    let updatedComment: Comment | null = null;
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.likes.includes(currentUser.id);
          const newLikes = isLiked
            ? c.likes.filter((id) => id !== currentUser.id)
            : [...c.likes, currentUser.id];
          const updated = { ...c, likes: newLikes };
          updatedComment = updated;
          return updated;
        }
        return c;
      })
    );

    if (isSupabaseConfigured() && updatedComment) {
      supabase
        .from("comments")
        .update({ likes: (updatedComment as Comment).likes })
        .eq("id", commentId)
        .then(({ error }) => {
          if (error) console.error("Error updating comment likes in Supabase:", error);
        });
    }
  };

  const editComment = (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content } : c))
    );

    if (isSupabaseConfigured()) {
      supabase
        .from("comments")
        .update({ content })
        .eq("id", commentId)
        .then(({ error }) => {
          if (error) console.error("Error updating comment in Supabase:", error);
        });
    }

    toast.success("Comment updated.");
  };

  const deleteComment = (commentId: string) => {
    let idsToDelete = [commentId];
    setComments((prev) => {
      // Find all IDs to delete (the comment itself + all its nested replies)
      prev.forEach((c) => {
        if (c.parentId === commentId) {
          idsToDelete.push(c.id);
        }
      });
      return prev.filter((c) => !idsToDelete.includes(c.id));
    });

    if (isSupabaseConfigured()) {
      supabase
        .from("comments")
        .delete()
        .in("id", idsToDelete)
        .then(({ error }) => {
          if (error) console.error("Error deleting comment(s) from Supabase:", error);
        });
    }

    toast.success("Comment deleted.");
  };

  // Notification Operations
  const markNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  // Report Operations
  const submitReport = (blogId: string | null, commentId: string | null, reason: string, details: string) => {
    if (!currentUser) {
      toast.error("Please sign in to file reports.");
      return;
    }
    const reports = mockDb.get<Report[]>("reports", []);
    const newReport: Report = {
      id: `report_${Date.now()}`,
      reporterId: currentUser.id,
      blogId,
      commentId,
      reason,
      details,
      status: "pending",
      createdDate: new Date().toISOString(),
    };
    mockDb.set("reports", [...reports, newReport]);
    toast.success("Content reported. Our moderation team will review this shortly.");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        blogs,
        comments,
        follows,
        bookmarks,
        notifications,
        categories,
        tags,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        login,
        loginWithPhone,
        logout,
        register,
        googleLogin,
        resetPassword,
        updateProfile,
        toggleLike,
        toggleBookmark,
        createBlog,
        updateBlog,
        deleteBlog,
        toggleFollow,
        isFollowing,
        addComment,
        toggleLikeComment,
        editComment,
        deleteComment,
        markNotificationsRead,
        submitReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
