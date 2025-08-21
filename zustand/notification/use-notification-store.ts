import { UUID } from "node:crypto";

import { create } from "zustand";

import type { Notification } from "@/types";

interface NotificationState {
	clearAll: () => void;
	notifications: Notification[];
	markAsRead: (id: UUID) => void;
	removeNotification: (id: UUID) => void;
	setNotifications: (data: Notification[]) => void;
	// Loading states
	markingIds: UUID[];
	isBulkMarking: boolean;
	setMarking: (id: UUID, value: boolean) => void;
	setBulkMarking: (value: boolean) => void;
	clearMarking: () => void;
}

const useNotificationStore = create<NotificationState>(set => ({
	notifications: [],
	markingIds: [],
	isBulkMarking: false,
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
	setMarking: (id, value) =>
		set(state => ({
			markingIds: value
				? [...new Set([...(state.markingIds || []), id])]
				: (state.markingIds || []).filter(x => x !== id),
		})),
	setBulkMarking: value => set({ isBulkMarking: value }),
	clearMarking: () => set({ markingIds: [], isBulkMarking: false }),
}));

export default useNotificationStore;
