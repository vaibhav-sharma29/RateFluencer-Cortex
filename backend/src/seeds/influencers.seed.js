const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Influencer = require('../models/Influencer.model');

const niches = ['AI & Technology', 'Finance', 'Business', 'Startups', 'Creator Economy', 'Fitness', 'Travel', 'Food', 'Fashion', 'Education'];
const platforms = ['instagram', 'youtube', 'linkedin', 'twitter'];
const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'New York', 'London', 'Dubai', 'Singapore'];
const ageGroups = ['18-24', '25-34', '35-44', '18-34'];
const countries = ['India', 'USA', 'UK', 'UAE', 'Singapore'];

const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Kavya', 'Aditya', 'Meera', 'Karan', 'Divya', 'Siddharth', 'Pooja', 'Nikhil', 'Shreya', 'Amit', 'Riya', 'Varun', 'Nisha'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Mehta', 'Joshi', 'Nair', 'Reddy', 'Kapoor', 'Malhotra', 'Bose', 'Iyer', 'Rao'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateGrowthHistory() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let followers = randomBetween(10000, 500000);
  return months.map((month) => {
    followers = Math.floor(followers * randomFloat(1.01, 1.08));
    return { month, followers, engagementRate: randomFloat(1.5, 8.5) };
  });
}

function generateInfluencer(index) {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const fullName = `${firstName} ${lastName}`;
  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${randomBetween(1, 99)}`;
  const niche = niches[index % niches.length];
  const platform = platforms[index % platforms.length];
  const followers = randomBetween(5000, 2000000);
  const avgLikes = Math.floor(followers * randomFloat(0.02, 0.12));
  const avgComments = Math.floor(avgLikes * randomFloat(0.05, 0.15));
  const avgShares = Math.floor(avgLikes * randomFloat(0.02, 0.08));
  const avgSaves = Math.floor(avgLikes * randomFloat(0.03, 0.10));
  const avgViews = Math.floor(followers * randomFloat(0.3, 2.5));

  const influencerScore = randomBetween(45, 98);
  const authenticityScore = randomBetween(50, 99);
  const growthScore = randomBetween(40, 95);

  return {
    username,
    fullName,
    platform,
    niche,
    bio: `${niche} creator | Sharing insights on ${niche.toLowerCase()} | ${randomBetween(2, 8)} years experience | Based in ${locations[index % locations.length]}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    location: locations[index % locations.length],
    followers,
    following: randomBetween(100, 5000),
    totalPosts: randomBetween(50, 2000),
    avgLikes,
    avgComments,
    avgShares,
    avgSaves,
    avgViews,
    postingFrequency: randomFloat(1, 7),
    audienceDemographics: {
      ageGroup: ageGroups[index % ageGroups.length],
      topCountry: countries[index % countries.length],
      genderSplit: {
        male: randomBetween(30, 70),
        female: randomBetween(30, 70),
      },
    },
    growthHistory: generateGrowthHistory(),
    scores: {
      influencerScore,
      authenticityScore,
      growthScore,
      brandMatchScore: null,
    },
    isVerified: Math.random() > 0.7,
    isActive: true,
  };
}

async function seedInfluencers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Influencer.deleteMany({});
    console.log('🗑️  Cleared existing influencers');

    const influencers = Array.from({ length: 50 }, (_, i) => generateInfluencer(i));
    await Influencer.insertMany(influencers);

    console.log(`✅ Seeded 50 influencers successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedInfluencers();
