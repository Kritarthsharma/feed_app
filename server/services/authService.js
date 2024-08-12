const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");
const { generateToken } = require("../utils/jwtUtils");

const prisma = new PrismaClient();

// Handle user signup
async function handleSignup(ws, data) {
  const { username, email, password, name, lastname } = data;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    ws.send(JSON.stringify({ type: "error", message: "User already exists" }));
  } else {
    const hashedPassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, name, lastname },
    });
    ws.send(JSON.stringify({ type: "userCreated", user }));
  }
}

// Handle user login
async function handleLogin(ws, data) {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    ws.send(JSON.stringify({ type: "error", message: "User does not exist" }));
    return null;
  }

  const passwordMatch = await argon2.verify(user.password, password);
  if (!passwordMatch) {
    ws.send(JSON.stringify({ type: "error", message: "Incorrect password" }));
    return null;
  }

  const token = generateToken(user.id);
  ws.send(JSON.stringify({ type: "loginSuccess", user, token }));
  return user.id;
}

module.exports = {
  handleSignup,
  handleLogin,
};
