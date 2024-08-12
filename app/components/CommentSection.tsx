import { Comment } from "../types/types";
import { useState } from "react";

interface CommentSectionProps {
  comments: Comment[];
  postId: number;
  onCreateComment: (postId: number, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onCreateComment,
}) => {
  const [commentContent, setCommentContent] = useState("");

  const handleCreateComment = () => {
    if (commentContent.trim()) {
      onCreateComment(postId, commentContent);
      setCommentContent("");
    }
  };

  return (
    <div className="mt-4">
      <h2 className="font-semibold mb-2">Comments:</h2>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="ml-4 mb-2 p-2 border-l border-gray-300"
          >
            <p className="font-bold">{comment.author.username}</p>
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="ml-4 text-gray-500">No comments yet.</p>
      )}

      <div className="mt-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Add a comment"
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          onClick={handleCreateComment}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
