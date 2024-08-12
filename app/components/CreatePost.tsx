import { useState } from "react";

interface CreatePostProps {
  onCreatePost: (content: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCreatePost }) => {
  const [content, setContent] = useState("");

  const handleCreatePost = () => {
    if (content.trim()) {
      onCreatePost(content);
      setContent("");
    }
  };

  return (
    <div className="mb-6">
      <textarea
        className="w-full p-2 border border-gray-300 rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={handleCreatePost}
      >
        Post
      </button>
    </div>
  );
};

export default CreatePost;
