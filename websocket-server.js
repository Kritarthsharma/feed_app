const { WebSocketServer } = require("ws");
const http = require("http");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2"); // For password hashing

const prisma = new PrismaClient();
const secret = "my_extra_long_secret"; // Should be stored in an environment variable

// Create an HTTP server to pair with WebSocket
const server = http.createServer();

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("A user connected");

  let authenticatedUser = null;

  // Parse the token from the query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (token) {
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, secret);
      authenticatedUser = decoded.sub;
    } catch (err) {
      console.log("Invalid token");
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      ws.close();
      return;
    }
  }

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "signup") {
        const { username, email, password, name, lastname } = data;

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          ws.send(
            JSON.stringify({ type: "error", message: "User already exists" })
          );
        } else {
          const hashedPassword = await argon2.hash(password);
          const user = await prisma.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
              name,
              lastname,
            },
          });

          ws.send(JSON.stringify({ type: "userCreated", user }));
        }
      }

      if (data.type === "login") {
        const { email, password } = data;

        // Check if the user exists
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          ws.send(
            JSON.stringify({ type: "error", message: "User does not exist" })
          );
        } else {
          const passwordMatch = await argon2.verify(user.password, password);

          if (passwordMatch) {
            authenticatedUser = user;
            const token = jwt.sign({ sub: user.id }, secret, {
              expiresIn: "1h",
            }); // Generate JWT
            ws.send(JSON.stringify({ type: "loginSuccess", user, token })); // Send the token back to the client
          } else {
            ws.send(
              JSON.stringify({ type: "error", message: "Incorrect password" })
            );
          }
        }
      }

      // Fetch paginated posts
      if (data.type === "getPosts") {
        const { page = 1, pageSize = 10 } = data;

        const posts = await prisma.post.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            comments: { include: { author: true } },
            author: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const totalPosts = await prisma.post.count();
        const totalPages = Math.ceil(totalPosts / pageSize);

        ws.send(
          JSON.stringify({
            type: "postsPage",
            posts,
            currentPage: page,
            totalPages,
          })
        );
      }

      // Ensure the user is authenticated before allowing post creation
      if (data.type === "createPost") {
        if (!authenticatedUser) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Authentication required",
            })
          );
          return;
        }

        const { content } = data;
        const post = await prisma.post.create({
          data: { content, authorId: authenticatedUser },
          include: { comments: { include: { author: true } }, author: true },
        });

        const broadcastData = JSON.stringify({ type: "newPost", post });
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(broadcastData);
          }
        });
      }

      // Ensure the user is authenticated before allowing comment creation
      if (data.type === "createComment") {
        if (!authenticatedUser) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Authentication required",
            })
          );
          return;
        }

        const { content, postId } = data;
        const comment = await prisma.comment.create({
          data: { content, postId, authorId: authenticatedUser },
          include: { author: true },
        });

        const broadcastData = JSON.stringify({ type: "newComment", comment });
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(broadcastData);
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Error processing your request",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

// Start the server on port 8080
server.listen(8080, () => {
  console.log("WebSocket server running on ws://localhost:8080");
});
