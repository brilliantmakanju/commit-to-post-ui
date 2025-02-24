import type { Metadata } from "next";

import { SettingsTabs } from "@/components/settings/settings-tabs";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
	title: "Settings",
};

export default function SettingsPage() {
	return <SettingsTabs />;
}
