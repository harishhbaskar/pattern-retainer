import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { endOfDay, startOfDay, addDays } from 'date-fns';

const NOTIFICATION_ID_KEY = 'due_review_notification_id';
const ONBOARDING_SEEN_KEY = 'notification_onboarding_seen';
const ANDROID_CHANNEL_ID = 'Review Reminders';

export type Learning = {
  _id: string;
  topic: string;
  description?: string;
  stage: number;
  nextReviewDate: string;
};

/**
 * Initialize notification handler and Android channel.
 * Note: Listener for tap response is managed cleanly in _layout.tsx inside useEffect to ensure proper lifecycle cleanup.
 */
export async function initNotificationService() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Review Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Reminders when your learnings are ready for review',
      });
    }
  } catch (err) {
    console.error('Failed to initialize notification service:', err);
  }
}

/**
 * Cancel the currently scheduled Pattern Retainer due-review reminder, if one exists.
 */
export async function cancelScheduledDueReviewNotification() {
  try {
    const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch (err) {
    console.error('Failed to cancel scheduled notification:', err);
  }
}

/**
 * Core scheduling engine. Given the complete learning collection, calculates current or future due count,
 * cancels any existing reminder, and schedules exactly one local reminder according to the 9:00 AM local policy.
 */
export async function scheduleOrUpdateDueReviewNotification(learnings: Learning[]) {
  try {
    // 1. Cancel any previously scheduled reminder to guarantee at most one reminder exists
    await cancelScheduledDueReviewNotification();

    // 2. If no learnings exist at all, cancel and return
    if (!learnings || learnings.length === 0) {
      return;
    }

    // 3. Check if OS permission is granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const endOfToday = endOfDay(new Date());
    const dueItems = learnings.filter((l) => new Date(l.nextReviewDate) <= endOfToday);

    let targetDate: Date;
    let title: string;
    const body = 'Your memory has work scheduled. Open Pattern Retainer.';

    if (dueItems.length > 0) {
      // Case A: Items are currently due
      const count = dueItems.length;
      title = `${count} ${count === 1 ? 'learning is' : 'learnings are'} ready for review`;

      // Explicit comparison: now < todayAt9AM
      const now = new Date();
      const todayAt9AM = new Date();
      todayAt9AM.setHours(9, 0, 0, 0);

      if (now < todayAt9AM) {
        targetDate = todayAt9AM;
      } else {
        targetDate = addDays(todayAt9AM, 1);
      }
    } else {
      // Case B: No items due today. Find earliest future review calendar date
      const futureItems = learnings
        .filter((l) => new Date(l.nextReviewDate) > endOfToday)
        .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

      if (futureItems.length === 0) {
        return; // No future items either
      }

      const earliestCalendarDate = startOfDay(new Date(futureItems[0].nextReviewDate));
      targetDate = new Date(earliestCalendarDate);
      targetDate.setHours(9, 0, 0, 0);

      // Aggregate count expected to be due by endOfDay of that earliest future review date
      const expectedCount = learnings.filter(
        (l) => new Date(l.nextReviewDate) <= endOfDay(earliestCalendarDate)
      ).length;

      title = `${expectedCount} ${expectedCount === 1 ? 'learning is' : 'learnings are'} ready for review`;
    }

    // Schedule local notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });

    // Save scheduled notification ID
    if (notificationId) {
      await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
    }
  } catch (err) {
    console.error('Failed to schedule due review notification:', err);
  }
}

/**
 * Check permission onboarding status and prompt user if they have not seen the onboarding explanation before.
 * Safe and non-disruptive: if denied or dismissed, does not crash or repeatedly nag on future visits.
 */
export async function checkAndRequestNotificationPermission(
  learnings: Learning[]
): Promise<void> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
      await scheduleOrUpdateDueReviewNotification(learnings);
      return;
    }

    const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
    if (onboardingSeen === 'true') {
      // User already saw onboarding prompt or previously denied; do not nag again
      return;
    }

    // Show clean native alert onboarding prompt explaining why permission is needed
    Alert.alert(
      'Review reminders',
      'Pattern Retainer can remind you when your learnings are ready for review.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
            } catch {
              // Ignore
            }
          },
        },
        {
          text: 'Enable Reminders',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
              const { status: finalStatus } = await Notifications.requestPermissionsAsync();
              if (finalStatus === 'granted') {
                await scheduleOrUpdateDueReviewNotification(learnings);
              }
            } catch (err) {
              console.error('Failed to request notification permission:', err);
            }
          },
        },
      ]
    );
  } catch (err) {
    console.error('Failed to check notification permission:', err);
  }
}
