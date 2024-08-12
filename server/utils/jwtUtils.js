const jwt = require("jsonwebtoken");
const secret = "my_extra_long_secret"; // Should be stored in an environment variable

// Utility function to verify a JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded.sub;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

// Utility function to generate a JWT token
function generateToken(userId) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: "1h" });
}

module.exports = {
  verifyToken,
  generateToken,
};
