export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  categoryId: string;
  publishedAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}
