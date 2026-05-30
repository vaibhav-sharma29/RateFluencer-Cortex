const express = require('express');
const router = express.Router();
const { buildInfluencerProfile } = require('../services/youtube.service');
const Influencer = require('../models/Influencer.model');
const { protect } = require('../middleware/auth.middleware');

router.get('/channel/:username', async (req, res) => {
  try {
    const profile = await buildInfluencerProfile(req.params.username);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'YouTube channel not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/import/:username', async (req, res) => {
  try {
    const profile = await buildInfluencerProfile(req.params.username);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'YouTube channel not found' });
    }

    const existing = await Influencer.findOne({ username: profile.username, platform: 'youtube' });
    if (existing) {
      Object.assign(existing, profile);
      await existing.save();
      return res.json({ success: true, message: 'Influencer updated', data: existing });
    }

    const influencer = await Influencer.create(profile);
    res.status(201).json({ success: true, message: 'Influencer imported from YouTube', data: influencer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
