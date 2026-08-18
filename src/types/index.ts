export type UserRole = 'user' | 'admin' | 'editor';

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  createdAt: number;
  followerCount: number;
  followingCount: number;
  articleCount: number;
  website?: string;
}

export type ArticleStatus = 'draft' | 'published' | 'hidden' | 'rejected';

export interface Article {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  authorBio?: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown or rich formatted text
  coverImage?: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  status: ArticleStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isFeatured?: boolean;
  readTimeMinutes?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: number;
}

export interface Like {
  id: string;
  articleId: string;
  userId: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: number;
  article?: Article;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}

export type ReportTargetType = 'article' | 'comment' | 'user';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: string;
  detail?: string;
  status: ReportStatus;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  icon?: string;
  articleCount?: number;
  createdAt?: number;
}

export interface ArticleFilters {
  category?: string;
  tag?: string;
  authorId?: string;
  status?: ArticleStatus | 'all';
  sort?: 'latest' | 'popular' | 'views' | 'likes' | 'comments';
  search?: string;
  limit?: number;
  featuredOnly?: boolean;
}
