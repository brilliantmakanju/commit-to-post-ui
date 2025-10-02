"use client";
import {
	LinkedInPostPreview,
	TwitterPostPreview,
} from "@automattic/social-previews";
import React from "react";

// eslint-disable-next-line import/no-unresolved
import { DiscordPreview } from "@/components/socials-previews/discord-preview";

import { PostVersion } from "./types";

interface PreviewPaneProps {
	platform: "twitter" | "linkedin" | "discord";
	version: PostVersion & { images?: string[] };
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
	platform,
	version,
}) => {
	if (!version) return;

	// Get images array - support both new images array and backward compatibility with single image
	const getImages = () => {
		if (version.images && version.images.length > 0) {
			return version.images;
		}
		if (version.image) {
			return [version.image];
		}
		return [];
	};

	const images = getImages();

	switch (platform) {
		case "twitter": {
			// Convert images to Twitter media format
			const media =
				images.length > 0
					? images.map((imageUrl, index) => ({
							alt: `Post image ${index + 1}`,
							type: "image/" as const,
							url: imageUrl,
						}))
					: undefined;

			return (
				<TwitterPostPreview
					text={version.content || ""}
					name="Meltwater"
					screenName="@meltwater"
					profileImage="/Anime-Girl4.png"
					date={new Date()}
					media={media}
					showThreadConnector={false}
				/>
			);
		}
		case "linkedin": {
			// Convert images to LinkedIn media format
			const media =
				images.length > 0
					? images.map((imageUrl, index) => ({
							alt: `Post image ${index + 1}`,
							type: "image/" as const,
							url: imageUrl,
						}))
					: undefined;

			return (
				<LinkedInPostPreview
					name="Meltwater"
					profileImage="/Anime-Girl2.png"
					jobTitle="Marketing Professional"
					description={version.content || ""}
					url=""
					title=""
					media={media}
				/>
			);
		}
		case "discord": {
			// Convert images to Discord attachments format
			const attachments =
				images.length > 0
					? images.map((imageUrl, index) => ({
							url: imageUrl,
							filename: `image_${index + 1}.jpg`,
							size: 2048576, // Default size
							type: "image" as const,
							width: 500,
							height: 300,
						}))
					: [];

			return (
				<DiscordPreview
					content=""
					user={{ name: "Push to Draft", avatar: "/logo.png", app: true }}
					embeds={[
						{
							color: "#5865f2",
							title: "Push Update",
							timestamp: new Date().toISOString(),
							description: version.content || "",
						},
					]}
					attachments={attachments}
				/>
			);
		}
		default: {
			return;
		}
	}
};
