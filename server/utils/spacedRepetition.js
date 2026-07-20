export const calculateNextDate = (stage) => {
  const MAX_DAYS = 90;
  const daysToAdd = Math.min(Math.pow(2, stage - 1), MAX_DAYS);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};
