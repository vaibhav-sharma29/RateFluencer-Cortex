const express = require('express');
const router = express.Router();
const { matchInfluencers, getCampaignRecommendations } = require('../controllers/brand.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/match', protect, matchInfluencers);
router.post('/campaign', protect, getCampaignRecommendations);

module.exports = router;
