import express from "express";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register new user
// @access  Public

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username, !email, !password))
      return res.status(400).json({ message: "ALL fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already in use" });

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and pasword are required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

export default router;
