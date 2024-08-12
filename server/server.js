const { WebSocketServer } = require("ws");
const http = require("http");
const { verifyToken } = require("./utils/jwtUtils");
const authService = require("./services/authService");
const postService = require("./services/postService");

const server = http.createServer();
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  console.log("A user connected");
  let authenticatedUser = null;

  // Extract and verify token
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (token) {
    authenticatedUser = verifyToken(token);
    if (!authenticatedUser) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      ws.close();
      return;
    }
  }

  // Handle incoming messages
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "signup":
          await authService.handleSignup(ws, data);
          break;
        case "login":
          authenticatedUser = await authService.handleLogin(ws, data);
          break;
        case "getPosts":
          await postService.fetchPosts(ws, data);
          break;
        case "createPost":
          if (!authenticatedUser) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Authentication required",
              })
            );
          } else {
            await postService.createPost(ws, authenticatedUser, data);
          }
          break;
        case "createComment":
          if (!authenticatedUser) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Authentication required",
              })
            );
          } else {
            await postService.createComment(ws, authenticatedUser, data);
          }
          break;
        default:
          ws.send(
            JSON.stringify({ type: "error", message: "Unknown message type" })
          );
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

// Start the server
server.listen(8080, () => {
  console.log("WebSocket server running on ws://localhost:8080");
});
