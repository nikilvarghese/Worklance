const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jobportal-dev-secret");
    
    // Check passwordSet flag for all routes except /set-password
    if (req.path !== "/set-password") {
      const User = require("../models/User");
      const Hr = require("../models/Hr");
      const Model = decoded.role === "hr" ? Hr : User;
      const account = await Model.findById(decoded.id).select("passwordSet");
      
      if (account && account.passwordSet === false) {
        return res.status(403).json({ message: "Please set your password first.", requiresPasswordSet: true });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
