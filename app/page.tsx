"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Post = {
  id: number;
  content: string;
  author: { username: string };
  comments: Comment[];
  createdAt: string;
};

type Comment = {
  id: number;
  content: string;
  author: { username: string };
  postId: number;
  createdAt: string;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(); // Redirects to the login page if not authenticated
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      const token = session?.user?.token;

      // Pass the token when establishing the WebSocket connection
      ws.current = new WebSocket(`ws://localhost:8080?token=${token}`);

      ws.current.onopen = () => {
        console.log("Connected to WebSocket server");
        requestPostsPage(1); // Fetch the first page of posts on load
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "postsPage") {
          setPosts(data.posts);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
        }

        if (data.type === "newPost") {
          setPosts((prev) => [data.post, ...prev]);
        }

        if (data.type === "newComment") {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === data.comment.postId
                ? { ...post, comments: [...post.comments, data.comment] }
                : post
            )
          );
        }

        if (data.type === "error") {
          alert(data.message);
        }
      };

      ws.current.onclose = () => {
        console.log("Disconnected from WebSocket server");
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [status]);

  const requestPostsPage = (page: number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: "getPosts",
        page,
        pageSize: 10, // Adjust page size as needed
      });
      ws.current.send(message);
    }
  };

  const handleCreatePost = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: "createPost",
        content,
        token: session?.user?.token, // Include the token in the request
      });
      ws.current.send(message);
      setContent("");
    } else {
      console.error("WebSocket is not open");
    }
  };

  const handleCreateComment = (postId: number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: "createComment",
        content: commentContent,
        postId,
        token: session?.user?.token, // Include the token in the request
      });
      ws.current.send(message);
      setCommentContent("");
    } else {
      console.error("WebSocket is not open");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      requestPostsPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      requestPostsPage(currentPage - 1);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "authenticated") {
    return (
      <div className="p-8">
        <h1 className="text-2xl">Welcome, {session?.user?.name}</h1>
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Social Media Feed</h1>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* New Post Form */}
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

          {/* Posts List */}
          <div>
            {posts.map((post) => (
              <div key={post.id} className="mb-6">
                <div className="p-4 border border-gray-300 rounded bg-white">
                  <p className="font-bold">{post.author.username}</p>
                  <p>{post.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>

                  {/* Comments Section */}
                  <div className="mt-4">
                    <h2 className="font-semibold mb-2">Comments:</h2>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
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

                    {/* Add Comment */}
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
                        onClick={() => handleCreateComment(post.id)}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-black">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Return nothing if not authenticated (fallback)
}
