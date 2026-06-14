import { Link } from "react-router-dom";
import { User } from "@/utils/mockDb";
import { useApp } from "@/context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { UserPlus, UserCheck } from "lucide-react";

interface AuthorCardProps {
  author: User;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const { currentUser, toggleFollow, isFollowing } = useApp();
  const following = isFollowing(author.id);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFollow(author.id);
  };

  const isMe = currentUser?.id === author.id;

  return (
    <Card className="border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 text-center flex flex-col items-center justify-between h-full">
        <div className="flex flex-col items-center">
          {/* Avatar with ring */}
          <Link to={`/profile?id=${author.id}`}>
            <Avatar className="h-20 w-20 border-2 border-border shadow-sm mb-4 hover:scale-105 transition-transform duration-200">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>

          {/* User Details */}
          <Link to={`/profile?id=${author.id}`} className="hover:text-primary hover:underline transition-colors duration-200">
            <h4 className="font-bold text-base tracking-tight leading-snug">{author.name}</h4>
          </Link>
          <Link to={`/profile?id=${author.id}`} className="hover:text-primary transition-colors duration-200 block mb-3">
            <span className="text-xs text-muted-foreground">@{author.username}</span>
          </Link>

          {/* Bio */}
          <p className="text-xs text-muted-foreground line-clamp-3 mb-4 max-w-[200px] h-[48px] overflow-hidden leading-relaxed">
            {author.bio || "No bio available."}
          </p>
        </div>

        {/* Follow Stats and Action */}
        <div className="w-full space-y-4 mt-auto">
          <div className="flex justify-around text-center border-t border-b py-2 text-xs">
            <div>
              <span className="block font-bold text-foreground">{author.followersCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</span>
            </div>
            <div>
              <span className="block font-bold text-foreground">{author.followingCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Following</span>
            </div>
          </div>

          {!isMe && currentUser && (
            <Button
              variant={following ? "outline" : "default"}
              size="sm"
              className={`w-full rounded-full transition-all duration-300 ${
                following
                  ? "border-primary/20 text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-500/5"
                  : ""
              }`}
              onClick={handleFollowClick}
            >
              {following ? (
                <>
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          )}

          {!currentUser && (
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full"
              onClick={() => toggleFollow(author.id)}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              <span>Follow</span>
            </Button>
          )}

          {isMe && (
            <Button variant="outline" size="sm" className="w-full rounded-full text-muted-foreground" disabled>
              You
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
