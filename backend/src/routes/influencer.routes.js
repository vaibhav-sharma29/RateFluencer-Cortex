const express = require('express');
const router = express.Router();
const {
  getInfluencers,
  getInfluencerById,
  analyzeInfluencer,
  getTopInfluencers,
} = require('../controllers/influencer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getInfluencers);
router.get('/top', getTopInfluencers);
router.get('/:id', getInfluencerById);
router.post('/:id/analyze', protect, analyzeInfluencer);

module.exports = router;
