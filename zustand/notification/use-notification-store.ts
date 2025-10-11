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
	deletingIds: UUID[];
	isBulkMarking: boolean;
	isBulkDeleting: boolean;
	setMarking: (id: UUID, value: boolean) => void;
	setDeleting: (id: UUID, value: boolean) => void;
	setBulkMarking: (value: boolean) => void;
	setBulkDeleting: (value: boolean) => void;
	clearMarking: () => void;
	clearDeleting: () => void;
	clearAllMarking: () => void;
}

const useNotificationStore = create<NotificationState>(set => ({
	notifications: [],
	markingIds: [],
	deletingIds: [],
	isBulkMarking: false,
	isBulkDeleting: false,

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

	setDeleting: (id, value) =>
		set(state => ({
			deletingIds: value
				? [...new Set([...(state.deletingIds || []), id])]
				: (state.deletingIds || []).filter(x => x !== id),
		})),

	setBulkMarking: value => set({ isBulkMarking: value }),
	setBulkDeleting: value => set({ isBulkDeleting: value }),

	clearMarking: () => set({ markingIds: [], isBulkMarking: false }),
	clearDeleting: () => set({ deletingIds: [], isBulkDeleting: false }),
	clearAllMarking: () =>
		set({
			markingIds: [],
			deletingIds: [],
			isBulkMarking: false,
			isBulkDeleting: false,
		}),
}));

export default useNotificationStore;
