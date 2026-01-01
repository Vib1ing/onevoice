const express = require('express');
const router = express.Router();
const Blog = require('../../models/Blog');
const { checkJwt, adminOnly } = require('../../middleware/auth');

// Public: list blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find().sort({ published: -1 });
  res.json(blogs);
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
