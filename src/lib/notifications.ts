// ─────────────────────────────────────────────────────────────
// ClearMind — Notification Library
// Web-safe mock of expo-notifications. On native, this would use
// the real expo-notifications API. On web, all calls are no-ops
// that simulate the correct return values.
// ─────────────────────────────────────────────────────────────

// Platform detection — mock for web
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationTrigger {
  hour: number;
  minute: number;
  repeats: boolean;
}

export interface ScheduledNotification {
  id: string;
  content: NotificationContent;
  trigger: NotificationTrigger;
}

// ─── Permission management ───────────────────────────────────

const permissionGrantedKey = 'cm-notification-permission';

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (isWeb) {
    // Web mock: simulate granting permission on first request
    // In a real app, this would use the Notifications API
    const stored = localStorage.getItem(permissionGrantedKey);
    if (stored === 'granted') return 'granted';
    if (stored === 'denied') return 'denied';

    // Simulate the permission prompt — default to granted
    // (In production, this would show a browser permission dialog)
    localStorage.setItem(permissionGrantedKey, 'granted');
    return 'granted';
  }

  // Native path (expo-notifications) — would be:
  // const { status } = await Notifications.requestPermissionsAsync();
  // return status as NotificationPermissionStatus;
  return 'granted';
}

export async function getNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (isWeb) {
    const stored = localStorage.getItem(permissionGrantedKey);
    if (stored === 'granted') return 'granted';
    if (stored === 'denied') return 'denied';
    return 'undetermined';
  }
  return 'granted';
}

export async function setNotificationPermissionDenied(): Promise<void> {
  if (isWeb) {
    localStorage.setItem(permissionGrantedKey, 'denied');
  }
}

// ─── Android channel ────────────────────────────────────────

const ANDROID_CHANNEL_ID = 'clearmind-reminders';

export async function createAndroidNotificationChannel(): Promise<void> {
  if (isWeb) return;
  // Native: would call Notifications.setNotificationChannelAsync(...)
  // Not needed on web
}

// ─── Scheduling ─────────────────────────────────────────────

const scheduledKey = 'cm-scheduled-notifications';

function getScheduled(): ScheduledNotification[] {
  if (isWeb) {
    try {
      return JSON.parse(localStorage.getItem(scheduledKey) ?? '[]');
    } catch {
      return [];
    }
  }
  return [];
}

function setScheduled(notifications: ScheduledNotification[]): void {
  if (isWeb) {
    localStorage.setItem(scheduledKey, JSON.stringify(notifications));
  }
}

export async function scheduleNotification(
  content: NotificationContent,
  trigger: NotificationTrigger
): Promise<string> {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const notification: ScheduledNotification = { id, content, trigger };

  if (isWeb) {
    const scheduled = getScheduled();
    scheduled.push(notification);
    setScheduled(scheduled);
  }

  return id;
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  if (isWeb) {
    setScheduled([]);
  }
}

export async function cancelScheduledNotification(id: string): Promise<void> {
  if (isWeb) {
    const scheduled = getScheduled().filter((n) => n.id !== id);
    setScheduled(scheduled);
  }
}

export async function getAllScheduledNotifications(): Promise<ScheduledNotification[]> {
  return getScheduled();
}

// ─── High-level scheduling helpers ───────────────────────────

import type { NotificationConfig } from '@/types';

export async function rescheduleAllNotifications(
  config: NotificationConfig
): Promise<void> {
  // Cancel everything first
  await cancelAllScheduledNotifications();

  if (!config.enabled) return;

  const permission = await getNotificationPermission();
  if (permission !== 'granted') return;

  // Ensure Android channel exists
  await createAndroidNotificationChannel();

  // 1. Daily check-in reminder
  if (config.checkInReminder) {
    await scheduleNotification(
      {
        title: 'Daily Check-In',
        body: 'Take a moment to reflect on how you\u2019re doing today.',
        data: { type: 'checkin' },
      },
      {
        hour: config.checkInHour,
        minute: config.checkInMinute,
        repeats: true,
      }
    );
  }

  // 2. Milestone alerts — daily check at a different time
  if (config.milestoneAlerts) {
    await scheduleNotification(
      {
        title: 'Milestone Check',
        body: 'Let\u2019s see if you\u2019ve reached a new milestone today!',
        data: { type: 'milestone' },
      },
      {
        hour: (config.checkInHour + 1) % 24,
        minute: config.checkInMinute,
        repeats: true,
      }
    );
  }

  // 3. Craving support — afternoon check-in
  if (config.cravingSupport) {
    await scheduleNotification(
      {
        title: 'Feeling a craving?',
        body: 'You\u2019ve got this. Open ClearMind for breathing exercises and distractions.',
        data: { type: 'craving' },
      },
      {
        hour: 15,
        minute: 0,
        repeats: true,
      }
    );
  }
}

// ─── Browser Notification API (for web demo) ────────────────
// On web, we can use the browser Notification API for real notifications.

export function isBrowserNotificationSupported(): boolean {
  return isWeb && 'Notification' in window;
}

export async function showBrowserNotification(title: string, body: string): Promise<void> {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, { body });
  } catch {
    // Silently fail — notifications are a nice-to-have, not critical
  }
}

export const ANDROID_CHANNEL = ANDROID_CHANNEL_ID;
