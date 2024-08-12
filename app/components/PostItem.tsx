import { Post } from "../types/types";
import CommentSection from "./CommentSection";

interface PostItemProps {
  post: Post;
  onCreateComment: (postId: number, content: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onCreateComment }) => {
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded bg-white">
      <p className="font-bold">{post.author.username}</p>
      <p>{post.content}</p>
      <p className="text-sm text-gray-500">
        {new Date(post.createdAt).toLocaleString()}
      </p>

      <CommentSection
        comments={post.comments}
        postId={post.id}
        onCreateComment={onCreateComment}
      />
    </div>
  );
};

export default PostItem;
