const express = require('express');
const router = express.Router();
const { getTrends, generateFromTrend } = require('../controllers/trend.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getTrends);
router.post('/generate', protect, generateFromTrend);

module.exports = router;
