const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/influencers', require('./routes/influencer.routes'));
app.use('/api/brand', require('./routes/brand.routes'));
app.use('/api/content', require('./routes/content.routes'));
app.use('/api/trends', require('./routes/trend.routes'));
app.use('/api/youtube', require('./routes/youtube.routes'));
app.use('/api/agent', require('./routes/agent.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RateFluencer Backend is running 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ RateFluencer Backend running on http://localhost:${PORT}`);
});

module.exports = app;
