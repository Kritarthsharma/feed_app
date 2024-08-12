import { Post } from "../types/types";
import PostItem from "./PostItem";

interface PostListProps {
  posts: Post[];
  onCreateComment: (postId: number, content: string) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onCreateComment }) => {
  return (
    <div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onCreateComment={onCreateComment} />
      ))}
    </div>
  );
};

export default PostList;
