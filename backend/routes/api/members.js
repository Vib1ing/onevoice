const express = require('express');
const router = express.Router();
const Member = require('../../models/Member');
const { checkJwt, adminOnly } = require('../../middleware/auth');

// Public: list members
router.get('/', async (req, res) => {
  const members = await Member.find().sort({ joined: -1 });
  res.json(members);
});

// Admin: create
router.post('/', checkJwt, adminOnly, async (req, res) => {
  try {
    const m = new Member(req.body);
    await m.save();
    res.json(m);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update
router.put('/:id', checkJwt, adminOnly, async (req, res) => {
  try {
    const m = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(m);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: delete
router.delete('/:id', checkJwt, adminOnly, async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
