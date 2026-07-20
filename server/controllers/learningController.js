import asyncHandler from 'express-async-handler';
import Learning from "../models/Learning.js";
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

  if (difficulty === 'hard') {
    log.stage = Math.max(1, log.stage - 1);
  } else if (difficulty === 'easy') {
    log.stage += 2;
  } else {
    log.stage += 1;
  }

  log.nextReviewDate = calculateNextDate(log.stage);
  log.lastReviewedAt = new Date();
  await log.save();
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

  const reviewedThisWeek = await Learning.countDocuments({
    user: userId,
    lastReviewedAt: { $gte: weekStart },
  });

  const stageBreakdown = await Learning.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$stage', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const reviews = await Learning.find(
    { user: userId, lastReviewedAt: { $exists: true } },
    { lastReviewedAt: 1 }
  );

  const reviewDays = new Set(
    reviews.map(r => new Date(r.lastReviewedAt).toDateString())
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