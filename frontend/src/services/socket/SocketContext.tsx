import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { socketService } from './socketService';
import { useAuth } from '../../services/auth/auth.context';
import type { Notification } from '../../types';

interface SocketContextType {
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken) {
      socketService.connect();

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      const handleNotification = (data: unknown) => {
        const notification = data as Notification;
        setNotifications((prev) => [notification, ...prev]);
      };

      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('notification', handleNotification);

      return () => {
        socketService.off('connect', handleConnect);
        socketService.off('disconnect', handleDisconnect);
        socketService.off('notification', handleNotification);
        socketService.disconnect();
      };
    }

    return undefined;
  }, [auth.isAuthenticated, auth.accessToken]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
