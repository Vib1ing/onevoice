const express = require('express');
const router = express.Router();
const Blog = require('../../models/Blog');
const { checkJwt, adminOnly } = require('../../middleware/auth');

// Public: list blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find().sort({ published: -1 });
  res.json(blogs);
});

// Public: get single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Admin: create
router.post('/', checkJwt, adminOnly, async (req, res) => {
  const b = new Blog(req.body);
  await b.save();
  res.json(b);
});

// Admin: update
router.put('/:id', checkJwt, adminOnly, async (req, res) => {
  const b = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(b);
});

// Admin: delete
router.delete('/:id', checkJwt, adminOnly, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
