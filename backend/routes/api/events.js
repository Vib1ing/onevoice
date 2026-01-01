const express = require('express');
const router = express.Router();
const Event = require('../../models/Event');
const { checkJwt, adminOnly } = require('../../middleware/auth');

// Public: list events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: -1 });
  res.json(events);
});

// Admin: create
router.post('/', checkJwt, adminOnly, async (req, res) => {
  const e = new Event(req.body);
  await e.save();
  res.json(e);
});

// Admin: update
router.put('/:id', checkJwt, adminOnly, async (req, res) => {
  const e = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(e);
});

// Admin: delete
router.delete('/:id', checkJwt, adminOnly, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
