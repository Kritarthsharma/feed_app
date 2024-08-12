"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PostList from "./components/PostList";
import CreatePost from "./components/CreatePost";
import PaginationControls from "./components/PaginationControls";
import { Post } from "./types/types";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      const token = session?.user?.token;
      ws.current = new WebSocket(`ws://localhost:8080?token=${token}`);

      ws.current.onopen = () => {
        requestPostsPage(1);
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
      const message = JSON.stringify({ type: "getPosts", page, pageSize: 10 });
      ws.current.send(message);
    }
  };

  const handleCreatePost = (content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: "createPost",
        content,
        token: session?.user?.token,
      });
      ws.current.send(message);
    }
  };

  const handleCreateComment = (postId: number, content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: "createComment",
        postId,
        content,
        token: session?.user?.token,
      });
      ws.current.send(message);
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

          <CreatePost onCreatePost={handleCreatePost} />

          <PostList posts={posts} onCreateComment={handleCreateComment} />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        </div>
      </div>
    );
  }

  return null;
}
