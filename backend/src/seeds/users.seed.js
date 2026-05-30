const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User.model');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({ email: { $in: ['brand@demo.com', 'creator@demo.com'] } });

    await User.create([
      { name: 'Brand Demo', email: 'brand@demo.com', password: 'demo123', role: 'brand', company: 'Demo Brand Co' },
      { name: 'Creator Demo', email: 'creator@demo.com', password: 'demo123', role: 'creator' },
    ])

    console.log('Demo users seeded successfully')
    console.log('Brand: brand@demo.com / demo123')
    console.log('Creator: creator@demo.com / demo123')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
}

seedUsers()
