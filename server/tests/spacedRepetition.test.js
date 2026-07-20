import { jest } from '@jest/globals';
import { calculateNextDate } from '../utils/spacedRepetition.js';

describe('Spaced Repetition Algorithm', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should add 1 day for stage 1', () => {
    const nextDate = calculateNextDate(1);
    expect(nextDate.toISOString()).toBe('2024-01-02T12:00:00.000Z');
  });

  it('should add 2 days for stage 2', () => {
    const nextDate = calculateNextDate(2);
    expect(nextDate.toISOString()).toBe('2024-01-03T12:00:00.000Z');
  });

  it('should add 4 days for stage 3', () => {
    const nextDate = calculateNextDate(3);
    expect(nextDate.toISOString()).toBe('2024-01-05T12:00:00.000Z');
  });

  it('should add 8 days for stage 4', () => {
    const nextDate = calculateNextDate(4);
    expect(nextDate.toISOString()).toBe('2024-01-09T12:00:00.000Z');
  });

  it('should cap the interval at 90 days for large stages', () => {
    // 2^(10-1) = 512, which is > 90
    const nextDate = calculateNextDate(10);
    // 90 days from Jan 1 is March 31 (leap year 2024)
    expect(nextDate.toISOString()).toBe('2024-03-31T12:00:00.000Z');
  });
});
