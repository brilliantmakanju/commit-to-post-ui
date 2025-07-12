import { UUID } from "node:crypto";

import { create } from "zustand";

import type { Notification } from "@/types";

interface NotificationState {
	clearAll: () => void;
	notifications: Notification[];
	markAsRead: (id: UUID) => void;
	removeNotification: (id: UUID) => void;
	setNotifications: (data: Notification[]) => void;
}

const useNotificationStore = create<NotificationState>(set => ({
	notifications: [],
	setNotifications: notifications => set({ notifications }),
	markAsRead: id =>
		set(state => ({
			notifications: state.notifications.map(n =>
				n.id === id ? { ...n, is_read: true } : n,
			),
		})),
	removeNotification: id =>
		set(state => ({
			notifications: state.notifications.filter(n => n.id !== id),
		})),
	clearAll: () => set({ notifications: [] }),
}));

export default useNotificationStore;
