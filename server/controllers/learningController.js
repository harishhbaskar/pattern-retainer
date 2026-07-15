import Learning from "../models/Learning.js";
import Review from "../models/Review.js";


const calculateNextDate = (stage) => {
  const MAX_DAYS = 90;
  const daysToAdd = Math.min(Math.pow(2, stage - 1), MAX_DAYS);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

export const createLearning = async (req, res) => {
  try {
    const { topic, description } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ message: 'Topic is required' });
    }

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLearnings = async (req, res) => {
  try {
    
    const logs = await Learning.find({ user: req.user.id }).sort({ nextReviewDate: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const reviewLearning = async (req, res) => {
  try {
    const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!log) return res.status(404).json({ message: "Not found" });

    const { difficulty } = req.body;

    const validDifficulties = ['hard', 'good', 'easy'];
    if (!difficulty || !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid or missing difficulty. Must be one of: hard, good, easy" });
    }

    const stageBefore = log.stage;

    if (difficulty === 'hard') {
      // Hard: decrease stage by 1, with a minimum of stage 1
      log.stage = Math.max(1, log.stage - 1);
    } else if (difficulty === 'easy') {
      // Easy: skip a stage
      log.stage += 2;
    } else if (difficulty === 'good') {
      // Good (default): normal progression
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLearning = async (req, res) => {
  try {
    const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
    if (!log) return res.status(404).json({ message: 'Not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLearning = async (req, res) => {
  try {
    const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
    if (!log) return res.status(404).json({ message: 'Not found' });

    const { topic, description } = req.body;
    if (!topic || topic.trim() === '') {
      return res.status(400).json({ message: 'Topic is required' });
    }

    log.topic = topic.trim();
    log.description = description?.trim() || '';
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLearning = async (req, res) => {
  try {
    const log = await Learning.findOne({ _id: req.params.id, user: req.user.id });
    if (!log) return res.status(404).json({ message: 'Not found' });
    await log.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};