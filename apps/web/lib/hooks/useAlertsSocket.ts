'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { DisruptionPushPayload } from '@urbanflow/shared';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';

export function useAlertsSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const pushNotification = useNotificationsStore((s) => s.pushNotification);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
      auth: { token: accessToken },
    });

    socket.on('disruption', (payload: DisruptionPushPayload) => {
      pushNotification(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, pushNotification]);
}
