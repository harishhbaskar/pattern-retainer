import Learning from "../models/Learning.js";


const calculateNextDate = (stage) => {
  const daysToAdd = Math.pow(2, stage - 1);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

export const createLearning = async (req, res) => {
  try {
    const { topic, description } = req.body;
    const initialStage = 1;

    const newLog = new Learning({
      user: req.user.id,
      topic,
      description,
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

    log.stage += 1;
    log.nextReviewDate = calculateNextDate(log.stage);
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};