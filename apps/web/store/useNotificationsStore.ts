import { create } from 'zustand';
import type { DisruptionPushPayload, UserNotificationDto } from '@urbanflow/shared';

interface NotificationsState {
  notifications: UserNotificationDto[];
  unreadCount: number;
  setNotifications: (notifications: UserNotificationDto[]) => void;
  setUnreadCount: (count: number) => void;
  pushNotification: (payload: DisruptionPushPayload) => void;
  markRead: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  pushNotification: (payload) =>
    set((state) => ({
      notifications: [
        {
          id: payload.notificationId,
          profileId: '',
          alertId: payload.alert.id,
          alert: payload.alert,
          read: false,
          alternativeItinerary: payload.alternativeItinerary,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
