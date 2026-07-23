import asyncHandler from 'express-async-handler';
import Learning from "../models/Learning.js";
import Review from "../models/Review.js";
import { calculateNextDate } from "../utils/spacedRepetition.js";

export const createLearning = asyncHandler(async (req, res) => {
  const { topic, description } = req.body;

  const initialStage = 1;
  const newLog = new Learning({
    user: req.user.id,
    topic: topic.trim(),
    description: description?.trim() || '',
    nextReviewDate: calculateNextDate(initialStage),
    stage: initialStage,
  });

  await newLog.save();
  res.status(201).json(newLog);
});


export const getLearnings = asyncHandler(async (req, res) => {
  const logs = await Learning.find({ user: req.user.id }).sort({ nextReviewDate: 1 });
  res.json(logs);
});


export const reviewLearning = asyncHandler(async (req, res) => {
  const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });

  if (!log) {
    res.status(404);
    throw new Error("Learning log not found");
  }

  const { difficulty } = req.body;
  const validDifficulties = ['hard', 'good', 'easy'];
  if (!difficulty || !validDifficulties.includes(difficulty)) {
    res.status(400);
    throw new Error("Invalid or missing difficulty. Must be one of: hard, good, easy");
  }

  const stageBefore = log.stage;

  if (difficulty === 'hard') {
    log.stage = Math.max(1, log.stage - 1);
  } else if (difficulty === 'easy') {
    log.stage += 2;
  } else if (difficulty === 'good') {
    log.stage += 1;
  }

  const stageAfter = log.stage;
  const reviewedAt = new Date();

  log.nextReviewDate = calculateNextDate(log.stage);
  log.lastReviewedAt = reviewedAt;
  await log.save();

  await Review.create({
    user: req.user.id,
    learning: log._id,
    difficulty,
    stageBefore,
    stageAfter,
    reviewedAt,
  });

  res.json(log);
});

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const totalTopics = await Learning.countDocuments({ user: userId });

  const dueToday = await Learning.countDocuments({
    user: userId,
    nextReviewDate: { $lte: endOfToday },
  });

  const reviewedThisWeek = await Review.countDocuments({
    user: userId,
    reviewedAt: { $gte: weekStart },
  });

  const stageBreakdown = await Learning.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$stage', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Streak: count consecutive days going back from today that had at least one review
  const reviews = await Review.find(
    { user: userId, reviewedAt: { $exists: true } },
    { reviewedAt: 1 }
  );

  const reviewDays = new Set(
    reviews.map(r => new Date(r.reviewedAt).toDateString())
  );

  let streak = 0;
  const check = new Date();
  while (reviewDays.has(check.toDateString())) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  res.json({
    totalTopics,
    dueToday,
    reviewedThisWeek,
    streak,
    stageBreakdown,
  });
});

export const getLearning = asyncHandler(async (req, res) => {
  const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
  if (!log) {
    res.status(404);
    throw new Error('Learning log not found');
  }
  res.json(log);
});

export const updateLearning = asyncHandler(async (req, res) => {
  const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
  if (!log) {
    res.status(404);
    throw new Error('Learning log not found');
  }

  const { topic, description } = req.body;

  log.topic = topic.trim();
  log.description = description?.trim() || '';
  await log.save();
  res.json(log);
});

export const deleteLearning = asyncHandler(async (req, res) => {
  const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
  if (!log) {
    res.status(404);
    throw new Error('Learning log not found');
  }
  await log.deleteOne();
  res.json({ message: 'Deleted successfully' });
});