const express = require('express');
const router = express.Router();
const { generateContent, predictVirality } = require('../controllers/content.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, generateContent);
router.post('/predict-virality', protect, predictVirality);

module.exports = router;
