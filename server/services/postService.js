const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Fetch paginated posts
async function fetchPosts(ws, data) {
  const { page = 1, pageSize = 5 } = data;
  const posts = await prisma.post.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { comments: { include: { author: true } }, author: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPosts = await prisma.post.count();
  const totalPages = Math.ceil(totalPosts / pageSize);

  ws.send(
    JSON.stringify({ type: "postsPage", posts, currentPage: page, totalPages })
  );
}

// Create a new post
async function createPost(ws, userId, data) {
  const { content } = data;
  const post = await prisma.post.create({
    data: { content, authorId: userId },
    include: { comments: { include: { author: true } }, author: true },
  });

  const broadcastData = JSON.stringify({ type: "newPost", post });
  broadcastToClients(ws, broadcastData);
}

// Create a new comment
async function createComment(ws, userId, data) {
  const { content, postId } = data;
  const comment = await prisma.comment.create({
    data: { content, postId, authorId: userId },
    include: { author: true },
  });

  const broadcastData = JSON.stringify({ type: "newComment", comment });
  broadcastToClients(ws, broadcastData);
}

// Utility function to broadcast data to all connected clients
function broadcastToClients(ws, data) {
  ws.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(data);
    }
  });
}

module.exports = {
  fetchPosts,
  createPost,
  createComment,
};
