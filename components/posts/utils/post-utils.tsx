import type { PostStatus } from "@/types";

export const getBadgeStyles = (status: PostStatus) => {
	switch (status) {
		case "published": {
			return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
		}
		case "scheduled": {
			return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
		}
		case "drafted": {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
		}
		default: {
			return "bg-gray-500/10 text-gray-400 border-gray-500/20";
		}
	}
};

export const getStatusLabel = (status: PostStatus) => {
	return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getLayoutConfig = (count: number) => {
	if (count <= 3) {
		return {
			showOverlay: false,
			visiblePosts: count,
			gridClass: count === 3 ? "grid-cols-3" : `grid-cols-${count}`,
		};
	} else if (count === 4) {
		return {
			visiblePosts: 4,
			showOverlay: false,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	} else {
		return {
			visiblePosts: 4,
			showOverlay: true,
			remainingCount: count - 4,
			gridClass: "grid-cols-2 grid-rows-2",
		};
	}
};

export const normalizePlatform = (p?: string) => {
	const v = (p || "").toLowerCase();
	if (v === "x" || v === "twitter" || v === "x-twitter") return "twitter";
	if (v === "linkedin") return "linkedin";
	if (v === "discord") return "discord";
	if (v === "slack") return "slack";
	return;
};
