import React from "react";
import { Link } from "react-router-dom";
import { Feather, Twitter, Linkedin, Github, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/30 border-t transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Feather className="h-5 w-5 text-primary rotate-12" />
              <span>Inkspire</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A premium space for ideas, code, stories, and mindful thoughts. Share your perspective with the world.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full flex items-center justify-center border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trending Articles
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Popular Authors
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Write</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/studio?tab=stories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Creator Studio
                </Link>
              </li>

              <li>
                <Link to="/studio" className="text-muted-foreground hover:text-foreground transition-colors">
                  Author Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Inkspire. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for thinkers & creators.
          </p>
        </div>
      </div>
    </footer>
  );
};
