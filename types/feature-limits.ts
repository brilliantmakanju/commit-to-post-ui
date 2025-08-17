import { ReactNode } from "react";

// eslint-disable-next-line import/no-unresolved
import { FeatureCategory } from "@/zustand/feature-limits-store";

// Use FeatureCategory instead of LimitType
export type LimitType = FeatureCategory;

// Position types for tooltips
export type TooltipPosition = "top" | "bottom" | "left" | "right";

// Base props for limit components
export interface BaseLimitProps {
	limitType: LimitType;
	customTitle?: string;
	customMessage?: string;
}

// Warning modal props
export interface LimitWarningProps extends BaseLimitProps {
	isOpen: boolean;
	maxLimit: number;
	onClose: () => void;
	currentUsage: number;
}

// Limit reached modal props
export interface LimitReachedProps extends BaseLimitProps {
	isOpen: boolean;
	maxLimit: number;
	onClose: () => void;
	upgradeAction?: () => void;
}

// Tooltip props
export interface LimitTooltipProps extends BaseLimitProps {
	maxLimit: number;
	children: ReactNode;
	currentUsage: number;
	position?: TooltipPosition;
}

// Configuration for different limit types
export interface LimitTypeConfig {
	icon: React.ComponentType<{ className?: string }>;
	unit: string;
	title: string;
	warningTitle: string;
	reachedTitle: string;
}

// Feature limit data structure
export interface FeatureLimitData {
	limitId: string;
	userPlan?: string;
	currentCount: number;
	isAuthenticated?: boolean;
}
