import express from "express";
import Post from "../models/post.model.js";
import protect from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

const router = express.Router();

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private

router.post("/", protect, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    console.log(req.user._id);
    const post = await Post.create({
      title,
      content,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find().populate("createdBy", "username email");
    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET current user's posts only
// GET /api/posts/my-posts
router.get("/my-posts", protect, async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id });
    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single post by ID
// GET /api/posts/single-posts/:id
router.get("/single-posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "createdBy",
      "username email"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
});

//Update post
// PUT /api/posts/u/:id
router.put("/u/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ message: "Not authorized to edit this post" });
    }

    if (post.createdBy.toString() !== req.user.id) {
      console.log(req.user.id, post.createdBy.toString());

      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    const { title, content } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    const updatePost = await post.save();

    res.json({
      message: "Post updated successfully",
      post: updatePost,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//Delete post
// DELETE /api/posts/u/:id
router.delete("/u/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add likes
// PUT /api/posts/like/:id

router.put("/like/:id", protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid post ID" });

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      //remove like
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      //add like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likesCount: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
