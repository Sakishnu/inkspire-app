export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  banner: string;
  bio: string;
  website: string;
  socials: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  role: 'admin' | 'moderator' | 'writer' | 'reader';
  followersCount: number;
  followingCount: number;
  privacySettings: {
    profilePublic: boolean;
    allowComments: boolean;
  };
  joinedDate: string;
  isSuspended?: boolean;
  location?: string;
  phone?: string;
  passwordHash?: string;
}

export interface Blog {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate: string | null;
  category: string;
  tags: string[];
  coverImage: string;
  readingTime: number; // in minutes
  seoTitle: string;
  seoDescription: string;
  views: number;
  likes: string[]; // user IDs
  createdDate: string;
  publishedDate: string | null;
  featured: boolean;
}

export interface Comment {
  id: string;
  blogId: string;
  userId: string;
  content: string;
  parentId: string | null; // for nested replies
  likes: string[]; // user IDs
  createdDate: string;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  senderId: string; // actor
  type: 'like' | 'comment' | 'follow' | 'publish';
  blogId: string | null;
  read: boolean;
  createdDate: string;
}

export interface Report {
  id: string;
  reporterId: string;
  blogId: string | null;
  commentId: string | null;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdDate: string;
}

export interface Block {
  id: string;
  userId: string; // user who blocked
  blockedUserId: string; // user who is blocked
}

export interface Bookmark {
  id: string;
  userId: string;
  blogId: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
}

// Initial Mock Data
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Technology', description: 'Computing, Artificial Intelligence, software dev, and the future of tech.' },
  { id: '2', name: 'Design', description: 'UX/UI design, visual arts, typography, and clean interfaces.' },
  { id: '3', name: 'Productivity', description: 'Time management, habits, focus, and career acceleration.' },
  { id: '4', name: 'Mindfulness', description: 'Stoicism, meditation, healthy living, and digital detoxing.' },
  { id: '5', name: 'Lifestyle', description: 'Travel, personal essays, food, and design for living.' }
];

const INITIAL_TAGS: Tag[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'AI' },
  { id: '3', name: 'UX/UI' },
  { id: '4', name: 'Minimalism' },
  { id: '5', name: 'Career' },
  { id: '6', name: 'Stoicism' },
  { id: '7', name: 'Clean Code' },
  { id: '8', name: 'Deep Work' }
];

const INITIAL_USERS: User[] = [];

const INITIAL_BLOGS: Blog[] = [];

const INITIAL_COMMENTS: Comment[] = [];

const INITIAL_FOLLOWS: Follow[] = [];

const INITIAL_BOOKMARKS: Bookmark[] = [];

const INITIAL_BLOCKS: Block[] = [];

const INITIAL_REPORTS: Report[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [];

// Database operations helper
export const mockDb = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`inkspire_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`inkspire_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },

  init(): void {
    const isInitialized = localStorage.getItem('inkspire_initialized');
    const existingUsers = this.get<User[]>('users', []);
    
    // Check if the old dummy users are present
    const hasDummyData = existingUsers.some(u => u.id === 'user_admin');

    if (!isInitialized || hasDummyData) {
      this.set('users', INITIAL_USERS);
      this.set('blogs', INITIAL_BLOGS);
      this.set('comments', INITIAL_COMMENTS);
      this.set('follows', INITIAL_FOLLOWS);
      this.set('bookmarks', INITIAL_BOOKMARKS);
      this.set('blocks', INITIAL_BLOCKS);
      this.set('reports', INITIAL_REPORTS);
      this.set('notifications', INITIAL_NOTIFICATIONS);
      this.set('categories', INITIAL_CATEGORIES);
      this.set('tags', INITIAL_TAGS);
      localStorage.setItem('inkspire_initialized', 'true');
      localStorage.removeItem('inkspire_current_user'); // also clear logged in user if it was dummy
    }
  },

  reset(): void {
    localStorage.removeItem('inkspire_initialized');
    this.init();
  }
};
