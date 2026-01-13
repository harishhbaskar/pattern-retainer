import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Learning from './models/Learning.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // 1. CLEAR EXISTING DATA
    await User.deleteMany({});
    await Learning.deleteMany({});
    console.log('🗑️  Cleared existing data...');

    // 2. CREATE A DEMO USER
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
    });
    console.log('👤 Created user: demo@example.com / password123');

    // 3. GENERATE DATES
    const today = new Date();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Overdue

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 4. CREATE LEARNING LOGS (Bypassing Controller Logic)
    const logs = [
      {
        user: user._id,
        topic: 'React Native Navigation',
        description: 'Understood stack vs tab navigators.',
        stage: 3,
        nextReviewDate: today, // DUE TODAY (Shows on Dashboard)
      },
      {
        user: user._id,
        topic: 'MongoDB Aggregation',
        description: 'Using $match and $group pipelines.',
        stage: 1,
        nextReviewDate: yesterday, // OVERDUE (Shows on Dashboard)
      },
      {
        user: user._id,
        topic: 'Docker Containers',
        description: 'How to containerize a MERN app.',
        stage: 5,
        nextReviewDate: tomorrow, // FUTURE (Shows on Calendar)
      },
      {
        user: user._id,
        topic: 'TypeScript Generics',
        description: 'Using <T> to make reusable components.',
        stage: 2,
        nextReviewDate: nextWeek, // FUTURE (Shows on Calendar)
      },
      {
        user: user._id,
        topic: 'Redux Toolkit',
        description: 'Managing global state with slices.',
        stage: 4,
        nextReviewDate: today, // DUE TODAY
      },
    ];

    await Learning.insertMany(logs);
    console.log(`📚 Inserted ${logs.length} learning logs with custom dates`);

    console.log('✅ Seeding Complete! Press Ctrl+C to exit if it hangs.');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();