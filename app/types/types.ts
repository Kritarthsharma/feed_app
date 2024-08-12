export interface Comment {
  id: number;
  content: string;
  author: { username: string };
  postId: number;
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  author: { username: string };
  comments: Comment[];
  createdAt: string;
}
