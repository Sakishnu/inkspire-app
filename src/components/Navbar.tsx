import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Bell, Search, Menu, Feather, LogOut, User, BookOpen, PenTool, ChevronLeft } from "lucide-react";

export const Navbar: React.FC = () => {
  const { currentUser, logout, notifications, markNotificationsRead, users, searchQuery, setSearchQuery } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.userId === currentUser?.id && !n.read).length;
  const myNotifications = notifications.filter((n) => n.userId === currentUser?.id);

  const getActorInfo = (senderId: string) => {
    return users.find((u) => u.id === senderId);
  };

  const handleNotificationClick = () => {
    markNotificationsRead();
  };

  const activeLink = (path: string) => {
    return location.pathname === path
      ? "text-foreground font-semibold"
      : "text-muted-foreground hover:text-foreground transition-colors duration-200";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== "/" && location.pathname !== "/feed") {
      navigate("/feed");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left Side: Brand and Links */}
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex items-center gap-2">
            {location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-xl font-sans">
              <Feather className="h-6 w-6 text-primary rotate-12" />
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Inkspire
              </span>
            </Link>
          </div>

          <nav className="flex gap-4 md:gap-6 text-xs sm:text-sm font-medium">
            <Link to="/" className={activeLink("/")}>
              Explore
            </Link>
            {currentUser && (
              <Link to="/studio" className={activeLink("/studio")}>
                <span className="hidden sm:inline">Creator Studio</span>
                <span className="sm:hidden">Studio</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stories, topics, authors..."
              className="pl-9 pr-4 h-9 w-full bg-muted/40 border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Side: Theme, Auth, Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-4">

          <ThemeToggle />

          {/* Notifications Dropdown */}
          {currentUser && (
            <DropdownMenu onOpenChange={(open) => open && handleNotificationClick()}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                  <Bell className="h-[1.2rem] w-[1.2rem]" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600 text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="font-semibold text-sm px-2 py-1.5 flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">New updates</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {myNotifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  myNotifications.map((notif) => {
                    const actor = getActorInfo(notif.senderId);
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        className="flex items-start gap-3 p-2.5 cursor-pointer rounded-md focus:bg-accent"
                        onClick={() => {
                          if (notif.blogId) {
                            navigate(`/blog/${notif.blogId}`);
                          }
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={actor?.avatar} alt={actor?.name} />
                          <AvatarFallback>{actor?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs text-foreground">
                            <span className="font-semibold">{actor?.name}</span>{" "}
                            {notif.type === "like" && "liked your blog post."}
                            {notif.type === "comment" && "commented on your blog post."}
                            {notif.type === "follow" && "started following you."}
                            {notif.type === "publish" && "published a new blog post."}
                          </p>
                          <span className="text-[10px] text-muted-foreground block">
                            {new Date(notif.createdDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile Avatar / Sign In */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full focus-visible:ring-1 focus-visible:ring-primary/20">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal cursor-pointer hover:bg-muted/50 rounded-sm transition-colors p-2" onClick={() => navigate("/profile")}>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{currentUser.username} ({currentUser.role})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/studio")}>
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>Creator Studio</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/feed")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Feed</span>
                </DropdownMenuItem>


                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button size="sm" onClick={() => navigate("/login")} className="rounded-full px-5 font-semibold">
                Sign In
              </Button>
            </div>
          )}

          {/* Mobile Sheet Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Feather className="h-5 w-5 text-primary rotate-12" />
                  <span>Inkspire Menu</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-5 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:hidden">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search blogs..."
                    className="pl-9 pr-4 h-9 w-full bg-muted/40 border-none rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <nav className="flex flex-col gap-3">
                  <Link
                    to="/"
                    className="text-lg font-medium py-1.5 border-b"
                    onClick={() => setMobileOpen(false)}
                  >
                    Explore
                  </Link>
                  {currentUser && (
                    <>
                      <Link
                        to="/profile"
                        className="text-lg font-medium py-1.5 border-b"
                        onClick={() => setMobileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/studio"
                        className="text-lg font-medium py-1.5 border-b"
                        onClick={() => setMobileOpen(false)}
                      >
                        Creator Studio
                      </Link>
                    </>
                  )}
                </nav>

                <div className="flex flex-col gap-2.5 mt-auto">
                  {currentUser ? (
                    <div className="flex flex-col gap-3 border-t pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{currentUser.name}</p>
                          <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="w-full text-red-500 border-red-200 dark:border-red-900/40 hover:bg-red-500/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 border-t pt-4">
                      <Button className="w-full rounded-full font-semibold" onClick={() => {
                        navigate("/login");
                        setMobileOpen(false);
                      }}>
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
