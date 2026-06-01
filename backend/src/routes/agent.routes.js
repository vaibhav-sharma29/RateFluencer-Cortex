const express = require('express');
const router = express.Router();
const { runCampaignAgent } = require('../controllers/agent.controller');

router.post('/campaign', runCampaignAgent);

module.exports = router;
