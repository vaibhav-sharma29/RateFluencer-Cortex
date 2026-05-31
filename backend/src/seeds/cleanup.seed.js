const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Influencer = require('../models/Influencer.model');

// Only keep these real YouTube creators
const REAL_CREATORS = [
  'Tech Burner', 'BeerBiceps', 'warikoo', 'Trakin Tech',
  'Marques Brownlee', 'Veritasium', 'Fireship', 'Graham Stephan'
];

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000, family: 4 });
    console.log('Connected');

    const deleted = await Influencer.deleteMany({
      fullName: { $nin: REAL_CREATORS }
    });
    console.log('Deleted fake profiles:', deleted.deletedCount);

    const remaining = await Influencer.countDocuments();
    console.log('Real profiles remaining:', remaining);

    const profiles = await Influencer.find({}, 'fullName platform followers');
    profiles.forEach(p => console.log(`  - ${p.fullName} (${p.platform}) - ${p.followers.toLocaleString()} followers`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
